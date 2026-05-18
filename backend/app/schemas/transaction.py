from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.transaction import TransactionStatus
from app.schemas.document import DocumentRead


class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    property_id: str
    offer_id: str
    client_id: str
    agent_id: str
    status: TransactionStatus
    created_at: datetime
    documents: list[DocumentRead] = []
