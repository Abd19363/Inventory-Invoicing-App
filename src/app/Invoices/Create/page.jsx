"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

import {
    addItem,
    updateQuantity,
    deleteProduct,
    setCustomerName,
    setDate,
    clearDraft
} from "@/store/invoiceDraftSlice";

import { saveInvoice } from "@/Services/invoicesService";
import {
    getItems,
    updateItem
} from "@/Services/inventoryService";


// ==================================================
// VALIDATION SCHEMA
// ==================================================

const invoiceSchema = z.object({

    customerName: z
        .string()
        .min(1, "Customer name is required"),

    date: z
        .string()
        .min(1, "Invoice date is required"),

});


// ==================================================
// INVOICE LOG KEY
// ==================================================

const INVOICE_LOG_KEY = "invoiceActivityLog";


// ==================================================
// COMPONENT
// ==================================================

export default function InvoiceHome() {

    const draft = useSelector(
        (state) => state.invoiceDraft
    );

    const dispatch = useDispatch();

    const router = useRouter();


    // ==================================================
    // REACT HOOK FORM
    // ==================================================

    const {
        register,
        formState: { errors }
    } = useForm({

        resolver: zodResolver(
            invoiceSchema
        ),

    });


    // ==================================================
    // INVENTORY PRODUCTS
    // ==================================================

    const [products, setProducts] =
        useState([]);


    // ==================================================
    // SEARCH
    // ==================================================

    const [productSearch, setProductSearch] =
        useState("");


    // ==================================================
    // SELECTED PRODUCT
    // ==================================================

    const [selectedProduct, setSelectedProduct] =
        useState("");


    // ==================================================
    // INVOICE LOGS
    // ==================================================

    const [invoiceLogs, setInvoiceLogs] =
        useState([]);


    console.log(
        "Invoice Draft State:",
        draft
    );


    // ==================================================
    // SAVE INVOICE
    // ==================================================

    async function handleSaveInvoice() {

        // ----------------------------------------------
        // CUSTOMER NAME
        // ----------------------------------------------

        if (
            !draft.customerName ||
            !draft.customerName.trim()
        ) {

            alert(
                "Customer name is required."
            );

            return;

        }


        // ----------------------------------------------
        // DATE
        // ----------------------------------------------

        if (!draft.date) {

            alert(
                "Invoice date is required."
            );

            return;

        }


        // ----------------------------------------------
        // ITEMS
        // ----------------------------------------------

        if (
            !draft.items ||
            draft.items.length === 0
        ) {

            alert(
                "Please add at least one product to the invoice."
            );

            return;

        }


        // ----------------------------------------------
        // STOCK VALIDATION
        // ----------------------------------------------

        for (const item of draft.items) {

            if (
                !item.invoiceQuantity ||
                item.invoiceQuantity < 1
            ) {

                alert(
                    `Please enter a valid quantity for ${item.name}.`
                );

                return;

            }


            if (
                item.invoiceQuantity >
                item.quantity
            ) {

                alert(
                    `Only ${item.quantity} units of ${item.name} are available in stock.`
                );

                return;

            }

        }


        // ----------------------------------------------
        // SAVE
        // ----------------------------------------------

        try {

            const invoice = {

                id: Date.now(),

                customerName:
                    draft.customerName,

                date:
                    draft.date,

                items:
                    draft.items,

                total:
                    grandtotal

            };


            console.log(
                "Invoice being saved:",
                invoice
            );


            console.log(
                "Invoice total:",
                grandtotal
            );


            // ------------------------------------------
            // SAVE INVOICE
            // ------------------------------------------

            await saveInvoice(invoice);


            // ------------------------------------------
            // ADD ACTIVITY LOG
            // ------------------------------------------

            addInvoiceLog(
                invoice,
                "Added"
            );


            // ------------------------------------------
            // UPDATE INVENTORY STOCK
            // ------------------------------------------

            for (
                const item of draft.items
            ) {

                const remainingQuantity =
                    item.quantity -
                    item.invoiceQuantity;


                const updatedProduct = {

                    ...item,

                    quantity:
                        remainingQuantity

                };


                delete updatedProduct.invoiceQuantity;


                await updateItem(
                    item.id,
                    updatedProduct
                );

            }


            // ------------------------------------------
            // SUCCESS
            // ------------------------------------------

            alert(
                "Invoice saved successfully!"
            );


            console.log(
                "New Invoice is:",
                invoice
            );


            // ------------------------------------------
            // CLEAR DRAFT
            // ------------------------------------------

            dispatch(
                clearDraft()
            );


        } catch (error) {

            console.error(
                "Error saving invoice:",
                error
            );

            alert(
                error.message
            );

        }

    }


    // ==================================================
    // LOAD INVENTORY
    // ==================================================

    async function loadProducts() {

        try {

            const data =
                await getItems();


            console.log(
                "Inventory Products:",
                data
            );


            setProducts(
                data || []
            );


        } catch (error) {

            alert(
                error.message
            );

        }

    }


    useEffect(() => {

        loadProducts();

    }, []);


    // ==================================================
    // SEARCH PRODUCTS
    // ==================================================

    const filteredProducts =
        products.filter(
            (product) => {

                const search =
                    productSearch
                        .toLowerCase()
                        .trim();


                if (!search) {

                    return false;

                }


                return (

                    product.name
                        ?.toLowerCase()
                        .includes(search)

                    ||

                    product.category
                        ?.toLowerCase()
                        .includes(search)

                );

            }
        );


    // ==================================================
    // SELECT PRODUCT
    // ==================================================

    function handleSelectProduct(
        product
    ) {

        setSelectedProduct(
            product.id
        );


        setProductSearch(
            product.name
        );

    }


    // ==================================================
    // ADD PRODUCT
    // ==================================================

    function handleaddItem() {

        const product =
            products.find(
                (product) =>
                    product.id ===
                    Number(
                        selectedProduct
                    )
            );


        console.log(
            "Selected Product ID:",
            selectedProduct
        );


        console.log(
            "Product found:",
            product
        );


        if (product) {

            const invoiceItem = {

                ...product,

                invoiceQuantity: 1

            };


            dispatch(
                addItem(
                    invoiceItem
                )
            );


            setProductSearch("");

            setSelectedProduct("");


        } else {

            alert(
                "Please select a product first."
            );

        }

    }


    // ==================================================
    // INCREASE QUANTITY
    // ==================================================

    function handleIncrease(item) {

        if (
            item.invoiceQuantity >=
            item.quantity
        ) {

            alert(
                `Only ${item.quantity} units of ${item.name} are available in stock.`
            );

            return;

        }


        dispatch(

            updateQuantity({

                productId:
                    item.id,

                quantity:
                    item.invoiceQuantity + 1

            })

        );

    }


    // ==================================================
    // QUANTITY CHANGE
    // ==================================================

    function handleQuantityChange(
        item,
        value
    ) {

        if (value === "") {

            return;

        }


        const quantity =
            Number(value);


        if (quantity < 1) {

            return;

        }


        if (
            quantity >
            item.quantity
        ) {

            alert(
                `Only ${item.quantity} units of ${item.name} are available in stock.`
            );

            return;

        }


        dispatch(

            updateQuantity({

                productId:
                    item.id,

                quantity:
                    quantity

            })

        );

    }


    // ==================================================
    // GRAND TOTAL
    // ==================================================

    const grandtotal =
        draft.items.reduce(

            (
                total,
                item
            ) => {

                const quantity =
                    Number(
                        item.invoiceQuantity
                    ) || 0;


                const salePrice =
                    Number(
                        item.salePrice
                    ) || 0;


                return (
                    total +
                    (
                        quantity *
                        salePrice
                    )
                );

            },

            0

        );


    // ==================================================
    // LOAD INVOICE LOGS
    // ==================================================

    function loadInvoiceLogs() {

        const logs =
            JSON.parse(
                localStorage.getItem(
                    INVOICE_LOG_KEY
                )
            ) || [];


        setInvoiceLogs(
            logs
        );

    }


    // ==================================================
    // ADD INVOICE LOG
    // ==================================================

    function addInvoiceLog(
        invoice,
        action
    ) {

        const existingLogs =
            JSON.parse(
                localStorage.getItem(
                    INVOICE_LOG_KEY
                )
            ) || [];


        const newLog = {

            logId:
                Date.now(),

            invoiceId:
                invoice.id,

            customerName:
                invoice.customerName,

            total:
                invoice.total,

            action:
                action,

            timestamp:
                new Date()
                    .toLocaleString()

        };


        const updatedLogs = [

            newLog,

            ...existingLogs

        ];


        localStorage.setItem(

            INVOICE_LOG_KEY,

            JSON.stringify(
                updatedLogs
            )

        );


        setInvoiceLogs(
            updatedLogs
        );

    }


    useEffect(() => {

        loadInvoiceLogs();

    }, []);


    // ==================================================
    // DELETE LOG
    // ==================================================

    function deleteInvoiceLog(
        logId
    ) {

        const existingLogs =
            JSON.parse(
                localStorage.getItem(
                    INVOICE_LOG_KEY
                )
            ) || [];


        const updatedLogs =
            existingLogs.filter(
                (log) =>
                    log.logId !==
                    logId
            );


        localStorage.setItem(

            INVOICE_LOG_KEY,

            JSON.stringify(
                updatedLogs
            )

        );


        setInvoiceLogs(
            updatedLogs
        );

    }


    // ==================================================
    // UI
    // ==================================================

    return (

        <div
            className="
                min-h-screen
                w-full
                bg-slate-800
                text-zinc-100
                flex
                flex-col
                items-center
                p-4
                sm:p-6
                lg:p-8
                antialiased
            "
        >


            {/* ==================================================
                MAIN CONTAINER
            ================================================== */}

            <div
                className="
                    w-full
                    max-w-5xl
                    flex
                    flex-col
                    items-center
                    gap-6
                "
            >


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div
                    className="
                        w-full
                        flex
                        flex-col
                        items-center
                        text-center
                        p-6
                        rounded-2xl
                        border
                        border-slate-700/70
                        bg-slate-700/70
                        backdrop-blur-md
                        shadow-xl
                        space-y-2
                    "
                >

                    <h1
                        className="
                            text-3xl
                            sm:text-4xl
                            font-extrabold
                            tracking-tight
                            text-amber-500
                            drop-shadow-md
                        "
                    >

                        Create Invoice

                    </h1>


                    <p
                        className="
                            text-sm
                            sm:text-base
                            font-medium
                            text-slate-300
                        "
                    >

                        Add customer details and products
                        to generate a new invoice.

                    </p>

                </div>



                {/* ==================================================
                    CUSTOMER DETAILS
                ================================================== */}

                <div
                    className="
                        w-full
                        rounded-2xl
                        border
                        border-slate-700/70
                        bg-slate-900/70
                        backdrop-blur-md
                        shadow-xl
                        p-5
                        sm:p-6
                    "
                >

                    <h2
                        className="
                            text-xl
                            font-bold
                            text-white
                            mb-5
                            border-b
                            border-slate-700
                            pb-3
                        "
                    >

                        Customer Details

                    </h2>


                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-5
                        "
                    >


                        {/* CUSTOMER NAME */}

                        <div>

                            <label
                                className="
                                    block
                                    mb-2
                                    text-sm
                                    font-semibold
                                    text-slate-300
                                "
                            >

                                Customer Name

                            </label>


                            <input
                                type="text"
                                {...register(
                                    "customerName"
                                )}
                                value={
                                    draft.customerName
                                }
                                onChange={(e) => {

                                    dispatch(

                                        setCustomerName(
                                            e.target.value
                                        )

                                    );

                                }}
                                placeholder="Enter customer name"
                                className="
                                    w-full
                                    px-4
                                    py-3
                                    rounded-lg
                                    border
                                    border-slate-700
                                    bg-slate-950/70
                                    text-white
                                    placeholder-slate-500
                                    outline-none
                                    focus:border-emerald-500
                                    focus:ring-2
                                    focus:ring-emerald-500/20
                                    transition-all
                                "
                            />


                            {errors.customerName && (

                                <p
                                    className="
                                        text-rose-400
                                        text-sm
                                        mt-2
                                    "
                                >

                                    {
                                        errors
                                            .customerName
                                            .message
                                    }

                                </p>

                            )}

                        </div>



                        {/* DATE */}

                        <div>

                            <label
                                className="
                                    block
                                    mb-2
                                    text-sm
                                    font-semibold
                                    text-slate-300
                                "
                            >

                                Invoice Date

                            </label>


                            <input
                                type="date"
                                {...register(
                                    "date"
                                )}
                                value={
                                    draft.date
                                }
                                onChange={(e) => {

                                    dispatch(

                                        setDate(
                                            e.target.value
                                        )

                                    );

                                }}
                                className="
                                    w-full
                                    px-4
                                    py-3
                                    rounded-lg
                                    border
                                    border-slate-700
                                    bg-slate-950/70
                                    text-white
                                    [color-scheme: dark]
                                    [&::-webkit-calendar-picker-indicator]:invert
                                    // [&::-webkit-calendar-picker-indicator]:cursor-pointer
                                    // [&::-webkit-calendar-picker-indicator]:opacity-20
                                    // hover:[&::-webkit-calendar-picker-indicator]:opacity-100
                                    outline-none
                                    focus:border-emerald-500
                                    focus:ring-2
                                    focus:ring-emerald-500/20
                                    transition-all
                                "
                            />


                            {errors.date && (

                                <p
                                    className="
                                        text-rose-400
                                        text-sm
                                        mt-2
                                    "
                                >

                                    {
                                        errors
                                            .date
                                            .message
                                    }

                                </p>

                            )}

                        </div>

                    </div>

                </div>



                {/* ==================================================
                    PRODUCT SEARCH
                ================================================== */}

                <div
                    className="
                        w-full
                        rounded-2xl
                        border
                        border-slate-700/70
                        bg-slate-900/70
                        backdrop-blur-md
                        shadow-xl
                        p-5
                        sm:p-6
                    "
                >

                    <h2
                        className="
                            text-xl
                            font-bold
                            text-white
                            mb-5
                            border-b
                            border-slate-700
                            pb-3
                        "
                    >

                        Add Products

                    </h2>


                    <div
                        className="
                            relative
                            flex
                            flex-col
                            sm:flex-row
                            gap-3
                        "
                    >

                        <input
                            type="text"
                            value={
                                productSearch
                            }
                            onChange={(e) => {

                                setProductSearch(
                                    e.target.value
                                );

                                setSelectedProduct(
                                    ""
                                );

                            }}
                            placeholder="Search by product name or category..."
                            className="
                                flex-1
                                px-4
                                py-3
                                rounded-lg
                                border
                                border-slate-700
                                bg-slate-950/70
                                text-white
                                placeholder-slate-500
                                outline-none
                                focus:border-emerald-500
                                focus:ring-2
                                focus:ring-emerald-500/20
                            "
                        />


                        <button
                            type="button"
                            onClick={
                                handleaddItem
                            }
                            className="
                                bg-emerald-700
                                hover:bg-emerald-600
                                active:bg-emerald-800
                                text-white
                                font-semibold
                                px-7
                                py-3
                                rounded-lg
                                shadow-lg
                                transition-all
                                duration-200
                                hover:-translate-y-0.5
                                cursor-pointer
                            "
                        >

                            + Add Item

                        </button>



                        {/* SEARCH RESULTS */}

                        {productSearch && (

                            <div
                                className="
                                    absolute
                                    z-50
                                    top-full
                                    left-0
                                    right-0
                                    mt-2
                                    bg-slate-950
                                    border
                                    border-slate-700
                                    rounded-xl
                                    shadow-2xl
                                    overflow-hidden
                                "
                            >

                                {filteredProducts.length >
                                0 ? (

                                    filteredProducts.map(
                                        (product) => (

                                            <button
                                                key={
                                                    product.id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    handleSelectProduct(
                                                        product
                                                    )
                                                }
                                                className="
                                                    w-full
                                                    text-left
                                                    px-4
                                                    py-3
                                                    border-b
                                                    border-slate-800
                                                    hover:bg-slate-800
                                                    transition-colors
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-4
                                                    "
                                                >

                                                    <div>

                                                        <p
                                                            className="
                                                                font-semibold
                                                                text-white
                                                            "
                                                        >

                                                            {
                                                                product.name
                                                            }

                                                        </p>


                                                        <p
                                                            className="
                                                                text-xs
                                                                text-slate-400
                                                                mt-1
                                                            "
                                                        >

                                                            {
                                                                product.category
                                                            }

                                                        </p>

                                                    </div>


                                                    <div
                                                        className="
                                                            text-right
                                                            text-emerald-400
                                                            font-semibold
                                                            whitespace-nowrap
                                                        "
                                                    >

                                                        Rs.{" "}

                                                        {Number(
                                                            product.salePrice ||
                                                            0
                                                        ).toLocaleString()}

                                                    </div>

                                                </div>

                                            </button>

                                        )
                                    )

                                ) : (

                                    <div
                                        className="
                                            px-4
                                            py-5
                                            text-center
                                            text-slate-500
                                        "
                                    >

                                        No products found.

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                </div>



                {/* ==================================================
                    INVOICE ITEMS
                ================================================== */}

                <div
                    className="
                        w-full
                        rounded-2xl
                        border
                        border-slate-700/70
                        bg-slate-900/70
                        backdrop-blur-md
                        shadow-xl
                        p-5
                        sm:p-6
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            gap-3
                            border-b
                            border-slate-700
                            pb-4
                            mb-5
                        "
                    >

                        <h2
                            className="
                                text-xl
                                font-bold
                                text-white
                            "
                        >

                            Invoice Items

                        </h2>


                        <span
                            className="
                                w-fit
                                text-xs
                                font-semibold
                                px-3
                                py-1
                                bg-emerald-500/10
                                border
                                border-emerald-500/20
                                text-emerald-400
                                rounded-full
                            "
                        >

                            {draft.items.length}{" "}

                            {
                                draft.items.length === 1
                                    ? "Item"
                                    : "Items"
                            }

                        </span>

                    </div>



                    {/* TABLE */}

                    <div
                        className="
                            overflow-x-auto
                            rounded-xl
                            border
                            border-slate-700/80
                        "
                    >

                        <table
                            className="
                                w-full
                                text-left
                                border-collapse
                                min-w-[800px]
                            "
                        >

                            <thead>

                                <tr
                                    className="
                                        bg-slate-950
                                        text-slate-400
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        border-b
                                        border-slate-700
                                    "
                                >

                                    <th className="py-3.5 px-4">
                                        Product
                                    </th>

                                    <th className="py-3.5 px-4 text-center">
                                        Quantity
                                    </th>

                                    <th className="py-3.5 px-4 text-center">
                                        Available Stock
                                    </th>

                                    <th className="py-3.5 px-4 text-right">
                                        Sale Price
                                    </th>

                                    <th className="py-3.5 px-4 text-right">
                                        Total
                                    </th>

                                    <th className="py-3.5 px-4 text-center">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody
                                className="
                                    divide-y
                                    divide-slate-800
                                    bg-slate-900/60
                                    text-sm
                                "
                            >

                                {draft.items.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan={6}
                                            className="
                                                py-10
                                                text-center
                                                text-slate-500
                                                italic
                                            "
                                        >

                                            No items added to
                                            invoice yet.

                                        </td>

                                    </tr>

                                ) : (

                                    draft.items.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.id
                                                }
                                                className="
                                                    hover:bg-slate-800/50
                                                    transition-colors
                                                "
                                            >

                                                {/* PRODUCT */}

                                                <td
                                                    className="
                                                        py-4
                                                        px-4
                                                        font-medium
                                                        text-white
                                                    "
                                                >

                                                    {item.name}

                                                </td>


                                                {/* QUANTITY */}

                                                <td
                                                    className="
                                                        py-4
                                                        px-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            justify-center
                                                            gap-2
                                                        "
                                                    >

                                                        {/* MINUS */}

                                                        <button
                                                            type="button"
                                                            onClick={() => {

                                                                if (
                                                                    item.invoiceQuantity >
                                                                    1
                                                                ) {

                                                                    dispatch(

                                                                        updateQuantity({

                                                                            productId:
                                                                                item.id,

                                                                            quantity:
                                                                                item.invoiceQuantity -
                                                                                1

                                                                        })

                                                                    );

                                                                }

                                                            }}
                                                            disabled={
                                                                item.invoiceQuantity <=
                                                                1
                                                            }
                                                            className="
                                                                w-7
                                                                h-7
                                                                flex
                                                                items-center
                                                                justify-center
                                                                rounded-md
                                                                bg-slate-800
                                                                hover:bg-slate-700
                                                                text-slate-300
                                                                hover:text-white
                                                                font-bold
                                                                transition-all
                                                                disabled:opacity-30
                                                                disabled:cursor-not-allowed
                                                            "
                                                        >

                                                            -

                                                        </button>


                                                        {/* QUANTITY INPUT */}

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={
                                                                item.invoiceQuantity
                                                            }
                                                            onChange={(e) =>
                                                                handleQuantityChange(
                                                                    item,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="
                                                                w-14
                                                                h-8
                                                                text-center
                                                                font-semibold
                                                                text-white
                                                                bg-slate-800
                                                                border
                                                                border-slate-700
                                                                rounded-md
                                                                outline-none
                                                                focus:border-emerald-500
                                                                focus:ring-1
                                                                focus:ring-emerald-500
                                                            "
                                                        />


                                                        {/* PLUS */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleIncrease(
                                                                    item
                                                                )
                                                            }
                                                            disabled={
                                                                item.invoiceQuantity >=
                                                                item.quantity
                                                            }
                                                            className="
                                                                w-7
                                                                h-7
                                                                flex
                                                                items-center
                                                                justify-center
                                                                rounded-md
                                                                bg-slate-800
                                                                hover:bg-slate-700
                                                                text-slate-300
                                                                hover:text-white
                                                                font-bold
                                                                transition-all
                                                                disabled:opacity-30
                                                                disabled:cursor-not-allowed
                                                            "
                                                        >

                                                            +

                                                        </button>

                                                    </div>

                                                </td>


                                                {/* AVAILABLE STOCK */}

                                                <td
                                                    className="
                                                        py-4
                                                        px-4
                                                        text-center
                                                    "
                                                >

                                                    <span
                                                        className={`
                                                            inline-flex
                                                            items-center
                                                            px-3
                                                            py-1
                                                            rounded-full
                                                            text-xs
                                                            font-semibold
                                                            ${
                                                                item.quantity <=
                                                                0

                                                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"

                                                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                            }
                                                        `}
                                                    >

                                                        {
                                                            item.quantity
                                                        }

                                                    </span>

                                                </td>


                                                {/* SALE PRICE */}

                                                <td
                                                    className="
                                                        py-4
                                                        px-4
                                                        text-right
                                                        font-medium
                                                        text-slate-300
                                                    "
                                                >

                                                    Rs.{" "}

                                                    {Number(
                                                        item.salePrice ||
                                                        0
                                                    ).toLocaleString()}

                                                </td>


                                                {/* TOTAL */}

                                                <td
                                                    className="
                                                        py-4
                                                        px-4
                                                        text-right
                                                        font-bold
                                                        text-emerald-400
                                                    "
                                                >

                                                    Rs.{" "}

                                                    {(
                                                        (
                                                            Number(
                                                                item.invoiceQuantity
                                                            ) || 0
                                                        ) *

                                                        (
                                                            Number(
                                                                item.salePrice
                                                            ) || 0
                                                        )
                                                    ).toLocaleString()}

                                                </td>


                                                {/* DELETE */}

                                                <td
                                                    className="
                                                        py-4
                                                        px-4
                                                        text-center
                                                    "
                                                >

                                                    <button
                                                        type="button"
                                                        onClick={() => {

                                                            dispatch(

                                                                deleteProduct({

                                                                    productId:
                                                                        item.id

                                                                })

                                                            );

                                                        }}
                                                        className="
                                                            bg-rose-600
                                                            hover:bg-rose-500
                                                            text-white
                                                            text-xs
                                                            font-semibold
                                                            px-3
                                                            py-1.5
                                                            rounded-lg
                                                            transition-colors
                                                            cursor-pointer
                                                        "
                                                    >

                                                        Delete

                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>



                    {/* ==================================================
                        GRAND TOTAL
                    ================================================== */}

                    <div
                        className="
                            mt-6
                            flex
                            flex-col
                            items-center
                            border-t
                            border-slate-700
                            pt-6
                        "
                    >

                        <p
                            className="
                                text-sm
                                text-slate-400
                                mb-1
                            "
                        >

                            Grand Total

                        </p>


                        <h2
                            className="
                                text-3xl
                                font-extrabold
                                text-emerald-400
                            "
                        >

                            Rs.{" "}

                            {grandtotal.toLocaleString()}

                        </h2>

                    </div>

                </div>



                {/* ==================================================
                    RECENT ACTIVITY
                ================================================== */}

                <div
                    className="
                        w-full
                        rounded-2xl
                        border
                        border-slate-700/70
                        bg-slate-900/70
                        backdrop-blur-md
                        shadow-xl
                        p-5
                        sm:p-6
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            gap-3
                            border-b
                            border-slate-700
                            pb-4
                            mb-5
                        "
                    >

                        <h2
                            className="
                                text-xl
                                font-bold
                                text-white
                            "
                        >

                            Recent Invoice Logs

                        </h2>


                        <span
                            className="
                                w-fit
                                text-xs
                                font-semibold
                                px-3
                                py-1
                                bg-blue-500/10
                                border
                                border-blue-500/20
                                text-blue-400
                                rounded-full
                            "
                        >

                            {invoiceLogs.length} Activities

                        </span>

                    </div>



                    <div
                        className="
                            overflow-x-auto
                            rounded-xl
                            border
                            border-slate-700/80
                        "
                    >

                        <table
                            className="
                                w-full
                                text-left
                                border-collapse
                                min-w-[800px]
                            "
                        >

                            <thead>

                                <tr
                                    className="
                                        bg-slate-950
                                        text-slate-400
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wider
                                        border-b
                                        border-slate-700
                                    "
                                >

                                    <th className="py-3 px-4">
                                        Invoice ID
                                    </th>

                                    <th className="py-3 px-4">
                                        Customer
                                    </th>

                                    <th className="py-3 px-4 text-center">
                                        Action
                                    </th>

                                    <th className="py-3 px-4 text-right">
                                        Total
                                    </th>

                                    <th className="py-3 px-4">
                                        Time
                                    </th>

                                    <th className="py-3 px-4 text-center">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody
                                className="
                                    divide-y
                                    divide-slate-800
                                    bg-slate-900/60
                                "
                            >

                                {invoiceLogs.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan={6}
                                            className="
                                                py-8
                                                text-center
                                                text-slate-500
                                                italic
                                            "
                                        >

                                            No recent invoice activity.

                                        </td>

                                    </tr>

                                ) : (

                                    invoiceLogs
                                        .slice(0, 10)
                                        .map(
                                            (log) => (

                                                <tr
                                                    key={
                                                        log.logId
                                                    }
                                                    className="
                                                        hover:bg-slate-800/50
                                                        transition-colors
                                                    "
                                                >

                                                    <td
                                                        className="
                                                            py-3
                                                            px-4
                                                            font-mono
                                                            text-slate-300
                                                        "
                                                    >

                                                        {
                                                            log.invoiceId
                                                        }

                                                    </td>


                                                    <td
                                                        className="
                                                            py-3
                                                            px-4
                                                            text-white
                                                        "
                                                    >

                                                        {
                                                            log.customerName
                                                        }

                                                    </td>


                                                    <td
                                                        className="
                                                            py-3
                                                            px-4
                                                            text-center
                                                        "
                                                    >

                                                        <span
                                                            className={`
                                                                inline-flex
                                                                px-2.5
                                                                py-1
                                                                rounded-full
                                                                text-xs
                                                                font-semibold
                                                                ${
                                                                    log.action ===
                                                                    "Added"

                                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"

                                                                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                                }
                                                            `}
                                                        >

                                                            {
                                                                log.action
                                                            }

                                                        </span>

                                                    </td>


                                                    <td
                                                        className="
                                                            py-3
                                                            px-4
                                                            text-right
                                                            font-semibold
                                                            text-emerald-400
                                                        "
                                                    >

                                                        Rs.{" "}

                                                        {Number(
                                                            log.total ||
                                                            0
                                                        ).toLocaleString()}

                                                    </td>


                                                    <td
                                                        className="
                                                            py-3
                                                            px-4
                                                            text-slate-500
                                                            text-sm
                                                        "
                                                    >

                                                        {
                                                            log.timestamp
                                                        }

                                                    </td>


                                                    <td
                                                        className="
                                                            py-3
                                                            px-4
                                                            text-center
                                                        "
                                                    >

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteInvoiceLog(
                                                                    log.logId
                                                                )
                                                            }
                                                            className="
                                                                bg-rose-600
                                                                hover:bg-rose-500
                                                                text-white
                                                                text-xs
                                                                font-semibold
                                                                px-3
                                                                py-1.5
                                                                rounded-lg
                                                                transition-colors
                                                            "
                                                        >

                                                            Delete

                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>



                {/* ==================================================
                    MAIN ACTIONS
                ================================================== */}

                <div
                    className="
                        w-full
                        flex
                        flex-col
                        sm:flex-row
                        justify-center
                        items-center
                        gap-3
                    "
                >

                    {/* CREATE */}

                    <button
                        type="button"
                        onClick={
                            handleSaveInvoice
                        }
                        className="
                            w-full
                            sm:w-auto
                            bg-emerald-700
                            hover:bg-emerald-600
                            active:bg-emerald-800
                            text-white
                            font-semibold
                            px-7
                            py-3
                            rounded-lg
                            shadow-lg
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            cursor-pointer
                        "
                    >

                        Create Invoice

                    </button>


                    {/* CLEAR */}

                    <button
                        type="button"
                        onClick={() => {

                            dispatch(
                                clearDraft()
                            );

                            setProductSearch("");

                            setSelectedProduct("");

                        }}
                        className="
                            w-full
                            sm:w-auto
                            bg-rose-600
                            hover:bg-rose-500
                            text-white
                            font-semibold
                            px-7
                            py-3
                            rounded-lg
                            shadow-lg
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            cursor-pointer
                        "
                    >

                        Clear Invoice

                    </button>

                </div>



                {/* ==================================================
                    NAVIGATION
                ================================================== */}

                <div
                    className="
                        w-full
                        flex
                        flex-col
                        sm:flex-row
                        justify-center
                        items-center
                        gap-3
                        pt-2
                    "
                >

                    {/* HOME */}

                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/Home"
                            )
                        }
                        className="
                            w-full
                            sm:w-auto
                            bg-yellow-600
                            hover:bg-yellow-500
                            text-white
                            font-semibold
                            px-7
                            py-3
                            rounded-lg
                            shadow-lg
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            cursor-pointer
                        "
                    >

                        Go to Home Page

                    </button>


                    {/* INVOICE DASHBOARD */}

                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                "/Invoices"
                            )
                        }
                        className="
                            w-full
                            sm:w-auto
                            bg-slate-700
                            hover:bg-slate-600
                            text-white
                            font-semibold
                            px-7
                            py-3
                            rounded-lg
                            border
                            border-slate-600
                            shadow-lg
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            cursor-pointer
                        "
                    >

                        Go to Invoice Page

                    </button>

                </div>

            </div>

        </div>

    );

}