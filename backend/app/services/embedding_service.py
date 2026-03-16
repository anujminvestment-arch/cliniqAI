import logging
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

    embedding = Embedding(
        clinic_id=clinic_id,
        patient_id=patient_id,
        doctor_id=doctor_id,
        source_type=source_type,
        source_id=source_id,
        content_text=content_text,
        embedding=vector,
        metadata=metadata or {},
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

    result = await db.execute(sql_text(sql), params)
    rows = result.all()
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
