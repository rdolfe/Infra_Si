import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Enum, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class OfferStatus(str, enum.Enum):
    pending = "pending"
    countered = "countered"
    accepted = "accepted"
    rejected = "rejected"


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    property_id: Mapped[str] = mapped_column(String(36), ForeignKey("properties.id"), nullable=False)
    client_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    proposed_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    counter_price: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    status: Mapped[OfferStatus] = mapped_column(Enum(OfferStatus), nullable=False, default=OfferStatus.pending)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    property: Mapped["Property"] = relationship("Property", back_populates="offers")
    client: Mapped["User"] = relationship("User", back_populates="offers_as_client", foreign_keys=[client_id])
    agent: Mapped["User"] = relationship("User", back_populates="offers_as_agent", foreign_keys=[agent_id])
    transaction: Mapped["Transaction | None"] = relationship("Transaction", back_populates="offer", uselist=False)
    messages: Mapped[list["Message"]] = relationship("Message", back_populates="offer", foreign_keys="Message.offer_id")
