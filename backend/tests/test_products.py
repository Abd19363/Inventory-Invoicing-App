import io
from PIL import Image


def get_valid_png_bytes():
    img = Image.new("RGB", (20, 20), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def create_product_helper(client, admin_headers):
    return client.post(
        "/products",
        headers=admin_headers,
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


def test_create_product(client, admin_headers):

    response = create_product_helper(client, admin_headers)

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Laptop"
    assert data["category"] == "Electronics"
    assert data["quantity"] == 10

    assert float(data["purchase_price"]) == 50000
    assert float(data["retail_price"]) == 60000
    assert float(data["discount"]) == 10
    assert float(data["sale_price"]) == 54000


def test_create_product_unauthorized(client):

    response = client.post(
        "/products",
        data={
            "name": "Laptop",
            "purchase_price": "50000",
            "retail_price": "60000",
            "sale_price": "54000"
        }
    )

    assert response.status_code == 401


def test_get_products(client, admin_headers):

    create_product_helper(client, admin_headers)

    response = client.get("/products")

    assert response.status_code == 200

    products = response.json()

    assert len(products) == 1
    assert products[0]["name"] == "Laptop"
    assert products[0]["category"] == "Electronics"


def test_get_product(client, admin_headers):

    create_response = create_product_helper(client, admin_headers)

    product_id = create_response.json()["id"]

    response = client.get(f"/products/{product_id}")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == product_id
    assert data["category"] == "Electronics"


def test_get_product_not_found(client):

    response = client.get("/products/99999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"


def test_update_product(client, admin_headers):

    create_response = create_product_helper(client, admin_headers)

    product_id = create_response.json()["id"]

    response = client.put(
        f"/products/{product_id}",
        headers=admin_headers,
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

    # Sale price recalculated: 70000 - 10% = 63000
    assert float(data["sale_price"]) == 63000


def test_update_product_not_found(client, admin_headers):

    response = client.put(
        "/products/99999",
        headers=admin_headers,
        data={"name": "Non-existent"}
    )

    assert response.status_code == 404


def test_delete_product(client, admin_headers):

    create_response = create_product_helper(client, admin_headers)

    product_id = create_response.json()["id"]

    response = client.delete(
        f"/products/{product_id}",
        headers=admin_headers
    )

    assert response.status_code == 204

    response = client.get(f"/products/{product_id}")

    assert response.status_code == 404


def test_delete_product_not_found(client, admin_headers):

    response = client.delete(
        "/products/99999",
        headers=admin_headers
    )

    assert response.status_code == 404


def test_negative_product_quantity(client, admin_headers):

    response = client.post(
        "/products",
        headers=admin_headers,
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


def test_upload_product_image_invalid_type(client, admin_headers):

    create_response = create_product_helper(client, admin_headers)
    product_id = create_response.json()["id"]

    fake_file = io.BytesIO(b"dummy binary data")

    response = client.post(
        f"/products/{product_id}/images",
        headers=admin_headers,
        files={"file": ("test.txt", fake_file, "text/plain")}
    )

    assert response.status_code == 400
    assert "Only JPEG, PNG and WebP" in response.json()["detail"]


def test_upload_and_get_product_image(client, admin_headers):

    create_response = create_product_helper(client, admin_headers)
    product_id = create_response.json()["id"]

    valid_png = get_valid_png_bytes()
    file_data = io.BytesIO(valid_png)

    response = client.post(
        f"/products/{product_id}/images",
        headers=admin_headers,
        files={"file": ("test.png", file_data, "image/png")}
    )

    assert response.status_code == 201
    upload_data = response.json()
    assert upload_data["product_id"] == product_id
    assert "full_image_id" in upload_data

    # Retrieve image
    full_image_id = upload_data["full_image_id"]
    get_img_response = client.get(f"/products/{product_id}/images/{full_image_id}")
    assert get_img_response.status_code == 200
    assert get_img_response.headers["content-type"] == "image/png"


def test_get_product_image_not_found(client, admin_headers):

    create_response = create_product_helper(client, admin_headers)
    product_id = create_response.json()["id"]

    response = client.get(f"/products/{product_id}/images/99999")
    assert response.status_code == 404