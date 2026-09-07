const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";


// ==========================================
// HANDLE API RESPONSE
// ==========================================

async function handleResponse(response) {

    const contentType =
        response.headers.get("content-type");

    let data = null;

    try {

        if (
            contentType &&
            contentType.includes("application/json")
        ) {

            data = await response.json();

        } else {

            const text = await response.text();

            data = text || null;
        }

    } catch (error) {

        console.error(
            "Failed to parse API response:",
            error
        );

    }


    if (!response.ok) {

        console.error(
            "API ERROR STATUS:",
            response.status
        );

        console.error(
            "API ERROR STATUS TEXT:",
            response.statusText
        );

        console.error(
            "API ERROR DATA:",
            data
        );


        let message =
            "Something went wrong";


        if (
            Array.isArray(
                data?.detail
            )
        ) {

            message =
                data.detail
                    .map((error) => {

                        const field =
                            error?.loc?.join(".") ||
                            "field";

                        return `${field}: ${
                            error?.msg ||
                            "Invalid value"
                        }`;

                    })
                    .join("\n");

        }

        else if (
            typeof data?.detail ===
            "string"
        ) {

            message =
                data.detail;

        }

        else if (
            typeof data?.message ===
            "string"
        ) {

            message =
                data.message;

        }

        else if (
            typeof data ===
            "string"
        ) {

            message =
                data;
        }


        throw new Error(
            message
        );
    }


    return data;
}



// ==========================================
// REGISTER
// ==========================================

export async function register(email, password, role = "SALES_MANAGER") {

    const cleanEmail = email.trim().toLowerCase();

    const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: cleanEmail,
                password,
                role
            })
        }
    );

    return await handleResponse(response);
}



// ==========================================
// LOGIN
// ==========================================

export async function login(
    email,
    password
) {

    const cleanEmail =
        email.trim().toLowerCase();


    console.log(
        "Attempting login for:",
        cleanEmail
    );


    const response =
        await fetch(
            `${API_BASE_URL}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        email:
                            cleanEmail,

                        password:
                            password
                    })
            }
        );


    const data =
        await handleResponse(
            response
        );


    console.log(
        "Login response:",
        data
    );


    // ==========================================
    // VALIDATE ACCESS TOKEN
    // ==========================================

    if (
        !data ||
        !data.access_token
    ) {

        throw new Error(
            "Login succeeded but the server did not return an access token."
        );
    }


    // ==========================================
    // STORE TOKENS & USER ROLE
    // ==========================================

    localStorage.setItem(
        "accessToken",
        data.access_token
    );


    if (
        data.refresh_token
    ) {

        localStorage.setItem(
            "refreshToken",
            data.refresh_token
        );
    }

    if (data.role) {
        localStorage.setItem("userRole", data.role);
    }

    if (data.user_id || data.email || data.role) {
        localStorage.setItem("user", JSON.stringify({
            id: data.user_id,
            email: data.email,
            role: data.role
        }));
    }


    console.log(
        "Access token stored successfully."
    );


    console.log(
        "Authentication check:",
        Boolean(
            localStorage.getItem(
                "accessToken"
            )
        )
    );


    return data;
}



// ==========================================
// REFRESH ACCESS TOKEN
// ==========================================

export async function refreshAccessToken() {

    const refreshToken =
        localStorage.getItem(
            "refreshToken"
        );


    if (!refreshToken) {

        throw new Error(
            "No refresh token available"
        );
    }


    const response =
        await fetch(
            `${API_BASE_URL}/auth/refresh`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        refresh_token:
                            refreshToken
                    })
            }
        );


    const data =
        await handleResponse(
            response
        );


    if (
        !data ||
        !data.access_token
    ) {

        throw new Error(
            "Refresh response did not contain an access token."
        );
    }


    localStorage.setItem(
        "accessToken",
        data.access_token
    );


    return data.access_token;
}



// ==========================================
// LOGOUT
// ==========================================

export async function logout() {

    const refreshToken =
        localStorage.getItem(
            "refreshToken"
        );


    if (refreshToken) {

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/auth/logout`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                refresh_token:
                                    refreshToken
                            })
                    }
                );


            if (!response.ok) {

                console.warn(
                    "Logout request returned:",
                    response.status
                );

            }

        } catch (error) {

            console.error(
                "Logout request failed:",
                error
            );

        }
    }


    // ==========================================
    // ALWAYS CLEAR LOCAL TOKENS & ROLE
    // ==========================================

    localStorage.removeItem(
        "accessToken"
    );

    localStorage.removeItem(
        "refreshToken"
    );

    localStorage.removeItem(
        "userRole"
    );

    localStorage.removeItem(
        "user"
    );


    console.log(
        "Local authentication tokens cleared."
    );
}



// ==========================================
// AUTHENTICATION CHECK
// ==========================================

export function isAuthenticated() {

    if (
        typeof window ===
        "undefined"
    ) {

        return false;
    }


    const token =
        localStorage.getItem(
            "accessToken"
        );


    return Boolean(token);
}

// ==========================================
// GET ACCESS TOKEN
// ==========================================

export function getAccessToken() {

    if (
        typeof window ===
        "undefined"
    ) {

        return null;
    }


    return localStorage.getItem(
        "accessToken"
    );
}

// ==========================================
// RBAC HELPERS
// ==========================================

export function getUserRole() {
    if (typeof window === "undefined") {
        return null;
    }
    return localStorage.getItem("userRole") || "SALES_MANAGER";
}

export function getUser() {
    if (typeof window === "undefined") {
        return null;
    }
    const userStr = localStorage.getItem("user");
    try {
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        return null;
    }
}

export function isAdmin() {
    return getUserRole() === "ADMIN";
}

export function isSalesManager() {
    return getUserRole() === "SALES_MANAGER";
}