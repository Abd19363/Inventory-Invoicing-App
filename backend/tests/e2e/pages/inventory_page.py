"""
Page Object Model — Inventory Page (/Inventory)

Covers the full product CRUD lifecycle:
  - View product list / search
  - Add a new product
  - Edit an existing product
  - Delete a product (with ConfirmModal)
"""

import time
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"


class InventoryPage:

    URL = f"{BASE_URL}/Inventory"

    def __init__(self, driver, wait):
        self.driver = driver
        self.wait   = wait

    # --------------------------------------------------------
    # Navigation
    # --------------------------------------------------------

    def open(self):
        self.driver.get(self.URL)
        self.wait.until(
            EC.visibility_of_element_located(
                (By.XPATH, "//*[contains(text(), 'Inventory') or contains(text(), 'Products')]")
            )
        )

    # --------------------------------------------------------
    # Search
    # --------------------------------------------------------

    def search(self, query: str):
        """Type into the search bar and wait for results to filter."""
        search_box = self.wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//input[@placeholder and contains(@placeholder, 'Search')]")
            )
        )
        self._fill_field(["search"], query)
        time.sleep(0.5)


    def clear_search(self):
        search_box = self.driver.find_element(
            By.XPATH, "//input[contains(@placeholder, 'Search')]"
        )
        search_box.send_keys(Keys.CONTROL + "a")
        search_box.send_keys(Keys.BACKSPACE)
        search_box.send_keys(Keys.ESCAPE)

    # --------------------------------------------------------
    # Add Product
    # --------------------------------------------------------

    def click_add_product(self):
        """Click the 'Add Product' button to navigate to /Inventory/Add."""
        xpath = (
            "//button[contains(text(), 'Add Product') or contains(text(), 'Add Item')]"
            " | //a[contains(text(), 'Add Product') or contains(text(), 'Add Item')]"
        )
        btn = self.wait.until(EC.presence_of_element_located((By.XPATH, xpath)))
        try:
            btn.click()
        except Exception:
            self.driver.execute_script("arguments[0].click();", btn)

        self.wait.until(EC.url_contains("/Inventory/Add"))

    def fill_product_form(
        self,
        name: str,
        category: str = "Electronics",
        description: str = "Selenium E2E test product",
        quantity: int = 10,
        purchase_price: float = 50.0,
        retail_price: float = 80.0,
        discount: float = 0.0,
        sale_price: float = 80.0,
    ):
        """Fill in the Add/Edit product form fields."""
        self._fill_field(["name"], name)
        self._fill_field(["category"], category)
        self._fill_field(["description"], description)
        self._fill_field(["quantity"], str(quantity))
        self._fill_field(["purchasePrice", "purchase_price"], str(purchase_price))
        self._fill_field(["retailPrice", "retail_price"], str(retail_price))
        self._fill_field(["discount"], str(discount))
        # salePrice is calculated automatically by the UI; filled if present
        self._fill_field(["salePrice", "sale_price"], str(sale_price))
    def _fill_field(self, field_identifiers: list, value: str):
        """Find input/textarea by id or name and safely set value via dynamic prototype setter."""
        el = None
        for name in field_identifiers:
            els = self.driver.find_elements(By.ID, name) or self.driver.find_elements(By.NAME, name)
            if els:
                el = els[0]
                break

        if el is not None:
            try:
                # Dynamic prototype detection supports both HTMLInputElement and HTMLTextAreaElement
                self.driver.execute_script(
                    """
                    var prototype = Object.getPrototypeOf(arguments[0]);
                    var descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
                    if (descriptor && descriptor.set) {
                        descriptor.set.call(arguments[0], arguments[1]);
                    } else {
                        arguments[0].value = arguments[1];
                    }
                    arguments[0].dispatchEvent(new Event('input',  { bubbles: true }));
                    arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
                    """,
                    el,
                    value
                )
            except Exception:
                el.send_keys(Keys.CONTROL + "a")
                el.send_keys(Keys.BACKSPACE)
                if value:
                    el.send_keys(value)


    def submit_form(self):
     """Click the primary submit button on the product form and wait for inventory page."""
     xpath = (
        "//button[@type='submit']"
        " | //button[contains(text(), 'Save') or contains(text(), 'Add Product') or contains(text(), 'Update')]"
     )

     btn = self.wait.until(
        EC.element_to_be_clickable((By.XPATH, xpath))
     )

     try:
        btn.click()
     except Exception:
        self.driver.execute_script(
            "arguments[0].click();",
            btn
        )

    # IMPORTANT:
    # /Inventory/Edit/123 also contains "/Inventory",
    # so url_contains("/Inventory") can return.
    # before the edit submission has actually navigated.
     self.wait.until(
        lambda d: d.current_url.rstrip("/").endswith("/Inventory")
    )

    # --------------------------------------------------------
    # Edit Product
    # --------------------------------------------------------
    def click_edit_for_product(self, product_name: str):
        """Find product row by name (using search filter) and click its Edit button."""
        # Step 1: Filter inventory table by product name so it appears immediately
        try:
            self.search(product_name)
        except Exception:
            pass

        # Step 2: Locate the Edit button in the matching row
        xpath = (
            f"//*[contains(text(), '{product_name}')]"
            f"/ancestor::tr//button[contains(text(), 'Edit')]"
            f" | //*[contains(text(), '{product_name}')]"
            f"/ancestor::div[contains(@class,'card')]//button[contains(text(), 'Edit')]"
        )
        btn = self.wait.until(EC.presence_of_element_located((By.XPATH, xpath)))
        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
        time.sleep(0.2)
        self.driver.execute_script("arguments[0].click();", btn)
        self.wait.until(EC.url_contains("/Inventory/Edit"))



    # --------------------------------------------------------
    # Delete Product
    # --------------------------------------------------------

    def click_delete_for_product(self, product_name: str):
        """Find product row by name and click its Delete button."""
        row = self.wait.until(
            EC.presence_of_element_located(
                (By.XPATH, f"//*[contains(text(), '{product_name}')]")
            )
        )
        btn = row.find_element(
            By.XPATH,
            "./ancestor::tr//button[contains(text(), 'Delete')]"
            " | ./ancestor::div[contains(@class,'card')]//button[contains(text(), 'Delete')]"
        )
        try:
            btn.click()
        except Exception:
            self.driver.execute_script("arguments[0].click();", btn)

    def confirm_delete(self):
        """Confirm deletion in the ConfirmModal dialog."""
        modal_btn_xpath = (
            "//div[contains(@class,'fixed') and contains(@class,'z-[999]')]//button[contains(@class, 'bg-red') or contains(text(), 'Delete') or contains(text(), 'Confirm')]"
        )
        btn = self.wait.until(EC.element_to_be_clickable((By.XPATH, modal_btn_xpath)))
        try:
            btn.click()
        except Exception:
            self.driver.execute_script("arguments[0].click();", btn)

        time.sleep(1.0)  # Wait for backend API call & UI state refresh


    # --------------------------------------------------------
    # Queries
    # --------------------------------------------------------

    def is_product_visible(self, product_name: str) -> bool:
        """Check if a product name appears anywhere on the current page without raising exceptions."""
        try:
            elements = self.driver.find_elements(
                By.XPATH, f"//*[contains(text(), '{product_name}')]"
            )
            return len(elements) > 0
        except Exception:
            return False


    def get_product_count(self) -> int:
        """Return the number of product cards / rows rendered on screen."""
        try:
            items = self.driver.find_elements(
                By.XPATH, "//tr[td] | //*[contains(@class,'product-card')]"
            )
            return len(items)
        except Exception:
            return 0

    def purchase_price_field_visible(self) -> bool:
        """Check if any purchase price header or input is visible (ADMIN only)."""
        try:
            elements = self.driver.find_elements(
                By.XPATH, "//*[contains(text(), 'Purchase Price') or contains(text(), 'purchasePrice')]"
            )
            return len(elements) > 0
        except Exception:
            return False
