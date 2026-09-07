import io
from PIL import Image


def get_valid_png_bytes():
    img = Image.new("RGB", (20, 20), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_create_supplier(client):

    response = client.post(
        "/suppliers",
        json={
            "name": "ABC Suppliers",
            "email": "abc@example.com",
            "phone": "03001234567",
            "address": "Lahore"
        }
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "ABC Suppliers"
    assert data["email"] == "abc@example.com"
    assert data["phone"] == "03001234567"
    assert data["address"] == "Lahore"


def test_get_suppliers(client):

    client.post(
        "/suppliers",
        json={
            "name": "ABC Suppliers",
            "email": "abc@example.com"
        }
    )

    response = client.get("/suppliers")

    assert response.status_code == 200

    suppliers = response.json()

    assert len(suppliers) == 1
    assert suppliers[0]["name"] == "ABC Suppliers"


def test_get_supplier(client):

    create_response = client.post(
        "/suppliers",
        json={
            "name": "ABC Suppliers",
            "email": "abc@example.com"
        }
    )

    supplier_id = create_response.json()["id"]

    response = client.get(f"/suppliers/{supplier_id}")

    assert response.status_code == 200

    assert response.json()["id"] == supplier_id


def test_get_supplier_not_found(client):

    response = client.get("/suppliers/99999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Supplier not found"


def test_update_supplier(client):

    create_response = client.post(
        "/suppliers",
        json={
            "name": "ABC Suppliers"
        }
    )

    supplier_id = create_response.json()["id"]

    response = client.put(
        f"/suppliers/{supplier_id}",
        json={
            "name": "Updated Suppliers",
            "phone": "03111234567"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Updated Suppliers"
    assert data["phone"] == "03111234567"


def test_update_supplier_not_found(client):

    response = client.put(
        "/suppliers/99999",
        json={"name": "Non Existent"}
    )

    assert response.status_code == 404


def test_delete_supplier(client):

    create_response = client.post(
        "/suppliers",
        json={
            "name": "ABC Suppliers"
        }
    )

    supplier_id = create_response.json()["id"]

    response = client.delete(f"/suppliers/{supplier_id}")

    assert response.status_code == 204

    response = client.get(f"/suppliers/{supplier_id}")

    assert response.status_code == 404


def test_delete_supplier_not_found(client):

    response = client.delete("/suppliers/99999")

    assert response.status_code == 404


def test_upload_and_get_supplier_image(client):

    create_response = client.post(
        "/suppliers",
        json={"name": "Supplier With Image"}
    )
    supplier_id = create_response.json()["id"]

    valid_png = get_valid_png_bytes()
    file_data = io.BytesIO(valid_png)

    upload_response = client.post(
        f"/suppliers/{supplier_id}/image",
        files={"file": ("supplier.png", file_data, "image/png")}
    )

    assert upload_response.status_code == 201
    assert upload_response.json()["supplier_id"] == supplier_id

    get_img_response = client.get(f"/suppliers/{supplier_id}/image")
    assert get_img_response.status_code == 200
    assert get_img_response.headers["content-type"] == "image/png"


def test_get_supplier_image_not_found(client):

    create_response = client.post(
        "/suppliers",
        json={"name": "Supplier Without Image"}
    )
    supplier_id = create_response.json()["id"]

    response = client.get(f"/suppliers/{supplier_id}/image")
    assert response.status_code == 404
    assert response.json()["detail"] == "Supplier image not found"