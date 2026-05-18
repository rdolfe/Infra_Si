import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id: Mapped[str] = mapped_column(String(36), ForeignKey("transactions.id"), nullable=False)
    file_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    uploaded_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    signed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    signed_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)

    transaction: Mapped["Transaction"] = relationship("Transaction", back_populates="documents")
    uploader: Mapped["User"] = relationship("User", back_populates="documents_uploaded", foreign_keys=[uploaded_by])
    signer: Mapped["User | None"] = relationship("User", back_populates="documents_signed", foreign_keys=[signed_by])
