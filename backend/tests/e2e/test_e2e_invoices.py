"""
E2E Automation Tests — Invoice Management

Covers:

TC-INV-01A  Admin invoices page loads showing the invoice list
TC-INV-01B  Admin can navigate to invoices from sidebar

TC-INV-02A  Admin creates a new invoice → appears in list
TC-INV-02B  Sales Manager creates a new invoice → appears in list

TC-INV-03   Admin views created invoice details page

TC-INV-04A  Admin marks invoice as paid → status updates to 'paid'
TC-INV-04B  Sales Manager marks invoice as paid → status updates to 'paid'

TC-INV-05   Sales Manager cannot see purchase prices
"""

import time
import sys
from pathlib import Path

# import pytest


# ============================================================
# MAKE PROJECT ROOT IMPORTABLE
# ============================================================

sys.path.insert(
    0,
    str(Path(__file__).resolve().parents[2])
)


from tests.e2e.pages.invoices_page import InvoicesPage
from tests.e2e.pages.inventory_page import InventoryPage
from tests.e2e.pages.sidebar_page import SidebarPage


# ============================================================
# HELPER — CREATE PRODUCT
# ============================================================

def _create_product(driver, wait, prefix: str):
    """
    Create a product through the Inventory UI.

    The driver passed to this function determines which
    stakeholder creates the product.

    Returns:
        Product name
    """

    product_name = (
        f"{prefix}_{int(time.time() * 1000)}"
    )

    inventory_page = InventoryPage(
        driver,
        wait
    )

    inventory_page.open()

    inventory_page.click_add_product()

    inventory_page.fill_product_form(
        name=product_name,
        quantity=20,
        purchase_price=50.0,
        retail_price=100.0,
        sale_price=90.0,
    )

    inventory_page.submit_form()

    # Wait until the product appears in the UI.
    wait.until(
        lambda d: inventory_page.is_product_visible(
            product_name
        )
    )

    return product_name


# ============================================================
# HELPER — CREATE INVOICE
# ============================================================

def _create_invoice(
    driver,
    wait,
    product_name: str,
    customer_prefix: str
):
    """
    Create an invoice for an existing product.

    This helper can be used by both ADMIN and
    SALES_MANAGER.

    The product must already exist before this function
    is called.

    Returns:
        (customer_name, InvoicesPage)
    """

    customer_name = (
        f"{customer_prefix}_{int(time.time() * 1000)}"
    )

    invoice_page = InvoicesPage(
        driver,
        wait
    )

    invoice_page.open_create()

    invoice_page.fill_customer_name(
        customer_name
    )

    invoice_page.select_first_available_product(
        product_name
    )

    invoice_page.click_add_item()

    invoice_page.set_quantity(1)

    invoice_page.submit_invoice()

    return customer_name, invoice_page


# ============================================================
# TC-INV-01
# ============================================================

class TestInvoicesPageLoads:

    def test_invoices_page_renders(
        self,
        admin_driver,
        wait
    ):
        """
        Navigating to /Invoices should render the invoice
        list page for ADMIN.
        """

        page = InvoicesPage(
            admin_driver,
            wait
        )

        page.open()

        page_src = admin_driver.page_source

        assert (
            "Invoice" in page_src
            or "Invoicing" in page_src
        ), (
            "Invoices page did not render "
            "expected content for ADMIN"
        )

    def test_sidebar_navigation_to_invoices(
        self,
        admin_driver,
        wait
    ):
        """
        Clicking 'Invoicing' in the sidebar should navigate
        to /Invoices.
        """

        sidebar = SidebarPage(
            admin_driver,
            wait
        )

        sidebar.go_to_invoices()

        assert "/Invoices" in admin_driver.current_url


# ============================================================
# TC-INV-02A
# ADMIN — CREATE INVOICE
# ============================================================

class TestCreateInvoiceAdmin:

    def test_admin_create_invoice_appears_in_list(
        self,
        admin_driver,
        wait
    ):
        """
        ADMIN creates a product, creates an invoice using
        that product, and verifies that the invoice appears
        in the invoice list.
        """

        # ----------------------------------------------------
        # Create product using ADMIN account.
        # ----------------------------------------------------

        product_name = _create_product(
            admin_driver,
            wait,
            "AdminInvProduct"
        )

        # ----------------------------------------------------
        # Create invoice using ADMIN account.
        # ----------------------------------------------------

        customer_name = (
            f"E2E_Admin_Customer_{int(time.time() * 1000)}"
        )

        invoice_page = InvoicesPage(
            admin_driver,
            wait
        )

        invoice_page.open_create()

        invoice_page.fill_customer_name(
            customer_name
        )

        # Current frontend does not expose a customer email
        # field, so this is intentionally not required.

        invoice_page.select_first_available_product(
            product_name
        )

        invoice_page.click_add_item()

        # Quantity input exists only after Add Item.
        invoice_page.set_quantity(2)

        invoice_page.submit_invoice()

        # ----------------------------------------------------
        # Verify invoice appears in list.
        # ----------------------------------------------------

        assert invoice_page.is_invoice_visible(
            customer_name
        ), (
            f"ADMIN-created invoice for "
            f"'{customer_name}' was not found "
            f"in /Invoices."
        )


# ============================================================
# TC-INV-02B
# SALES_MANAGER — CREATE INVOICE
# ============================================================

