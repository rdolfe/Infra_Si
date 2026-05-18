import uuid
from datetime import datetime
from sqlalchemy import String, Enum, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

import enum


class UserRole(str, enum.Enum):
    visitor = "visitor"
    client = "client"
    agent = "agent"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False, default=UserRole.client)
    agency_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("agencies.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    agency: Mapped["Agency | None"] = relationship("Agency", back_populates="users")
    properties: Mapped[list["Property"]] = relationship("Property", back_populates="agent", foreign_keys="Property.agent_id")
    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="client", foreign_keys="Favorite.client_id")
    offers_as_client: Mapped[list["Offer"]] = relationship("Offer", back_populates="client", foreign_keys="Offer.client_id")
    offers_as_agent: Mapped[list["Offer"]] = relationship("Offer", back_populates="agent", foreign_keys="Offer.agent_id")
    transactions_as_client: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="client", foreign_keys="Transaction.client_id")
    transactions_as_agent: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="agent", foreign_keys="Transaction.agent_id")
    documents_uploaded: Mapped[list["Document"]] = relationship("Document", back_populates="uploader", foreign_keys="Document.uploaded_by")
    documents_signed: Mapped[list["Document"]] = relationship("Document", back_populates="signer", foreign_keys="Document.signed_by")
    messages_sent: Mapped[list["Message"]] = relationship("Message", back_populates="sender")
    notifications: Mapped[list["Notification"]] = relationship("Notification", back_populates="user")
