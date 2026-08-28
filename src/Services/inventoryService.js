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
// CONVERT IMAGE URL
// ==========================================

function getImageUrl(url) {

    if (!url) {
        return null;
    }

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    if (url.startsWith("/")) {
        return `${API_URL}${url}`;
    }

    return `${API_URL}/${url}`;

}


// ==========================================
// CONVERT BACKEND PRODUCT
// → FRONTEND PRODUCT
// ==========================================

function mapProduct(product) {

    if (!product) {
        return product;
    }

    return {

        id:
            product.id,

        name:
            product.name,

        description:
            product.description || "",

        category:
            product.category || "",

        quantity:
            Number(
                product.quantity ?? 0
            ),

        purchasePrice:
            Number(
                product.purchase_price ??
                product.purchasePrice ??
                0
            ),

        retailPrice:
            Number(
                product.retail_price ??
                product.retailPrice ??
                0
            ),

        discount:
            Number(
                product.discount ??
                0
            ),

        salePrice:
            Number(
                product.sale_price ??
                product.salePrice ??
                0
            ),

        supplierId:
            product.supplier_id ??
            product.supplierId ??
            null,

        // ==========================================
        // EXISTING THUMBNAIL IMAGE
        // ==========================================

        thumbnailUrl:
            getImageUrl(
                product.thumbnail_url ??
                product.thumbnailUrl
            ),

        // ==========================================
        // EXISTING FULL-SIZE IMAGE
        // ==========================================

        fullImageUrl:
            getImageUrl(
                product.full_image_url ??
                product.fullImageUrl
            )

    };

}


// ==========================================
// HANDLE API RESPONSE
// ==========================================

async function handleResponse(response) {

    const contentType =
        response.headers.get(
            "content-type"
        );

    let data = null;


    if (
        contentType &&
        contentType.includes(
            "application/json"
        )
    ) {

        data =
            await response.json();

    }


    if (!response.ok) {

        console.error(
            "API ERROR:",
            {
                status:
                    response.status,

                statusText:
                    response.statusText,

                data:
                    data
            }
        );


        let message =
            `Request failed with status ${response.status}`;


        if (
            typeof data?.detail === "string"
        ) {

            message =
                data.detail;

        }

        else if (
            Array.isArray(
                data?.detail
            )
        ) {

            message =
                data.detail
                    .map(error => {

                        const location =
                            error.loc
                                ?.join(".") ||
                            "field";

                        return (
                            `${location}: ${error.msg}`
                        );

                    })
                    .join("\n");

        }

        else if (
            data?.detail
        ) {

            message =
                JSON.stringify(
                    data.detail,
                    null,
                    2
                );

        }


        throw new Error(
            message
        );

    }


    return data;

}


// ==========================================
// GET ALL PRODUCTS
// ==========================================

export async function getItems() {

    try {

        const response =
            await fetch(
                `${API_URL}/products`,
                {
                    method: "GET",
                    headers: getAuthHeaders({
                        "Content-Type": "application/json"
                    })
                }
            );

        const data =
            await handleResponse(
                response
            );


        if (!Array.isArray(data)) {
            return [];
        }


        return data.map(
            mapProduct
        );

    } catch (error) {

        console.error(
            "Failed to fetch products:",
            error
        );

        return [];

    }

}


// ==========================================
// GET PRODUCT BY ID
// ==========================================

export async function getItemById(id) {

    if (!id) {

        throw new Error(
            "Product ID is required."
        );

    }


    const response =
        await fetch(
            `${API_URL}/products/${id}`,
            {
                method: "GET",
                headers: getAuthHeaders({
                    "Content-Type": "application/json"
                })
            }
        );


    const data =
        await handleResponse(
            response
        );


    return mapProduct(
        data
    );

}


// ==========================================
// ADD PRODUCT
// ==========================================

export async function addItems(item) {

    const quantity =
        Number(
            item.quantity
        );

    const purchasePrice =
        Number(
            item.purchasePrice ??
            item.purchase_price
        );

    const retailPrice =
        Number(
            item.retailPrice ??
            item.retail_price
        );

    const discount =
        Number(
            item.discount
        );

    const salePrice =
        Number(
            item.salePrice ??
            item.sale_price
        );


    if (!Number.isFinite(quantity)) {
        throw new Error(
            "Quantity must be a valid number."
        );
    }

    if (!Number.isFinite(purchasePrice)) {
        throw new Error(
            "Purchase price must be a valid number."
        );
    }

    if (!Number.isFinite(retailPrice)) {
        throw new Error(
            "Retail price must be a valid number."
        );
    }

    if (!Number.isFinite(discount)) {
        throw new Error(
            "Discount must be a valid number."
        );
    }

    if (!Number.isFinite(salePrice)) {
        throw new Error(
            "Sale price must be a valid number."
        );
    }


    const product = {

        name:
            String(
                item.name || ""
            ).trim(),

        description:
            item.description
                ? String(
                    item.description
                ).trim()
                : null,

        quantity:
            quantity,

        purchase_price:
            purchasePrice,

        retail_price:
            retailPrice,

        discount:
            discount,

        sale_price:
            salePrice,

        supplier_id:
            item.supplierId ??
            item.supplier_id
                ? Number(
                    item.supplierId ??
                    item.supplier_id
                )
                : null

    };


    // Backend expects multipart/form-data (Form fields), not JSON
    const formData = new FormData();
    formData.append("name", product.name);
    if (item.category) {
        formData.append("category", String(item.category).trim());
    }
    if (product.description != null) {
        formData.append("description", product.description);
    }
    formData.append("quantity", String(product.quantity));
    formData.append("purchase_price", String(product.purchase_price));
    formData.append("retail_price", String(product.retail_price));
    formData.append("discount", String(product.discount));
    formData.append("sale_price", String(product.sale_price));
    if (product.supplier_id != null) {
        formData.append("supplier_id", String(product.supplier_id));
    }

    const response =
        await fetch(
            `${API_URL}/products`,
            {
                method: "POST",
                // Do NOT set Content-Type manually — browser sets multipart boundary
                headers: getAuthHeaders(),
                body: formData
            }
        );


    const data =
        await handleResponse(
            response
        );


    if (!data?.id) {

        throw new Error(
            "Product was created but the backend did not return a product ID."
        );

    }


    return mapProduct(
        data
    );

}


