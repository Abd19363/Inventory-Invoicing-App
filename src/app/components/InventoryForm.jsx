"use client";

import {
    Formik,
    Form,
    Field,
    ErrorMessage,
} from "formik";

import * as Yup from "yup";


// ========================================
// VALIDATION SCHEMA
// ========================================

const validationSchema = Yup.object({

    name: Yup.string()
        .required("Product name is required"),

    category: Yup.string()
        .required("Category is required"),

    quantity: Yup.number()
        .typeError("Quantity must be a number")
        .required("Quantity is required")
        .min(1, "Quantity must be at least 1")
        .integer("Quantity must be a whole number"),

    purchasePrice: Yup.number()
        .typeError("Purchase price must be a number")
        .required("Purchase price is required")
        .min(0, "Purchase price cannot be negative"),

    retailPrice: Yup.number()
        .typeError("Retail price must be a number")
        .required("Retail price is required")
        .min(0, "Retail price cannot be negative"),

    discount: Yup.number()
        .typeError("Discount must be a number")
        .required("Discount is required")
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot exceed 100%"),

});


// ========================================
// INVENTORY FORM
// ========================================

export default function InventoryForm({
    initialValues,
    onSubmit,
}) {

    // Make sure all fields always have a value.
    // This prevents uncontrolled -> controlled input warnings.

    const defaultValues = {

        name: initialValues?.name || "",

        category: initialValues?.category || "",

        quantity: initialValues?.quantity ?? "",

        purchasePrice: initialValues?.purchasePrice ?? "",

        retailPrice: initialValues?.retailPrice ?? "",

        discount: initialValues?.discount ?? 0,

        salePrice: initialValues?.salePrice ?? 0,

    };


    return (

        <Formik

            initialValues={defaultValues}

            validationSchema={validationSchema}

            enableReinitialize={true}

            onSubmit={(values) => {

                // ========================================
                // CALCULATE SALE PRICE
                // ========================================

                const retailPrice =
                    Number(values.retailPrice || 0);

                const discount =
                    Number(values.discount || 0);

                const salePrice =
                    retailPrice -
                    (
                        retailPrice * discount
                    ) / 100;


                // ========================================
                // CREATE PRODUCT
                // ========================================

                const product = {

                    ...values,

                    quantity:
                        Number(values.quantity),

                    purchasePrice:
                        Number(values.purchasePrice),

                    retailPrice:
                        retailPrice,

                    discount:
                        discount,

                    salePrice:
                        salePrice,

                };


                console.log(
                    "Product being submitted:",
                    product
                );


                onSubmit(product);

            }}

        >

            {({ values }) => {


                // ========================================
                // AUTOMATIC SALE PRICE
                // ========================================

                const retailPrice =
                    Number(values.retailPrice || 0);

                const discount =
                    Number(values.discount || 0);

                const salePrice =
                    retailPrice -
                    (
                        retailPrice * discount
                    ) / 100;


                // ========================================
                // TOTAL INVENTORY VALUE
                // ========================================

                const quantity =
                    Number(values.quantity || 0);

                const totalValue =
                    quantity * salePrice;


                return (

                    <Form
                        className="
                            max-w-lg
                            mx-auto
                            mt-10
                            bg-teal-100
                            shadow-lg
                            rounded-lg
                            p-8
                        "
                    >

                        {/* ================================= */}
                        {/* HEADING */}
                        {/* ================================= */}

                        <h2
                            className="
                                text-3xl
                                font-bold
                                text-center
                                text-blue-700
                                mb-8
                            "
                        >
                            Product Details
                        </h2>


                        {/* ================================= */}
                        {/* PRODUCT NAME */}
                        {/* ================================= */}

                        <div className="mb-5">

                            <label
                                className="
                                    block
                                    mb-2
                                    font-semibold
                                    text-gray-700
                                    text-center
                                "
                            >
                                Product Name
                            </label>


                            <Field
                                type="text"
                                name="name"
                                placeholder="Enter product name"
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-md
                                    p-3
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    bg-black
                                    transition-all
                                    duration-300
                                    ease-in-out
                                    hover:translate-x-2
                                    hover:border-4
                                    hover:border-blue-300
                                    text-center
                                "
                            />


                            <ErrorMessage
                                name="name"
                                component="div"
                                className="
                                    text-red-600
                                    text-sm
                                    mt-1
                                "
                            />

                        </div>


                        {/* ================================= */}
                        {/* CATEGORY */}
                        {/* ================================= */}

                        <div className="mb-5">

                            <label
                                className="
                                    block
                                    mb-2
                                    font-semibold
                                    text-gray-700
                                    text-center
                                "
                            >
                                Category
                            </label>


                            <Field
                                type="text"
                                name="category"
                                placeholder="Enter category"
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-md
                                    p-3
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    bg-black
                                    transition-all
                                    duration-300
                                    ease-in-out
                                    hover:translate-x-2
                                    hover:border-4
                                    hover:border-blue-300
                                    text-center
                                "
                            />


                            <ErrorMessage
                                name="category"
                                component="div"
                                className="
                                    text-red-600
                                    text-sm
                                    mt-1
                                "
                            />

                        </div>


                        {/* ================================= */}
                        {/* QUANTITY */}
                        {/* ================================= */}

                        <div className="mb-5">

                            <label
                                className="
                                    block
                                    mb-2
                                    font-semibold
                                    text-gray-700
                                    text-center
                                "
                            >
                                Quantity
                            </label>


                            <Field
                                type="number"
                                name="quantity"
                                placeholder="Enter quantity"
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-md
                                    p-3
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    bg-black
                                    transition-all
                                    duration-300
                                    ease-in-out
                                    hover:translate-x-2
                                    hover:border-4
                                    hover:border-blue-300
                                    text-center
                                "
                            />


                            <ErrorMessage
                                name="quantity"
                                component="div"
                                className="
                                    text-red-600
                                    text-sm
                                    mt-1
                                "
                            />

                        </div>


                        {/* ================================= */}
                        {/* PURCHASE PRICE */}
                        {/* ================================= */}

                        <div className="mb-5">

                            <label
                                className="
                                    block
                                    mb-2
                                    font-semibold
                                    text-gray-700
                                    text-center
                                "
                            >
                                Purchase Price
                            </label>


                            <Field
                                type="number"
                                name="purchasePrice"
                                placeholder="Enter purchase price"
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-md
                                    p-3
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    bg-black
                                    transition-all
                                    duration-300
                                    ease-in-out
                                    hover:translate-x-2
                                    hover:border-4
                                    hover:border-blue-300
                                    text-center
                                "
                            />


                            <ErrorMessage
                                name="purchasePrice"
                                component="div"
                                className="
                                    text-red-500
                                    text-sm
                                    mt-1
                                "
                            />

                        </div>


                        {/* ================================= */}
                        {/* RETAIL PRICE */}
                        {/* ================================= */}

                        <div className="mb-5">

                            <label
                                className="
                                    block
                                    mb-2
                                    font-semibold
                                    text-gray-700
                                    text-center
                                "
                            >
                                Retail Price
                            </label>


                            <Field
                                type="number"
                                name="retailPrice"
                                placeholder="Enter retail price"
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-md
                                    p-3
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    bg-black
                                    transition-all
                                    duration-300
                                    ease-in-out
                                    hover:translate-x-2
                                    hover:border-4
                                    hover:border-blue-300
                                    text-center
                                "
                            />


                            <ErrorMessage
                                name="retailPrice"
                                component="div"
                                className="
                                    text-red-500
                                    text-sm
                                    mt-1
                                "
                            />

                        </div>


                        {/* ================================= */}
                        {/* DISCOUNT */}
                        {/* ================================= */}

                        <div className="mb-5">

                            <label
                                className="
                                    block
                                    mb-2
                                    font-semibold
                                    text-gray-700
                                    text-center
                                "
                            >
                                Discount (%)
                            </label>


                            <Field
                                type="number"
                                name="discount"
                                placeholder="Enter discount percentage"
                                className="
                                    w-full
                                    border
                                    border-gray-300
                                    rounded-md
                                    p-3
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    bg-black
                                    transition-all
                                    duration-300
                                    ease-in-out
                                    hover:translate-x-2
                                    hover:border-4
                                    hover:border-blue-300
                                    text-center
                                "
                            />


                            <ErrorMessage
                                name="discount"
                                component="div"
                                className="
                                    text-red-500
                                    text-sm
                                    mt-1
                                "
                            />

                        </div>


                        {/* ================================= */}
                        {/* SALE PRICE */}
                        {/* ================================= */}

                        <div className="mb-5">

                            <label
                                className="
                                    block
                                    mb-2
                                    font-semibold
                                    text-gray-700
                                    text-center
                                "
                            >
                                Sale Price
                            </label>


                            <div
                                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black transition-all duration-300 ease-in-out hover:translate-x-2 hover:border-4 hover:border-blue-300 text-center "
                            >

                                {salePrice.toLocaleString()}

                            </div>

                        </div>


                        {/* ================================= */}
                        {/* TOTAL INVENTORY VALUE */}
                        {/* ================================= */}

                        <div className="mb-6">

                            <label
                                className="
                                    block
                                    mb-2
                                    font-semibold
                                    text-gray-700
                                    text-center
                                "
                            >
                                Total Inventory Value
                            </label>


                            <div
                                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black transition-all duration-300 ease-in-out hover:translate-x-2 hover:border-4 hover:border-blue-300 text-center "
                            >

                                {totalValue.toLocaleString()}

                            </div>

                        </div>


                        {/* ================================= */}
                        {/* SUBMIT */}
                        {/* ================================= */}

                        <button
                            type="submit"
                            className="
                                w-full
                                bg-blue-400
                                text-white
                                py-3
                                rounded-md
                                font-semibold
                                hover:bg-blue-800
                                transition
                                duration-300
                            "
                        >
                            Add Product
                        </button>


                    </Form>

                );

            }}

        </Formik>

    );

}