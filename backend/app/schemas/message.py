from datetime import datetime
from pydantic import BaseModel, ConfigDict, model_validator


class MessageThreadRead(BaseModel):
    offer_id: str
    property_id: str | None
    last_message: str
    last_message_at: datetime
    unread_count: int


class MessageCreate(BaseModel):
    offer_id: str | None = None
    property_id: str | None = None
    content: str

    @model_validator(mode="after")
    def check_thread_ref(self) -> "MessageCreate":
        if not self.offer_id and not self.property_id:
            raise ValueError("Either offer_id or property_id must be set")
        return self


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    offer_id: str | None
    property_id: str | None
    sender_id: str
    content: str
    created_at: datetime
