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

            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-medium">

                Loading Invoices...

            </div>

        );

    }


    // ==========================================
    // ERROR
    // ==========================================

    if (isError) {

        return (

            <div className="min-h-screen bg-slate-900 text-rose-400 flex items-center justify-center font-medium">

                Failed to load invoices.

            </div>

        );

    }


    console.log(
        "Invoices: ",
        invoices
    );


    console.log(
        "Filtered Invoices: ",
        filteredInvoices
    );


    // ==========================================
    // DELETE INVOICE
    // ==========================================

    async function handledelete(id) {

        try {

            await deleteInvoice(id);

            alert(
                "Invoice deleted successfully!"
            );


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

        <div className="min-h-screen w-full bg-slate-800 text-zinc-100 flex flex-col justify-start items-center p-4 sm:p-6 lg:p-8 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">


            {/* ==================================
                HEADER
            ================================== */}

            <div className="w-full flex flex-col items-center p-6 text-center bg-zinc-600/80 border border-zinc-700/60 rounded-2xl shadow-xl max-w-4xl mx-auto my-4 space-y-2">

                <h4 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-md">

                    Welcome to Invoice Dashboard

                </h4>

            </div>


            {/* ==================================
                INVOICE LIST SECTION
            ================================== */}

            <div className="my-4 w-full max-w-4xl">


                <h2 className="text-xl font-bold mb-3 text-zinc-100 text-center hover:bg-zinc-400 w-max mx-auto px-4 py-1 rounded-lg transition-colors">

                    Invoice List

                </h2>


                {/* ==================================
                    SEARCH BAR
                ================================== */}

                <div className="mb-5">

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                        placeholder="Search by customer name, invoice ID or date..."
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />


                    <div className="flex justify-between items-center mt-2">

                        <p className="text-sm text-zinc-400">

                            Showing{" "}

                            <span className="text-emerald-400 font-semibold">

                                {filteredInvoices.length}

                            </span>

                            {" "}of{" "}

                            <span className="text-zinc-200">

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
                                className="text-sm text-zinc-400 hover:text-white transition-colors"
                            >

                                Clear Search

                            </button>

                        )}

                    </div>

                </div>


                {/* ==================================
                    INVOICE TABLE
                ================================== */}

                <div className="overflow-x-auto rounded-xl border border-zinc-700/80 shadow-xl">

                    <table className="w-full border-collapse text-left text-sm">


                        {/* TABLE HEADER */}

                        <thead>

                            <tr className="bg-zinc-800 text-zinc-300 font-semibold border-b border-zinc-700/80">

                                <th className="p-3 text-center">
                                    Invoice ID
                                </th>

                                <th className="p-3">
                                    Customer
                                </th>

                                <th className="p-3">
                                    Date
                                </th>

                                <th className="p-3 text-right">
                                    Total
                                </th>

                                <th className="p-3 text-center">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        {/* TABLE BODY */}

                        <tbody className="divide-y divide-zinc-800 bg-zinc-900/60">


                            {filteredInvoices.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={5}
                                        className="p-6 text-center text-zinc-500 italic"
                                    >

                                        {debouncedSearch
                                            ? "No invoices match your search."
                                            : "No invoices found."
                                        }

                                    </td>

                                </tr>

                            ) : (

                                filteredInvoices.map(
                                    (invoice) => (

                                        <tr
                                            key={invoice.id}
                                            className="hover:bg-zinc-800/50 transition-colors"
                                        >


                                            {/* INVOICE ID */}

                                            <td className="p-3 font-mono text-zinc-300 text-center">

                                                {invoice.id}

                                            </td>


                                            {/* CUSTOMER */}

                                            <td className="p-3 font-medium text-zinc-100">

                                                {invoice.customerName || "—"}

                                            </td>


                                            {/* DATE */}

                                            <td className="p-3 text-zinc-400">

                                                {invoice.date || "—"}

                                            </td>


                                            {/* TOTAL */}

                                            <td className="p-3 text-right font-semibold text-emerald-400">

                                                $
                                                {invoice.total?.toLocaleString() ?? 0}

                                            </td>


                                            {/* ACTIONS */}

                                            <td className="p-3">

                                                <div className="flex items-center justify-center gap-2">


                                                    {/* VIEW */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.push(
                                                                `/Invoices/View/${invoice.id}`
                                                            )
                                                        }
                                                        className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg px-3 py-1.5 transition-all shadow-sm"
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
                                                        className="bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg px-3 py-1.5 transition-all shadow-sm"
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

            </div>


            {/* ==================================
                BOTTOM ACTION BUTTONS
            ================================== */}

            <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-center items-center gap-3 py-2 my-2">


                {/* CREATE INVOICE */}

                <button
                    onClick={() =>
                        router.push("/Invoices/Create")
                    }
                    className="w-full sm:w-auto bg-green-500 hover:bg-emerald-800 active:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-emerald-500/50"
                >

                    <span className="text-lg font-bold leading-none text-emerald-100">
                        +
                    </span>

                    <span>
                        Create Invoice
                    </span>

                </button>


                {/* HOME */}

                <button
                    onClick={() =>
                        router.push("/Home")
                    }
                    className="w-full sm:w-auto bg-zinc-800 hover:bg-yellow-600 active:bg-zinc-900 text-zinc-100 font-semibold text-sm px-6 py-2.5 rounded-xl border border-zinc-700/80 shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 outline-none focus:ring-2 focus:ring-zinc-500/50"
                >

                    <span>
                        Go to Home
                    </span>

                </button>

            </div>

        </div>

    );

}