class TestCreateInvoiceSalesManager:

    def test_sales_manager_create_invoice_appears_in_list(
        self,
        admin_driver,
        sales_driver,
        wait
    ):
        """
        SALES_MANAGER creates an invoice using a product
        that was previously created by ADMIN.

        SALES_MANAGER is not responsible for creating the
        product because product creation is not assumed to
        be part of SALES_MANAGER permissions.
        """

        # ----------------------------------------------------
        # STEP 1 — ADMIN creates the product.
        # ----------------------------------------------------

        product_name = _create_product(
            admin_driver,
            wait,
            "SalesInvProduct"
        )

        # ----------------------------------------------------
        # STEP 2 — SALES_MANAGER creates the invoice
        # using the existing ADMIN-created product.
        # ----------------------------------------------------

        customer_name = (
            f"E2E_Sales_Customer_{int(time.time() * 1000)}"
        )

        invoice_page = InvoicesPage(
            sales_driver,
            wait
        )

        invoice_page.open_create()

        invoice_page.fill_customer_name(
            customer_name
        )

        invoice_page.select_first_available_product(
            product_name
        )

        invoice_page.click_add_item()

        invoice_page.set_quantity(2)

        invoice_page.submit_invoice()

        # ----------------------------------------------------
        # STEP 3 — Verify invoice appears in list.
        # ----------------------------------------------------

        assert invoice_page.is_invoice_visible(
            customer_name
        ), (
            f"SALES_MANAGER-created invoice for "
            f"'{customer_name}' was not found "
            f"in /Invoices."
        )


# ============================================================
# TC-INV-03
# ADMIN — VIEW INVOICE
# ============================================================

class TestViewInvoice:

    def test_view_invoice_detail_page(
        self,
        admin_driver,
        wait
    ):
        """
        Clicking View on an invoice should open its detail
        page.
        """

        product_name = _create_product(
            admin_driver,
            wait,
            "ViewProd"
        )

        customer_name, invoice_page = _create_invoice(
            admin_driver,
            wait,
            product_name,
            "E2E_ViewCustomer"
        )

        invoice_page.click_view_invoice(
            customer_name
        )

        assert (
            "/Invoices/View"
            in admin_driver.current_url
        ), (
            "Expected /Invoices/View in URL, "
            f"got: {admin_driver.current_url}"
        )

        assert customer_name in (
            admin_driver.page_source
        )


# ============================================================
# TC-INV-04A
# ADMIN — MARK INVOICE AS PAID
# ============================================================

class TestMarkInvoiceAsPaidAdmin:

    def test_admin_mark_invoice_paid_updates_status(
        self,
        admin_driver,
        wait
    ):
        """
        ADMIN creates an invoice and marks it as paid.
        """

        # ----------------------------------------------------
        # Create product using ADMIN.
        # ----------------------------------------------------

        product_name = _create_product(
            admin_driver,
            wait,
            "AdminPaidProd"
        )

        # ----------------------------------------------------
        # Create invoice using ADMIN.
        # ----------------------------------------------------

        customer_name, invoice_page = _create_invoice(
            admin_driver,
            wait,
            product_name,
            "E2E_Admin_PaidCustomer"
        )

        # ----------------------------------------------------
        # Mark invoice as paid.
        # ----------------------------------------------------

        invoice_page.click_mark_as_paid(
            customer_name
        )

        # Wait until the UI reflects the successful payment.
        invoice_page.wait_for_paid_status()

        current_status = invoice_page.get_invoice_status(
            customer_name
        )

        assert current_status == "paid", (
            f"ADMIN: Expected status 'paid', "
            f"got '{current_status}'."
        )


# ============================================================
# TC-INV-04B
# SALES_MANAGER — MARK INVOICE AS PAID
# ============================================================

class TestMarkInvoiceAsPaidSalesManager:

    def test_sales_manager_mark_invoice_paid_updates_status(
        self,
        admin_driver,
        sales_driver,
        wait
    ):
        """
        SALES_MANAGER creates an invoice using an existing
        ADMIN-created product and then marks that invoice
        as paid.

        SALES_MANAGER is not required to create the product.
        """

        # ----------------------------------------------------
        # STEP 1 — ADMIN creates the product.
        # ----------------------------------------------------

        product_name = _create_product(
            admin_driver,
            wait,
            "SalesPaidProd"
        )

        # ----------------------------------------------------
        # STEP 2 — SALES_MANAGER creates the invoice using
        # the existing product.
        # ----------------------------------------------------

        customer_name, invoice_page = _create_invoice(
            sales_driver,
            wait,
            product_name,
            "E2E_Sales_PaidCustomer"
        )

        # ----------------------------------------------------
        # STEP 3 — SALES_MANAGER marks the invoice as paid.
        # ----------------------------------------------------

        invoice_page.click_mark_as_paid(
            customer_name
        )

        # Wait until the UI reflects the successful payment.
        invoice_page.wait_for_paid_status()

        current_status = invoice_page.get_invoice_status(
            customer_name
        )

        assert current_status == "paid", (
            f"SALES_MANAGER: Expected status 'paid', "
            f"got '{current_status}'."
        )


# ============================================================
# TC-INV-05
# SALES_MANAGER — PURCHASE PRICE RBAC
# ============================================================

class TestRBACInvoiceSalesManager:

    def test_sales_manager_cannot_see_purchase_price(
        self,
        sales_driver,
        wait
    ):
        """
        SALES_MANAGER should not see purchase price
        information.
        """

        # ----------------------------------------------------
        # Inventory page
        # ----------------------------------------------------

        inventory_page = InventoryPage(
            sales_driver,
            wait
        )

        inventory_page.open()

        assert not inventory_page.purchase_price_field_visible(), (
            "SALES_MANAGER can see purchase price "
            "on Inventory page — RBAC failure!"
        )

        # ----------------------------------------------------
        # Invoices page
        # ----------------------------------------------------

        invoice_page = InvoicesPage(
            sales_driver,
            wait
        )

        invoice_page.open()

        assert not invoice_page.purchase_price_visible(), (
            "SALES_MANAGER can see purchase price "
            "on Invoices page — RBAC failure!"
        )