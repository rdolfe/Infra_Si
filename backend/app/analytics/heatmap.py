from sqlalchemy.orm import Session

from app.models.property import Property, PropertyStatus


def compute_heatmap(db: Session) -> dict:
    """
    Cluster published properties by 0.01° geo cell (≈1 km²),
    compute average price per cell, and return a GeoJSON FeatureCollection.
    Each feature is a small square polygon with avg_price + count properties.
    """
    properties = (
        db.query(Property)
        .filter(
            Property.status == PropertyStatus.published,
            Property.lat.isnot(None),
            Property.lng.isnot(None),
        )
        .all()
    )

    cells: dict[tuple, list[float]] = {}
    for prop in properties:
        cell = (round(prop.lat, 2), round(prop.lng, 2))
        cells.setdefault(cell, []).append(float(prop.price))

    half = 0.005  # half of one 0.01° cell

    features = []
    for (lat, lng), prices in cells.items():
        avg_price = sum(prices) / len(prices)
        features.append(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [lng - half, lat - half],
                            [lng + half, lat - half],
                            [lng + half, lat + half],
                            [lng - half, lat + half],
                            [lng - half, lat - half],
                        ]
                    ],
                },
                "properties": {
                    "avg_price": round(avg_price, 2),
                    "count": len(prices),
                    "lat": lat,
                    "lng": lng,
                },
            }
        )

    return {"type": "FeatureCollection", "features": features}
