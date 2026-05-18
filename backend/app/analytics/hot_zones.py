from sqlalchemy.orm import Session

from app.models.agency import Agency
from app.models.property import Property, PropertyStatus


def compute_hot_zones(db: Session) -> list[dict]:
    """
    Group properties by agency city, score each zone using:
        score = listing_count_norm * 0.4 + avg_price_norm * 0.4 + sold_ratio * 0.2
    All components are normalised to [0, 1] before weighting.
    Returns list sorted by score descending.
    """
    rows = (
        db.query(Property, Agency)
        .join(Agency, Property.agency_id == Agency.id)
        .filter(Property.status.in_([PropertyStatus.published, PropertyStatus.sold]))
        .all()
    )

    if not rows:
        return []

    zones: dict[str, dict] = {}
    for prop, agency in rows:
        city = agency.city
        if city not in zones:
            zones[city] = {
                "lats": [],
                "lngs": [],
                "prices": [],
                "listing_count": 0,
                "sold_count": 0,
            }
        zones[city]["listing_count"] += 1
        zones[city]["prices"].append(float(prop.price))
        if prop.lat is not None:
            zones[city]["lats"].append(prop.lat)
        if prop.lng is not None:
            zones[city]["lngs"].append(prop.lng)
        if prop.status == PropertyStatus.sold:
            zones[city]["sold_count"] += 1

    zone_metrics = []
    for city, data in zones.items():
        avg_price = sum(data["prices"]) / len(data["prices"])
        sold_ratio = data["sold_count"] / data["listing_count"] if data["listing_count"] else 0.0
        lat = sum(data["lats"]) / len(data["lats"]) if data["lats"] else 0.0
        lng = sum(data["lngs"]) / len(data["lngs"]) if data["lngs"] else 0.0
        zone_metrics.append(
            {
                "zone_name": city,
                "lat": lat,
                "lng": lng,
                "avg_price": avg_price,
                "listing_count": data["listing_count"],
                "sold_ratio": sold_ratio,
            }
        )

    max_listing = max(z["listing_count"] for z in zone_metrics) or 1
    min_price = min(z["avg_price"] for z in zone_metrics)
    max_price = max(z["avg_price"] for z in zone_metrics)
    price_range = (max_price - min_price) or 1

    results = []
    for z in zone_metrics:
        listing_norm = z["listing_count"] / max_listing
        price_norm = (z["avg_price"] - min_price) / price_range
        score = round(listing_norm * 0.4 + price_norm * 0.4 + z["sold_ratio"] * 0.2, 4)
        results.append(
            {
                "zone_name": z["zone_name"],
                "lat": z["lat"],
                "lng": z["lng"],
                "score": score,
                "avg_price": round(z["avg_price"], 2),
                "listing_count": z["listing_count"],
            }
        )

    return sorted(results, key=lambda x: x["score"], reverse=True)
