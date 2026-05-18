from datetime import datetime, timedelta, timezone

import pytest
from jose import jwt

from app.core.config import settings


def test_register_success(client):
    res = client.post(
        "/api/auth/register",
        json={"name": "New User", "email": "newuser@test.com", "password": "password123"},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "newuser@test.com"
    assert data["role"] == "client"


def test_register_duplicate_email(client):
    payload = {"name": "User", "email": "dup@test.com", "password": "password123"}
    client.post("/api/auth/register", json=payload)
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 400


def test_login_valid(client):
    client.post(
        "/api/auth/register",
        json={"name": "Login User", "email": "login@test.com", "password": "password123"},
    )
    res = client.post(
        "/api/auth/login",
        json={"email": "login@test.com", "password": "password123"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_wrong_password(client):
    client.post(
        "/api/auth/register",
        json={"name": "User", "email": "wrongpw@test.com", "password": "correct"},
    )
    res = client.post(
        "/api/auth/login",
        json={"email": "wrongpw@test.com", "password": "wrong"},
    )
    assert res.status_code == 401


def test_refresh_token_valid(client):
    client.post(
        "/api/auth/register",
        json={"name": "Refresh User", "email": "refresh@test.com", "password": "password123"},
    )
    login_res = client.post(
        "/api/auth/login",
        json={"email": "refresh@test.com", "password": "password123"},
    )
    refresh_token = login_res.json()["refresh_token"]

    res = client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_refresh_token_expired(client):
    expired_payload = {
        "sub": "00000000-0000-0000-0000-000000000001",
        "role": "client",
        "type": "refresh",
        "exp": datetime.now(timezone.utc) - timedelta(seconds=1),
    }
    expired_token = jwt.encode(
        expired_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    res = client.post(
        "/api/auth/refresh",
        json={"refresh_token": expired_token},
    )
    assert res.status_code == 401
