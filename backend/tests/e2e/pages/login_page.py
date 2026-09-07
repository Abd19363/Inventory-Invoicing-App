"""
Page Object Model — Login Page (/Login)

Encapsulates all selectors and browser interactions for the two-step
login flow:
  Step 1: Role selection (Admin / Sales Manager cards)
  Step 2: Email + Password form (Sign In / Register tabs)
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC


class LoginPage:

    URL = "http://localhost:3000/Login"

    def __init__(self, driver, wait):
        self.driver = driver
        self.wait   = wait

    # --------------------------------------------------------
    # Navigation
    # --------------------------------------------------------

    def open(self, role: str = None):
        """Navigate to the /Login page, optionally passing a role query param."""
        target_url = f"{self.URL}?role={role}" if role else self.URL
        self.driver.get(target_url)

        if role:
            # If role param was passed, the auth form (email field) loads directly
            self.wait.until(EC.visibility_of_element_located((By.ID, "email")))
        else:
            # Wait until the role-selection heading is visible
            self.wait.until(
                EC.visibility_of_element_located(
                    (By.XPATH, "//*[contains(text(), 'Choose your access level')]")
                )
            )

    # --------------------------------------------------------
    # Step 1 — Role Selection
    # --------------------------------------------------------

    def select_role(self, role: str):
        """
        Click the role card that matches the given role key.
        role: 'ADMIN' | 'SALES_MANAGER'
        """
        role_label_map = {
            "ADMIN": "Admin",
            "SALES_MANAGER": "Sales Manager",
        }
        role_name = role_label_map.get(role, "Admin")

        # Find the card button containing the role header
        xpath = f"//button[.//h2[contains(text(), '{role_name}')]] | //button[contains(., '{role_name}')]"
        btn = self.wait.until(EC.presence_of_element_located((By.XPATH, xpath)))

        try:
            btn.click()
        except Exception:
            self.driver.execute_script("arguments[0].click();", btn)

        # Wait for the auth form to appear
        self.wait.until(
            EC.visibility_of_element_located((By.ID, "email"))
        )

    # --------------------------------------------------------
    # Step 2 — Auth Form
    # --------------------------------------------------------

    def click_tab(self, tab: str):
        """Switch between 'Sign In' and 'Register' tabs."""
        # Target tab button inside the top tab container
        btn = self.wait.until(
            EC.presence_of_element_located(
                (By.XPATH, f"//div[contains(@class, 'bg-[#091525]')]//button[normalize-space()='{tab}']")
            )
        )
        try:
            btn.click()
        except Exception:
            self.driver.execute_script("arguments[0].click();", btn)

    def _set_input_value(self, element_id: str, value: str):
        """Helper to clear React controlled inputs safely and send keys."""
        field = self.wait.until(EC.visibility_of_element_located((By.ID, element_id)))
        field.send_keys(Keys.CONTROL + "a")
        field.send_keys(Keys.BACKSPACE)
        if value:
            field.send_keys(value)

    def enter_email(self, email: str):
        self._set_input_value("email", email)

    def enter_password(self, password: str):
        self._set_input_value("password", password)

    def enter_confirm_password(self, password: str):
        self._set_input_value("confirm-password", password)

    def click_sign_in(self):
        """Click the full-width submit button at the bottom of the login form."""
        btn = self.wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//button[contains(@class, 'w-full') and contains(., 'Sign In')]")
            )
        )
        try:
            btn.click()
        except Exception:
            self.driver.execute_script("arguments[0].click();", btn)

    def click_create_account(self):
        """Click the full-width submit button at the bottom of the register form."""
        btn = self.wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//button[contains(@class, 'w-full') and (contains(., 'Create Account') or contains(., 'Register'))]")
            )
        )
        try:
            btn.click()
        except Exception:
            self.driver.execute_script("arguments[0].click();", btn)

    # --------------------------------------------------------
    # Composed actions
    # --------------------------------------------------------

    def login(self, email: str, password: str):
        """Fill and submit the login form."""
        self.enter_email(email)
        self.enter_password(password)
        self.click_sign_in()

    def register(self, email: str, password: str):
        """Switch to Register tab, fill form, and submit."""
        self.click_tab("Register")
        self.enter_email(email)
        self.enter_password(password)
        self.enter_confirm_password(password)
        self.click_create_account()

    # --------------------------------------------------------
    # Assertions / Queries
    # --------------------------------------------------------

    def get_error_message(self) -> str:
        """Return visible error message text, or empty string."""
        try:
            el = self.wait.until(
                EC.visibility_of_element_located(
                    (By.XPATH, "//*[contains(@class,'rose')]")
                )
            )
            return el.text.strip()
        except Exception:
            return ""

    def get_success_message(self) -> str:
        """Return visible success message text, or empty string."""
        try:
            el = self.wait.until(
                EC.visibility_of_element_located(
                    (By.XPATH, "//*[contains(@class,'emerald')]")
                )
            )
            return el.text.strip()
        except Exception:
            return ""

    def wait_for_dashboard(self):
        """Wait until the browser navigates away from /Login to /Home."""
        try:
            self.wait.until(EC.url_contains("/Home"))
        except Exception as e:
            err = self.get_error_message()
            raise Exception(
                f"Failed to navigate to /Home. Page error: '{err}'. Current URL: '{self.driver.current_url}'"
            ) from e
