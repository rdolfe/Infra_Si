import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.favorite import Favorite
from app.models.photo import Photo
from app.models.user import User, UserRole
from app.schemas.property import PropertyCreate, PropertyRead, PropertySummary, PropertyUpdate
from app.services.property_service import (
    create_property,
    delete_property,
    get_properties,
    get_property_by_id,
    toggle_favorite,
    update_property,
)

router = APIRouter(prefix="/properties", tags=["properties"])


class PropertyListResponse:
    pass


@router.get("", response_model=dict)
def list_properties(
    category: str | None = None,
    type: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    min_surface: float | None = None,
    rooms: int | None = None,
    dpe_rating: str | None = None,
    coup_de_coeur: bool | None = None,
    city: str | None = None,
    prop_status: str | None = None,
    agent_id: str | None = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    items, total = get_properties(
        db=db,
        category=category,
        type=type,
        min_price=min_price,
        max_price=max_price,
        min_surface=min_surface,
        rooms=rooms,
        dpe_rating=dpe_rating,
        coup_de_coeur=coup_de_coeur,
        city=city,
        status=prop_status,
        agent_id=agent_id,
        page=page,
        limit=limit,
    )
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": [PropertySummary.model_validate(p) for p in items],
    }


@router.get("/{property_id}", response_model=PropertyRead)
def get_property(property_id: str, db: Session = Depends(get_db)):
    return get_property_by_id(property_id, db)


@router.post("", response_model=PropertyRead, status_code=status.HTTP_201_CREATED)
def create(
    data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.agent, UserRole.admin)),
):
    return create_property(data, current_user.id, db)


@router.put("/{property_id}", response_model=PropertyRead)
def update(
    property_id: str,
    data: PropertyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.agent, UserRole.admin)),
):
    return update_property(property_id, data, current_user, db)


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    property_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.agent, UserRole.admin)),
):
    delete_property(property_id, current_user, db)


@router.post("/{property_id}/favorite", status_code=status.HTTP_200_OK)
def favorite(
    property_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.client)),
):
    return toggle_favorite(current_user.id, property_id, db)


@router.get("/favorites/list", response_model=list[PropertySummary])
def list_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.client)),
):
    favs = (
        db.query(Favorite)
        .filter(Favorite.client_id == current_user.id)
        .all()
    )
    property_ids = [f.property_id for f in favs]
    if not property_ids:
        return []
    from app.models.property import Property
    props = db.query(Property).filter(Property.id.in_(property_ids)).all()
    return [PropertySummary.model_validate(p) for p in props]


@router.post("/{property_id}/photos", status_code=status.HTTP_201_CREATED)
def upload_photo(
    property_id: str,
    file: UploadFile = File(...),
    display_order: int = Form(default=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.agent, UserRole.admin)),
):
    prop = get_property_by_id(property_id, db)

    if current_user.role == UserRole.agent and prop.agent_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot add photos to another agent's listing")

    upload_dir = os.path.join(os.path.dirname(__file__), "..", "..", settings.UPLOAD_DIR)
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename or "")[-1].lower() or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(upload_dir, filename)

    with open(filepath, "wb") as f:
        f.write(file.file.read())

    photo = Photo(
        property_id=property_id,
        url=f"/static/uploads/{filename}",
        display_order=display_order,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return {"id": photo.id, "url": photo.url, "display_order": photo.display_order}
