import pytest


def test_list_properties_public(client, published_property):
    res = client.get("/api/properties")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1


def test_filter_by_category(client, published_property, db):
    res = client.get("/api/properties?category=residential")
    assert res.status_code == 200
    items = res.json()["items"]
    for item in items:
        assert item["category"] == "residential"


def test_create_property_as_agent(client, agent_headers, agent_user):
    payload = {
        "title": "Maison Lyon",
        "description": "Belle maison",
        "price": 450000,
        "surface": 120,
        "rooms": 5,
        "type": "house",
        "category": "residential",
        "address": "5 rue Bellecour, Lyon",
        "lat": 45.75,
        "lng": 4.83,
        "dpe_rating": "C",
        "coup_de_coeur": False,
        "agency_id": agent_user.agency_id,
    }
    res = client.post("/api/properties", json=payload, headers=agent_headers)
    assert res.status_code == 201
    assert res.json()["title"] == "Maison Lyon"


def test_create_property_as_client(client, client_headers, agency):
    payload = {
        "title": "Maison Lyon",
        "description": "Belle maison",
        "price": 450000,
        "surface": 120,
        "rooms": 5,
        "type": "house",
        "category": "residential",
        "address": "5 rue Bellecour, Lyon",
        "lat": 45.75,
        "lng": 4.83,
        "dpe_rating": "C",
        "coup_de_coeur": False,
        "agency_id": agency.id,
    }
    res = client.post("/api/properties", json=payload, headers=client_headers)
    assert res.status_code == 403


def test_update_own_listing_as_agent(client, agent_headers, published_property):
    res = client.put(
        f"/api/properties/{published_property.id}",
        json={"title": "Titre modifié"},
        headers=agent_headers,
    )
    assert res.status_code == 200
    assert res.json()["title"] == "Titre modifié"


def test_update_other_agent_listing(client, second_agent_headers, published_property):
    res = client.put(
        f"/api/properties/{published_property.id}",
        json={"title": "Piratage"},
        headers=second_agent_headers,
    )
    assert res.status_code == 403


def test_toggle_favorite_as_client(client, client_headers, published_property):
    res = client.post(
        f"/api/properties/{published_property.id}/favorite",
        headers=client_headers,
    )
    assert res.status_code == 200
    assert res.json()["favorited"] is True

    res2 = client.post(
        f"/api/properties/{published_property.id}/favorite",
        headers=client_headers,
    )
    assert res2.status_code == 200
    assert res2.json()["favorited"] is False
