from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.message import Message
from app.models.offer import Offer
from app.models.property import Property
from app.models.user import User
from app.schemas.message import MessageCreate, MessageRead, MessageThreadRead
from app.services.notification_service import create_notification

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("/threads", response_model=list[MessageThreadRead])
def get_message_threads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    offer_ids = (
        db.query(Message.offer_id)
        .filter(
            Message.offer_id.isnot(None),
            (Message.sender_id == current_user.id)
            | Message.offer_id.in_(
                db.query(Offer.id).filter(
                    (Offer.client_id == current_user.id)
                    | (Offer.agent_id == current_user.id)
                )
            ),
        )
        .distinct()
        .all()
    )

    threads: list[MessageThreadRead] = []
    seen: set[str] = set()

    for (oid,) in offer_ids:
        if oid in seen:
            continue
        seen.add(oid)

        offer = db.get(Offer, oid)
        if not offer:
            continue
        if current_user.id not in (offer.client_id, offer.agent_id):
            continue

        msgs = (
            db.query(Message)
            .filter(Message.offer_id == oid)
            .order_by(Message.created_at.desc())
            .all()
        )
        if not msgs:
            continue

        last = msgs[0]
        unread = sum(
            1 for m in msgs if m.sender_id != current_user.id
        )
        threads.append(
            MessageThreadRead(
                offer_id=oid,
                property_id=offer.property_id,
                last_message=last.content[:100],
                last_message_at=last.created_at,
                unread_count=unread,
            )
        )

    threads.sort(key=lambda t: t.last_message_at, reverse=True)
    return threads


@router.get("", response_model=list[MessageRead])
def get_messages(
    offer_id: str | None = None,
    property_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not offer_id and not property_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either offer_id or property_id is required",
        )

    if offer_id:
        offer = db.get(Offer, offer_id)
        if not offer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
        if current_user.id not in (offer.client_id, offer.agent_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a party to this offer")
        return (
            db.query(Message)
            .filter(Message.offer_id == offer_id)
            .order_by(Message.created_at)
            .all()
        )

    prop = db.get(Property, property_id)
    if not prop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")

    if current_user.id == prop.agent_id:
        return (
            db.query(Message)
            .filter(Message.property_id == property_id)
            .order_by(Message.created_at)
            .all()
        )

    participant = (
        db.query(Message)
        .filter(Message.property_id == property_id, Message.sender_id == current_user.id)
        .first()
    )
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a party to this conversation",
        )
    return (
        db.query(Message)
        .filter(Message.property_id == property_id)
        .order_by(Message.created_at)
        .all()
    )


@router.post("", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
def send_message(
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.offer_id:
        offer = db.get(Offer, data.offer_id)
        if not offer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
        if current_user.id not in (offer.client_id, offer.agent_id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a party to this offer")
        recipient_id = offer.agent_id if current_user.id == offer.client_id else offer.client_id
        create_notification(
            user_id=recipient_id,
            type="new_message",
            payload={"offer_id": data.offer_id, "sender_id": current_user.id},
            db=db,
        )

    elif data.property_id:
        prop = db.get(Property, data.property_id)
        if not prop:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
        if current_user.id != prop.agent_id:
            create_notification(
                user_id=prop.agent_id,
                type="new_message",
                payload={"property_id": data.property_id, "sender_id": current_user.id},
                db=db,
            )
        else:
            participants = (
                db.query(Message.sender_id)
                .filter(
                    Message.property_id == data.property_id,
                    Message.sender_id != current_user.id,
                )
                .distinct()
                .all()
            )
            for (pid,) in participants:
                create_notification(
                    user_id=pid,
                    type="new_message",
                    payload={"property_id": data.property_id, "sender_id": current_user.id},
                    db=db,
                )

    message = Message(
        offer_id=data.offer_id,
        property_id=data.property_id,
        sender_id=current_user.id,
        content=data.content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
