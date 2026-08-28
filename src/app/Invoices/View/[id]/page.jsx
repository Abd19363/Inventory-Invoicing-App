"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getItemById } from "@/Services/inventoryService";
import { getInvoiceById, markInvoiceAsPaid, viewInvoicePdf } from "@/Services/invoicesService";
import useAuth from "@/hooks/useAuth";
import Sidebar from "@/app/components/Sidebar";
import useSidebarState from "@/hooks/useSidebarState";


// ==================================================
// INVOICE DETAILS PAGE
// ==================================================

export default function InvoiceDetails() {

    useAuth();

    const router = useRouter();

    const params = useParams();

    const queryClient = useQueryClient();

    const invoiceId = params?.id;

    const [sidebarCollapsed, setSidebarCollapsed] = useSidebarState();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


    // ==================================================
    // GET INVOICE
    // ==================================================

    const {
        data: invoice,
        isLoading,
        isError,
        error
    } = useQuery({

        queryKey: [
            "invoice",
            invoiceId
        ],

        queryFn: () =>
            getInvoiceById(invoiceId),

        enabled:
            !!invoiceId

    });


    // ==================================================
    // MARK AS PAID MUTATION
    // ==================================================

    const markPaidMutation = useMutation({
        mutationFn: () => markInvoiceAsPaid(invoiceId),
        onSuccess: () => {
            queryClient.invalidateQueries(["invoice", invoiceId]);
            queryClient.invalidateQueries(["invoices"]);
        }
    });

    console.log("Invoice details received:", invoice);
    console.log(
        "FULL INVOICE ITEM:",
        JSON.stringify(invoice?.items?.[0], null, 2)
    );

    const {
        data: products = {}
    } = useQuery({

        queryKey: [
            "invoice-products",
            invoice?.items?.map(
                item => item.productId
            )
        ],

        queryFn: async () => {

            const productMap = {};

            for (
                const item
                of invoice.items || []
            ) {

                try {

                    const product =
                        await getItemById(
                            item.productId
                        );

                    productMap[
                        item.productId
                    ] = product;

                } catch (error) {

                    console.error(
                        `Failed to load product ${item.productId}:`,
                        error
                    );

                }

            }

            return productMap;

        },

        enabled:
            !!invoice?.items?.length

    });


    // ==================================================
    // LOADING
    // ==================================================

    if (isLoading) {

        return (

            <div className="
                min-h-screen
                bg-zinc-950
                text-white
                flex
                items-center
                justify-center
                p-6
            ">

                <div className="
                    bg-zinc-900
                    border
                    border-zinc-800
                    rounded-2xl
                    px-10
                    py-8
                    text-center
                    shadow-2xl
                ">

                    <div className="
                        w-10
                        h-10
                        border-4
                        border-zinc-700
                        border-t-emerald-500
                        rounded-full
                        animate-spin
                        mx-auto
                        mb-4
                    " />

                    <p className="
                        text-lg
                        font-semibold
                        text-zinc-200
                    ">
                        Loading Invoice...
                    </p>

                </div>

            </div>
        );
    }


    // ==================================================
    // ERROR
    // ==================================================

    if (isError) {

        return (

            <div className="
                min-h-screen
                bg-zinc-950
                flex
                items-center
                justify-center
                p-6
            ">

                <div className="
                    max-w-md
                    w-full
                    bg-zinc-900
                    border
                    border-rose-500/20
                    rounded-2xl
                    p-8
                    text-center
                    shadow-2xl
                ">

                    <div className="
                        w-14
                        h-14
                        mx-auto
                        mb-4
                        rounded-full
                        bg-rose-500/10
                        border
                        border-rose-500/20
                        flex
                        items-center
                        justify-center
                    ">

                        <span className="text-2xl">!</span>

                    </div>


                    <h2 className="
                        text-xl
                        font-bold
                        text-rose-400
                        mb-2
                    ">
                        Error Loading Invoice
                    </h2>


                    <p className="
                        text-zinc-400
                        mb-6
                    ">
                        {error?.message || "Failed to load invoice details."}
                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            router.push("/Invoices")
                        }
                        className="
                            bg-emerald-600
                            hover:bg-emerald-500
                            text-white
                            font-semibold
                            px-5
                            py-2.5
                            rounded-xl
                            transition-all
                        "
                    >
                        ← Back to Invoices
                    </button>

                </div>

            </div>
        );
    }


    // ==================================================
    // INVOICE NOT FOUND
    // ==================================================

    if (!invoice) {

        return (

            <div className="
                min-h-screen
                bg-zinc-950
                text-white
                flex
                items-center
                justify-center
                p-6
            ">

                <div className="
                    bg-zinc-900
                    border
                    border-zinc-800
                    rounded-2xl
                    p-8
                    text-center
                    shadow-2xl
                ">

                    <h2 className="
                        text-xl
                        font-bold
                        text-white
                        mb-3
                    ">
                        Invoice Not Found
                    </h2>

                    <p className="
                        text-zinc-500
                        mb-5
                    ">
                        No invoice was found with ID #{invoiceId}.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            router.push("/Invoices")
                        }
                        className="
                            bg-emerald-600
                            hover:bg-emerald-500
                            text-white
                            font-semibold
                            px-5
                            py-2.5
                            rounded-xl
                        "
                    >
                        ← Back to Invoices
                    </button>

                </div>

            </div>
        );
    }


    // ==================================================
    // CALCULATE TOTAL FROM ITEMS
    // ==================================================

    const calculatedTotal =
        (invoice.items || []).reduce(
            (total, item) => {

                return (
                    total +
                    Number(item.subtotal || 0)
                );

            },
            0
        );


    const invoiceTotal =
        Number(invoice.total || 0);

    const isPaid = invoice.status === "paid";


    // ==================================================
    // PAGE
    // ==================================================

    return (

        <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex">

            <Sidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <div className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarCollapsed ? "md:ml-0" : "md:ml-[260px]"} min-h-screen flex flex-col`}>

                {/* TOP BAR HEADER WITH SIDEBAR SLIDER TOGGLE */}
                <header className="sticky top-0 z-30 h-16 bg-[#051424]/90 backdrop-blur-md border-b border-[#3c4a42] flex items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-3">
                        {sidebarCollapsed && (
                            <button
                                onClick={() => setSidebarCollapsed(false)}
                                className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0d1c2d] border border-[#3c4a42] text-[#bbcabf] hover:text-[#4edea3] hover:border-[#10b981]/50 text-xs font-semibold transition-all cursor-pointer shadow-md"
                                title="Expand Sidebar Slider"
                            >
                                <svg className="w-4 h-4 text-[#4edea3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                                <span>Sidebar Slider</span>
                            </button>
                        )}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-slate-400 hover:text-white"
                        >
                            ☰
                        </button>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>🧾</span> Invoice Details
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => viewInvoicePdf(invoice.id)}
                            className="bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            📄 View PDF Report
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/Invoices")}
                            className="bg-[#0d1c2d] hover:bg-[#1c2b3c] text-[#bbcabf] hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#3c4a42] transition-all cursor-pointer"
                        >
                            ← Back
                        </button>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-6xl w-full mx-auto">
                    <div className="mx-auto">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="
                    bg-zinc-900
                    border
                    border-zinc-800
                    rounded-2xl
                    p-6
                    sm:p-8
                    mb-6
                    shadow-xl
                ">

                    <div className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-5
                    ">

                        <div>

                            <div className="flex items-center gap-3 mb-2">
                                <p className="
                                    text-xs
                                    font-semibold
                                    tracking-widest
                                    text-emerald-400
                                ">
                                    SALES MANAGEMENT
                                </p>

                                {isPaid ? (
                                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                        ✓ PAID IN FULL
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                        ● UNPAID / PENDING
                                    </span>
                                )}
                            </div>

                            <h1 className="
                                text-2xl
                                sm:text-3xl
                                font-extrabold
                                text-white
                            ">
                                Invoice Details
                            </h1>

                            <p className="
                                mt-2
                                text-sm
                                text-zinc-500
                            ">
                                Invoice #{invoice.id}
                            </p>

                        </div>


                        <div className="flex flex-wrap items-center gap-3">

                            {!isPaid && (
                                <button
                                    type="button"
                                    onClick={() => markPaidMutation.mutate()}
                                    disabled={markPaidMutation.isLoading}
                                    className="
                                        bg-emerald-600
                                        hover:bg-emerald-500
                                        active:bg-emerald-700
                                        text-white
                                        font-semibold
                                        px-4
                                        py-2.5
                                        rounded-xl
                                        shadow-lg
                                        shadow-emerald-900/30
                                        transition-all
                                        hover:-translate-y-0.5
                                        disabled:opacity-50
                                    "
                                >
                                    {markPaidMutation.isLoading ? "Processing..." : "✓ Mark as Paid"}
                                </button>
                            )}

                            {invoice.status !== "paid" && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push(`/Invoices/Edit/${invoice.id}`)
                                    }
                                    className="
                                        bg-amber-600
                                        hover:bg-amber-500
                                        active:bg-amber-700
                                        text-white
                                        font-semibold
                                        px-4
                                        py-2.5
                                        rounded-xl
                                        shadow-lg
                                        shadow-amber-900/30
                                        transition-all
                                        hover:-translate-y-0.5
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >
                                    ✏️ Edit Invoice
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => viewInvoicePdf(invoice.id)}
                                className="
                                    bg-indigo-600
                                    hover:bg-indigo-500
                                    text-white
                                    font-semibold
                                    px-4
                                    py-2.5
                                    rounded-xl
                                    shadow-lg
                                    shadow-indigo-900/30
                                    transition-all
                                    hover:-translate-y-0.5
                                    flex
                                    items-center
                                    gap-2
                                    cursor-pointer
                                "
                            >
                                📄 View PDF Report
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/Invoices")
                                }
                                className="
                                    bg-zinc-800
                                    hover:bg-zinc-700
                                    text-zinc-200
                                    font-semibold
                                    px-4
                                    py-2.5
                                    rounded-xl
                                    border
                                    border-zinc-700
                                    transition-all
                                "
                            >
                                ← Back to Invoices
                            </button>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    PAID READ-ONLY BANNER
                ================================================== */}

                {isPaid && (
                    <div className="
                        bg-emerald-950/40
                        border
                        border-emerald-500/30
                        rounded-2xl
                        p-4
                        mb-6
                        flex
                        items-center
                        gap-3
                        text-emerald-200
                        text-sm
                    ">
                        <span className="text-xl">🔒</span>
                        <div>
                            <p className="font-bold text-emerald-400">Paid Invoice — Locked & Read-Only</p>
                            <p className="text-zinc-400 text-xs">This invoice has been marked as Paid. All quantities, pricing, and customer details are permanently secured against edits.</p>
                        </div>
                    </div>
                )}


                {/* ==================================================
                    CUSTOMER + INVOICE INFORMATION
                ================================================== */}

                <div className="
                    bg-zinc-900
                    border
                    border-zinc-800
                    rounded-2xl
                    p-6
                    sm:p-8
                    mb-6
                    shadow-xl
                ">

                    <h2 className="
                        text-xl
                        font-bold
                        text-white
                        mb-6
                        border-b
                        border-zinc-800
                        pb-4
                    ">
                        Invoice Information
                    </h2>


                    <div className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        gap-6
                    ">


                        {/* INVOICE ID */}

                        <div>

                            <p className="
                                text-xs
                                uppercase
                                tracking-wider
                                font-semibold
                                text-zinc-500
                                mb-1
                            ">
                                Invoice ID
                            </p>

                            <p className="
                                text-lg
                                font-semibold
                                text-white
                            ">
                                #{invoice.id}
                            </p>

                        </div>


                        {/* CUSTOMER NAME */}

                        <div>

                            <p className="
                                text-xs
                                uppercase
                                tracking-wider
                                font-semibold
                                text-zinc-500
                                mb-1
                            ">
                                Customer Name
                            </p>

                            <p className="
                                text-lg
                                font-semibold
                                text-white
                            ">
                                {invoice.customerName || "—"}
                            </p>

                        </div>


                        {/* CUSTOMER EMAIL */}

                        <div>

                            <p className="
                                text-xs
                                uppercase
                                tracking-wider
                                font-semibold
                                text-zinc-500
                                mb-1
                            ">
                                Customer Email
                            </p>

                            <p className="
                                text-lg
                                font-semibold
                                text-white
                                break-all
                            ">
                                {invoice.customerEmail || "—"}
                            </p>

                        </div>


                        {/* DATE */}

                        <div>

                            <p className="
                                text-xs
                                uppercase
                                tracking-wider
                                font-semibold
                                text-zinc-500
                                mb-1
                            ">
                                Invoice Date
                            </p>

                            <p className="
                                text-lg
                                font-semibold
                                text-white
                            ">
                                {invoice.date || "—"}
                            </p>

                        </div>


                        {/* CREATED AT */}

                        <div>

                            <p className="
                                text-xs
                                uppercase
                                tracking-wider
                                font-semibold
                                text-zinc-500
                                mb-1
                            ">
                                Created At
                            </p>

                            <p className="
                                text-sm
                                font-medium
                                text-zinc-300
                            ">
                                {invoice.createdAt
                                    ? new Date(
                                        invoice.createdAt
                                    ).toLocaleString()
                                    : "—"}
                            </p>

                        </div>


                        {/* GRAND TOTAL */}

                        <div>

                            <p className="
                                text-xs
                                uppercase
                                tracking-wider
                                font-semibold
                                text-zinc-500
                                mb-1
                            ">
                                Grand Total
                            </p>

                            <p className="
                                text-2xl
                                font-extrabold
                                text-emerald-400
                            ">
                                Rs.{" "}
                                {invoiceTotal.toLocaleString()}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    PRODUCTS
                ================================================== */}

                <div className="
                    bg-zinc-900
                    border
                    border-zinc-800
                    rounded-2xl
                    p-6
                    sm:p-8
                    shadow-xl
                ">

                    <div className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-3
                        mb-6
                    ">

                        <h2 className="
                            text-xl
                            font-bold
                            text-white
                        ">
                            Invoice Items
                        </h2>

                        <span className="
                            w-fit
                            px-3
                            py-1
                            rounded-full
                            bg-blue-500/10
                            border
                            border-blue-500/20
                            text-blue-400
                            text-xs
                            font-semibold
                        ">
                            {(invoice.items || []).length}{" "}
                            {(invoice.items || []).length === 1
                                ? "Item"
                                : "Items"}
                        </span>

                    </div>


                    <div className="
                        overflow-x-auto
                        rounded-xl
                        border
                        border-zinc-800
                    ">

                        <table className="
                            w-full
                            border-collapse
                            min-w-[700px]
                        ">

                            <thead>

                                <tr className="
                                    bg-zinc-950
                                    text-zinc-400
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    border-b
                                    border-zinc-800
                                ">

                                    <th className="p-4 text-left">
                                        Product
                                    </th>

                                    <th className="p-4 text-center">
                                        Quantity
                                    </th>

                                    <th className="p-4 text-right">
                                        Retail Price
                                    </th>

                                    <th className="p-4 text-center">
                                        Discount
                                    </th>

                                    <th className="p-4 text-right">
                                        Sale Price
                                    </th>

                                    <th className="p-4 text-right">
                                        Subtotal
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="
                                divide-y
                                divide-zinc-800
                            ">

                                {(invoice.items || []).length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan={6}
                                            className="
                                                p-8
                                                text-center
                                                text-zinc-500
                                            "
                                        >
                                            No invoice items found.
                                        </td>

                                    </tr>

                                ) : (

                                    invoice.items.map(
                                        (item) => {
                                            const pDetail = products[item.productId];
                                            const retailP = item.retailPrice || pDetail?.retailPrice || item.unitPrice || 0;
                                            const discountVal = item.discount || pDetail?.discount || 0;
                                            const saleP = item.salePrice || item.unitPrice || 0;

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="
                                                        hover:bg-zinc-800/50
                                                        transition-colors
                                                    "
                                                >
                                                    {/* PRODUCT */}
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="
                                                                h-12
                                                                w-12
                                                                flex-shrink-0
                                                                overflow-hidden
                                                                rounded-lg
                                                                border
                                                                border-zinc-700
                                                                bg-zinc-950
                                                            ">
                                                                {pDetail?.thumbnailUrl ? (
                                                                    <img
                                                                        src={pDetail.thumbnailUrl}
                                                                        alt={item.name || "Product"}
                                                                        className="h-full w-full object-contain"
                                                                    />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-zinc-600 text-lg">
                                                                        📦
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-white">
                                                                    {item.name || "Unknown Product"}
                                                                </p>
                                                                <p className="mt-0.5 text-xs text-zinc-500">
                                                                    Product #{item.productId}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* QUANTITY */}
                                                    <td className="p-4 text-center text-zinc-300 font-medium">
                                                        {item.quantity}
                                                    </td>

                                                    {/* RETAIL PRICE */}
                                                    <td className="p-4 text-right text-zinc-300 font-medium">
                                                        Rs. {Number(retailP).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>

                                                    {/* DISCOUNT */}
                                                    <td className="p-4 text-center">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${Number(discountVal) > 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "text-zinc-500"}`}>
                                                            {Number(discountVal) > 0 ? `${discountVal}% OFF` : "0%"}
                                                        </span>
                                                    </td>

                                                    {/* SALE PRICE */}
                                                    <td className="p-4 text-right text-emerald-300 font-semibold">
                                                        Rs. {Number(saleP).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>

                                                    {/* SUBTOTAL */}
                                                    <td className="p-4 text-right font-extrabold text-emerald-400">
                                                        Rs. {Number(item.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* ==================================================
                        TOTAL
                    ================================================== */}

                    <div className="
                        mt-6
                        pt-6
                        border-t
                        border-zinc-800
                        flex
                        flex-col
                        items-end
                        gap-2
                    ">

                        <div className="
                            flex
                            justify-between
                            w-full
                            sm:w-auto
                            sm:min-w-[280px]
                            text-zinc-500
                        ">

                            <span>
                                Calculated Total
                            </span>

                            <span>
                                Rs.{" "}
                                {calculatedTotal.toLocaleString()}
                            </span>

                        </div>


                        <div className="
                            flex
                            justify-between
                            w-full
                            sm:w-auto
                            sm:min-w-[280px]
                            text-xl
                            font-extrabold
                        ">

                            <span className="text-white">
                                Grand Total
                            </span>

                            <span className="
                                text-emerald-400
                            ">
                                Rs.{" "}
                                {invoiceTotal.toLocaleString()}
                            </span>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    BOTTOM BUTTON
                ================================================== */}

                <div className="
                    flex
                    justify-center
                    mt-6
                ">

                    <button
                        type="button"
                        onClick={() =>
                            router.push("/Invoices")
                        }
                        className="
                            bg-emerald-600
                            hover:bg-emerald-500
                            text-white
                            font-semibold
                            px-7
                            py-3
                            rounded-xl
                            shadow-lg
                            transition-all
                            hover:-translate-y-0.5
                        "
                    >
                        ← Go to Invoice List
                    </button>

                </div>

            </div>

                </main>
            </div>
        </div>
    );
}