import pytest
from datetime import timedelta
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from starlette.testclient import TestClient

from app.core.database import Base, get_db
from app.core.security import hash_password, create_access_token
from app.main import app
from app.models.user import User, UserRole
from app.models.agency import Agency
from app.models.property import Property, PropertyStatus


TEST_DB_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def engine():
    eng = create_engine(
        TEST_DB_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(eng)
    yield eng
    eng.dispose()


@pytest.fixture(scope="function")
def db(engine):
    session = sessionmaker(bind=engine, autocommit=False, autoflush=False)()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def _make_user(db, name: str, email: str, role: UserRole, agency_id: str | None = None) -> User:
    user = User(
        name=name,
        email=email,
        password_hash=hash_password("testpass123"),
        role=role,
        agency_id=agency_id,
    )
    db.add(user)
    db.flush()
    return user


def _make_agency(db, name: str = "Agence Test") -> Agency:
    agency = Agency(name=name, city="Paris", address="1 rue de la Paix")
    db.add(agency)
    db.flush()
    return agency


def _make_property(db, agent_id: str, agency_id: str | None = None) -> Property:
    prop = Property(
        title="Appartement Paris",
        description="Beau bien",
        price=300000,
        surface=60,
        rooms=3,
        type="apartment",
        category="residential",
        address="10 rue Lafayette, Paris",
        lat=48.87,
        lng=2.34,
        dpe_rating="B",
        coup_de_coeur=False,
        status=PropertyStatus.published,
        agent_id=agent_id,
        agency_id=agency_id,
    )
    db.add(prop)
    db.flush()
    return prop


def _auth_headers(user_id: str, role: UserRole) -> dict:
    token = create_access_token({"sub": user_id, "role": role}, expires_delta=timedelta(hours=1))
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def agency(db) -> Agency:
    return _make_agency(db)


@pytest.fixture
def agent_user(db, agency) -> User:
    return _make_user(db, "Agent Test", "agent@test.com", UserRole.agent, agency.id)


@pytest.fixture
def client_user(db) -> User:
    return _make_user(db, "Client Test", "client@test.com", UserRole.client)


@pytest.fixture
def admin_user(db) -> User:
    return _make_user(db, "Admin Test", "admin@test.com", UserRole.admin)


@pytest.fixture
def second_agent(db, agency) -> User:
    return _make_user(db, "Agent Deux", "agent2@test.com", UserRole.agent, agency.id)


@pytest.fixture
def published_property(db, agent_user, agency) -> Property:
    return _make_property(db, agent_user.id, agency.id)


@pytest.fixture
def agent_headers(agent_user) -> dict:
    return _auth_headers(agent_user.id, agent_user.role)


@pytest.fixture
def client_headers(client_user) -> dict:
    return _auth_headers(client_user.id, client_user.role)


@pytest.fixture
def admin_headers(admin_user) -> dict:
    return _auth_headers(admin_user.id, admin_user.role)


@pytest.fixture
def second_agent_headers(second_agent) -> dict:
    return _auth_headers(second_agent.id, second_agent.role)
