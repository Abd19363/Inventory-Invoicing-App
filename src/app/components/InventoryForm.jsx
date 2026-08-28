"use client";

import {
    Formik,
    Form,
    Field,
    ErrorMessage,
} from "formik";

import * as Yup from "yup";
import toast from "react-hot-toast";


// ========================================
// VALIDATION SCHEMA
// ========================================

const validationSchema = Yup.object({

    name: Yup.string()
        .trim()
        .required("Product name is required"),

    category: Yup.string()
        .trim()
        .required("Category is required"),

    description: Yup.string()
        .max(
            500,
            "Description cannot exceed 500 characters"
        )
        .nullable(),

    quantity: Yup.number()
        .typeError("Quantity must be a number")
        .required("Quantity is required")
        .min(
            1,
            "Quantity must be at least 1"
        )
        .integer(
            "Quantity must be a whole number"
        ),

    purchasePrice: Yup.number()
        .typeError(
            "Purchase price must be a number"
        )
        .required(
            "Purchase price is required"
        )
        .min(
            0,
            "Purchase price cannot be negative"
        ),

    retailPrice: Yup.number()
        .typeError(
            "Retail price must be a number"
        )
        .required(
            "Retail price is required"
        )
        .min(
            0,
            "Retail price cannot be negative"
        ),

    discount: Yup.number()
        .typeError(
            "Discount must be a number"
        )
        .required(
            "Discount is required"
        )
        .min(
            0,
            "Discount cannot be negative"
        )
        .max(
            100,
            "Discount cannot exceed 100%"
        ),

    // ========================================
    // IMAGE FILE (OPTIONAL)
    // Allowed formats : JPEG / JPG / PNG
    // Maximum size   : 5 MB
    // ========================================

    imageFile: Yup.mixed()
        .nullable()
        .test(
            "fileType",
            "Only JPEG and PNG images are allowed (no videos or other formats)",
            (file) => {

                if (!file) {
                    return true;
                }

                return [
                    "image/jpeg",
                    "image/png",
                ].includes(file.type);

            }
        )
        .test(
            "fileSize",
            "Image size must not exceed 5 MB",
            (file) => {

                if (!file) {
                    return true;
                }

                return (
                    file.size <=
                    5 * 1024 * 1024
                );

            }
        ),

});


// ========================================
// INVENTORY FORM
// ========================================

