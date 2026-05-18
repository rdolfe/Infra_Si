from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict
from app.models.offer import OfferStatus


class OfferCreate(BaseModel):
    property_id: str
    proposed_price: float
    message: str | None = None


class OfferRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    property_id: str
    client_id: str
    agent_id: str
    proposed_price: float
    counter_price: float | None
    status: OfferStatus
    created_at: datetime


class OfferUpdate(BaseModel):
    action: Literal["accept", "counter", "reject"]
    new_price: float | None = None
