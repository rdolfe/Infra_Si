from pydantic import BaseModel


class HeatmapFeature(BaseModel):
    type: str = "Feature"
    geometry: dict
    properties: dict


class HeatmapFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: list[HeatmapFeature]


class HotZone(BaseModel):
    zone_name: str
    lat: float
    lng: float
    score: float
    avg_price: float
    listing_count: int
