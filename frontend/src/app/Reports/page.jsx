"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { getInvoices, viewInvoicePdf } from "@/Services/invoicesService";
import { getItems } from "@/Services/inventoryService";
import Sidebar from "@/app/components/Sidebar";
import useSidebarState from "@/hooks/useSidebarState";

export default function ReportsPage() {
    const { checkingAuth, isAdmin } = useAuth();
    const router = useRouter();
    const [invoices, setInvoices] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useSidebarState();

    function Router() {
        return useRouter();
    }

    useEffect(() => {
        if (checkingAuth) return;

        async function loadReportData() {
            try {
                setLoading(true);
                const [invRes, prodRes] = await Promise.allSettled([
                    getInvoices(),
                    getItems(),
                ]);

                setInvoices(
                    invRes.status === "fulfilled" && Array.isArray(invRes.value)
                        ? invRes.value
                        : []
                );
                setProducts(
                    prodRes.status === "fulfilled" && Array.isArray(prodRes.value)
                        ? prodRes.value
                        : []
                );
            } catch (err) {
                console.error("Error loading report data:", err);
            } finally {
                setLoading(false);
            }
        }

        loadReportData();
    }, [checkingAuth]);

    const logout = async () => {
        try {
            const { logout: authLogout } = await import("@/Services/authService");
            await authLogout();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            router.replace("/Login");
        }
    };

    if (checkingAuth || loading) {
        return (
            <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-bounce">📊</div>
                    <p className="text-lg font-semibold text-[#4edea3]">Loading Reports & Analytics...</p>
                </div>
            </div>
        );
    }

    // Filtered Invoices
    const filteredInvoices = invoices.filter((inv) => {
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "paid" && inv.status === "paid") ||
            (statusFilter === "unpaid" && inv.status !== "paid");

        const matchesSearch =
            !searchQuery ||
            inv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(inv.id).includes(searchQuery);

        return matchesStatus && matchesSearch;
    });

    // Report Aggregations
    const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    const paidRevenue = invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    const unpaidRevenue = invoices
        .filter((inv) => inv.status !== "paid")
        .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

    const totalStockValue = products.reduce(
        (sum, p) => sum + (Number(p.quantity) || 0) * (Number(p.salePrice || p.purchasePrice) || 0),
        0
    );

    const handlePrintSummary = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex">
            <Sidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* MAIN CONTENT AREA */}
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

                    {/* Responsive Search Input */}
                    <div className="w-full max-w-xs md:max-w-md mx-2">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86948a] text-sm">
                                🔍
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search reports or invoices..."
                                className="w-full bg-[#0d1c2d] border border-[#3c4a42] rounded-lg text-sm text-[#d4e4fa] placeholder-[#86948a] pl-9 pr-4 py-2 outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="hidden sm:flex items-center gap-3">
                        <button
                            onClick={handlePrintSummary}
                            className="bg-[#1c2b3c] hover:bg-[#25374c] text-[#4edea3] border border-[#3c4a42] px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                        >
                            🖨 Print Report
                        </button>
                        <button
                            onClick={() => router.push("/Invoices")}
                            className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-[#10b981]/20"
                        >
                            + New Entry
                        </button>
                    </div>
                </header>

                {/* MOBILE MENU DRAWER */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-[#0d1c2d] border-b border-[#3c4a42] p-4 space-y-2">
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                router.push("/Home");
                            }}
                            className="w-full text-left py-2 px-3 text-[#bbcabf] hover:text-white"
                        >
                            ▦ Dashboard
                        </button>
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                router.push("/Inventory");
                            }}
                            className="w-full text-left py-2 px-3 text-[#bbcabf] hover:text-white"
                        >
                            📦 Inventory
                        </button>
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                router.push("/Invoices");
                            }}
                            className="w-full text-left py-2 px-3 text-[#bbcabf] hover:text-white"
                        >
                            🧾 Invoicing
                        </button>
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                router.push("/Reports");
                            }}
                            className="w-full text-left py-2 px-3 text-[#4edea3] font-semibold"
                        >
                            📊 Reports
                        </button>
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                router.push("/Settings");
                            }}
                            className="w-full text-left py-2 px-3 text-[#bbcabf] hover:text-white"
                        >
                            ⚙ Settings
                        </button>
                    </div>
                )}

                {/* BODY CONTENT */}
                <main className="p-4 md:p-8 space-y-8 flex-1">
                    {/* TITLE */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                                Reports & PDF Exports Hub
                            </h1>
                            <p className="text-sm text-[#86948a] mt-1">
                                Stream invoice PDFs directly, analyze sales revenue, and export financial summaries.
                            </p>
                        </div>

                        <button
                            onClick={handlePrintSummary}
                            className="sm:hidden w-full bg-[#10b981] hover:bg-[#059669] text-white py-2.5 rounded-lg text-sm font-semibold text-center"
                        >
                            🖨 Print Executive Summary
                        </button>
                    </div>

                    {/* KPI CARDS (ADMIN vs SALES MANAGER) */}
                    {isAdmin ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-[#0d1c2d] border border-[#3c4a42] p-5 rounded-xl">
                                <p className="text-xs text-[#86948a] uppercase font-semibold">Total Sales Revenue</p>
                                <p className="text-2xl font-bold text-[#4edea3] mt-2">Rs. {totalRevenue.toLocaleString()}</p>
                                <p className="text-xs text-[#86948a] mt-1">{invoices.length} Invoices generated</p>
                            </div>
                            <div className="bg-[#0d1c2d] border border-[#3c4a42] p-5 rounded-xl">
                                <p className="text-xs text-[#86948a] uppercase font-semibold">Paid Collected Revenue</p>
                                <p className="text-2xl font-bold text-[#71a1ff] mt-2">Rs. {paidRevenue.toLocaleString()}</p>
                                <p className="text-xs text-[#86948a] mt-1">
                                    {invoices.filter((i) => i.status === "paid").length} Paid invoices
                                </p>
                            </div>
                            <div className="bg-[#0d1c2d] border border-[#3c4a42] p-5 rounded-xl">
                                <p className="text-xs text-[#86948a] uppercase font-semibold">Outstanding Unpaid</p>
                                <p className="text-2xl font-bold text-[#ffb95f] mt-2">Rs. {unpaidRevenue.toLocaleString()}</p>
                                <p className="text-xs text-[#86948a] mt-1">Pending payments</p>
                            </div>
                            <div className="bg-[#0d1c2d] border border-[#3c4a42] p-5 rounded-xl">
                                <p className="text-xs text-[#86948a] uppercase font-semibold">Inventory Valuation</p>
                                <p className="text-2xl font-bold text-[#e2e8f0] mt-2">Rs. {totalStockValue.toLocaleString()}</p>
                                <p className="text-xs text-[#86948a] mt-1">{products.length} Product SKUs</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-[#0d1c2d] border border-[#3c4a42] p-5 rounded-xl">
                                <p className="text-xs text-[#86948a] uppercase font-semibold">Invoices Streamed</p>
                                <p className="text-2xl font-bold text-[#4edea3] mt-2">{invoices.length}</p>
                                <p className="text-xs text-[#86948a] mt-1">Customer Statements</p>
                            </div>
                            <div className="bg-[#0d1c2d] border border-[#3c4a42] p-5 rounded-xl">
                                <p className="text-xs text-[#86948a] uppercase font-semibold">Paid Statements</p>
                                <p className="text-2xl font-bold text-[#71a1ff] mt-2">
                                    {invoices.filter((i) => i.status === "paid").length}
                                </p>
                                <p className="text-xs text-[#86948a] mt-1">Cleared Invoices</p>
                            </div>
                            <div className="bg-[#0d1c2d] border border-[#3c4a42] p-5 rounded-xl">
                                <p className="text-xs text-[#86948a] uppercase font-semibold">Product Catalog SKUs</p>
                                <p className="text-2xl font-bold text-[#e2e8f0] mt-2">{products.length}</p>
                                <p className="text-xs text-[#86948a] mt-1">Active items</p>
                            </div>
                        </div>
                    )}

                    {/* INVOICE PDF GENERATION SECTION */}
                    <div className="bg-[#0d1c2d] border border-[#3c4a42] rounded-xl p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3c4a42]/60 pb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span>📄</span> Invoice PDF Reports & Streamer
                                </h2>
                                <p className="text-xs text-[#86948a] mt-0.5">
                                    Click any invoice below to generate and view its official PDF statement inline.
                                </p>
                            </div>

                            {/* FILTER BUTTONS */}
                            <div className="flex items-center gap-2 bg-[#051424] p-1 rounded-lg border border-[#3c4a42]">
                                <button
                                    onClick={() => setStatusFilter("all")}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                        statusFilter === "all" ? "bg-[#10b981] text-white" : "text-[#bbcabf] hover:text-white"
                                    }`}
                                >
                                    All ({invoices.length})
                                </button>
                                <button
                                    onClick={() => setStatusFilter("paid")}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                        statusFilter === "paid" ? "bg-[#10b981] text-white" : "text-[#bbcabf] hover:text-white"
                                    }`}
                                >
                                    Paid
                                </button>
                                <button
                                    onClick={() => setStatusFilter("unpaid")}
                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                        statusFilter === "unpaid" ? "bg-[#10b981] text-white" : "text-[#bbcabf] hover:text-white"
                                    }`}
                                >
                                    Unpaid
                                </button>
                            </div>
                        </div>

                        {/* INVOICES PDF TABLE */}
                        {filteredInvoices.length === 0 ? (
                            <div className="text-center py-12 text-[#86948a] text-sm">
                                No invoices found matching your criteria.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#3c4a42] text-xs uppercase text-[#86948a] tracking-wider">
                                            <th className="py-3 px-4">Invoice ID</th>
                                            <th className="py-3 px-4">Customer</th>
                                            <th className="py-3 px-4">Date</th>
                                            <th className="py-3 px-4">Status</th>
                                            <th className="py-3 px-4 text-right">Amount</th>
                                            <th className="py-3 px-4 text-center">PDF Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#3c4a42]/40 text-[#d4e4fa]">
                                        {filteredInvoices.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-[#1c2b3c]/60 transition-colors">
                                                <td className="py-3.5 px-4 font-medium text-emerald-400">
                                                    #{inv.id}
                                                </td>
                                                <td className="py-3.5 px-4 font-semibold text-white">
                                                    {inv.customerName || "N/A"}
                                                </td>
                                                <td className="py-3.5 px-4 text-[#86948a] text-xs">
                                                    {inv.date || "N/A"}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            inv.status === "paid"
                                                                ? "bg-[#10b981]/15 text-[#4edea3] border border-[#10b981]/30"
                                                                : "bg-[#ffb95f]/15 text-[#ffb95f] border border-[#ffb95f]/30"
                                                        }`}
                                                    >
                                                        {inv.status === "paid" ? "✓ Paid" : "⏳ Unpaid"}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-bold text-white">
                                                    Rs. {Number(inv.total || 0).toLocaleString()}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <button
                                                        onClick={() => viewInvoicePdf(inv.id)}
                                                        className="bg-[#10b981] hover:bg-[#059669] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 mx-auto transition-all shadow-md shadow-[#10b981]/20 cursor-pointer"
                                                    >
                                                        <span>📄</span> View PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
