from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    transaction_id: str
    file_url: str
    uploaded_by: str
    signed_at: datetime | None
    signed_by: str | None


class DocumentSignPayload(BaseModel):
    signer_name: str
    confirmed: bool
