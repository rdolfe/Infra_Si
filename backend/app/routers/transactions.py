from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.transaction import Transaction
from app.models.user import User, UserRole
from app.schemas.transaction import TransactionRead

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionRead])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.client:
        return (
            db.query(Transaction)
            .filter(Transaction.client_id == current_user.id)
            .order_by(Transaction.created_at.desc())
            .all()
        )
    if current_user.role == UserRole.agent:
        return (
            db.query(Transaction)
            .filter(Transaction.agent_id == current_user.id)
            .order_by(Transaction.created_at.desc())
            .all()
        )
    return db.query(Transaction).order_by(Transaction.created_at.desc()).all()


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tx = db.get(Transaction, transaction_id)
    if tx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )
    if current_user.role == UserRole.client and tx.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your transaction"
        )
    if current_user.role == UserRole.agent and tx.agent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not your transaction"
        )
    return tx
