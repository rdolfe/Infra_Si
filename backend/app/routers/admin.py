from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.agency import Agency
from app.models.property import Property
from app.models.transaction import Transaction, TransactionStatus
from app.models.user import User, UserRole
from app.schemas.agency import AgencyCreate, AgencyRead
from app.schemas.user import UserRead

router = APIRouter(prefix="/admin", tags=["admin"])

_admin_only = require_role(UserRole.admin)


class AdminUserUpdate(BaseModel):
    role: Optional[UserRole] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _: User = Depends(_admin_only),
):
    return {
        "total_users": db.query(User).count(),
        "total_listings": db.query(Property).count(),
        "active_transactions": db.query(Transaction)
        .filter(Transaction.status == TransactionStatus.in_progress)
        .count(),
        "total_agencies": db.query(Agency).count(),
    }


@router.get("/users", response_model=list[UserRead])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(_admin_only),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.put("/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: str,
    data: AdminUserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(_admin_only),
):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if data.role is not None:
        user.role = data.role
    if data.name is not None:
        user.name = data.name
    if data.email is not None:
        user.email = data.email
    db.commit()
    db.refresh(user)
    return user


@router.get("/agencies", response_model=list[AgencyRead])
def list_agencies(
    db: Session = Depends(get_db),
    _: User = Depends(_admin_only),
):
    return db.query(Agency).order_by(Agency.name).all()


@router.post("/agencies", response_model=AgencyRead, status_code=status.HTTP_201_CREATED)
def create_agency(
    data: AgencyCreate,
    db: Session = Depends(get_db),
    _: User = Depends(_admin_only),
):
    agency = Agency(name=data.name, city=data.city, address=data.address)
    db.add(agency)
    db.commit()
    db.refresh(agency)
    return agency
