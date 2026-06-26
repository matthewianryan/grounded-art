"""Read endpoints for the feed, events and posts.

The feed supports the decided temporal views, sliced by the dates on each item: what is on
this weekend, what is opening this week, and what is closing soon.
"""

from datetime import date, timedelta
from enum import StrEnum

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import FeedItem, FeedItemStatus, FeedItemType
from app.schemas import FeedItemRead, FeedPage

router = APIRouter(prefix="/feed", tags=["feed"])


class FeedView(StrEnum):
    THIS_WEEKEND = "this_weekend"
    OPENING_THIS_WEEK = "opening_this_week"
    CLOSING_SOON = "closing_soon"


def _view_filters(view: FeedView, today: date) -> list:
    """Build the date filters for a temporal view, relative to today."""
    if view is FeedView.OPENING_THIS_WEEK:
        return [
            FeedItem.starts_on.is_not(None),
            FeedItem.starts_on >= today,
            FeedItem.starts_on <= today + timedelta(days=7),
        ]
    if view is FeedView.CLOSING_SOON:
        return [
            FeedItem.ends_on.is_not(None),
            FeedItem.ends_on >= today,
            FeedItem.ends_on <= today + timedelta(days=7),
        ]
    # this_weekend: items running over the coming Saturday and Sunday. An item is on if it
    # starts on or before Sunday and either has no end or ends on or after Saturday.
    saturday = today + timedelta(days=(5 - today.weekday()) % 7)
    sunday = saturday + timedelta(days=1)
    return [
        FeedItem.starts_on.is_not(None),
        FeedItem.starts_on <= sunday,
        or_(FeedItem.ends_on.is_(None), FeedItem.ends_on >= saturday),
    ]


@router.get("", response_model=FeedPage)
def list_feed(
    db: Session = Depends(get_db),
    type: FeedItemType | None = Query(None, description="Filter by item type."),
    view: FeedView | None = Query(None, description="Temporal view."),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> FeedPage:
    filters = [FeedItem.status == FeedItemStatus.ACTIVE]
    if type is not None:
        filters.append(FeedItem.type == type)
    if view is not None:
        filters.extend(_view_filters(view, date.today()))

    total = db.scalar(select(func.count()).select_from(FeedItem).where(*filters)) or 0
    stmt = (
        select(FeedItem)
        .where(*filters)
        .order_by(
            FeedItem.featured.desc(),
            func.coalesce(FeedItem.published_at, FeedItem.created_at).desc(),
        )
        .limit(limit)
        .offset(offset)
    )
    items = db.scalars(stmt).all()
    return FeedPage(items=items, total=total, limit=limit, offset=offset)


@router.get("/{slug}", response_model=FeedItemRead)
def get_feed_item(slug: str, db: Session = Depends(get_db)) -> FeedItem:
    stmt = select(FeedItem).where(
        FeedItem.slug == slug, FeedItem.status == FeedItemStatus.ACTIVE
    )
    item = db.scalars(stmt).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Feed item not found")
    return item