// ==========================================
// UPLOAD ONE PRODUCT IMAGE
// ==========================================

export async function uploadProductImage(
    productId,
    file,
    imageType = "full"
) {

    if (!productId) {

        throw new Error(
            "Product ID is required for image upload."
        );

    }


    if (!file) {

        throw new Error(
            "Please select an image."
        );

    }


    if (
        file.type &&
        ![
            "image/jpeg",
            "image/png",
            "image/webp"
        ].includes(
            file.type
        )
    ) {

        throw new Error(
            "Only JPEG, PNG and WebP images are allowed."
        );

    }


    const MAX_FILE_SIZE =
        5 * 1024 * 1024;


    if (
        file.size >
        MAX_FILE_SIZE
    ) {

        throw new Error(
            "Image size must not exceed 5 MB."
        );

    }


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    const url =
        `${API_URL}/products/${productId}/images`;


    console.log(
        "Uploading product image:",
        {
            productId,
            fileName: file.name,
            mimeType: file.type,
            size: file.size
        }
    );


    const response =
        await fetch(
            url,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: formData
            }
        );


    const data =
        await handleResponse(
            response
        );


    console.log(
        "Image upload response:",
        data
    );


    return data;

}


// ==========================================
// UPLOAD PRODUCT IMAGE HELPER
// ==========================================

export async function uploadProductImages(
    productId,
    file
) {

    if (!file) {
        return null;
    }

    return await uploadProductImage(
        productId,
        file
    );

}


// ==========================================
// UPDATE PRODUCT
// ==========================================

export async function updateItem(
    id,
    updatedData
) {

    if (!id) {

        throw new Error(
            "Product ID is required."
        );

    }


    const product = {

        name:
            String(
                updatedData.name || ""
            ).trim(),

        description:
            updatedData.description
                ? String(
                    updatedData.description
                ).trim()
                : null,

        quantity:
            Number(
                updatedData.quantity ?? 0
            ),

        purchase_price:
            Number(
                updatedData.purchasePrice ??
                updatedData.purchase_price ??
                0
            ),

        retail_price:
            Number(
                updatedData.retailPrice ??
                updatedData.retail_price ??
                0
            ),

        discount:
            Number(
                updatedData.discount ??
                0
            ),

        sale_price:
            Number(
                updatedData.salePrice ??
                updatedData.sale_price ??
                0
            ),

        supplier_id:
            updatedData.supplierId ??
            updatedData.supplier_id
                ? Number(
                    updatedData.supplierId ??
                    updatedData.supplier_id
                )
                : null

    };


    if (
        !Number.isFinite(
            product.quantity
        )
    ) {

        throw new Error(
            "Quantity must be a valid number."
        );

    }


    if (
        !Number.isFinite(
            product.purchase_price
        )
    ) {

        throw new Error(
            "Purchase price must be a valid number."
        );

    }


    if (
        !Number.isFinite(
            product.retail_price
        )
    ) {

        throw new Error(
            "Retail price must be a valid number."
        );

    }


    if (
        !Number.isFinite(
            product.discount
        )
    ) {

        throw new Error(
            "Discount must be a valid number."
        );

    }


    if (
        !Number.isFinite(
            product.sale_price
        )
    ) {

        throw new Error(
            "Sale price must be a valid number."
        );

    }


    // Backend expects multipart/form-data (Form fields), not JSON
    const formData = new FormData();
    formData.append("name", product.name);
    if (updatedData.category) {
        formData.append("category", String(updatedData.category).trim());
    }
    if (product.description != null) {
        formData.append("description", product.description);
    }
    formData.append("quantity", String(product.quantity));
    formData.append("purchase_price", String(product.purchase_price));
    formData.append("retail_price", String(product.retail_price));
    formData.append("discount", String(product.discount));
    formData.append("sale_price", String(product.sale_price));
    if (product.supplier_id != null) {
        formData.append("supplier_id", String(product.supplier_id));
    }


    const response =
        await fetch(
            `${API_URL}/products/${id}`,
            {
                method: "PUT",
                // Do NOT set Content-Type manually — browser sets multipart boundary
                headers: getAuthHeaders(),
                body: formData
            }
        );


    const data =
        await handleResponse(
            response
        );


    return mapProduct(
        data
    );

}


// ==========================================
// DELETE PRODUCT
// ==========================================

export async function deleteItem(id) {

    if (!id) {

        throw new Error(
            "Product ID is required."
        );

    }


    const response =
        await fetch(
            `${API_URL}/products/${id}`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );


    if (!response.ok) {

        const contentType =
            response.headers.get(
                "content-type"
            );

        let data = null;


        if (
            contentType &&
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json();

        }


        let message =
            "Failed to delete product.";


        if (
            typeof data?.detail === "string"
        ) {

            message =
                data.detail;

        }


        throw new Error(
            message
        );

    }


    return true;

}