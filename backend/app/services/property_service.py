from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.favorite import Favorite
from app.models.property import Property, PropertyStatus
from app.models.user import User, UserRole
from app.schemas.property import PropertyCreate, PropertyUpdate


def get_properties(
    db: Session,
    category: str | None = None,
    type: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    min_surface: float | None = None,
    rooms: int | None = None,
    dpe_rating: str | None = None,
    coup_de_coeur: bool | None = None,
    city: str | None = None,
    status: str | None = None,
    agent_id: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Property], int]:
    query = db.query(Property)

    if category:
        query = query.filter(Property.category == category)
    if type:
        query = query.filter(Property.type == type)
    if min_price is not None:
        query = query.filter(Property.price >= min_price)
    if max_price is not None:
        query = query.filter(Property.price <= max_price)
    if min_surface is not None:
        query = query.filter(Property.surface >= min_surface)
    if rooms is not None:
        query = query.filter(Property.rooms == rooms)
    if dpe_rating:
        query = query.filter(Property.dpe_rating == dpe_rating)
    if coup_de_coeur is not None:
        query = query.filter(Property.coup_de_coeur == coup_de_coeur)
    if city:
        query = query.filter(Property.address.ilike(f"%{city}%"))
    if agent_id:
        query = query.filter(Property.agent_id == agent_id)
    if status:
        query = query.filter(Property.status == status)
    elif agent_id is None:
        query = query.filter(Property.status == PropertyStatus.published)

    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return items, total


def get_property_by_id(property_id: str, db: Session) -> Property:
    prop = db.get(Property, property_id)
    if prop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found")
    return prop


def create_property(data: PropertyCreate, agent_id: str, db: Session) -> Property:
    prop = Property(
        title=data.title,
        description=data.description,
        price=data.price,
        surface=data.surface,
        rooms=data.rooms,
        type=data.type,
        category=data.category,
        address=data.address,
        lat=data.lat,
        lng=data.lng,
        dpe_rating=data.dpe_rating,
        coup_de_coeur=data.coup_de_coeur,
        floor=data.floor,
        parking=data.parking,
        cellar=data.cellar,
        garden=data.garden,
        agent_id=agent_id,
        agency_id=data.agency_id,
        status=PropertyStatus.draft,
    )
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


def update_property(property_id: str, data: PropertyUpdate, current_user: User, db: Session) -> Property:
    prop = get_property_by_id(property_id, db)

    if current_user.role == UserRole.agent and prop.agent_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot modify another agent's listing")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(prop, field, value)

    db.commit()
    db.refresh(prop)
    return prop


def delete_property(property_id: str, current_user: User, db: Session) -> None:
    prop = get_property_by_id(property_id, db)

    if current_user.role == UserRole.agent and prop.agent_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another agent's listing")

    db.delete(prop)
    db.commit()


def toggle_favorite(client_id: str, property_id: str, db: Session) -> dict:
    get_property_by_id(property_id, db)

    fav = db.query(Favorite).filter(
        Favorite.client_id == client_id,
        Favorite.property_id == property_id,
    ).first()

    if fav:
        db.delete(fav)
        db.commit()
        return {"favorited": False}
    else:
        fav = Favorite(client_id=client_id, property_id=property_id)
        db.add(fav)
        db.commit()
        return {"favorited": True}
