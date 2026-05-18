from sqlalchemy import String, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (PrimaryKeyConstraint("client_id", "property_id"),)

    client_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    property_id: Mapped[str] = mapped_column(String(36), ForeignKey("properties.id"), nullable=False)

    client: Mapped["User"] = relationship("User", back_populates="favorites", foreign_keys=[client_id])
    property: Mapped["Property"] = relationship("Property", back_populates="favorites")
