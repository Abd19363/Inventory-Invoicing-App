"""
Page Object Model — Invoices Page (/Invoices)

Handles:
- Invoice list navigation
- Invoice creation
- Product selection
- Invoice quantity
- Invoice detail navigation
- Mark invoice as paid
- Invoice status verification
- RBAC visibility checks
"""

import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


BASE_URL = "http://localhost:3000"


class InvoicesPage:

    URL = f"{BASE_URL}/Invoices"
    CREATE_URL = f"{BASE_URL}/Invoices/Create"

    def __init__(self, driver, wait):
        self.driver = driver
        self.wait = wait

    # ========================================================
    # NAVIGATION
    # ========================================================

    def open(self):
        """Navigate to the invoice list page."""

        self.driver.get(self.URL)

        self.wait.until(
            EC.presence_of_element_located(
                (
                    By.XPATH,
                    "//h1[contains(translate(normalize-space(.), "
                    "'INVOICE', 'invoice'), 'invoice')]"
                )
            )
        )

    def open_create(self):
        """Navigate to the Create Invoice page."""

        self.driver.get(self.CREATE_URL)

        self.wait.until(
            EC.presence_of_element_located(
                (
                    By.XPATH,
                    "//input[@placeholder='Enter customer name']"
                )
            )
        )

        self.wait.until(
            EC.presence_of_element_located(
                (
                    By.XPATH,
                    "//input[@placeholder='Search by product name or category...']"
                )
            )
        )

    # ========================================================
    # REACT INPUT HELPER
    # ========================================================

    def _set_react_input(self, element, value: str):
        """
        Update a React-controlled input.

        Uses the native HTMLInputElement value setter and
        dispatches input/change events.
        """

        self.driver.execute_script(
            """
            const nativeSetter =
                Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    'value'
                ).set;

            nativeSetter.call(arguments[0], arguments[1]);

            arguments[0].dispatchEvent(
                new Event('input', { bubbles: true })
            );

            arguments[0].dispatchEvent(
                new Event('change', { bubbles: true })
            );
            """,
            element,
            value,
        )

    # ========================================================
    # CUSTOMER DETAILS
    # ========================================================

    def fill_customer_name(self, name: str):
        """Fill Customer Name."""

        field = self.wait.until(
            EC.visibility_of_element_located(
                (
                    By.XPATH,
                    "//input[@placeholder='Enter customer name']"
                )
            )
        )

        field.click()
        field.clear()

        self._set_react_input(field, name)

        self.wait.until(
            lambda d: field.get_attribute("value") == name
        )

    def fill_customer_email(self, email: str):
        """
        Fill Customer Email if the field exists.

        The current Create Invoice page does not contain a
        customer email field, so this method intentionally
        does nothing when it is absent.
        """

        elements = self.driver.find_elements(
            By.XPATH,
            "//input[@type='email' or "
            "@name='customer_email' or "
            "@id='customer_email']"
        )

        if not elements:
            return

        field = elements[0]

        self._set_react_input(field, email)

    def fill_date(self, date_str: str = "2026-09-01"):
        """Fill Invoice Date."""

        date_input = self.wait.until(
            EC.visibility_of_element_located(
                (
                    By.XPATH,
                    "//input[@type='date']"
                )
            )
        )

        self._set_react_input(date_input, date_str)

        self.wait.until(
            lambda d: date_input.get_attribute("value") == date_str
        )

    # ========================================================
    # PRODUCT SELECTION
    # ========================================================

    def select_first_available_product(self, product_name: str):
        """
        Search for the specified product and select the first
        matching result.
        """

        if not product_name or not product_name.strip():
            raise ValueError(
                "product_name must not be empty."
            )

        search_term = product_name.strip()

        picker = self.wait.until(
            EC.visibility_of_element_located(
                (
                    By.XPATH,
                    "//input[@placeholder="
                    "'Search by product name or category...']"
                )
            )
        )

        picker.click()
        picker.clear()

        self._set_react_input(
            picker,
            search_term
        )

        # Wait until the search result containing the product
        # name becomes visible.
        option_xpath = (
            "//button["
            ".//p[normalize-space()="
            f"'{search_term}']"
            "]"
        )

        try:
            option = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, option_xpath)
                )
            )
        except Exception:
            # Fallback for cases where the product name is not
            # wrapped exactly inside the expected <p>.
            option_xpath = (
                "//button["
                f"contains(normalize-space(.), '{search_term}')"
                "]"
            )

            option = self.wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, option_xpath)
                )
            )

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block: 'center'});",
            option
        )

        option.click()

        # Verify that selecting the product updated the
        # search input.
        self.wait.until(
            lambda d: picker.get_attribute("value")
            == search_term
        )

    # ========================================================
    # ADD ITEM
    # ========================================================

    def click_add_item(self):
        """Click '+ Add Item'."""

        button = self.wait.until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    "//button[normalize-space(.)='+ Add Item']"
                )
            )
        )

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block: 'center'});",
            button
        )

        button.click()

        # The selected product should now appear inside
        # the Invoice Items table.
        self.wait.until(
            EC.presence_of_element_located(
                (
                    By.XPATH,
                    "//tbody/tr[td]"
                )
            )
        )

        # Quantity input is rendered only after the item
        # has been added.
        self.wait.until(
            EC.visibility_of_element_located(
                (
                    By.XPATH,
                    "//tbody/tr//input[@type='number']"
                )
            )
        )

    # ========================================================
    # QUANTITY
    # ========================================================

    def set_quantity(self, quantity: int = 1):
        """Set the invoice quantity."""

        if quantity < 1:
            raise ValueError(
                "Invoice quantity must be at least 1."
            )

        qty_field = self.wait.until(
            EC.visibility_of_element_located(
                (
                    By.XPATH,
                    "//tbody/tr//input[@type='number']"
                )
            )
        )

        qty_field.click()
        qty_field.clear()

        self._set_react_input(
            qty_field,
            str(quantity)
        )

        # React may re-render the input, so locate it again
        # rather than relying on the old WebElement.
        self.wait.until(
            lambda d: d.find_element(
                By.XPATH,
                "//tbody/tr//input[@type='number']"
            ).get_attribute("value") == str(quantity)
        )

    # ========================================================
    # SUBMIT INVOICE
    # ========================================================

    def submit_invoice(self):
        """
        Click Create Invoice and wait for navigation to
        /Invoices.

        If navigation does not happen, print useful page
        diagnostics and re-raise the Selenium exception.
        """

        # Make sure date is populated.
        self.fill_date()

        # Make sure an invoice item exists before submitting.
        items = self.driver.find_elements(
            By.XPATH,
            "//tbody/tr"
        )

        if not items:
            raise AssertionError(
                "Cannot submit invoice: no invoice item exists."
            )

        button = self.wait.until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    "//button[normalize-space(.)='Create Invoice']"
                )
            )
        )

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block: 'center'});",
            button
        )

        button.click()

        try:
            self.wait.until(
                lambda d: (
                    "/Invoices" in d.current_url
                    and "/Create" not in d.current_url
                )
            )

        except Exception:
            print("\n" + "=" * 60)
            print("INVOICE SUBMISSION FAILED")
            print("=" * 60)

            print(
                "Current URL:",
                self.driver.current_url
            )

            print(
                "Page title:",
                self.driver.title
            )

            print("\nVisible page text:")
            print(
                self.driver.find_element(
                    By.TAG_NAME,
                    "body"
                ).text
            )

            print("=" * 60 + "\n")

            raise

    # ========================================================
    # INVOICE LIST
    # ========================================================

    def is_invoice_visible(self, customer_name: str) -> bool:
        """Return True if the customer appears on the invoice page."""

        try:
            self.wait.until(
                EC.presence_of_element_located(
                    (
                        By.XPATH,
                        f"//*[normalize-space()="
                        f"'{customer_name}']"
                    )
                )
            )
            return True

        except Exception:
            return False

    # ========================================================
    # VIEW INVOICE
    # ========================================================

    def click_view_invoice(self, customer_name: str):
        """
        Find the invoice containing the specified customer and
        click its View/Details/Open action.
        """

        customer_xpath = (
            f"//*[normalize-space()='{customer_name}']"
        )

        self.wait.until(
            EC.presence_of_element_located(
                (By.XPATH, customer_xpath)
            )
        )

        xpath = (
            f"{customer_xpath}"
            "/ancestor::tr[1]"
            "//button["
            "contains(translate(normalize-space(.), "
            "'VIEW', 'view'), 'view')"
            " or "
            "contains(translate(normalize-space(.), "
            "'DETAIL', 'detail'), 'detail')"
            " or "
            "contains(translate(normalize-space(.), "
            "'OPEN', 'open'), 'open')"
            "]"
            " | "
            f"{customer_xpath}"
            "/ancestor::tr[1]"
            "//a[contains(@href, '/Invoices/View')]"
        )

        button = self.wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, xpath)
            )
        )

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block: 'center'});",
            button
        )

        button.click()

        self.wait.until(
            EC.url_contains("/Invoices/View")
        )

    # ========================================================
    # MARK AS PAID
    # ========================================================

    def click_mark_as_paid(self, customer_name: str):
        """Open invoice details and click Mark as Paid."""

        # Open detail page first.
        self.click_view_invoice(customer_name)

        mark_paid_button = self.wait.until(
            EC.element_to_be_clickable(
                (
                    By.XPATH,
                    "//button[contains("
                    "translate(normalize-space(.), "
                    "'MARK AS PAID', 'mark as paid'), "
                    "'mark as paid')]"
                )
            )
        )

        self.driver.execute_script(
            "arguments[0].scrollIntoView({block: 'center'});",
            mark_paid_button
        )

        mark_paid_button.click()

        # Handle confirmation modal if one exists.
        self.confirm_action()

    def confirm_action(self):
        """
        Confirm a modal action if a confirmation dialog
        appears. If no modal exists, continue normally.
        """

        try:
            confirm_button = WebDriverWait(
                self.driver,
                3
            ).until(
                EC.element_to_be_clickable(
                    (
                        By.XPATH,
                        "//div[@role='dialog' or "
                        "contains(@class,'modal') or "
                        "contains(@class,'fixed')]"
                        "//button["
                        "contains(translate(normalize-space(.), "
                        "'CONFIRM', 'confirm'), 'confirm')"
                        " or "
                        "contains(translate(normalize-space(.), "
                        "'YES', 'yes'), 'yes')"
                        "]"
                    )
                )
            )

            confirm_button.click()

        except Exception:
            # No confirmation dialog is a valid scenario.
            return

    # ========================================================
    # STATUS
    # ========================================================

    def get_invoice_status(self, customer_name: str) -> str:
     """
     Determine invoice status from the invoice detail page.

     The Invoice Details page explicitly renders:
     - "PAID IN FULL" when paid
     - "UNPAID / PENDING" when unpaid
     """

     paid_xpath = (
        "//*[contains("
        "translate(normalize-space(.), "
        "'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
        "'abcdefghijklmnopqrstuvwxyz'), "
        "'paid in full'"
        ")]"
     )

     unpaid_xpath = (
        "//*[contains("
        "translate(normalize-space(.), "
        "'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
        "'abcdefghijklmnopqrstuvwxyz'), "
        "'unpaid / pending'"
        ")]"
     )

     if self.driver.find_elements(By.XPATH, paid_xpath):
        return "paid"

     if self.driver.find_elements(By.XPATH, unpaid_xpath):
        return "unpaid"

     return ""

    def wait_for_paid_status(self):
     """
     Wait until the Invoice Details page displays
     the explicit PAID IN FULL status.
     """

     paid_xpath = (
        "//*[contains("
        "translate(normalize-space(.), "
        "'ABCDEFGHIJKLMNOPQRSTUVWXYZ', "
        "'abcdefghijklmnopqrstuvwxyz'), "
        "'paid in full'"
        ")]"
     )

     self.wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, paid_xpath)
        )
     )

    # ========================================================
    # RBAC
    # ========================================================

    def purchase_price_visible(self) -> bool:
        """Return True if purchase price is visible."""

        try:
            elements = self.driver.find_elements(
                By.XPATH,
                "//*[contains("
                "translate(normalize-space(.), "
                "'PURCHASE PRICE', 'purchase price'), "
                "'purchase price')]"
            )

            return len(elements) > 0

        except Exception:
            return False