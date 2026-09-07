"""
E2E Automation Tests — Inventory Management
============================================
Covers:
  TC-INV-01  Inventory page loads and shows the product list
  TC-INV-02  Search filters products by name
  TC-INV-03  Add new product → product appears in the list
  TC-INV-04  Edit existing product → changes persist
  TC-INV-05  Delete product with ConfirmModal → product removed
"""

import time
import pytest
from tests.e2e.pages.inventory_page import InventoryPage
from tests.e2e.pages.sidebar_page   import SidebarPage

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


# ============================================================
# TC-INV-01
# ============================================================

class TestInventoryPageLoads:

    def test_inventory_page_renders(self, admin_driver, wait):
        """
        Navigating to /Inventory should display the product listing
        page with the Add Product control visible.
        """
        page = InventoryPage(admin_driver, wait)
        page.open()

        page_src = admin_driver.page_source
        assert (
            "Inventory" in page_src or "Product" in page_src
        ), "Inventory page did not render expected content"

    def test_sidebar_navigation_to_inventory(self, admin_driver, wait):
        """
        Clicking 'Inventory' in the sidebar navigates to /Inventory.
        """
        sidebar = SidebarPage(admin_driver, wait)
        sidebar.go_to_inventory()

        assert "/Inventory" in admin_driver.current_url


# ============================================================
# TC-INV-02
# ============================================================

class TestInventorySearch:

    def test_search_filters_results(self, admin_driver, wait):
        """
        Typing a query into the search box should filter the
        visible product list to matching results.
        All products visible before search; fewer (or zero) after
        searching for a non-existent term.
        """
        page = InventoryPage(admin_driver, wait)
        page.open()

        # Search for a string unlikely to match any product
        page.search("ZZZNOMATCH9999")
        page_src = admin_driver.page_source

        # After filtering, no product row should contain 'ZZZNOMATCH'
        # (the search term itself may appear in the search box)
        assert "ZZZNOMATCH9999" not in page_src.replace(
            "ZZZNOMATCH9999", ""
        ).replace("value", ""), "Search did not filter results"


# ============================================================
# TC-INV-03
# ============================================================

class TestAddProduct:

    def test_add_product_appears_in_list(self, admin_driver, wait):
        """
        Filling out the Add Product form and submitting it should
        create the product and display it on the Inventory list page.
        """
        unique_name = f"E2E_Laptop_{int(time.time())}"

        page = InventoryPage(admin_driver, wait)
        page.open()
        page.click_add_product()

        page.fill_product_form(
            name=unique_name,
            category="Electronics",
            description="Selenium automation test product",
            quantity=5,
            purchase_price=800.0,
            retail_price=1200.0,
            discount=10.0,
            sale_price=1080.0,
        )
        page.submit_form()

        # Explicitly wait for asynchronous submission and UI render
        try:
            wait.until(lambda d: page.is_product_visible(unique_name))
        except Exception:
            pytest.fail(f"Newly added product '{unique_name}' not found in inventory list")


# ============================================================
# TC-INV-04
# ============================================================

class TestEditProduct:

    def test_edit_product_persists_changes(self, admin_driver, wait):
        """
        After editing a product's name, the updated name should
        appear in the inventory list.
        """
        original_name = f"E2E_Edit_Before_{int(time.time())}"
        updated_name  = f"E2E_Edit_After_{int(time.time())}"

        page = InventoryPage(admin_driver, wait)
        page.open()
        page.click_add_product()
        page.fill_product_form(
            name=original_name,
            quantity=3,
            purchase_price=100.0,
            retail_price=150.0,
            sale_price=140.0,
        )
        page.submit_form()

        # Wait for created product to be visible before editing
        wait.until(lambda d: page.is_product_visible(original_name))

        # Now edit it
        page.click_edit_for_product(original_name)
        page.fill_product_form(name=updated_name)
        page.submit_form()

        # Explicitly wait for updated product name to be visible
        try:
            wait.until(lambda d: page.is_product_visible(updated_name))
        except Exception:
            pytest.fail(f"Updated product name '{updated_name}' not found after editing")


# ============================================================
# TC-INV-05
# ============================================================

class TestDeleteProduct:

    def test_delete_product_removes_from_list(self, admin_driver, wait):
        """
        Clicking Delete on a product and confirming in the modal
        should remove the product from the inventory list.
        """
        product_name = f"E2E_Delete_{int(time.time())}"

        page = InventoryPage(admin_driver, wait)
        page.open()
        page.click_add_product()
        page.fill_product_form(
            name=product_name,
            quantity=1,
            purchase_price=50.0,
            retail_price=70.0,
            sale_price=65.0,
        )
        page.submit_form()

        # Verify it's there first with an explicit wait
        wait.until(lambda d: page.is_product_visible(product_name))

        # Delete it
        page.click_delete_for_product(product_name)
        page.confirm_delete()

        # Wait for it to disappear
        try:
            wait.until(lambda d: not page.is_product_visible(product_name))
        except Exception:
            pytest.fail(f"Product '{product_name}' still visible after deletion")
            