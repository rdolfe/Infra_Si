from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.schemas.offer import OfferCreate, OfferRead, OfferUpdate
from app.services.offer_service import (
    get_offer,
    list_offers,
    submit_offer,
    update_offer_status,
)

router = APIRouter(prefix="/offers", tags=["offers"])


@router.post("", response_model=OfferRead, status_code=status.HTTP_201_CREATED)
def create_offer(
    data: OfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.client)),
):
    return submit_offer(data, current_user.id, db)


@router.get("", response_model=list[OfferRead])
def list_offers_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_offers(current_user, db)


@router.get("/{offer_id}", response_model=OfferRead)
def get_offer_route(
    offer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_offer(offer_id, current_user, db)


@router.put("/{offer_id}", response_model=OfferRead)
def update_offer_route(
    offer_id: str,
    data: OfferUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_offer_status(offer_id, data, current_user, db)
