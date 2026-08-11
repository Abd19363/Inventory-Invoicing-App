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

                    <Form className="space-y-6">


                        {/* ================================= */}
                        {/* PRODUCT NAME */}
                        {/* ================================= */}

                        <div>

                            <label
                                htmlFor="name"
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-slate-300
                                    mb-2
                                "
                            >
                                Product Name
                            </label>


                            <Field
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Enter product name"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-700
                                    bg-slate-950
                                    px-4
                                    py-3
                                    text-white
                                    placeholder-slate-500
                                    outline-none
                                    transition-all
                                    duration-200
                                    focus:border-emerald-500
                                    focus:ring-2
                                    focus:ring-emerald-500/20
                                "
                            />


                            <ErrorMessage
                                name="name"
                                component="div"
                                className="
                                    mt-1.5
                                    text-sm
                                    text-rose-400
                                "
                            />

                        </div>


                        {/* ================================= */}
                        {/* CATEGORY */}
                        {/* ================================= */}

                        <div>

                            <label
                                htmlFor="category"
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-slate-300
                                    mb-2
                                "
                            >
                                Category
                            </label>


                            <Field
                                id="category"
                                type="text"
                                name="category"
                                placeholder="Enter category"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-700
                                    bg-slate-950
                                    px-4
                                    py-3
                                    text-white
                                    placeholder-slate-500
                                    outline-none
                                    transition-all
                                    duration-200
                                    focus:border-emerald-500
                                    focus:ring-2
                                    focus:ring-emerald-500/20
                                "
                            />


                            <ErrorMessage
                                name="category"
                                component="div"
                                className="
                                    mt-1.5
                                    text-sm
                                    text-rose-400
                                "
                            />

                        </div>


                        {/* ================================= */}
                        {/* QUANTITY */}
                        {/* ================================= */}

                        <div>

                            <label
                                htmlFor="quantity"
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-slate-300
                                    mb-2
                                "
                            >
                                Quantity
                            </label>


                            <Field
                                id="quantity"
                                type="number"
                                name="quantity"
                                placeholder="Enter quantity"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-700
                                    bg-slate-950
                                    px-4
                                    py-3
                                    text-white
                                    placeholder-slate-500
                                    outline-none
                                    transition-all
                                    duration-200
                                    focus:border-emerald-500
                                    focus:ring-2
                                    focus:ring-emerald-500/20
                                "
                            />


                            <ErrorMessage
                                name="quantity"
                                component="div"
                                className="
                                    mt-1.5
                                    text-sm
                                    text-rose-400
                                "
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
                                    className="
                                        block
                                        text-sm
                                        font-medium
                                        text-slate-300
                                        mb-2
                                    "
                                >
                                    Purchase Price
                                </label>


                                <Field
                                    id="purchasePrice"
                                    type="number"
                                    name="purchasePrice"
                                    placeholder="Enter purchase price"
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-700
                                        bg-slate-950
                                        px-4
                                        py-3
                                        text-white
                                        placeholder-slate-500
                                        outline-none
                                        transition-all
                                        duration-200
                                        focus:border-emerald-500
                                        focus:ring-2
                                        focus:ring-emerald-500/20
                                    "
                                />


                                <ErrorMessage
                                    name="purchasePrice"
                                    component="div"
                                    className="
                                        mt-1.5
                                        text-sm
                                        text-rose-400
                                    "
                                />

                            </div>


                            {/* RETAIL PRICE */}

                            <div>

                                <label
                                    htmlFor="retailPrice"
                                    className="
                                        block
                                        text-sm
                                        font-medium
                                        text-slate-300
                                        mb-2
                                    "
                                >
                                    Retail Price
                                </label>


                                <Field
                                    id="retailPrice"
                                    type="number"
                                    name="retailPrice"
                                    placeholder="Enter retail price"
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-700
                                        bg-slate-950
                                        px-4
                                        py-3
                                        text-white
                                        placeholder-slate-500
                                        outline-none
                                        transition-all
                                        duration-200
                                        focus:border-emerald-500
                                        focus:ring-2
                                        focus:ring-emerald-500/20
                                    "
                                />


                                <ErrorMessage
                                    name="retailPrice"
                                    component="div"
                                    className="
                                        mt-1.5
                                        text-sm
                                        text-rose-400
                                    "
                                />

                            </div>


                        </div>


                        {/* ================================= */}
                        {/* DISCOUNT */}
                        {/* ================================= */}

                        <div>

                            <label
                                htmlFor="discount"
                                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-slate-300
                                    mb-2
                                "
                            >
                                Discount (%)
                            </label>


                            <Field
                                id="discount"
                                type="number"
                                name="discount"
                                placeholder="Enter discount percentage"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-700
                                    bg-slate-950
                                    px-4
                                    py-3
                                    text-white
                                    placeholder-slate-500
                                    outline-none
                                    transition-all
                                    duration-200
                                    focus:border-emerald-500
                                    focus:ring-2
                                    focus:ring-emerald-500/20
                                "
                            />


                            <ErrorMessage
                                name="discount"
                                component="div"
                                className="
                                    mt-1.5
                                    text-sm
                                    text-rose-400
                                "
                            />

                        </div>


                        {/* ================================= */}
                        {/* CALCULATED VALUES */}
                        {/* ================================= */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                            {/* SALE PRICE */}

                            <div
                                className="
                                    rounded-xl
                                    border
                                    border-emerald-500/20
                                    bg-emerald-500/5
                                    p-4
                                "
                            >

                                <p className="text-sm text-slate-400">
                                    Sale Price
                                </p>

                                <p className="mt-1 text-2xl font-bold text-emerald-400">
                                    {salePrice.toLocaleString()}
                                </p>

                            </div>


                            {/* TOTAL VALUE */}

                            <div
                                className="
                                    rounded-xl
                                    border
                                    border-slate-700
                                    bg-slate-950
                                    p-4
                                "
                            >

                                <p className="text-sm text-slate-400">
                                    Total Inventory Value
                                </p>

                                <p className="mt-1 text-2xl font-bold text-white">
                                    {totalValue.toLocaleString()}
                                </p>

                            </div>


                        </div>


                        {/* ================================= */}
                        {/* SUBMIT */}
                        {/* ================================= */}

                        <button
                            type="submit"
                            className="
                                w-full
                                rounded-xl
                                bg-emerald-600
                                px-6
                                py-3
                                font-semibold
                                text-white
                                shadow-lg
                                shadow-emerald-600/20
                                transition-all
                                duration-200
                                hover:bg-emerald-500
                                hover:-translate-y-0.5
                                active:translate-y-0
                                focus:outline-none
                                focus:ring-2
                                focus:ring-emerald-500/50
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