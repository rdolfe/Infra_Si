from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.property import PropertyType, PropertyCategory, PropertyStatus
from app.schemas.agency import AgencyRead


class PhotoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    url: str
    display_order: int


class PropertyCreate(BaseModel):
    title: str
    description: str
    price: float
    surface: float
    rooms: int
    type: PropertyType
    category: PropertyCategory
    address: str
    lat: float | None = None
    lng: float | None = None
    dpe_rating: str | None = None
    coup_de_coeur: bool = False
    floor: int | None = None
    parking: bool = False
    cellar: bool = False
    garden: bool = False
    agency_id: str


class PropertyUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    surface: float | None = None
    rooms: int | None = None
    type: PropertyType | None = None
    category: PropertyCategory | None = None
    address: str | None = None
    lat: float | None = None
    lng: float | None = None
    dpe_rating: str | None = None
    coup_de_coeur: bool | None = None
    status: PropertyStatus | None = None
    floor: int | None = None
    parking: bool | None = None
    cellar: bool | None = None
    garden: bool | None = None


class PropertySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    price: float
    surface: float
    rooms: int
    type: PropertyType
    category: PropertyCategory
    address: str
    dpe_rating: str | None
    coup_de_coeur: bool
    status: PropertyStatus
    lat: float | None
    lng: float | None
    photos: list[PhotoRead]


class PropertyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    price: float
    surface: float
    rooms: int
    type: PropertyType
    category: PropertyCategory
    address: str
    lat: float | None
    lng: float | None
    dpe_rating: str | None
    coup_de_coeur: bool
    status: PropertyStatus
    floor: int | None
    parking: bool
    cellar: bool
    garden: bool
    agent_id: str
    agency_id: str
    created_at: datetime
    photos: list[PhotoRead]
    agency: AgencyRead | None = None
