import hashlib
import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.embedding import Embedding

logger = logging.getLogger(__name__)

try:
    import openai
    _openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
except ImportError:
    _openai_client = None


async def generate_embedding(text: str) -> list[float] | None:
    """Generate embedding vector using OpenAI text-embedding-3-small."""
    if not _openai_client:
        logger.warning("OpenAI client not configured, skipping embedding generation")
        return None
    try:
        response = await _openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=text[:8000],
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Embedding generation failed: {e}")
        return None


async def store_embedding(
    db: AsyncSession,
    *,
    clinic_id: str,
    source_type: str,
    source_id: str,
    content_text: str,
    patient_id: str | None = None,
    doctor_id: str | None = None,
    metadata: dict | None = None,
) -> Embedding | None:
    """Generate and store an embedding for the given content."""
    vector = await generate_embedding(content_text)
    if vector is None:
        return None

    # Convert vector to JSON string if pgvector extension is not available (Text column fallback)
    import json as _json
    stored_vector = _json.dumps(vector) if isinstance(vector, list) else vector

    embedding = Embedding(
        clinic_id=clinic_id,
        patient_id=patient_id,
        doctor_id=doctor_id,
        source_type=source_type,
        source_id=source_id,
        content_text=content_text,
        embedding=stored_vector,
        extra_data=metadata or {},
    )
    db.add(embedding)
    await db.flush()
    return embedding


async def search_similar(
    db: AsyncSession,
    clinic_id: str,
    query_text: str,
    source_type: str | None = None,
    limit: int = 5,
) -> list[dict]:
    """Search for similar content using pgvector cosine similarity."""
    query_vector = await generate_embedding(query_text)
    if query_vector is None:
        return []

    from sqlalchemy import text as sql_text
    vector_str = "[" + ",".join(str(v) for v in query_vector) + "]"

    sql = """
        SELECT id, source_type, source_id, content_text,
               1 - (embedding <=> :vector::vector) as similarity
        FROM embeddings
        WHERE clinic_id = :clinic_id
    """
    if source_type:
        sql += " AND source_type = :source_type"
    sql += " ORDER BY embedding <=> :vector::vector LIMIT :limit"

    params = {"clinic_id": clinic_id, "vector": vector_str, "limit": limit}
    if source_type:
        params["source_type"] = source_type

    try:
        result = await db.execute(sql_text(sql), params)
        rows = result.all()
    except Exception as e:
        logger.warning(f"Vector search failed (pgvector may not be installed): {e}")
        await db.rollback()
        return []
    return [
        {
            "id": str(row[0]),
            "source_type": row[1],
            "source_id": str(row[2]),
            "content_text": row[3],
            "similarity": float(row[4]),
        }
        for row in rows
    ]


async def embed_knowledge_base_entry(db: AsyncSession, entry) -> bool:
    """Generate and store embedding for a knowledge base entry."""
    content_hash = hashlib.sha256(f"{entry.title} {entry.content}".encode()).hexdigest()

    # Skip if already embedded with same content
    if entry.content_hash == content_hash and entry.last_embedded_at:
        return False

    # Create combined text for better semantic matching
    combined = f"Category: {entry.category}. Title: {entry.title}. {entry.content}"
    if entry.tags:
        combined += f" Tags: {', '.join(entry.tags)}"

    result = await store_embedding(
        db,
        clinic_id=str(entry.clinic_id),
        source_type="knowledge_base",
        source_id=str(entry.id),
        content_text=combined,
        doctor_id=str(entry.doctor_id) if entry.doctor_id else None,
        metadata={"category": entry.category, "language": entry.language, "title": entry.title},
    )

    if result:
        entry.content_hash = content_hash
        entry.last_embedded_at = datetime.now(timezone.utc)
        return True
    return False


async def embed_all_kb_entries(db: AsyncSession, clinic_id: str) -> dict:
    """Embed all knowledge base entries for a clinic."""
    from app.models.knowledge_base import KnowledgeBase

    result = await db.execute(
        select(KnowledgeBase).where(
            KnowledgeBase.clinic_id == clinic_id,
            KnowledgeBase.is_published == True,
        )
    )
    entries = result.scalars().all()
    embedded = 0
    skipped = 0
    for entry in entries:
        if await embed_knowledge_base_entry(db, entry):
            embedded += 1
        else:
            skipped += 1
    await db.flush()
    return {"embedded": embedded, "skipped": skipped, "total": len(entries)}


async def search_knowledge_base(
    db: AsyncSession,
    clinic_id: str,
    query: str,
    limit: int = 5,
    min_similarity: float = 0.3,
) -> list[dict]:
    """Semantic search in knowledge base using embeddings."""
    try:
        results = await search_similar(db, clinic_id, query, source_type="knowledge_base", limit=limit)
        return [r for r in results if r.get("similarity", 0) >= min_similarity]
    except Exception as e:
        logger.warning(f"KB embedding search failed: {e}")
        return []
