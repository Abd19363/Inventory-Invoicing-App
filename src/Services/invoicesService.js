const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

function getAuthHeaders(extraHeaders = {}) {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;

    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extraHeaders,
    };
}


// ==========================================
// HANDLE API RESPONSE
// ==========================================

async function handleResponse(response) {

    const contentType =
        response.headers.get("content-type");

    let data = null;

    if (
        contentType &&
        contentType.includes("application/json")
    ) {
        data = await response.json();
    }

    if (!response.ok) {

        console.error("API Error:", {
            status: response.status,
            statusText: response.statusText,
            data: data
        });

        let message = "Something went wrong";

        if (Array.isArray(data?.detail)) {

            message = data.detail
                .map((error) => {

                    const field =
                        error?.loc?.join(".") || "field";

                    return `${field}: ${error?.msg || "Invalid value"}`;

                })
                .join("\n");

        } else if (typeof data?.detail === "string") {

            message = data.detail;

        } else if (data?.message) {

            message = data.message;

        }

        throw new Error(message);
    }

    return data;
}


// ==========================================
// NORMALIZE INVOICE
// ==========================================

function normalizeInvoice(invoice) {

    if (!invoice) {
        return invoice;
    }

    return {

        id: invoice.id,

        customerName:
            invoice.customer_name || "",

        customerEmail:
            invoice.customer_email || "",

        total:
            Number(
                invoice.total_amount || 0
            ),

        status:
            invoice.status || "unpaid",

        date:
            invoice.created_at
                ? invoice.created_at.split("T")[0]
                : "",

        createdAt:
            invoice.created_at || "",

        items:
            (invoice.items || []).map(
                (item) => ({

                    id:
                        item.id,

                    productId:
                        item.product_id,

                    name:
                        item.product_name || "Unknown Product",

                    quantity:
                        item.quantity,

                    invoiceQuantity:
                        item.quantity,

                    salePrice:
                        Number(
                            item.sale_price || item.unit_price || 0
                        ),

                    retailPrice:
                        Number(
                            item.retail_price || item.unit_price || 0
                        ),

                    discount:
                        Number(
                            item.discount || 0
                        ),

                    unitPrice:
                        Number(
                            item.unit_price || 0
                        ),

                    subtotal:
                        Number(
                            item.subtotal || 0
                        )

                })
            )
    };
}


// ==========================================
// GET ALL INVOICES
// ==========================================

export async function getInvoices() {

    try {

        const response = await fetch(
            `${API_URL}/invoices`,
            {
                method: "GET",
                headers: getAuthHeaders({
                    "Content-Type": "application/json"
                })
            }
        );

        const data =
            await handleResponse(response);

        return Array.isArray(data)
            ? data.map(normalizeInvoice)
            : [];

    } catch (error) {

        console.error(
            "Failed to fetch invoices:",
            error
        );

        return [];

    }

}


// ==========================================
// GET INVOICE BY ID
// ==========================================

export async function getInvoiceById(id) {

    const response = await fetch(
        `${API_URL}/invoices/${id}`,
        {
            method: "GET",
            headers: getAuthHeaders({
                "Content-Type": "application/json"
            })
        }
    );

    const data =
        await handleResponse(response);

    return normalizeInvoice(data);
}


// ==========================================
// SAVE INVOICE
// ==========================================

export async function saveInvoice(invoice) {

    const payload = {

        customer_name:
            invoice.customerName,

        customer_email:
            invoice.customerEmail || null,

        status:
            invoice.status || "unpaid",

        items:
            invoice.items.map((item) => ({

                product_id:
                    Number(
                        item.productId ||
                        item.id
                    ),

                quantity:
                    Number(
                        item.invoiceQuantity ||
                        item.quantity
                    )

            }))

    };


    console.log(
        "Invoice API Payload:",
        payload
    );


    const response = await fetch(
        `${API_URL}/invoices`,
        {
            method: "POST",

            headers: getAuthHeaders({
                "Content-Type": "application/json"
            }),

            body:
                JSON.stringify(payload)
        }
    );


    const data =
        await handleResponse(response);


    console.log(
        "Invoice API Response:",
        data
    );


    return normalizeInvoice(data);
}


// ==========================================
// UPDATE INVOICE
// ==========================================

export async function updateInvoice(
    id,
    updatedInvoice
) {

    const payload = {

        customer_name:
            updatedInvoice.customerName,

        customer_email:
            updatedInvoice.customerEmail || null,

        status:
            updatedInvoice.status,

        ...(updatedInvoice.items ? {
            items: updatedInvoice.items.map((item) => ({
                product_id: Number(item.productId || item.id),
                quantity: Number(item.invoiceQuantity || item.quantity)
            }))
        } : {})

    };


    console.log(
        "Update Invoice Payload:",
        payload
    );


    const response = await fetch(
        `${API_URL}/invoices/${id}`,
        {
            method: "PUT",

            headers: getAuthHeaders({
                "Content-Type": "application/json"
            }),

            body:
                JSON.stringify(payload)
        }
    );


    const data =
        await handleResponse(response);


    return normalizeInvoice(data);
}


// ==========================================
// MARK INVOICE AS PAID
// ==========================================

export async function markInvoiceAsPaid(id) {

    const response = await fetch(
        `${API_URL}/invoices/${id}`,
        {
            method: "PUT",
            headers: getAuthHeaders({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify({
                status: "paid"
            })
        }
    );

    const data = await handleResponse(response);

    return normalizeInvoice(data);
}


// ==========================================
// GET SERVER PDF URL & VIEW IN BROWSER
// ==========================================

export function getInvoicePdfUrl(id) {
    return `${API_URL}/invoices/${id}/pdf`;
}

export function viewInvoicePdf(id) {
    window.open(getInvoicePdfUrl(id), "_blank");
}


// ==========================================
// DELETE INVOICE
// ==========================================

export async function deleteInvoice(id) {

    const response = await fetch(
        `${API_URL}/invoices/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders()
        }
    );


    if (!response.ok) {

        let data = null;

        try {
            data = await response.json();
        } catch {
            // Response has no JSON body
        }


        throw new Error(
            typeof data?.detail === "string"
                ? data.detail
                : "Failed to delete invoice"
        );
    }


    return true;
}