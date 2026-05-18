from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.document import Document
from app.models.transaction import Transaction
from app.models.user import User, UserRole
from app.schemas.document import DocumentRead, DocumentSignPayload
from app.services.document_service import upload_document, sign_document

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
def upload(
    transaction_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.agent)),
):
    return upload_document(transaction_id, file, current_user.id, db)


@router.get("/{document_id}", response_model=DocumentRead)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.get(Document, document_id)
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found"
        )

    tx = db.get(Transaction, doc.transaction_id)
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

    return doc


@router.post("/{document_id}/sign", response_model=DocumentRead)
def sign(
    document_id: str,
    payload: DocumentSignPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.client)),
):
    if not payload.confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="confirmed must be true to sign",
        )
    return sign_document(document_id, current_user.id, db)
