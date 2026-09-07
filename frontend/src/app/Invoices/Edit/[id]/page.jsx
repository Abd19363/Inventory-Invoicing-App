"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getInvoiceById, updateInvoice } from "@/Services/invoicesService";
import { getItems } from "@/Services/inventoryService";
import useAuth from "@/hooks/useAuth";
import Sidebar from "@/app/components/Sidebar";
import useSidebarState from "@/hooks/useSidebarState";

export default function EditInvoicePage() {
    useAuth();

    const [sidebarCollapsed, setSidebarCollapsed] = useSidebarState();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const invoiceId = params?.id;

    // ==================================================
    // FORM & DRAFT STATE
    // ==================================================
    const [customerName, setCustomerName] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [status, setStatus] = useState("unpaid");
    const [items, setItems] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [addQuantity, setAddQuantity] = useState(1);
    const [submitError, setSubmitError] = useState("");

    // ==================================================
    // FETCH DATA
    // ==================================================
    const {
        data: invoice,
        isLoading: isInvoiceLoading,
        isError: isInvoiceError,
        error: invoiceError,
    } = useQuery({
        queryKey: ["invoice", invoiceId],
        queryFn: () => getInvoiceById(invoiceId),
        enabled: Boolean(invoiceId),
    });

    const {
        data: availableProducts = [],
        isLoading: isProductsLoading,
    } = useQuery({
        queryKey: ["products"],
        queryFn: getItems,
    });

    // Populate initial state from loaded invoice
    useEffect(() => {
        if (invoice) {
            setCustomerName(invoice.customerName || "");
            setCustomerEmail(invoice.customerEmail || "");
            setStatus(invoice.status || "unpaid");
            setItems(
                (invoice.items || []).map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    salePrice: Number(item.salePrice || item.unitPrice || 0),
                    invoiceQuantity: Number(item.invoiceQuantity || item.quantity || 1),
                }))
            );
        }
    }, [invoice]);

    // ==================================================
    // UPDATE MUTATION
    // ==================================================
    const updateMutation = useMutation({
        mutationFn: (updatedPayload) => updateInvoice(invoiceId, updatedPayload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
            router.push(`/Invoices/View/${invoiceId}`);
        },
        onError: (err) => {
            setSubmitError(err.message || "Failed to update invoice.");
        },
    });

    // ==================================================
    // ITEM ACTIONS
    // ==================================================
    const handleAddProduct = () => {
        if (!selectedProductId) return;

        const prod = availableProducts.find(
            (p) => String(p.id) === String(selectedProductId)
        );
        if (!prod) return;

        const existingIndex = items.findIndex(
            (it) => String(it.productId) === String(prod.id)
        );

        if (existingIndex > -1) {
            const updated = [...items];
            updated[existingIndex].invoiceQuantity += Number(addQuantity);
            setItems(updated);
        } else {
            setItems([
                ...items,
                {
                    productId: prod.id,
                    name: prod.name,
                    salePrice: Number(prod.salePrice || 0),
                    invoiceQuantity: Number(addQuantity),
                },
            ]);
        }

        setSelectedProductId("");
        setAddQuantity(1);
    };

    const handleQuantityChange = (productId, newQty) => {
        const qty = Math.max(1, Number(newQty) || 1);
        setItems(
            items.map((it) =>
                String(it.productId) === String(productId)
                    ? { ...it, invoiceQuantity: qty }
                    : it
            )
        );
    };

    const handleRemoveItem = (productId) => {
        setItems(items.filter((it) => String(it.productId) !== String(productId)));
    };

    // ==================================================
    // SUBMIT
    // ==================================================
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitError("");

        if (!customerName.trim()) {
            setSubmitError("Customer name is required.");
            return;
        }

        if (items.length === 0) {
            setSubmitError("At least one product item is required.");
            return;
        }

        updateMutation.mutate({
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim() || null,
            status,
            items,
        });
    };

    // Calculated total
    const totalAmount = items.reduce(
        (sum, it) => sum + (Number(it.salePrice) || 0) * (Number(it.invoiceQuantity) || 0),
        0
    );

    // ==================================================
    // RENDERING
    // ==================================================
    if (isInvoiceLoading || isProductsLoading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
                <div className="flex items-center gap-3 text-emerald-400">
                    <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <span>Loading invoice data...</span>
                </div>
            </div>
        );
    }

    if (isInvoiceError || !invoice) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md text-center">
                    <p className="text-rose-400 text-lg font-semibold mb-2">Error Loading Invoice</p>
                    <p className="text-slate-400 text-sm mb-6">{invoiceError?.message || "Invoice not found."}</p>
                    <button
                        onClick={() => router.push("/Invoices")}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-2.5 rounded-xl border border-slate-700"
                    >
                        Back to Invoices
                    </button>
                </div>
            </div>
        );
    }

    // SECURITY CHECK: READ-ONLY IF PAID
    if (invoice.status === "paid") {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center">
                <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8 max-w-lg text-center shadow-xl">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl mx-auto mb-4">
                        🔒
                    </div>
                    <h1 className="text-2xl font-bold text-slate-100 mb-2">Invoice #{invoice.id} is Paid</h1>
                    <p className="text-amber-300/90 text-sm mb-6">
                        Paid invoices are read-only and cannot be modified to ensure accounting integrity.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => router.push(`/Invoices/View/${invoice.id}`)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30"
                        >
                            View Invoice
                        </button>
                        <button
                            onClick={() => router.push("/Invoices")}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-2.5 rounded-xl border border-slate-700"
                        >
                            Back to Invoices
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex">
            <Sidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <div className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarCollapsed ? "md:ml-0" : "md:ml-[260px]"} min-h-screen flex flex-col`}>
                {/* RESPONSIVE TOP BAR */}
                <header className="sticky top-0 bg-[#051424]/90 backdrop-blur-md border-b border-[#3c4a42] px-4 md:px-8 py-3.5 flex items-center justify-between z-30">
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
                        <div className="flex items-center gap-3 md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-[#bbcabf] hover:text-white text-xl"
                            >
                                ☰
                            </button>
                            <span className="text-lg font-bold text-[#4edea3]">InvPro</span>
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-4xl w-full mx-auto">
                    <div className="mx-auto space-y-8">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-100">
                            Edit Invoice #{invoice.id}
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Update customer details, items, or status for this unpaid invoice.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push("/Invoices")}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-xl border border-slate-700 text-sm self-start md:self-auto"
                    >
                        Cancel
                    </button>
                </div>

                {submitError && (
                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl text-sm">
                        {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* CUSTOMER DETAILS CARD */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                            <span>👤</span> Customer Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                                    placeholder="Enter customer name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Customer Email (Optional)
                                </label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                                    placeholder="customer@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Invoice Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full md:w-64 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                            >
                                <option value="unpaid">Unpaid</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                    </div>

                    {/* ITEMS CARD */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                            <span>📦</span> Invoice Items
                        </h2>

                        {/* ADD PRODUCT ROW */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-end gap-4">
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Select Product to Add
                                </label>
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="">-- Choose Product --</option>
                                    {availableProducts.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — Rs. {Number(p.salePrice || 0).toLocaleString()} (Stock: {p.quantity})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-full md:w-32">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                    Qty
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={addQuantity}
                                    onChange={(e) => setAddQuantity(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleAddProduct}
                                disabled={!selectedProductId}
                                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all text-sm whitespace-nowrap"
                            >
                                + Add Product
                            </button>
                        </div>

                        {/* ITEMS TABLE */}
                        {items.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                                No items in this invoice. Add a product above.
                            </div>
                        ) : (
                            <div className="overflow-x-auto border border-slate-800 rounded-xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                                        <tr>
                                            <th className="p-3.5">Product Name</th>
                                            <th className="p-3.5">Unit Price</th>
                                            <th className="p-3.5 w-32">Quantity</th>
                                            <th className="p-3.5 text-right">Subtotal</th>
                                            <th className="p-3.5 text-center w-16">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {items.map((item) => (
                                            <tr key={item.productId} className="hover:bg-slate-850">
                                                <td className="p-3.5 font-medium text-slate-200">{item.name}</td>
                                                <td className="p-3.5 text-slate-300">
                                                    Rs. {Number(item.salePrice).toLocaleString()}
                                                </td>
                                                <td className="p-3.5">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.invoiceQuantity}
                                                        onChange={(e) =>
                                                            handleQuantityChange(item.productId, e.target.value)
                                                        }
                                                        className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-center text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                                                    />
                                                </td>
                                                <td className="p-3.5 text-right font-semibold text-slate-100">
                                                    Rs. {(Number(item.salePrice) * Number(item.invoiceQuantity)).toLocaleString()}
                                                </td>
                                                <td className="p-3.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(item.productId)}
                                                        className="text-rose-400 hover:text-rose-300 font-bold p-1 rounded hover:bg-rose-500/10"
                                                        title="Remove item"
                                                    >
                                                        ✕
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TOTAL SUMMARY */}
                        <div className="flex justify-end pt-4 border-t border-slate-800">
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-w-[240px] text-right">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                    Grand Total
                                </span>
                                <span className="text-2xl font-bold text-emerald-400">
                                    Rs. {totalAmount.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* SUBMIT BUTTONS */}
                    <div className="flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.push("/Invoices")}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-3 rounded-xl border border-slate-700 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateMutation.isLoading}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-emerald-900/30 transition-all text-sm"
                        >
                            {updateMutation.isLoading ? "Saving Changes..." : "✓ Save Invoice Changes"}
                        </button>
                    </div>
                </form>
            </div>
                </main>
            </div>
        </div>
    );
}
