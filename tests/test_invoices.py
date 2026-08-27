def get_admin_token(client):

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


def get_sales_manager_token(client):

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


def create_test_product(client):

    admin_token = get_admin_token(client)

    response = client.post(
        "/products",
        headers={
            "Authorization": f"Bearer {admin_token}"
        },
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


def test_create_invoice(client):

    product = create_test_product(client)

    manager_token = get_sales_manager_token(client)

    response = client.post(
        "/invoices",
        headers={
            "Authorization": f"Bearer {manager_token}"
        },
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


def test_invoice_reduces_stock(client):

    product = create_test_product(client)

    manager_token = get_sales_manager_token(client)

    response = client.post(
        "/invoices",
        headers={
            "Authorization": f"Bearer {manager_token}"
        },
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

    product_response = client.get(
        f"/products/{product['id']}"
    )

    assert product_response.status_code == 200
    assert product_response.json()["quantity"] == 7


def test_invoice_insufficient_stock(client):

    product = create_test_product(client)

    manager_token = get_sales_manager_token(client)

    response = client.post(
        "/invoices",
        headers={
            "Authorization": f"Bearer {manager_token}"
        },
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


def test_get_invoices(client):

    product = create_test_product(client)

    manager_token = get_sales_manager_token(client)

    create_response = client.post(
        "/invoices",
        headers={
            "Authorization": f"Bearer {manager_token}"
        },
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

    response = client.get(
        "/invoices"
    )

    assert response.status_code == 200

    invoices = response.json()

    assert len(invoices) == 1
    assert invoices[0]["customer_name"] == "John Doe"


def test_get_invoice(client):

    product = create_test_product(client)

    manager_token = get_sales_manager_token(client)

    create_response = client.post(
        "/invoices",
        headers={
            "Authorization": f"Bearer {manager_token}"
        },
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

    response = client.get(
        f"/invoices/{invoice_id}"
    )

    assert response.status_code == 200
    assert response.json()["id"] == invoice_id


def test_delete_invoice_restores_stock(client):

    product = create_test_product(client)

    manager_token = get_sales_manager_token(client)

    create_response = client.post(
        "/invoices",
        headers={
            "Authorization": f"Bearer {manager_token}"
        },
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

    product_response = client.get(
        f"/products/{product['id']}"
    )

    assert product_response.json()["quantity"] == 6

    response = client.delete(
        f"/invoices/{invoice_id}"
    )

    assert response.status_code == 204

    product_response = client.get(
        f"/products/{product['id']}"
    )

    assert product_response.json()["quantity"] == 10


def test_invoice_unknown_product(client):

    manager_token = get_sales_manager_token(client)

    response = client.post(
        "/invoices",
        headers={
            "Authorization": f"Bearer {manager_token}"
        },
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