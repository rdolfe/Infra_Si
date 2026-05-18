import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Enum, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class TransactionStatus(str, enum.Enum):
    in_progress = "in_progress"
    completed = "completed"


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    property_id: Mapped[str] = mapped_column(String(36), ForeignKey("properties.id"), nullable=False)
    offer_id: Mapped[str] = mapped_column(String(36), ForeignKey("offers.id"), nullable=False, unique=True)
    client_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    status: Mapped[TransactionStatus] = mapped_column(Enum(TransactionStatus), nullable=False, default=TransactionStatus.in_progress)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    property: Mapped["Property"] = relationship("Property", back_populates="transactions")
    offer: Mapped["Offer"] = relationship("Offer", back_populates="transaction")
    client: Mapped["User"] = relationship("User", back_populates="transactions_as_client", foreign_keys=[client_id])
    agent: Mapped["User"] = relationship("User", back_populates="transactions_as_agent", foreign_keys=[agent_id])
    documents: Mapped[list["Document"]] = relationship("Document", back_populates="transaction", cascade="all, delete-orphan")
