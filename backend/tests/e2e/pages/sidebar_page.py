"""
Page Object Model — Sidebar Navigation

Encapsulates all interactions with the collapsible sidebar that
appears on the dashboard, inventory, invoices and reports pages.
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


class SidebarPage:

    def __init__(self, driver, wait):
        self.driver = driver
        self.wait   = wait

    # --------------------------------------------------------
    # Navigation helpers
    # --------------------------------------------------------

    def _click_nav_item(self, text: str):
        """Click a sidebar navigation link by its visible label."""
        self.wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, f"//nav//*[contains(text(), '{text}')]")
            )
        ).click()

    def go_to_dashboard(self):
        self._click_nav_item("Dashboard")
        self.wait.until(EC.url_contains("/Home"))

    def go_to_inventory(self):
        self._click_nav_item("Inventory")
        self.wait.until(EC.url_contains("/Inventory"))

    def go_to_invoices(self):
        self._click_nav_item("Invoicing")
        self.wait.until(EC.url_contains("/Invoices"))

    def go_to_reports(self):
        self._click_nav_item("Reports")
        self.wait.until(EC.url_contains("/Reports"))

    # --------------------------------------------------------
    # Logout
    # --------------------------------------------------------

    def logout(self):
        """Click the Logout button and wait for redirect to /Login."""
        self.wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(), 'Logout')]")
            )
        ).click()
        self.wait.until(EC.url_contains("/Login"))

    # --------------------------------------------------------
    # Role badge
    # --------------------------------------------------------

    def get_role_badge_text(self) -> str:
        """Return the text of the role badge shown in the sidebar."""
        try:
            el = self.driver.find_element(
                By.XPATH, "//*[contains(text(), 'Admin') or contains(text(), 'Sales Manager')]"
            )
            return el.text.strip()
        except Exception:
            return ""

    # --------------------------------------------------------
    # Create Invoice quick button (ADMIN only)
    # --------------------------------------------------------

    def click_create_invoice(self):
        self.wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//button[contains(text(), 'Create Invoice')]")
            )
        ).click()
        self.wait.until(EC.url_contains("/Invoices/Create"))