export default function InventoryForm({
    initialValues,
    onSubmit,
    buttontext = "Add Product",
    isEdit = false,
}) {

    const defaultValues = {

        name:
            initialValues?.name ||
            "",

        category:
            initialValues?.category ||
            "",

        description:
            initialValues?.description ||
            "",

        quantity:
            initialValues?.quantity ??
            "",

        purchasePrice:
            initialValues?.purchasePrice ??
            "",

        retailPrice:
            initialValues?.retailPrice ??
            "",

        discount:
            initialValues?.discount ??
            0,

        salePrice:
            initialValues?.salePrice ??
            0,

        imageFile:
            null,

        thumbnailFile:
            null,

        fullImageFile:
            null,

        thumbnailUrl:
            initialValues?.thumbnailUrl ||
            initialValues?.thumbnail_url ||
            null,

        fullImageUrl:
            initialValues?.fullImageUrl ||
            initialValues?.full_image_url ||
            null,

    };


    return (

        <Formik
            initialValues={defaultValues}
            validationSchema={validationSchema}
            enableReinitialize={true}

            onSubmit={(values) => {

                const quantity =
                    Number(
                        values.quantity
                    );

                const purchasePrice =
                    Number(
                        values.purchasePrice
                    );

                const retailPrice =
                    Number(
                        values.retailPrice
                    );

                const discount =
                    Number(
                        values.discount
                    );


                // ========================================
                // CALCULATE SALE PRICE
                // ========================================

                const salePrice =
                    retailPrice -
                    (
                        retailPrice *
                        discount
                    ) / 100;


                // ========================================
                // CREATE PRODUCT OBJECT
                // ========================================

                const selectedImage =
                    values.imageFile ||
                    values.fullImageFile ||
                    values.thumbnailFile;

                const product = {

                    name:
                        values.name.trim(),

                    category:
                        values.category.trim(),

                    description:
                        values.description?.trim()
                        || null,

                    quantity:
                        quantity,

                    purchasePrice:
                        purchasePrice,

                    retailPrice:
                        retailPrice,

                    discount:
                        discount,

                    salePrice:
                        salePrice,

                    imageFile:
                        selectedImage,

                    thumbnailFile:
                        selectedImage,

                    fullImageFile:
                        selectedImage,

                };


                console.log(
                    "Product being submitted:",
                    product
                );


                onSubmit(
                    product
                );

            }}

        >

            {({
                values,
                setFieldValue,
            }) => {

                // ========================================
                // CALCULATE SALE PRICE
                // ========================================

                const retailPrice =
                    Number(
                        values.retailPrice ||
                        0
                    );

                const discount =
                    Number(
                        values.discount ||
                        0
                    );

                const salePrice =
                    retailPrice -
                    (
                        retailPrice *
                        discount
                    ) / 100;


                // ========================================
                // TOTAL INVENTORY VALUE
                // ========================================

                const quantity =
                    Number(
                        values.quantity ||
                        0
                    );

                const totalValue =
                    quantity *
                    salePrice;


                // ========================================
                // HANDLE NEW IMAGE
                // ========================================

                const handleImageChange = (
                    event
                ) => {

                    const file =
                        event
                            .currentTarget
                            .files?.[0] ||
                        null;


                    if (!file) {
                        return;
                    }


                    // ========================================
                    // REAL-TIME FILE TYPE VALIDATION
                    // Only JPEG / JPG / PNG are accepted.
                    // ========================================

                    const allowedTypes = [
                        "image/jpeg",
                        "image/png",
                    ];

                    if (!allowedTypes.includes(file.type)) {

                        toast.error(
                            "Invalid file type. Only JPEG, JPG and PNG images are allowed."
                        );

                        // Reset the file input
                        event.currentTarget.value = "";

                        return;
                    }


                    // ========================================
                    // REAL-TIME FILE SIZE VALIDATION
                    // Maximum allowed size: 5 MB
                    // ========================================

                    const maxSize = 5 * 1024 * 1024; // 5 MB in bytes

                    if (file.size > maxSize) {

                        const sizeMB =
                            (file.size / (1024 * 1024)).toFixed(2);

                        toast.error(
                            `Image is too large (${sizeMB} MB). Maximum allowed size is 5 MB.`
                        );

                        // Reset the file input
                        event.currentTarget.value = "";

                        return;
                    }


                    console.log(
                        "New product image selected:",
                        file.name,
                        `(${(file.size / 1024).toFixed(1)} KB)`
                    );


                    setFieldValue(
                        "imageFile",
                        file
                    );

                    setFieldValue(
                        "thumbnailFile",
                        file
                    );

                    setFieldValue(
                        "fullImageFile",
                        file
                    );


                    // Clear existing URLs so preview uses the selected file
                    setFieldValue(
                        "thumbnailUrl",
                        null
                    );

                    setFieldValue(
                        "fullImageUrl",
                        null
                    );

                };


                const activeImage =
                    values.imageFile ||
                    values.fullImageFile ||
                    values.thumbnailFile;

                const activePreviewUrl =
                    values.fullImageUrl ||
                    values.thumbnailUrl;


                return (

                    <Form className="space-y-6">

                        {/* ================================= */}
                        {/* PRODUCT NAME */}
                        {/* ================================= */}

                        <div>

                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-slate-300 mb-2"
                            >
                                Product Name
                            </label>

                            <Field
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Enter product name"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />

                            <ErrorMessage
                                name="name"
                                component="div"
                                className="mt-1.5 text-sm text-rose-400"
                            />

                        </div>


                        {/* ================================= */}
                        {/* CATEGORY */}
                        {/* ================================= */}

                        <div>

                            <label
                                htmlFor="category"
                                className="block text-sm font-medium text-slate-300 mb-2"
                            >
                                Category
                            </label>

                            <Field
                                id="category"
                                type="text"
                                name="category"
                                placeholder="Enter category"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />

                            <ErrorMessage
                                name="category"
                                component="div"
                                className="mt-1.5 text-sm text-rose-400"
                            />

                        </div>


                        {/* ================================= */}
                        {/* DESCRIPTION */}
                        {/* ================================= */}

                        <div>

                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-slate-300 mb-2"
                            >
                                Description
                            </label>

                            <Field
                                as="textarea"
                                id="description"
                                name="description"
                                rows="4"
                                placeholder="Enter product description"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-200 resize-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />

                            <ErrorMessage
                                name="description"
                                component="div"
                                className="mt-1.5 text-sm text-rose-400"
                            />

                        </div>


                        {/* ================================= */}
                        {/* QUANTITY */}
                        {/* ================================= */}

                        <div>

                            <label
                                htmlFor="quantity"
                                className="block text-sm font-medium text-slate-300 mb-2"
                            >
                                Quantity
                            </label>

                            <Field
                                id="quantity"
                                type="number"
                                min="1"
                                name="quantity"
                                placeholder="Enter quantity"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />

                            <ErrorMessage
                                name="quantity"
                                component="div"
                                className="mt-1.5 text-sm text-rose-400"
                            />

                        </div>


                        {/* ================================= */}
                        {/* PRICE GRID */}
                        {/* ================================= */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* PURCHASE PRICE */}

                            <div>

                                <label
                                    htmlFor="purchasePrice"
                                    className="block text-sm font-medium text-slate-300 mb-2"
                                >
                                    Purchase Price
                                </label>

                                <Field
                                    id="purchasePrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="purchasePrice"
                                    placeholder="Enter purchase price"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />

                                <ErrorMessage
                                    name="purchasePrice"
                                    component="div"
                                    className="mt-1.5 text-sm text-rose-400"
                                />

                            </div>


                            {/* RETAIL PRICE */}

                            <div>

                                <label
                                    htmlFor="retailPrice"
                                    className="block text-sm font-medium text-slate-300 mb-2"
                                >
                                    Retail Price
                                </label>

                                <Field
                                    id="retailPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="retailPrice"
                                    placeholder="Enter retail price"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />

                                <ErrorMessage
                                    name="retailPrice"
                                    component="div"
                                    className="mt-1.5 text-sm text-rose-400"
                                />

                            </div>

                        </div>


                        {/* ================================= */}
                        {/* DISCOUNT */}
                        {/* ================================= */}

                        <div>

                            <label
                                htmlFor="discount"
                                className="block text-sm font-medium text-slate-300 mb-2"
                            >
                                Discount (%)
                            </label>

                            <Field
                                id="discount"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                name="discount"
                                placeholder="Enter discount percentage"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />

                            <ErrorMessage
                                name="discount"
                                component="div"
                                className="mt-1.5 text-sm text-rose-400"
                            />

                        </div>


                        {/* ================================= */}
                        {/* CALCULATED VALUES */}
                        {/* ================================= */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">

                                <p className="text-sm text-slate-400">
                                    Sale Price
                                </p>

                                <p className="mt-1 text-2xl font-bold text-emerald-400">

                                    {salePrice.toLocaleString(
                                        undefined,
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}

                                </p>

                            </div>


                            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">

                                <p className="text-sm text-slate-400">
                                    Total Inventory Value
                                </p>

                                <p className="mt-1 text-2xl font-bold text-white">

                                    {totalValue.toLocaleString(
                                        undefined,
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}

                                </p>

                            </div>

                        </div>


                        {/* ================================= */}
                        {/* SINGLE PRODUCT IMAGE UPLOAD */}
                        {/* ================================= */}

                        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">

                            <div className="mb-5">

                                <h3 className="text-lg font-semibold text-white">
                                    Product Image
                                </h3>

                                <p className="mt-1 text-sm text-slate-400">
                                    Upload a product image. Accepted formats: <span className="text-slate-300 font-medium">JPEG, JPG, PNG</span>. Maximum size: <span className="text-slate-300 font-medium">5 MB</span>. The backend will auto-generate a thumbnail.
                                </p>

                            </div>


                            <div className="flex flex-col md:flex-row items-center gap-6">

                                {/* IMAGE PREVIEW */}

                                <div className="w-full md:w-56 h-56 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-inner">

                                    {activeImage ? (

                                        <img
                                            src={URL.createObjectURL(
                                                activeImage
                                            )}
                                            alt="New product preview"
                                            className="h-full w-full object-contain p-2"
                                        />

                                    ) : activePreviewUrl ? (

                                        <img
                                            src={activePreviewUrl}
                                            alt="Current product image"
                                            className="h-full w-full object-contain p-2"
                                        />

                                    ) : (

                                        <div className="text-center p-4 text-slate-500">
                                            <span className="text-3xl block mb-1">🖼️</span>
                                            <span className="text-xs">No image selected</span>
                                        </div>

                                    )}

                                </div>


                                {/* FILE INPUT & INFO */}

                                <div className="w-full space-y-3">

                                    <label
                                        htmlFor="imageFile"
                                        className="block text-sm font-medium text-slate-300"
                                    >
                                        Select Image File
                                    </label>


                                    <input
                                        id="imageFile"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={
                                            handleImageChange
                                        }
                                        className="block w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-500 cursor-pointer"
                                    />


                                    {activeImage && (

                                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                                            <p className="font-semibold">Selected: {activeImage.name}</p>
                                            <p className="text-slate-400 mt-0.5">Size: {(activeImage.size / 1024).toFixed(1)} KB — Thumbnail will be auto-generated on save.</p>
                                        </div>

                                    )}


                                    <ErrorMessage
                                        name="imageFile"
                                        component="div"
                                        className="text-sm text-rose-400"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* ================================= */}
                        {/* SUBMIT BUTTON */}
                        {/* ================================= */}

                        <button
                            type="submit"
                            className="w-full rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:bg-emerald-500 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                        >
                            {buttontext}
                        </button>

                    </Form>

                );

            }}

        </Formik>

    );

}