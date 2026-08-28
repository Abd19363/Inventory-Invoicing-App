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

    return response.json()["access_token"]


def create_product(client, token):

    response = client.post(
        "/products",
        headers={
            "Authorization": f"Bearer {token}"
        },
        data={
            "name": "Laptop",
            "category": "Electronics",
            "description": "Test laptop",
            "quantity": "10",
            "purchase_price": "50000",
            "retail_price": "60000",
            "discount": "10",
            "sale_price": "54000"
        }
    )

    return response


def test_create_product(client):

    token = get_admin_token(client)

    response = create_product(
        client,
        token
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Laptop"
    assert data["category"] == "Electronics"
    assert data["quantity"] == 10

    assert float(data["purchase_price"]) == 50000
    assert float(data["retail_price"]) == 60000
    assert float(data["discount"]) == 10
    assert float(data["sale_price"]) == 54000


def test_get_products(client):

    token = get_admin_token(client)

    create_product(
        client,
        token
    )

    response = client.get(
        "/products"
    )

    assert response.status_code == 200

    products = response.json()

    assert len(products) == 1
    assert products[0]["name"] == "Laptop"
    assert products[0]["category"] == "Electronics"


def test_get_product(client):

    token = get_admin_token(client)

    create_response = create_product(
        client,
        token
    )

    product_id = create_response.json()["id"]

    response = client.get(
        f"/products/{product_id}"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == product_id
    assert data["category"] == "Electronics"


def test_update_product(client):

    token = get_admin_token(client)

    create_response = create_product(
        client,
        token
    )

    product_id = create_response.json()["id"]

    response = client.put(
        f"/products/{product_id}",
        headers={
            "Authorization": f"Bearer {token}"
        },
        data={
            "name": "Updated Laptop",
            "category": "Computers",
            "quantity": "20",
            "purchase_price": "55000",
            "retail_price": "70000",
            "discount": "10"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Updated Laptop"
    assert data["category"] == "Computers"
    assert data["quantity"] == 20

    assert float(data["purchase_price"]) == 55000
    assert float(data["retail_price"]) == 70000
    assert float(data["discount"]) == 10

    # Sale price should be recalculated:
    # 70000 - 10% = 63000
    assert float(data["sale_price"]) == 63000


def test_delete_product(client):

    token = get_admin_token(client)

    create_response = create_product(
        client,
        token
    )

    product_id = create_response.json()["id"]

    response = client.delete(
        f"/products/{product_id}",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 204

    response = client.get(
        f"/products/{product_id}"
    )

    assert response.status_code == 404


def test_negative_product_quantity(client):

    token = get_admin_token(client)

    response = client.post(
        "/products",
        headers={
            "Authorization": f"Bearer {token}"
        },
        data={
            "name": "Invalid Product",
            "quantity": "-5",
            "purchase_price": "100",
            "retail_price": "150",
            "discount": "0",
            "sale_price": "150"
        }
    )

    assert response.status_code == 400