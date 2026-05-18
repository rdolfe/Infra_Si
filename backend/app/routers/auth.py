from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import register_user, authenticate_user, refresh_tokens

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    user = register_user(data, db)
    return user


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return authenticate_user(data.email, data.password, db)


@router.post("/refresh")
def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    return refresh_tokens(data.refresh_token, db)
