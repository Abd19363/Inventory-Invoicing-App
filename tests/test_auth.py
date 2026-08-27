def test_register(client):

    response = client.post(
        "/auth/register",
        json={
            "email": "admin@example.com",
            "password": "Admin123!",
            "role": "ADMIN"
        }
    )

    assert response.status_code == 201

    data = response.json()

    assert data["email"] == "admin@example.com"
    assert data["role"] == "ADMIN"
    assert "user_id" in data


def test_duplicate_registration(client):

    client.post(
        "/auth/register",
        json={
            "email": "admin@example.com",
            "password": "Admin123!",
            "role": "ADMIN"
        }
    )

    response = client.post(
        "/auth/register",
        json={
            "email": "admin@example.com",
            "password": "Another123!",
            "role": "ADMIN"
        }
    )

    assert response.status_code == 400

    assert response.json()["detail"] == \
        "Email already registered"


def test_login(client):

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

    data = response.json()

    assert data["token_type"] == "bearer"
    assert data["email"] == "admin@example.com"
    assert data["role"] == "ADMIN"

    assert data["access_token"]
    assert data["refresh_token"]
    assert data["user_id"]


def test_login_wrong_password(client):

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
            "password": "WrongPassword!"
        }
    )

    assert response.status_code == 401

    assert response.json()["detail"] == \
        "Invalid email or password"


def test_login_unknown_user(client):

    response = client.post(
        "/auth/login",
        json={
            "email": "unknown@example.com",
            "password": "Admin123!"
        }
    )

    assert response.status_code == 401


def test_refresh_token(client):

    client.post(
        "/auth/register",
        json={
            "email": "admin@example.com",
            "password": "Admin123!",
            "role": "ADMIN"
        }
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin@example.com",
            "password": "Admin123!"
        }
    )

    login_data = login_response.json()

    response = client.post(
        "/auth/refresh",
        json={
            "refresh_token": login_data["refresh_token"]
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["access_token"]
    assert data["refresh_token"] == \
        login_data["refresh_token"]


def test_logout(client):

    client.post(
        "/auth/register",
        json={
            "email": "admin@example.com",
            "password": "Admin123!",
            "role": "ADMIN"
        }
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin@example.com",
            "password": "Admin123!"
        }
    )

    refresh_token = login_response.json()["refresh_token"]

    response = client.post(
        "/auth/logout",
        json={
            "refresh_token": refresh_token
        }
    )

    assert response.status_code == 200

    assert response.json()["message"] == \
        "Logged out successfully"


def test_revoked_refresh_token(client):

    client.post(
        "/auth/register",
        json={
            "email": "admin@example.com",
            "password": "Admin123!",
            "role": "ADMIN"
        }
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "admin@example.com",
            "password": "Admin123!"
        }
    )

    refresh_token = login_response.json()["refresh_token"]

    client.post(
        "/auth/logout",
        json={
            "refresh_token": refresh_token
        }
    )

    response = client.post(
        "/auth/refresh",
        json={
            "refresh_token": refresh_token
        }
    )

    assert response.status_code == 401

    assert response.json()["detail"] == \
        "Refresh token has been revoked"