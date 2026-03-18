import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.knowledge_base import KnowledgeBase
from app.core.deps import get_current_user, CurrentUser, require_roles

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/knowledge-base", tags=["knowledge-base"])


@router.get("")
async def list_entries(
    category: str | None = None,
    search: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(KnowledgeBase).where(
        (KnowledgeBase.clinic_id == user.clinic_id) | (KnowledgeBase.clinic_id == None)
    )
    if category:
        query = query.where(KnowledgeBase.category == category)
    if search:
        query = query.where(KnowledgeBase.title.ilike(f"%{search}%") | KnowledgeBase.content.ilike(f"%{search}%"))
    query = query.order_by(KnowledgeBase.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    entries = result.scalars().all()

    return {
        "entries": [
            {
                "id": str(e.id),
                "category": e.category,
                "title": e.title,
                "content": e.content,
                "language": e.language,
                "tags": e.tags,
                "is_published": e.is_published,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in entries
        ],
    }


@router.post("")
async def create_entry(
    body: dict,
    user: CurrentUser = Depends(require_roles("clinic_owner", "doctor")),
    db: AsyncSession = Depends(get_db),
):
    entry = KnowledgeBase(
        clinic_id=user.clinic_id,
        category=body.get("category", "general"),
        title=body["title"],
        content=body["content"],
        language=body.get("language", "en"),
        tags=body.get("tags", []),
        is_published=body.get("is_published", True),
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    # Auto-embed if OpenAI key is configured
    try:
        from app.services.embedding_service import embed_knowledge_base_entry
        await embed_knowledge_base_entry(db, entry)
        await db.commit()
    except Exception as e:
        logger.warning(f"Auto-embed failed: {e}")

    return {"id": str(entry.id), "title": entry.title}


@router.put("/{entry_id}")
async def update_entry(
    entry_id: str,
    body: dict,
    user: CurrentUser = Depends(require_roles("clinic_owner", "doctor")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeBase).where(KnowledgeBase.id == entry_id, KnowledgeBase.clinic_id == user.clinic_id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    for field in ["category", "title", "content", "language", "tags", "is_published"]:
        if field in body:
            setattr(entry, field, body[field])
    await db.commit()

    # Re-embed after update
    try:
        from app.services.embedding_service import embed_knowledge_base_entry
        await embed_knowledge_base_entry(db, entry)
        await db.commit()
    except Exception as e:
        logger.warning(f"Re-embed failed: {e}")

    return {"id": str(entry.id), "title": entry.title}


@router.post("/embed-all")
async def embed_all(
    user: CurrentUser = Depends(require_roles("clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    from app.services.embedding_service import embed_all_kb_entries
    result = await embed_all_kb_entries(db, str(user.clinic_id))
    await db.commit()
    return result


@router.get("/search")
async def semantic_search(
    q: str = Query(..., min_length=2),
    limit: int = Query(5, le=20),
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.embedding_service import search_knowledge_base
    results = await search_knowledge_base(db, str(user.clinic_id), q, limit=limit)
    return {"results": results, "query": q}


@router.delete("/{entry_id}")
async def delete_entry(
    entry_id: str,
    user: CurrentUser = Depends(require_roles("clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeBase).where(KnowledgeBase.id == entry_id, KnowledgeBase.clinic_id == user.clinic_id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    await db.delete(entry)
    await db.commit()
    return {"success": True}
