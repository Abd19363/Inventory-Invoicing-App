def create_test_product(client, admin_headers):

    response = client.post(
        "/products",
        headers=admin_headers,
        data={
            "name": "Test Product",
            "category": "Electronics",
            "quantity": "10",
            "purchase_price": "100",
            "retail_price": "200",
            "discount": "10",
            "sale_price": "180"
        }
    )

    assert response.status_code == 201

    return response.json()


def test_create_invoice(client, admin_headers, sales_manager_headers):

    product = create_test_product(client, admin_headers)

    response = client.post(
        "/invoices",
        headers=sales_manager_headers,
        json={
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "items": [
                {
                    "product_id": product["id"],
                    "quantity": 2
                }
            ]
        }
    )

    assert response.status_code == 201

    data = response.json()

    assert data["customer_name"] == "John Doe"

    # 180 * 2
    assert float(data["total_amount"]) == 360

    assert len(data["items"]) == 1

    assert data["items"][0]["product_id"] == product["id"]
    assert data["items"][0]["quantity"] == 2
    assert float(data["items"][0]["unit_price"]) == 180
    assert float(data["items"][0]["subtotal"]) == 360


def test_invoice_reduces_stock(client, admin_headers, sales_manager_headers):

    product = create_test_product(client, admin_headers)

    response = client.post(
        "/invoices",
        headers=sales_manager_headers,
        json={
            "customer_name": "John Doe",
            "items": [
                {
                    "product_id": product["id"],
                    "quantity": 3
                }
            ]
        }
    )

    assert response.status_code == 201

    product_response = client.get(f"/products/{product['id']}")

    assert product_response.status_code == 200
    assert product_response.json()["quantity"] == 7


def test_invoice_insufficient_stock(client, admin_headers, sales_manager_headers):

    product = create_test_product(client, admin_headers)

    response = client.post(
        "/invoices",
        headers=sales_manager_headers,
        json={
            "customer_name": "John Doe",
            "items": [
                {
                    "product_id": product["id"],
                    "quantity": 50
                }
            ]
        }
    )

    assert response.status_code == 400

    assert "Insufficient stock" in response.json()["detail"]


def test_get_invoices(client, admin_headers, sales_manager_headers):

    product = create_test_product(client, admin_headers)

    create_response = client.post(
        "/invoices",
        headers=sales_manager_headers,
        json={
            "customer_name": "John Doe",
            "items": [
                {
                    "product_id": product["id"],
                    "quantity": 1
                }
            ]
        }
    )

    assert create_response.status_code == 201

    response = client.get("/invoices")

    assert response.status_code == 200

    invoices = response.json()

    assert len(invoices) == 1
    assert invoices[0]["customer_name"] == "John Doe"


def test_get_invoice(client, admin_headers, sales_manager_headers):

    product = create_test_product(client, admin_headers)

    create_response = client.post(
        "/invoices",
        headers=sales_manager_headers,
        json={
            "customer_name": "John Doe",
            "items": [
                {
                    "product_id": product["id"],
                    "quantity": 1
                }
            ]
        }
    )

    assert create_response.status_code == 201

    invoice_id = create_response.json()["id"]

    response = client.get(f"/invoices/{invoice_id}")

    assert response.status_code == 200
    assert response.json()["id"] == invoice_id


def test_get_invoice_not_found(client):

    response = client.get("/invoices/99999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Invoice not found"


def test_update_invoice(client, admin_headers, sales_manager_headers):

    product = create_test_product(client, admin_headers)

    create_response = client.post(
        "/invoices",
        headers=sales_manager_headers,
        json={
            "customer_name": "John Doe",
            "items": [
                {
                    "product_id": product["id"],
                    "quantity": 1
                }
            ]
        }
    )

    invoice_id = create_response.json()["id"]

    update_response = client.put(
        f"/invoices/{invoice_id}",
        json={
            "customer_name": "Jane Smith",
            "status": "unpaid"
        }
    )

    assert update_response.status_code == 200
    assert update_response.json()["customer_name"] == "Jane Smith"


def test_delete_invoice_restores_stock(client, admin_headers, sales_manager_headers):

    product = create_test_product(client, admin_headers)

    create_response = client.post(
        "/invoices",
        headers=sales_manager_headers,
        json={
            "customer_name": "John Doe",
            "items": [
                {
                    "product_id": product["id"],
                    "quantity": 4
                }
            ]
        }
    )

    assert create_response.status_code == 201

    invoice_id = create_response.json()["id"]

    product_response = client.get(f"/products/{product['id']}")

    assert product_response.json()["quantity"] == 6

    response = client.delete(f"/invoices/{invoice_id}")

    assert response.status_code == 204

    product_response = client.get(f"/products/{product['id']}")

    assert product_response.json()["quantity"] == 10


def test_delete_invoice_not_found(client):

    response = client.delete("/invoices/99999")

    assert response.status_code == 404


def test_invoice_unknown_product(client, sales_manager_headers):

    response = client.post(
        "/invoices",
        headers=sales_manager_headers,
        json={
            "customer_name": "John Doe",
            "items": [
                {
                    "product_id": 99999,
                    "quantity": 1
                }
            ]
        }
    )

    assert response.status_code == 400

    assert "not found" in response.json()["detail"]


def test_get_invoice_pdf(client, admin_headers, sales_manager_headers):

    product = create_test_product(client, admin_headers)

    create_response = client.post(
        "/invoices",
        headers=sales_manager_headers,
        json={
            "customer_name": "John Doe",
            "items": [
                {
                    "product_id": product["id"],
                    "quantity": 1
                }
            ]
        }
    )

    invoice_id = create_response.json()["id"]

    pdf_response = client.get(f"/invoices/{invoice_id}/pdf")

    assert pdf_response.status_code == 200
    assert pdf_response.headers["content-type"] == "application/pdf"
    assert len(pdf_response.content) > 0


def test_get_invoice_pdf_not_found(client):

    pdf_response = client.get("/invoices/99999/pdf")

    assert pdf_response.status_code == 404