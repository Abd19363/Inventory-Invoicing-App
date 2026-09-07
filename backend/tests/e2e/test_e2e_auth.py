"""
E2E Automation Tests — Authentication Flows
============================================
Covers:
  TC-AUTH-01  Login page loads with role selection screen
  TC-AUTH-02  Select Admin role → auth form appears
  TC-AUTH-03  Login with valid ADMIN credentials → redirected to /Home
  TC-AUTH-04  Login with wrong password → error message displayed
  TC-AUTH-05  Register a new SALES_MANAGER → success message shown
  TC-AUTH-06  Logout from sidebar → redirected back to /Login
"""

import time
import pytest
from tests.e2e.conftest import (
    FRONTEND_URL,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    SALES_EMAIL,
    SALES_PASSWORD,
)
from tests.e2e.pages.login_page  import LoginPage
from tests.e2e.pages.sidebar_page import SidebarPage
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


# ============================================================
# TC-AUTH-01
# ============================================================

class TestLoginPageLoads:

    def test_role_selection_screen_renders(self, driver, wait):
        """
        Navigating to /Login should show the role-selection screen
        with both Admin and Sales Manager cards.
        """
        driver.get(f"{FRONTEND_URL}/Login")

        wait.until(
            EC.visibility_of_element_located(
                (By.XPATH, "//*[contains(text(), 'Choose your access level')]")
            )
        )

        page_source = driver.page_source
        assert "Admin"          in page_source, "Admin card not found on login page"
        assert "Sales Manager"  in page_source, "Sales Manager card not found on login page"
        assert "InvPro SaaS"    in page_source, "Brand name not found on login page"


# ============================================================
# TC-AUTH-02
# ============================================================

class TestRoleSelection:

    def test_select_admin_role_shows_auth_form(self, driver, wait):
        """
        Clicking the Admin role card should transition to Step 2
        and display the email/password form.
        """
        page = LoginPage(driver, wait)
        page.open()
        page.select_role("ADMIN")

        # Email field must be visible after role selection
        email_field = driver.find_element(By.ID, "email")
        assert email_field.is_displayed(), "Email input not visible after selecting Admin role"

        # Admin portal label should be present
        assert "Admin" in driver.page_source

    def test_select_sales_manager_role_shows_auth_form(self, driver, wait):
        """
        Clicking the Sales Manager role card should show the auth form
        with the Sales Manager portal label.
        """
        page = LoginPage(driver, wait)
        page.open()
        page.select_role("SALES_MANAGER")

        email_field = driver.find_element(By.ID, "email")
        assert email_field.is_displayed()
        assert "Sales Manager" in driver.page_source


# ============================================================
# TC-AUTH-03
# ============================================================

class TestValidLogin:

    def test_admin_login_redirects_to_home(self, driver, wait):
        """
        A registered ADMIN user can log in successfully and
        is redirected to the /Home dashboard.
        """
        page = LoginPage(driver, wait)
        page.open()
        page.select_role("ADMIN")
        page.login(ADMIN_EMAIL, ADMIN_PASSWORD)
        page.wait_for_dashboard()

        assert "/Home" in driver.current_url, (
            f"Expected /Home, got: {driver.current_url}"
        )

    def test_sales_manager_login_redirects_to_home(self, driver, wait):
        """
        A registered SALES_MANAGER user can log in and is
        redirected to the /Home dashboard.
        """
        page = LoginPage(driver, wait)
        page.open()
        page.select_role("SALES_MANAGER")
        page.login(SALES_EMAIL, SALES_PASSWORD)
        page.wait_for_dashboard()

        assert "/Home" in driver.current_url


# ============================================================
# TC-AUTH-04
# ============================================================

class TestInvalidLogin:

    def test_wrong_password_shows_error(self, driver, wait):
        """
        Submitting the login form with an incorrect password must
        display an error message and NOT navigate to /Home.
        """
        page = LoginPage(driver, wait)
        page.open()
        page.select_role("ADMIN")
        page.login(ADMIN_EMAIL, "WrongPassword999!")

        error = page.get_error_message()
        assert error != "", "Expected an error message for invalid credentials"
        assert "/Home" not in driver.current_url, (
            "Should NOT redirect to /Home on failed login"
        )

    def test_empty_email_shows_error(self, driver, wait):
        """
        Submitting with an empty email must show a validation error.
        """
        page = LoginPage(driver, wait)
        page.open()
        page.select_role("ADMIN")
        page.enter_password("SomePass123!")
        page.click_sign_in()

        error = page.get_error_message()
        assert error != "", "Expected validation error for empty email"


# ============================================================
# TC-AUTH-05
# ============================================================

class TestLogout:

    def test_logout_redirects_to_login(self, admin_driver, wait):
        """
        Clicking the Logout button in the sidebar should clear
        the session and redirect the user back to /Login.
        """
        sidebar = SidebarPage(admin_driver, wait)
        sidebar.logout()

        assert "/Login" in admin_driver.current_url, (
            f"Expected /Login after logout, got: {admin_driver.current_url}"
        )
