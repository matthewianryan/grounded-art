"""Read endpoints for galleries, the map nodes."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, nulls_last, select
from sqlalchemy.orm import Session, selectinload

from app.db import get_db
from app.models import Gallery, GalleryStatus
from app.schemas import GalleryPage, GalleryRead

router = APIRouter(prefix="/galleries", tags=["galleries"])

# Only active galleries are exposed. Hidden and opted-out galleries never leave the API.
_eager = (selectinload(Gallery.images), selectinload(Gallery.external_refs))


@router.get("", response_model=GalleryPage)
def list_galleries(
    db: Session = Depends(get_db),
    suburb: str | None = Query(None, description="Filter by suburb."),
    featured: bool | None = Query(None, description="Filter by featured flag."),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> GalleryPage:
    filters = [Gallery.status == GalleryStatus.ACTIVE]
    if suburb is not None:
        filters.append(Gallery.suburb == suburb)
    if featured is not None:
        filters.append(Gallery.featured.is_(featured))

    total = db.scalar(select(func.count()).select_from(Gallery).where(*filters)) or 0
    stmt = (
        select(Gallery)
        .where(*filters)
        .options(*_eager)
        .order_by(
            Gallery.featured.desc(),
            nulls_last(Gallery.featured_rank),
            Gallery.name,
        )
        .limit(limit)
        .offset(offset)
    )
    items = db.scalars(stmt).all()
    return GalleryPage(items=items, total=total, limit=limit, offset=offset)


@router.get("/{slug}", response_model=GalleryRead)
def get_gallery(slug: str, db: Session = Depends(get_db)) -> Gallery:
    stmt = (
        select(Gallery)
        .where(Gallery.slug == slug, Gallery.status == GalleryStatus.ACTIVE)
        .options(*_eager)
    )
    gallery = db.scalars(stmt).first()
    if gallery is None:
        raise HTTPException(status_code=404, detail="Gallery not found")
    return gallery
