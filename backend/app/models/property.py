import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Enum, ForeignKey, DateTime, Float, Boolean, Text, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class PropertyType(str, enum.Enum):
    apartment = "apartment"
    house = "house"
    villa = "villa"
    studio = "studio"
    office = "office"
    retail = "retail"
    warehouse = "warehouse"


class PropertyCategory(str, enum.Enum):
    residential = "residential"
    professional = "professional"


class PropertyStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    sold = "sold"


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    surface: Mapped[float] = mapped_column(Float, nullable=False)
    rooms: Mapped[int] = mapped_column(Integer, nullable=False)
    type: Mapped[PropertyType] = mapped_column(Enum(PropertyType), nullable=False)
    category: Mapped[PropertyCategory] = mapped_column(Enum(PropertyCategory), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    dpe_rating: Mapped[str | None] = mapped_column(String(1), nullable=True)
    coup_de_coeur: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[PropertyStatus] = mapped_column(Enum(PropertyStatus), nullable=False, default=PropertyStatus.draft)
    floor: Mapped[int | None] = mapped_column(Integer, nullable=True)
    parking: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    cellar: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    garden: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    agency_id: Mapped[str] = mapped_column(String(36), ForeignKey("agencies.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    agent: Mapped["User"] = relationship("User", back_populates="properties", foreign_keys=[agent_id])
    agency: Mapped["Agency"] = relationship("Agency", back_populates="properties")
    photos: Mapped[list["Photo"]] = relationship("Photo", back_populates="property", cascade="all, delete-orphan")
    favorites: Mapped[list["Favorite"]] = relationship("Favorite", back_populates="property", cascade="all, delete-orphan")
    offers: Mapped[list["Offer"]] = relationship("Offer", back_populates="property")
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="property")
    messages: Mapped[list["Message"]] = relationship("Message", back_populates="property", foreign_keys="Message.property_id")
