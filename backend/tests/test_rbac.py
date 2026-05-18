import pytest


def test_admin_only_route_as_client(client, client_headers):
    res = client.get("/api/admin/users", headers=client_headers)
    assert res.status_code == 403


def test_admin_only_route_as_admin(client, admin_headers, admin_user):
    res = client.get("/api/admin/users", headers=admin_headers)
    assert res.status_code == 200
    users = res.json()
    assert isinstance(users, list)


def test_agent_cannot_sign_document(client, agent_headers, db, published_property, client_user, agent_user):
    from app.models.transaction import Transaction
    from app.models.document import Document

    tx = Transaction(
        property_id=published_property.id,
        offer_id="00000000-0000-0000-0000-000000000001",
        client_id=client_user.id,
        agent_id=agent_user.id,
    )
    db.add(tx)
    db.flush()

    doc = Document(
        transaction_id=tx.id,
        file_url="/static/uploads/test.pdf",
        uploaded_by=agent_user.id,
    )
    db.add(doc)
    db.flush()

    res = client.post(
        f"/api/documents/{doc.id}/sign",
        json={"signer_name": "Agent Test", "confirmed": True},
        headers=agent_headers,
    )
    assert res.status_code == 403


def test_client_cannot_upload_document(client, client_headers, db, published_property, client_user, agent_user):
    from app.models.transaction import Transaction

    tx = Transaction(
        property_id=published_property.id,
        offer_id="00000000-0000-0000-0000-000000000002",
        client_id=client_user.id,
        agent_id=agent_user.id,
    )
    db.add(tx)
    db.flush()

    import io
    file_content = b"fake pdf content"
    res = client.post(
        "/api/documents",
        data={"transaction_id": tx.id},
        files={"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")},
        headers=client_headers,
    )
    assert res.status_code == 403
