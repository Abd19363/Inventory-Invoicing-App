"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInvoices, deleteInvoice } from "@/Services/invoicesService";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function InvoiceDashboard() {
    useAuth();

    const router = useRouter();
    const queryClient = useQueryClient();

    // ==========================================
    // SEARCH STATE
    // ==========================================

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // ==========================================
    // GET INVOICES
    // ==========================================

    const {
        data,
        isLoading,
        isError
    } = useQuery({
        queryKey: ["invoices"],
        queryFn: getInvoices
    });

    const invoices = data || [];

    // ==========================================
    // DEBOUNCING
    // ==========================================

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(
                searchTerm.toLowerCase().trim()
            );
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [searchTerm]);

    // ==========================================
    // FILTER INVOICES
    // ==========================================

    const filteredInvoices = invoices.filter(
        (invoice) => {

            if (debouncedSearch === "") {
                return true;
            }

            const invoiceId =
                String(invoice.id || "")
                    .toLowerCase();

            const customerName =
                String(invoice.customerName || "")
                    .toLowerCase();

            const invoiceDate =
                String(invoice.date || "")
                    .toLowerCase();

            return (
                invoiceId.includes(debouncedSearch) ||
                customerName.includes(debouncedSearch) ||
                invoiceDate.includes(debouncedSearch)
            );
        }
    );

    // ==========================================
    // LOADING
    // ==========================================

    if (isLoading) {
        return (
            <div className="
                min-h-screen
                bg-zinc-950
                text-white
                flex
                items-center
                justify-center
            ">
                <div className="
                    text-center
                    bg-zinc-900
                    border
                    border-zinc-800
                    rounded-2xl
                    px-10
                    py-8
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
                    "></div>

                    <p className="
                        text-lg
                        font-semibold
                        text-zinc-200
                    ">
                        Loading Invoices...
                    </p>

                </div>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

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
                    bg-zinc-900
                    border
                    border-rose-500/20
                    rounded-2xl
                    p-8
                    text-center
                    shadow-2xl
                    max-w-md
                    w-full
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
                        <span className="text-2xl">
                            !
                        </span>
                    </div>

                    <h2 className="
                        text-xl
                        font-bold
                        text-rose-400
                        mb-2
                    ">
                        Unable to Load Invoices
                    </h2>

                    <p className="text-zinc-400">
                        Failed to load invoices.
                    </p>

                    <button
                        onClick={() =>
                            queryClient.invalidateQueries({
                                queryKey: ["invoices"]
                            })
                        }
                        className="
                            mt-5
                            bg-emerald-600
                            hover:bg-emerald-500
                            text-white
                            font-semibold
                            px-5
                            py-2.5
                            rounded-xl
                            transition-all
                            duration-200
                            shadow-lg
                            shadow-emerald-900/20
                        "
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }

    // ==========================================
    // DELETE INVOICE
    // ==========================================

    async function handledelete(id) {

        try {

            // Find invoice before deleting it
            const invoiceToDelete = invoices.find(
                (invoice) => invoice.id === id
            );

            // Delete invoice
            await deleteInvoice(id);

            // Add deletion to activity log
            if (invoiceToDelete) {

                const existingLogs =
                    JSON.parse(
                        localStorage.getItem(
                            "invoiceActivityLog"
                        )
                    ) || [];

                const newLog = {

                    logId: Date.now(),

                    invoiceId:
                        invoiceToDelete.id,

                    customerName:
                        invoiceToDelete.customerName,

                    total:
                        invoiceToDelete.total,

                    action:
                        "Deleted",

                    timestamp:
                        new Date().toLocaleString()

                };

                const updatedLogs = [
                    newLog,
                    ...existingLogs
                ];

                localStorage.setItem(
                    "invoiceActivityLog",
                    JSON.stringify(updatedLogs)
                );
            }

            alert(
                "Invoice deleted successfully!"
            );

            // Refresh invoice list
            queryClient.invalidateQueries({
                queryKey: ["invoices"]
            });

        } catch (error) {

            alert(error.message);

        }
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="
            min-h-screen
            w-full
            bg-zinc-950
            text-zinc-100
            flex
            flex-col
            items-center
            p-4
            sm:p-6
            lg:p-8
            antialiased
            selection:bg-emerald-500/30
            selection:text-emerald-200
        ">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="
                w-full
                max-w-6xl
                mb-8
                p-6
                sm:p-8
                rounded-2xl
                bg-zinc-900
                border
                border-zinc-800
                shadow-xl
            ">

                <div className="
                    flex
                    flex-col
                    sm:flex-row
                    items-center
                    justify-between
                    gap-5
                ">

                    <div className="text-center sm:text-left">

                        <p className="
                            text-xs
                            sm:text-sm
                            font-semibold
                            tracking-widest
                            text-emerald-400
                            mb-2
                        ">
                            SALES MANAGEMENT
                        </p>

                        <h1 className="
                            text-2xl
                            sm:text-3xl
                            lg:text-4xl
                            font-extrabold
                            tracking-tight
                            text-white
                        ">
                            Invoice Dashboard
                        </h1>

                        <p className="
                            mt-2
                            text-sm
                            sm:text-base
                            text-zinc-500
                        ">
                            Manage invoices and keep track of your sales.
                        </p>

                    </div>


                    <div className="
                        min-w-[150px]
                        bg-zinc-950
                        border
                        border-zinc-800
                        rounded-xl
                        px-6
                        py-4
                        text-center
                        shadow-inner
                    ">

                        <p className="
                            text-xs
                            uppercase
                            tracking-wider
                            font-semibold
                            text-zinc-500
                        ">
                            Total Invoices
                        </p>

                        <p className="
                            text-3xl
                            font-extrabold
                            text-emerald-400
                            mt-1
                        ">
                            {invoices.length}
                        </p>

                    </div>

                </div>

            </div>


            {/* ==================================
                MAIN CONTENT
            ================================== */}

            <div className="
                w-full
                max-w-6xl
            ">


                {/* ==================================
                    LIST HEADER
                ================================== */}

                <div className="
                    flex
                    flex-col
                    sm:flex-row
                    items-start
                    sm:items-center
                    justify-between
                    gap-4
                    mb-5
                ">

                    <div>

                        <h2 className="
                            text-xl
                            sm:text-2xl
                            font-bold
                            text-white
                        ">
                            Invoice List
                        </h2>

                        <p className="
                            text-sm
                            text-zinc-500
                            mt-1
                        ">
                            View, search and manage your invoices.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            router.push("/Invoices/Create")
                        }
                        className="
                            w-full
                            sm:w-auto
                            bg-emerald-600
                            hover:bg-emerald-500
                            active:bg-emerald-700
                            text-white
                            font-semibold
                            text-sm
                            px-5
                            py-2.5
                            rounded-xl
                            shadow-lg
                            shadow-emerald-900/20
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            flex
                            items-center
                            justify-center
                            gap-2
                            cursor-pointer
                        "
                    >

                        <span className="
                            text-lg
                            font-bold
                            leading-none
                        ">
                            +
                        </span>

                        Generate Invoice

                    </button>

                </div>


                {/* ==================================
                    SEARCH BAR
                ================================== */}

                <div className="
                    bg-zinc-900
                    border
                    border-zinc-800
                    rounded-2xl
                    p-5
                    mb-6
                    shadow-xl
                ">

                    <div className="relative">

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            placeholder="Search by customer name, invoice ID or date..."
                            className="
                                w-full
                                px-4
                                py-3
                                rounded-xl
                                bg-zinc-950
                                border
                                border-zinc-700
                                text-zinc-100
                                placeholder-zinc-600
                                outline-none
                                focus:border-emerald-500
                                focus:ring-2
                                focus:ring-emerald-500/20
                                transition-all
                            "
                        />

                    </div>


                    <div className="
                        flex
                        justify-between
                        items-center
                        mt-3
                    ">

                        <p className="
                            text-sm
                            text-zinc-500
                        ">

                            Showing{" "}

                            <span className="
                                text-emerald-400
                                font-semibold
                            ">
                                {filteredInvoices.length}
                            </span>

                            {" "}of{" "}

                            <span className="
                                text-zinc-300
                                font-semibold
                            ">
                                {invoices.length}
                            </span>

                            {" "}invoices

                        </p>


                        {searchTerm && (

                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm("");
                                }}
                                className="
                                    text-sm
                                    font-medium
                                    text-zinc-500
                                    hover:text-emerald-400
                                    transition-colors
                                "
                            >
                                Clear Search
                            </button>

                        )}

                    </div>

                </div>


                {/* ==================================
                    INVOICE TABLE
                ================================== */}

                <div className="
                    overflow-x-auto
                    rounded-2xl
                    border
                    border-zinc-800
                    shadow-2xl
                    bg-zinc-900
                ">

                    <table className="
                        w-full
                        border-collapse
                        text-left
                        text-sm
                    ">

                        {/* TABLE HEADER */}

                        <thead>

                            <tr className="
                                bg-zinc-950
                                text-zinc-400
                                font-semibold
                                text-xs
                                uppercase
                                tracking-wider
                                border-b
                                border-zinc-800
                            ">

                                <th className="
                                    p-4
                                    text-center
                                    whitespace-nowrap
                                ">
                                    Invoice ID
                                </th>

                                <th className="p-4">
                                    Customer
                                </th>

                                <th className="p-4">
                                    Date
                                </th>

                                <th className="
                                    p-4
                                    text-right
                                ">
                                    Total
                                </th>

                                <th className="
                                    p-4
                                    text-center
                                ">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        {/* TABLE BODY */}

                        <tbody className="
                            divide-y
                            divide-zinc-800
                            bg-zinc-900
                        ">

                            {filteredInvoices.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={5}
                                        className="
                                            p-12
                                            text-center
                                        "
                                    >

                                        <div className="
                                            flex
                                            flex-col
                                            items-center
                                        ">

                                            <div className="
                                                w-14
                                                h-14
                                                rounded-full
                                                bg-zinc-800
                                                border
                                                border-zinc-700
                                                flex
                                                items-center
                                                justify-center
                                                mb-4
                                            ">

                                                <span className="
                                                    text-2xl
                                                    text-zinc-500
                                                ">
                                                    📄
                                                </span>

                                            </div>

                                            <p className="
                                                text-zinc-400
                                                font-medium
                                            ">
                                                {debouncedSearch
                                                    ? "No invoices match your search."
                                                    : "No invoices found."
                                                }
                                            </p>

                                            {!debouncedSearch && (

                                                <button
                                                    onClick={() =>
                                                        router.push(
                                                            "/Invoices/Create"
                                                        )
                                                    }
                                                    className="
                                                        mt-4
                                                        text-emerald-400
                                                        hover:text-emerald-300
                                                        font-semibold
                                                    "
                                                >
                                                    Create your first invoice →
                                                </button>

                                            )}

                                        </div>

                                    </td>

                                </tr>

                            ) : (

                                filteredInvoices.map(
                                    (invoice) => (

                                        <tr
                                            key={invoice.id}
                                            className="
                                                hover:bg-zinc-800/60
                                                transition-colors
                                                duration-200
                                            "
                                        >

                                            {/* INVOICE ID */}

                                            <td className="
                                                p-4
                                                font-mono
                                                text-zinc-400
                                                text-center
                                            ">
                                                #{invoice.id}
                                            </td>


                                            {/* CUSTOMER */}

                                            <td className="
                                                p-4
                                                font-medium
                                                text-zinc-100
                                            ">
                                                {invoice.customerName || "—"}
                                            </td>


                                            {/* DATE */}

                                            <td className="
                                                p-4
                                                text-zinc-500
                                            ">
                                                {invoice.date || "—"}
                                            </td>


                                            {/* TOTAL */}

                                            <td className="
                                                p-4
                                                text-right
                                                font-semibold
                                                text-emerald-400
                                            ">
                                                Rs.{" "}
                                                {Number(
                                                    invoice.total || 0
                                                ).toLocaleString()}
                                            </td>


                                            {/* ACTIONS */}

                                            <td className="p-4">

                                                <div className="
                                                    flex
                                                    items-center
                                                    justify-center
                                                    gap-2
                                                ">

                                                    {/* VIEW */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.push(
                                                                `/Invoices/View/${invoice.id}`
                                                            )
                                                        }
                                                        className="
                                                            bg-blue-600
                                                            hover:bg-blue-500
                                                            active:bg-blue-700
                                                            text-white
                                                            font-semibold
                                                            text-xs
                                                            rounded-lg
                                                            px-4
                                                            py-2
                                                            transition-all
                                                            duration-200
                                                            shadow-sm
                                                            hover:-translate-y-0.5
                                                        "
                                                    >
                                                        View
                                                    </button>


                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handledelete(
                                                                invoice.id
                                                            )
                                                        }
                                                        className="
                                                            bg-rose-600
                                                            hover:bg-rose-500
                                                            active:bg-rose-700
                                                            text-white
                                                            font-semibold
                                                            text-xs
                                                            rounded-lg
                                                            px-4
                                                            py-2
                                                            transition-all
                                                            duration-200
                                                            shadow-sm
                                                            hover:-translate-y-0.5
                                                        "
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>


                {/* ==================================
                    BOTTOM NAVIGATION
                ================================== */}

                <div className="
                    flex
                    flex-col
                    sm:flex-row
                    justify-center
                    items-center
                    gap-3
                    mt-8
                ">

                    <button
                        onClick={() =>
                            router.push("/Home")
                        }
                        className="
                            w-full
                            sm:w-auto
                            bg-zinc-900
                            hover:bg-zinc-800
                            active:bg-zinc-950
                            text-zinc-200
                            font-semibold
                            px-6
                            py-3
                            rounded-xl
                            border
                            border-zinc-800
                            shadow-md
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                        "
                    >
                        ← Go to Home
                    </button>

                </div>

            </div>

        </div>
    );
}