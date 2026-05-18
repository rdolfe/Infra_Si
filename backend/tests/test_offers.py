import pytest
from app.models.notification import Notification
from app.models.transaction import Transaction


def test_submit_offer_as_client(client, client_headers, published_property, db):
    res = client.post(
        "/api/offers",
        json={"property_id": published_property.id, "proposed_price": 280000},
        headers=client_headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "pending"
    assert data["proposed_price"] == 280000.0

    notification = db.query(Notification).filter(
        Notification.user_id == published_property.agent_id
    ).first()
    assert notification is not None
    assert notification.type == "new_offer"


def test_submit_offer_as_agent(client, agent_headers, published_property):
    res = client.post(
        "/api/offers",
        json={"property_id": published_property.id, "proposed_price": 280000},
        headers=agent_headers,
    )
    assert res.status_code == 403


def test_counter_offer_as_agent(client, client_headers, agent_headers, published_property, db, client_user):
    offer_res = client.post(
        "/api/offers",
        json={"property_id": published_property.id, "proposed_price": 250000},
        headers=client_headers,
    )
    offer_id = offer_res.json()["id"]

    res = client.put(
        f"/api/offers/{offer_id}",
        json={"action": "counter", "new_price": 270000},
        headers=agent_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "countered"
    assert data["counter_price"] == 270000.0

    notification = db.query(Notification).filter(
        Notification.user_id == client_user.id
    ).first()
    assert notification is not None


def test_accept_offer_creates_transaction(client, client_headers, agent_headers, published_property, db):
    offer_res = client.post(
        "/api/offers",
        json={"property_id": published_property.id, "proposed_price": 290000},
        headers=client_headers,
    )
    offer_id = offer_res.json()["id"]

    res = client.put(
        f"/api/offers/{offer_id}",
        json={"action": "accept"},
        headers=agent_headers,
    )
    assert res.status_code == 200
    assert res.json()["status"] == "accepted"

    tx = db.query(Transaction).filter(Transaction.offer_id == offer_id).first()
    assert tx is not None


def test_reject_offer(client, client_headers, agent_headers, published_property):
    offer_res = client.post(
        "/api/offers",
        json={"property_id": published_property.id, "proposed_price": 200000},
        headers=client_headers,
    )
    offer_id = offer_res.json()["id"]

    res = client.put(
        f"/api/offers/{offer_id}",
        json={"action": "reject"},
        headers=agent_headers,
    )
    assert res.status_code == 200
    assert res.json()["status"] == "rejected"
