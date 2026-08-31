import os
from pathlib import Path
import sys

# =========================================================
# TEST ENVIRONMENT
# =========================================================

os.environ["TESTING"] = "True"
os.environ["JWT_SECRET_KEY"] = "test_secret_key_for_unit_tests_12345"

# Use PostgreSQL for tests.
# TEST_DATABASE_URL can be supplied by CI or locally.
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    os.getenv("DATABASE_URL")
)

if not TEST_DATABASE_URL:
    raise RuntimeError(
        "TEST_DATABASE_URL or DATABASE_URL must be configured for tests."
    )

# Make the application use the PostgreSQL test database
# before importing any application modules.
os.environ["DATABASE_URL"] = TEST_DATABASE_URL

# Make backend directory available for imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


# =========================================================
# IMPORTS
# =========================================================

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.database
from app.database import Base, get_db


# =========================================================
# TEST DATABASE
# =========================================================

engine = create_engine(
    TEST_DATABASE_URL
)

# Replace the application's engine with the test PostgreSQL engine
app.database.engine = engine


TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


from app.main import app


# =========================================================
# DATABASE OVERRIDE
# =========================================================

def override_get_db():
    db = TestingSessionLocal()

    try:
        yield db

    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


# =========================================================
# CREATE TEST DATABASE SCHEMA
# =========================================================

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():

    Base.metadata.create_all(bind=engine)

    yield

    Base.metadata.drop_all(bind=engine)


# =========================================================
# DATABASE CLEANUP PER TEST
# =========================================================

@pytest.fixture(autouse=True)
def clean_database():

    db = TestingSessionLocal()

    for table in reversed(Base.metadata.sorted_tables):
        db.execute(table.delete())

    db.commit()
    db.close()

    yield


# =========================================================
# REUSABLE FIXTURES
# =========================================================

@pytest.fixture
def client():

    return TestClient(app)


@pytest.fixture
def admin_token(client):

    client.post(
        "/auth/register",
        json={
            "email": "admin@example.com",
            "password": "Admin123!",
            "role": "ADMIN"
        }
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "admin@example.com",
            "password": "Admin123!"
        }
    )

    assert response.status_code == 200

    return response.json()["access_token"]


@pytest.fixture
def sales_manager_token(client):

    client.post(
        "/auth/register",
        json={
            "email": "manager@example.com",
            "password": "Manager123!",
            "role": "SALES_MANAGER"
        }
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "manager@example.com",
            "password": "Manager123!"
        }
    )

    assert response.status_code == 200

    return response.json()["access_token"]


@pytest.fixture
def admin_headers(admin_token):

    return {
        "Authorization": f"Bearer {admin_token}"
    }


@pytest.fixture
def sales_manager_headers(sales_manager_token):

    return {
        "Authorization": f"Bearer {sales_manager_token}"
    }