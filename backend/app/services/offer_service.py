from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.offer import Offer, OfferStatus
from app.models.property import Property, PropertyStatus
from app.models.transaction import Transaction
from app.models.user import User, UserRole
from app.schemas.offer import OfferCreate, OfferUpdate
from app.services.notification_service import create_notification


def submit_offer(data: OfferCreate, client_id: str, db: Session) -> Offer:
    prop = db.get(Property, data.property_id)
    if prop is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Property not found"
        )
    if prop.status != PropertyStatus.published:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Property is not available for offers",
        )

    offer = Offer(
        property_id=data.property_id,
        client_id=client_id,
        agent_id=prop.agent_id,
        proposed_price=data.proposed_price,
        status=OfferStatus.pending,
    )
    db.add(offer)
    db.flush()

    create_notification(
        user_id=prop.agent_id,
        type="new_offer",
        payload={
            "offer_id": offer.id,
            "property_id": prop.id,
            "proposed_price": float(data.proposed_price),
        },
        db=db,
    )

    db.commit()
    db.refresh(offer)
    return offer


def update_offer_status(
    offer_id: str, data: OfferUpdate, current_user: User, db: Session
) -> Offer:
    offer = db.get(Offer, offer_id)
    if offer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found"
        )

    is_agent = current_user.role == UserRole.agent and offer.agent_id == current_user.id
    is_client = current_user.role == UserRole.client and offer.client_id == current_user.id

    if not is_agent and not is_client:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions"
        )

    if is_client and offer.status != OfferStatus.countered:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Clients can only respond to a counter-offer",
        )
    if is_client and data.action == "counter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clients cannot make counter-offers",
        )
    if is_agent and offer.status not in (OfferStatus.pending, OfferStatus.countered):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Offer cannot be updated in its current state",
        )

    if data.action == "accept":
        offer.status = OfferStatus.accepted
        _create_transaction(offer, db)
        create_notification(
            user_id=offer.client_id,
            type="offer_accepted",
            payload={"offer_id": offer.id, "property_id": offer.property_id},
            db=db,
        )
    elif data.action == "counter":
        if data.new_price is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="new_price is required for a counter offer",
            )
        offer.status = OfferStatus.countered
        offer.counter_price = data.new_price
        create_notification(
            user_id=offer.client_id,
            type="offer_countered",
            payload={
                "offer_id": offer.id,
                "property_id": offer.property_id,
                "counter_price": float(data.new_price),
            },
            db=db,
        )
    elif data.action == "reject":
        offer.status = OfferStatus.rejected
        create_notification(
            user_id=offer.client_id,
            type="offer_rejected",
            payload={"offer_id": offer.id, "property_id": offer.property_id},
            db=db,
        )

    db.commit()
    db.refresh(offer)
    return offer


def _create_transaction(offer: Offer, db: Session) -> Transaction:
    transaction = Transaction(
        property_id=offer.property_id,
        offer_id=offer.id,
        client_id=offer.client_id,
        agent_id=offer.agent_id,
    )
    db.add(transaction)
    return transaction


def get_offer(offer_id: str, current_user: User, db: Session) -> Offer:
    offer = db.get(Offer, offer_id)
    if offer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found"
        )
    if current_user.role == UserRole.client and offer.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your offer"
        )
    if current_user.role == UserRole.agent and offer.agent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your listing's offer"
        )
    return offer


def list_offers(current_user: User, db: Session) -> list[Offer]:
    if current_user.role == UserRole.client:
        return (
            db.query(Offer)
            .filter(Offer.client_id == current_user.id)
            .order_by(Offer.created_at.desc())
            .all()
        )
    if current_user.role == UserRole.agent:
        return (
            db.query(Offer)
            .filter(Offer.agent_id == current_user.id)
            .order_by(Offer.created_at.desc())
            .all()
        )
    return db.query(Offer).order_by(Offer.created_at.desc()).all()
