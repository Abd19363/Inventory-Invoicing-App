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
import { getItems, updateItem } from "@/Services/inventoryService";


const invoiceSchema = z.object({
    customerName: z
        .string()
        .min(1, "Customer name is required"),

    date: z
        .string()
        .min(1, "Invoice date is required"),
});

const INVOICE_LOG_KEY = "invoiceActivityLog";

export default function InvoiceHome() {

    const draft = useSelector((state) => state.invoiceDraft);

    const dispatch = useDispatch();

    const router = useRouter();

    // React Hook Form
    const {
        register,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(invoiceSchema),
    });


    // Inventory products
    const [products, setProducts] = useState([]);


    // Search input
    const [productSearch, setProductSearch] = useState("");


    // Selected product
    const [selectedProduct, setSelectedProduct] = useState("");

    // invoice Log
    const [invoiceLogs, setInvoiceLogs] = useState([]);



    console.log("Invoice Draft State: ", draft);


    // --------------------------------------------------
    // SAVE INVOICE
    // --------------------------------------------------

    async function handleSaveInvoice() {

        // 1. Check customer name
        if (!draft.customerName || !draft.customerName.trim()) {
            alert("Customer name is required.");
            return;
        }


        // 2. Check invoice date
        if (!draft.date) {
            alert("Invoice date is required.");
            return;
        }


        // 3. Check whether at least one product is added
        if (!draft.items || draft.items.length === 0) {
            alert("Please add at least one product to the invoice.");
            return;
        }


        // 4. Check quantity against available stock
        for (const item of draft.items) {

            if (!item.invoiceQuantity || item.invoiceQuantity < 1) {
                alert(
                    `Please enter a valid quantity for ${item.name}.`
                );
                return;
            }

            if (item.invoiceQuantity > item.quantity) {
                alert(
                    `Only ${item.quantity} units of ${item.name} are available in stock.`
                );
                return;
            }
        }


        // 5. Create invoice
        try {

            const invoice = {
                id: Date.now(),
                customerName: draft.customerName,
                date: draft.date,
                items: draft.items,
                total: grandtotal
            };


            // 6. Save invoice

            console.log("Invoice being saved:", invoice);
            console.log("Invoice total:", grandtotal);

            await saveInvoice(invoice);
            addInvoiceLog(invoice, "Added");

            // update inventory stock

            for (const item of draft.items) {

                const remainingQuantity =
                    item.quantity -
                    item.invoiceQuantity;


                const updatedProduct = {

                    ...item,

                    quantity: remainingQuantity
                        

                };

                delete updatedProduct.invoiceQuantity;

                await updateItem(
                    item.id,
                    updatedProduct
                );

            }


            // 7. Success message
            alert("Invoice saved successfully!");


            // 8. Show saved invoice in console
            console.log("New Invoice is:", invoice);


            // 9. Clear Redux invoice draft
            dispatch(clearDraft());


        } catch (error) {

            console.error(
                "Error saving invoice:",
                error
            );

            alert(error.message);

        }
    }

    // --------------------------------------------------
    // LOAD INVENTORY PRODUCTS
    // --------------------------------------------------

    async function loadProducts() {

        try {

            const data = await getItems();

            console.log("Inventory Products: ", data);

            setProducts(data);

        } catch (error) {

            alert(error.message);

        }

    }

    useEffect(() => {

        loadProducts();

    }, []);


    // --------------------------------------------------
    // SEARCH PRODUCTS
    // --------------------------------------------------

    const filteredProducts = products.filter((product) => {

        const search = productSearch.toLowerCase().trim();


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

    });


    // --------------------------------------------------
    // SELECT PRODUCT FROM SEARCH RESULTS
    // --------------------------------------------------

    function handleSelectProduct(product) {

        setSelectedProduct(product.id);

        setProductSearch(product.name);

    }


    // --------------------------------------------------
    // ADD PRODUCT TO INVOICE
    // --------------------------------------------------

    function handleaddItem() {

        const product = products.find(

            (product) =>
                product.id === Number(selectedProduct)

        );


        console.log(
            "Selected Product Id: ",
            selectedProduct
        );


        console.log(
            "Product found: ",
            product
        );


        if (product) {

            const invoiceItem = {

                ...product,

                invoiceQuantity: 1

            };


            dispatch(addItem(invoiceItem));


            // Clear search after adding
            setProductSearch("");


            // Clear selected product
            setSelectedProduct("");

        } else {

            alert("Please select a product first.");

        }

    }

    function handleIncrease(item) {
        if (item.invoiceQuantity >= item.quantity) {
            alert(
                `Only ${item.quantity} units of ${item.name} are available in stock.`
            );
            return;
        }

        dispatch(
            updateQuantity({
                productId: item.id,
                quantity: item.invoiceQuantity + 1
            })
        );
    }

    function handleQuantityChange(item, value) {
        if (value === "") {
            return;
        }

        const quantity = Number(value);

        if (quantity < 1) {
            return;
        }

        if (quantity > item.quantity) {
            alert(
                `Only ${item.quantity} units of ${item.name} are available in stock.`
            );
            return;
        }

        dispatch(
            updateQuantity({
                productId: item.id,
                quantity: quantity
            })
        );
    }


    // --------------------------------------------------
    // GRAND TOTAL
    // --------------------------------------------------

    const grandtotal = draft.items.reduce(
        (total, item) => {

            const quantity =
                Number(item.invoiceQuantity) || 0;

            const salePrice =
                Number(item.salePrice) || 0;

            return total + (quantity * salePrice);

        },

        0
    );

    function loadInvoiceLogs() {
        const logs =
            JSON.parse(
                localStorage.getItem(INVOICE_LOG_KEY)
            ) || [];

        setInvoiceLogs(logs);
    }

    // Add log
    function addInvoiceLog(invoice, action) {

        const existingLogs =
            JSON.parse(
                localStorage.getItem("invoiceActivityLog")
            ) || [];

        const newLog = {
            logId: Date.now(),
            invoiceId: invoice.id,
            customerName: invoice.customerName,
            total: invoice.total,
            action: action,
            timestamp: new Date().toLocaleString()
        };

        const updatedLogs = [
            newLog,
            ...existingLogs
        ];

        localStorage.setItem(
            INVOICE_LOG_KEY,
            JSON.stringify(updatedLogs)
        );

        setInvoiceLogs(updatedLogs);
    }

    useEffect(() => {
        loadInvoiceLogs();
    }, [])

    function deleteInvoiceLog(logId) {
        const existingLogs =
            JSON.parse(
                localStorage.getItem(INVOICE_LOG_KEY)
            ) || [];

        const updatedLogs = existingLogs.filter(
            (log) => log.logId !== logId
        );

        localStorage.setItem(
            INVOICE_LOG_KEY,
            JSON.stringify(updatedLogs)
        );

        setInvoiceLogs(updatedLogs);
    }




    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (

        <div className="bg-zinc-500 min-h-screen">


            <div className="max-w-4xl mx-auto w-full flex flex-col items-center gap-6 my-auto py-8">


                {/* ==========================================
                    CUSTOMER NAME + DATE
                ========================================== */}

                <div className="w-full flex gap-6 mb-6">


                    {/* CUSTOMER NAME */}

                    <div className="flex-1">

                        <label className="block mb-2 font-semibold">

                            Customer Name

                        </label>


                        <input

                            type="text"

                            {...register("customerName")}

                            value={draft.customerName}

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
                                border
                                border-gray-300
                                rounded-md
                                p-3
                                focus:outline-none
                                focus:ring-2
                                focus:ring-blue-500
                            "

                        />


                        {errors.customerName && (

                            <p className="text-red-500">

                                {errors.customerName.message}

                            </p>

                        )}

                    </div>



                    {/* DATE */}

                    <div className="flex-1">

                        <label className="block mb-2 font-semibold">

                            Invoice Date

                        </label>


                        <input

                            type="date"

                            {...register("date")}

                            value={draft.date}

                            onChange={(e) => {

                                dispatch(
                                    setDate(
                                        e.target.value
                                    )
                                );

                            }}

                            className="
                                w-full
                                border
                                border-gray-300
                                rounded-md
                                p-3
                                focus:outline-none
                                focus:ring-2
                                focus:ring-blue-500
                            "

                        />


                        {errors.date && (

                            <p className="text-red-500">

                                {errors.date.message}

                            </p>

                        )}

                    </div>

                </div>

                {/* ==========================================
                    PRODUCT SEARCH SECTION
                ========================================== */}

                <div className="w-full max-w-2xl relative">

                    <div className="flex flex-col sm:flex-row items-center gap-3">

                        {/* SEARCH INPUT */}

                        <input

                            type="text"

                            value={productSearch}

                            onChange={(e) => {

                                setProductSearch(
                                    e.target.value
                                );

                                // Reset selected product
                                setSelectedProduct("");

                            }}

                            placeholder="Search product by name or category..."

                            className="
                                w-full
                                px-4
                                py-3
                                text-sm
                                font-medium
                                text-zinc-100
                                bg-zinc-900
                                border
                                border-zinc-700
                                rounded-lg
                                shadow-sm
                                outline-none
                                focus:border-emerald-500
                                focus:ring-2
                                focus:ring-emerald-500/20
                            "

                        />


                        {/* ADD ITEM BUTTON */}

                        <button

                            type="button"

                            onClick={handleaddItem}

                            className="
                                w-full
                                sm:w-auto
                                min-h-[42px]
                                justify-center
                                bg-black
                                hover:bg-emerald-700
                                active:bg-emerald-700
                                text-white
                                font-semibold
                                text-sm
                                px-8
                                rounded-lg
                                shadow-lg
                                shadow-emerald-600/20
                                transition-all
                                duration-200
                                cursor-pointer
                                flex
                                items-center
                                gap-2
                            "

                        >

                            Add Item

                        </button>

                    </div>



                    {/* ==========================================
                        SEARCH RESULTS
                    ========================================== */}

                    {productSearch && (

                        <div
                            className="
                                absolute
                                z-50
                                left-0
                                right-0
                                mt-2
                                bg-zinc-900
                                border
                                border-zinc-700
                                rounded-lg
                                shadow-2xl
                                overflow-hidden
                            "
                        >

                            {filteredProducts.length > 0 ? (

                                filteredProducts.map(
                                    (product) => (

                                        <button

                                            key={product.id}

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
                                                border-zinc-800
                                                hover:bg-zinc-800
                                                transition-colors
                                            "

                                        >

                                            <div className="
                                                flex
                                                justify-between
                                                items-center
                                            ">

                                                <div>

                                                    <p className="
                                                        font-semibold
                                                        text-white
                                                    ">

                                                        {product.name}

                                                    </p>


                                                    <p className="
                                                        text-xs
                                                        text-zinc-400
                                                        mt-1
                                                    ">

                                                        {product.category}

                                                    </p>

                                                </div>


                                                <div className="
                                                    text-right
                                                    text-emerald-400
                                                    font-semibold
                                                ">

                                                    {Number(product.salePrice || 0).toLocaleString()}

                                                </div>

                                            </div>

                                        </button>

                                    )
                                )

                            ) : (

                                <div className="
                                    px-4
                                    py-4
                                    text-center
                                    text-zinc-500
                                ">

                                    No products found.

                                </div>

                            )}

                        </div>

                    )}

                </div>



                {/* ==========================================
                    INVOICE ITEMS TABLE
                ========================================== */}

                <div className="
                    w-full
                    bg-zinc-900
                    border
                    border-zinc-800
                    rounded-2xl
                    p-4
                    sm:p-6
                    shadow-2xl
                    space-y-4
                ">


                    <div className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-zinc-800
                        pb-3
                    ">

                        <h2 className="
                            text-lg sm:text-xl font-bold text-white tracking-tight ml-88 bg-zinc-700 px-4 rounded hover:bg-slate-600   ">

                            Invoice Items

                        </h2>


                        <span className="
                            text-xs
                            font-semibold
                            px-2.5
                            py-1
                            bg-emerald-500/10
                            border
                            border-emerald-500/20
                            text-emerald-400
                            rounded-full
                        ">

                            {draft.items.length}

                            {" "}

                            {draft.items.length === 1
                                ? "Item"
                                : "Items"
                            }

                        </span>

                    </div>



                    {/* TABLE */}

                    <div className="
                        overflow-x-auto
                        rounded-xl
                        border
                        border-zinc-800/80
                    ">

                        <table className="
                            w-full
                            text-left
                            border-collapse
                        ">


                            <thead>

                                <tr className="
                                    bg-zinc-950/80
                                    text-zinc-400
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    border-b
                                    border-zinc-800
                                ">

                                    <th className="py-3.5 px-4">

                                        Product

                                    </th>

                                    <th className="
                                        py-3.5
                                        px-4
                                        text-center
                                    ">

                                        Quantity

                                    </th>

                                    <th className="py-3.5 px-4 text-center">
                                        Available Stock
                                    </th>

                                    <th className="
                                        py-3.5
                                        px-4
                                        text-right
                                    ">

                                        Retail Price

                                    </th>

                                    <th className="
                                        py-3.5
                                        px-4
                                        text-right
                                    ">

                                        Total

                                    </th>

                                    <th className="
                                        py-3.5
                                        px-4
                                        text-center
                                    ">

                                        Actions

                                    </th>

                                </tr>

                            </thead>



                            <tbody className="
                                divide-y
                                divide-zinc-800/60
                                text-sm
                            ">


                                {draft.items.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan={6}
                                            className="
                                                py-8
                                                text-center
                                                text-zinc-500
                                                italic
                                            "
                                        >

                                            No items added to invoice
                                            draft yet.

                                        </td>

                                    </tr>

                                ) : (

                                    draft.items.map(
                                        (item) => (

                                            <tr
                                                key={item.id}
                                                className="
                                                    hover:bg-zinc-800/40
                                                    transition-colors
                                                "
                                            >


                                                {/* PRODUCT */}

                                                <td className="
                                                    py-4
                                                    px-4
                                                    font-medium
                                                    text-zinc-100
                                                ">

                                                    {item.name}

                                                </td>

                                                {/* QUANTITY */}

                                                <td className="py-4 px-4">

                                                    <div className="flex items-center justify-center gap-2">

                                                        {/* MINUS BUTTON */}

                                                        <button
                                                            type="button"
                                                            onClick={() => {

                                                                if (item.invoiceQuantity > 1) {

                                                                    dispatch(
                                                                        updateQuantity({
                                                                            productId: item.id,
                                                                            quantity: item.invoiceQuantity - 1
                                                                        })
                                                                    );

                                                                }

                                                            }}
                                                            disabled={item.invoiceQuantity <= 1}
                                                            className="
                w-7
                h-7
                flex
                items-center
                justify-center
                rounded-md
                bg-zinc-800
                hover:bg-zinc-700
                text-zinc-300
                hover:text-white
                font-bold
                transition-all
                disabled:opacity-30
                disabled:cursor-not-allowed
            "
                                                        >
                                                            -
                                                        </button>


                                                        {/* EDITABLE QUANTITY */}

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.invoiceQuantity}
                                                            onChange={(e) => {

                                                                const value = e.target.value;

                                                                // Allow user to temporarily clear the field
                                                                if (value === "") {
                                                                    return;
                                                                }

                                                                const quantity = Number(value);

                                                                if (quantity >= 1) {

                                                                    dispatch(
                                                                        updateQuantity({
                                                                            productId: item.id,
                                                                            quantity: quantity
                                                                        })
                                                                    );

                                                                }

                                                            }}
                                                            className="
                w-12
                h-7
                text-center
                font-semibold
                text-white
                bg-zinc-800
                border
                border-zinc-700
                rounded-md
                outline-none
                focus:border-emerald-500
                focus:ring-1
                focus:ring-emerald-500
                [appearance:textfield]
                [&:: -webkit-inner-spin-button]: appearance-none
                [&:: -webkit-inner-outer-button]: appearance-none
                                       "
                                                        />


                                                        {/* PLUS BUTTON */}

                                                        <button
                                                            type="button"
                                                            onClick={() => handleIncrease(item)}
                                                            disabled={item.invoiceQuantity >= item.quantity}
                                                            className="
        w-7 h-7
        flex items-center justify-center
        rounded-md
        bg-zinc-800
        hover:bg-zinc-700
        text-zinc-300
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

                                                <td className="py-4 px-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${item.quantity <= 0
                                                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                            }`}
                                                    >
                                                        {item.quantity}
                                                    </span>
                                                </td>

                                                {/* PRICE */}

                                                <td className="
                                                    py-4
                                                    px-4
                                                    text-right
                                                    font-medium
                                                    text-zinc-300
                                                ">

                                                    {
                                                        Number(item.salePrice || 0).toLocaleString()
                                                    }

                                                </td>



                                                {/* TOTAL */}

                                                <td className="
                                                    py-4
                                                    px-4
                                                    text-right
                                                    font-bold
                                                    text-emerald-400
                                                ">

                                                    {(
                                                        (Number(item.invoiceQuantity) || 0) *
                                                        (Number(item.salePrice) || 0)
                                                    ).toLocaleString()}

                                                </td>



                                                {/* DELETE */}

                                                <td className="
                                                    py-4
                                                    px-4
                                                    text-center
                                                ">

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
                                                            px-3
                                                            py-1.5
                                                            text-xs
                                                            font-semibold
                                                            text-rose-400
                                                            hover:text-rose-300
                                                            bg-rose-500/10
                                                            hover:bg-rose-500/20
                                                            border
                                                            border-rose-500/20
                                                            rounded-md
                                                            transition-all
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



                    {/* ==========================================
                        GRAND TOTAL + ACTIONS
                    ========================================== */}

                    <div className="mt-6 text-center">


                        <h2 className="
                            text-2xl
                            font-bold
                            text-white
                        ">

                            Grand Total: {grandtotal.toLocaleString()}

                        </h2>

                        {/* RECENT INVOICE ACTIVITY */}
                        <div className="
        w-full
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        p-4
        sm:p-6
        shadow-2xl
        mt-6
        text-left
    ">

                            <div className="
            flex
            items-center
            justify-between
            border-b
            border-zinc-800
            pb-3
            mb-4
        ">

                                <h2 className="
                text-lg
                sm:text-xl
                font-bold
                text-white
                ml-75 bg-zinc-700 px-4 rounded hover:bg-slate-600
            ">
                                    Recent Invoice Logs
                                </h2>

                                <span className="
                text-xs
                font-semibold
                px-2.5
                py-1
                bg-blue-500/10
                border
                border-blue-500/20
                text-blue-400
                rounded-full
                
            ">
                                    {invoiceLogs.length} Activities
                                </span>

                            </div>


                            <div className="
            overflow-x-auto
            rounded-xl
            border
            border-zinc-800
        ">

                                <table className="w-full text-left border-collapse">

                                    <thead>

                                        <tr className="
                        bg-zinc-950
                        text-zinc-400
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        border-b
                        border-zinc-800
                    ">

                                            <th className="py-3 px-4">
                                                Invoice ID
                                            </th>

                                            <th className="py-3 px-4">
                                                Customer
                                            </th>

                                            <th className="py-3 px-4 text-center">
                                                Action Done
                                            </th>

                                            <th className="py-3 px-4 text-right">
                                                Total
                                            </th>

                                            <th className="py-3 px-4">
                                                Time
                                            </th>

                                            <th className="py-3 px-4">
                                                Actions
                                            </th>


                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-zinc-800">

                                        {invoiceLogs.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan={6}
                                                    className="
                                    py-8
                                    text-center
                                    text-zinc-500
                                    italic
                                "
                                                >
                                                    No recent invoice activity.
                                                </td>

                                            </tr>

                                        ) : (

                                            invoiceLogs
                                                .slice(0, 10)
                                                .map((log) => (

                                                    <tr
                                                        key={log.logId}
                                                        className="
                                        hover:bg-zinc-800/40
                                        transition-colors
                                    "
                                                    >

                                                        <td className="
                                        py-3
                                        px-4
                                        font-mono
                                        text-zinc-300
                                    ">
                                                            {log.invoiceId}
                                                        </td>


                                                        <td className="
                                        py-3
                                        px-4
                                        text-zinc-100
                                    ">
                                                            {log.customerName}
                                                        </td>


                                                        <td className="
                                        py-3
                                        px-4
                                        text-center
                                    ">

                                                            <span
                                                                className={
                                                                    log.action === "Added"
                                                                        ? `
                                                        inline-flex
                                                        px-2.5
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-semibold
                                                        bg-emerald-500/10
                                                        text-emerald-400
                                                        border
                                                        border-emerald-500/20
                                                    `
                                                                        : `
                                                        inline-flex
                                                        px-2.5
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-semibold
                                                        bg-rose-500/10
                                                        text-rose-400
                                                        border
                                                        border-rose-500/20
                                                    `
                                                                }
                                                            >
                                                                {log.action}
                                                            </span>

                                                        </td>


                                                        <td className="
                                        py-3
                                        px-4
                                        text-right
                                        font-semibold
                                        text-emerald-400
                                    ">
                                                            {log.total?.toLocaleString() ?? 0}
                                                        </td>


                                                        <td className="
                                        py-3
                                        px-4
                                        text-zinc-500
                                        text-sm
                                    ">
                                                            {log.timestamp}
                                                        </td>

                                                        <td className="py-3 px-4 text-center">

                                                            <button
                                                                type="button"
                                                                onClick={() => deleteInvoiceLog(log.logId)}
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

                                                ))

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>






                        {/* SAVE */}

                        <button

                            type="button"

                            onClick={handleSaveInvoice}

                            className="
                                mt-4
                                mr-3
                                bg-green-400
                                hover:bg-green-800
                                text-white
                                px-6
                                py-3
                                rounded-lg
                            "

                        >

                            Create Invoice

                        </button>



                        {/* CLEAR */}

                        <button

                            type="button"

                            onClick={() => {

                                dispatch(clearDraft());

                                setProductSearch("");

                                setSelectedProduct("");

                            }}

                            className="
                                mt-4
                                bg-red-400
                                hover:bg-red-800
                                text-white
                                px-6
                                py-3
                                rounded-lg
                            "

                        >

                            Clear Invoice

                        </button>

                    </div>

                </div>



                {/* ==========================================
                    NAVIGATION BUTTONS
                ========================================== */}

                <div className="
                    flex
                    flex-col
                    sm:flex-row
                    items-center
                    justify-center
                    gap-4
                    w-full
                    max-w-md
                    pt-2
                ">


                    <button

                        onClick={() =>
                            router.push("/Home")
                        }

                        className="
                            w-full
                            sm:w-auto
                            min-h-[48px]
                            justify-center
                            bg-yellow-400
                            hover:bg-yellow-700
                            text-white
                            font-semibold
                            text-sm
                            px-6
                            rounded-lg
                            shadow-lg
                            transition-all
                            cursor-pointer
                            flex
                            items-center
                            gap-2
                        "

                    >

                        Go to Home Page

                    </button>

                    <button

                        onClick={() =>
                            router.push("/Invoices")
                        }

                        className="
                            w-full
                            sm:w-auto
                            min-h-[48px]
                            justify-center
                            bg-yellow-400
                            hover:bg-yellow-700
                            text-white
                            font-semibold
                            text-sm
                            px-6
                            rounded-lg
                            shadow-lg
                            transition-all
                            cursor-pointer
                            flex
                            items-center
                            gap-2
                        "

                    >

                        Go to Invoice Page

                    </button>

                </div>

            </div>

        </div>

    );

}