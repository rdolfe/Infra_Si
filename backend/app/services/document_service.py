import os
import uuid
from datetime import datetime

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document
from app.models.transaction import Transaction, TransactionStatus
from app.models.user import UserRole
from app.services.notification_service import create_notification


def upload_document(
    transaction_id: str, file: UploadFile, agent_id: str, db: Session
) -> Document:
    tx = db.get(Transaction, transaction_id)
    if tx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found"
        )
    if tx.agent_id != agent_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the agent on this transaction",
        )

    upload_dir = os.path.join(
        os.path.dirname(__file__), "..", "..", settings.UPLOAD_DIR
    )
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename or "")[-1].lower() or ".pdf"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(upload_dir, filename)

    with open(filepath, "wb") as f:
        f.write(file.file.read())

    doc = Document(
        transaction_id=transaction_id,
        file_url=f"/static/uploads/{filename}",
        uploaded_by=agent_id,
        signed_at=None,
        signed_by=None,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def sign_document(document_id: str, client_id: str, db: Session) -> Document:
    doc = db.get(Document, document_id)
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found"
        )

    tx = db.get(Transaction, doc.transaction_id)
    if tx is None or tx.client_id != client_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not the client on this transaction",
        )

    if doc.signed_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document already signed",
        )

    doc.signed_at = datetime.utcnow()
    doc.signed_by = client_id

    all_docs = (
        db.query(Document)
        .filter(Document.transaction_id == doc.transaction_id)
        .all()
    )
    all_signed = all(
        d.signed_at is not None for d in all_docs if d.id != doc.id
    ) and doc.signed_at is not None

    if all_signed:
        tx.status = TransactionStatus.completed
        create_notification(
            user_id=tx.agent_id,
            type="transaction_completed",
            payload={
                "transaction_id": tx.id,
                "property_id": tx.property_id,
            },
            db=db,
        )

    db.commit()
    db.refresh(doc)
    return doc
