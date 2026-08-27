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

    response = client.get(
        "/suppliers"
    )

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

    response = client.get(
        f"/suppliers/{supplier_id}"
    )

    assert response.status_code == 200

    assert response.json()["id"] == supplier_id


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


def test_delete_supplier(client):

    create_response = client.post(
        "/suppliers",
        json={
            "name": "ABC Suppliers"
        }
    )

    supplier_id = create_response.json()["id"]

    response = client.delete(
        f"/suppliers/{supplier_id}"
    )

    assert response.status_code == 204

    response = client.get(
        f"/suppliers/{supplier_id}"
    )

    assert response.status_code == 404