from pydantic import BaseModel, ConfigDict


class AgencyCreate(BaseModel):
    name: str
    city: str
    address: str


class AgencyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    city: str
    address: str
