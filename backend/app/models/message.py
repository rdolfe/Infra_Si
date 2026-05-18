import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    offer_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("offers.id"), nullable=True)
    property_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("properties.id"), nullable=True)
    sender_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    offer: Mapped["Offer | None"] = relationship("Offer", back_populates="messages", foreign_keys=[offer_id])
    property: Mapped["Property | None"] = relationship("Property", back_populates="messages", foreign_keys=[property_id])
    sender: Mapped["User"] = relationship("User", back_populates="messages_sent")
