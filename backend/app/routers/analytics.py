import time

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.analytics.heatmap import compute_heatmap
from app.analytics.hot_zones import compute_hot_zones
from app.core.database import get_db
from app.schemas.analytics import HotZone

router = APIRouter(prefix="/analytics", tags=["analytics"])

_CACHE: dict[str, tuple[float, object]] = {}
_TTL = 600  # 10 minutes


def _cached(key: str, fn, db: Session):
    now = time.time()
    if key in _CACHE:
        ts, result = _CACHE[key]
        if now - ts < _TTL:
            return result
    result = fn(db)
    _CACHE[key] = (now, result)
    return result


@router.get("/heatmap")
def get_heatmap(db: Session = Depends(get_db)):
    return _cached("heatmap", compute_heatmap, db)


@router.get("/hot-zones", response_model=list[HotZone])
def get_hot_zones(db: Session = Depends(get_db)):
    return _cached("hot_zones", compute_hot_zones, db)
