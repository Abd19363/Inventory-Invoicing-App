"""
E2E conftest.py — Shared fixtures for Selenium automation tests.
"""

import time
import requests
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password

# ============================================================
# Application URLs
# ============================================================

FRONTEND_URL = "http://localhost:3000"
BACKEND_URL  = "http://127.0.0.1:8000"


# ============================================================
# Registered credentials requested by USER
# ============================================================

ADMIN_EMAIL    = "admin@gmail.com"
ADMIN_PASSWORD = "admin54321"

SALES_EMAIL    = "hamza@gmail.com"
SALES_PASSWORD = "hamza54321"


# ============================================================
# Ensure test users exist with exact credentials in database
# ============================================================

def _ensure_user_with_password(email: str, password: str, role: str):
    """Create or update user in local database with exact password & role."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        hashed = hash_password(password)
        if not user:
            user = User(
                username=email,
                email=email,
                password_hash=hashed,
                role=role,
                is_active=True
            )
            db.add(user)
        else:
            user.password_hash = hashed
            user.role = role
            user.is_active = True
        db.commit()
    except Exception as e:
        print(f"Error ensuring test user {email}: {e}")
        db.rollback()
    finally:
        db.close()


@pytest.fixture(scope="function", autouse=True)
def register_test_users():
    """
    Function-scoped fixture: ensure ADMIN and SALES_MANAGER accounts
    exist in the database with exact passwords before each E2E test runs.
    """
    _ensure_user_with_password(ADMIN_EMAIL, ADMIN_PASSWORD, "ADMIN")
    _ensure_user_with_password(SALES_EMAIL, SALES_PASSWORD, "SALES_MANAGER")
    yield


# ============================================================
# WebDriver fixture — Chrome
# ============================================================

@pytest.fixture
def driver():
    """
    Function-scoped fixture: spin up a Chrome WebDriver.
    Comment out --headless for visible browser window testing.
    """
    options = Options()
    # options.add_argument("--headless")          # Commented out for visual browser testing
    options.add_argument("--no-sandbox")        # Required in CI (Docker/GitHub Actions)
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1440,900")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")

    drv = webdriver.Chrome(options=options)
    #drv.implicitly_wait(10)  # Seconds — auto-waits for elements before failing
    yield drv
    drv.quit()


@pytest.fixture
def wait(driver):
    """Return an explicit WebDriverWait instance with 10s timeout."""
    return WebDriverWait(driver, 10)


# ============================================================
# Authenticated driver fixtures
# ============================================================

@pytest.fixture
def admin_driver(driver, wait):
    """Return a driver instance that is already logged in as ADMIN."""
    from tests.e2e.pages.login_page import LoginPage
    page = LoginPage(driver, wait)
    page.open()
    page.select_role("ADMIN")
    page.login(ADMIN_EMAIL, ADMIN_PASSWORD)
    page.wait_for_dashboard()
    return driver


@pytest.fixture
def sales_driver(driver, wait):
    """Return a driver instance that is already logged in as SALES_MANAGER."""
    from tests.e2e.pages.login_page import LoginPage
    page = LoginPage(driver, wait)
    page.open()
    page.select_role("SALES_MANAGER")
    page.login(SALES_EMAIL, SALES_PASSWORD)
    page.wait_for_dashboard()
    return driver
