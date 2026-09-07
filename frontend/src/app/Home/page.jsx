"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { getItems } from "@/Services/inventoryService";
import { getInvoices } from "@/Services/invoicesService";

import useAuth from "@/hooks/useAuth";
import Sidebar from "@/app/components/Sidebar";
import useSidebarState from "@/hooks/useSidebarState";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";


export default function Home() {

    const router = useRouter();
    const searchInputRef = useRef(null);

    // ==========================================
    // AUTHENTICATION & ROLE
    // ==========================================

    const { checkingAuth, isAdmin, isSalesManager, role } = useAuth();


    // ==========================================
    // STATE
    // ==========================================

    const [products, setProducts] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useSidebarState();
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [selectedDateRange, setSelectedDateRange] = useState("Today");
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        return now.toISOString().split("T")[0];
    });

    // ==========================================
    // GLOBAL KEYBOARD SHORTCUTS
    // ==========================================

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "/" && document.activeElement !== searchInputRef.current) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);


    // ==========================================
    // LOAD DASHBOARD DATA
    // ==========================================

    useEffect(() => {

        if (checkingAuth) {
            return;
        }


        async function loadDashboardData() {

            try {

                setLoading(true);

                const [productRes, invoiceRes] = await Promise.allSettled([
                    getItems(),
                    getInvoices()
                ]);

                const productData =
                    productRes.status === "fulfilled"
                        ? productRes.value
                        : [];

                const invoiceData =
                    invoiceRes.status === "fulfilled"
                        ? invoiceRes.value
                        : [];

                console.log(
                    "Dashboard Products:",
                    productData
                );

                console.log(
                    "Dashboard Invoices:",
                    invoiceData
                );


                setProducts(
                    Array.isArray(productData)
                        ? productData
                        : []
                );

                setInvoices(
                    Array.isArray(invoiceData)
                        ? invoiceData
                        : []
                );

            } catch (error) {

                console.error(
                    "Dashboard data error:",
                    error
                );

            } finally {

                setLoading(false);

            }

        }


        loadDashboardData();

    }, [checkingAuth]);


    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = async () => {

        try {

            const { logout } =
                await import("@/Services/authService");

            await logout();

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        } finally {

            router.replace("/Login");

        }

    };


    // ==========================================
    // AUTH CHECKING
    // ==========================================

    if (checkingAuth) {

        return (

            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

                <div className="text-center">

                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500 mx-auto" />

                    <p className="mt-4 text-slate-400">
                        Checking authentication...
                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex items-center justify-center p-4">

                <div className="text-center space-y-4">

                    <div className="relative w-16 h-16 mx-auto">
                        <div className="w-16 h-16 border-4 border-[#10b981]/20 border-t-[#10b981] rounded-full animate-spin" />
                        <span className="absolute inset-0 flex items-center justify-center text-xl">📦</span>
                    </div>

                    <div>
                        <p className="text-lg font-bold text-[#4edea3] tracking-wide animate-pulse">
                            Loading InvPro SaaS...
                        </p>

                        <p className="text-xs text-[#86948a] mt-1">
                            Preparing real-time inventory & invoices analytics
                        </p>
                    </div>

                </div>

            </div>

        );

    }


    // ==========================================
    // INVENTORY ANALYTICS
    // ==========================================

    const totalProducts =
        products.length;


    const totalStock =
        products.reduce(
            (total, product) => {

                return (
                    total +
                    Number(
                        product.quantity || 0
                    )
                );

            },
            0
        );


    const totalInventoryValue =
        products.reduce(
            (total, product) => {

                return (
                    total +
                    Number(
                        product.quantity || 0
                    ) *
                    Number(
                        product.salePrice ||
                        product.sale_price ||
                        0
                    )
                );

            },
            0
        );


    // ==========================================
    // INVENTORY CHART DATA
    // ==========================================

    const inventoryChartData =
        products.map(
            (product) => ({

                product:
                    product.name,

                purchaseValue:
                    Number(
                        product.quantity || 0
                    ) *
                    Number(
                        product.purchasePrice ||
                        product.purchase_price ||
                        0
                    ),

                sellingValue:
                    Number(
                        product.quantity || 0
                    ) *
                    Number(
                        product.salePrice ||
                        product.sale_price ||
                        0
                    ),

            })
        );


    // ==========================================
    // FILTER INVOICES BY SELECTED DATE / RANGE
    // ==========================================

    const filteredInvoicesByDate = invoices.filter((invoice) => {
        if (selectedDateRange === "All Time") return true;

        const invDateStr = invoice.date || invoice.created_at;
        if (!invDateStr) return true;

        const invDate = new Date(invDateStr);
        const today = new Date();

        if (selectedDateRange === "Today") {
            const todayISO = today.toISOString().split("T")[0];
            return invDateStr.startsWith(todayISO) || invDate.toDateString() === today.toDateString();
        }

        if (selectedDateRange === "Yesterday") {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayISO = yesterday.toISOString().split("T")[0];
            return invDateStr.startsWith(yesterdayISO) || invDate.toDateString() === yesterday.toDateString();
        }

        if (selectedDateRange === "This Week") {
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);
            return invDate >= sevenDaysAgo && invDate <= today;
        }

        if (selectedDateRange === "This Month") {
            return (
                invDate.getMonth() === today.getMonth() &&
                invDate.getFullYear() === today.getFullYear()
            );
        }

        if (selectedDateRange === "Custom" || selectedDate) {
            return (
                invDateStr.startsWith(selectedDate) ||
                invDate.toISOString().split("T")[0] === selectedDate
            );
        }

        return true;
    });


    // ==========================================
    // INVOICE ANALYTICS (DATE-FILTERED)
    // ==========================================

    const totalInvoices =
        filteredInvoicesByDate.length;


    const totalRevenue =
        filteredInvoicesByDate.reduce(
            (total, invoice) => {

                return (
                    total +
                    Number(
                        invoice.total ||
                        invoice.total_amount ||
                        0
                    )
                );

            },
            0
        );


    const averageInvoiceValue =
        totalInvoices > 0
            ? totalRevenue / totalInvoices
            : 0;


    // ==========================================
    // INVOICE REVENUE BY DATE (FILTERED)
    // ==========================================

    const revenueByDate = {};


    filteredInvoicesByDate.forEach(
        (invoice) => {

            const date =
                invoice.date ||
                invoice.created_at ||
                "Unknown";


            const revenue =
                Number(
                    invoice.total ||
                    invoice.total_amount ||
                    0
                );


            if (revenueByDate[date]) {

                revenueByDate[date] +=
                    revenue;

            } else {

                revenueByDate[date] =
                    revenue;

            }

        }
    );


    const revenueChartData =
        Object.entries(
            revenueByDate
        ).map(
            ([date, revenue]) => ({

                date,
                revenue,

            })
        );


    revenueChartData.sort(
        (a, b) =>
            new Date(a.date) -
            new Date(b.date)
    );


    // ==========================================
    // LIVE SEARCH MATCHES
    // ==========================================

    const matchingProducts = searchQuery.trim()
        ? products.filter((p) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    const matchingInvoices = searchQuery.trim()
        ? invoices.filter(
              (inv) =>
                  inv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  String(inv.id).includes(searchQuery)
          )
        : [];


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="min-h-screen bg-[#051424] text-[#d4e4fa]">


            {/* =====================================================
                SIDEBAR
            ===================================================== */}

            <Sidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />


            {/* =====================================================
                TOP BAR (RESPONSIVE)
            ===================================================== */}

            <header
                className={`sticky md:fixed top-0 right-0 w-full ${
                    sidebarCollapsed ? "md:w-full" : "md:w-[calc(100%-260px)]"
                } h-16 bg-[#051424]/90 backdrop-blur-md border-b border-[#3c4a42] flex items-center justify-between px-4 md:px-8 z-30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}
            >

                {/* Desktop Sidebar Toggle Switch */}
                {sidebarCollapsed && (
                    <button
                        onClick={() => setSidebarCollapsed(false)}
                        className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0d1c2d] border border-[#3c4a42] text-[#bbcabf] hover:text-[#4edea3] hover:border-[#10b981]/50 text-xs font-semibold transition-all mr-3 cursor-pointer shadow-md"
                        title="Expand Sidebar Slider"
                    >
                        <svg className="w-4 h-4 text-[#4edea3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                        <span>Sidebar Slider</span>
                    </button>
                )}

                {/* Mobile Menu Button & Brand */}
                <div className="flex items-center gap-3 md:hidden">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-[#bbcabf] hover:text-white text-xl"
                    >
                        ☰
                    </button>
                    <span className="text-base font-bold text-[#4edea3]">InvPro</span>
                </div>

                {/* RESPONSIVE SEARCH INPUT & LIVE POPUP */}
                <div className="flex-1 max-w-sm md:max-w-md mx-2 relative">

                    <div className="relative">

                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86948a]">
                            🔍
                        </span>

                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search inventory, invoices..."
                            className="w-full bg-[#0d1c2d] border border-[#3c4a42] rounded-lg text-sm text-[#d4e4fa] placeholder-[#86948a] pl-10 pr-4 py-2 outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                        />

                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86948a] hover:text-white text-xs font-bold"
                            >
                                ✕
                            </button>
                        )}

                    </div>

                    {/* LIVE SEARCH DROPDOWN POPUP */}
                    {searchQuery.trim() && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d1c2d] border border-[#3c4a42] rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                            {matchingProducts.length === 0 && matchingInvoices.length === 0 ? (
                                <div className="p-4 text-xs text-[#86948a] text-center">
                                    No products or invoices found matching "{searchQuery}".
                                </div>
                            ) : (
                                <div className="p-2 space-y-3">
                                    {/* PRODUCTS MATCHES */}
                                    {matchingProducts.length > 0 && (
                                        <div>
                                            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#86948a]">
                                                Matching Products ({matchingProducts.length})
                                            </div>
                                            {matchingProducts.slice(0, 5).map((prod) => (
                                                <div
                                                    key={prod.id}
                                                    onClick={() => {
                                                        setSearchQuery("");
                                                        router.push("/Inventory");
                                                    }}
                                                    className="px-3 py-2 hover:bg-[#1c2b3c] rounded-lg cursor-pointer flex items-center justify-between transition-colors"
                                                >
                                                    <div>
                                                        <p className="text-xs font-semibold text-white">{prod.name}</p>
                                                        <p className="text-[10px] text-[#86948a]">Stock: {prod.quantity} units</p>
                                                    </div>
                                                    <span className="text-xs font-bold text-[#4edea3]">
                                                        Rs. {Number(prod.salePrice || prod.sale_price || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* INVOICES MATCHES */}
                                    {matchingInvoices.length > 0 && (
                                        <div className="border-t border-[#3c4a42]/50 pt-2">
                                            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#86948a]">
                                                Matching Invoices ({matchingInvoices.length})
                                            </div>
                                            {matchingInvoices.slice(0, 5).map((inv) => (
                                                <div
                                                    key={inv.id}
                                                    onClick={() => {
                                                        setSearchQuery("");
                                                        router.push(`/Invoices/View/${inv.id}`);
                                                    }}
                                                    className="px-3 py-2 hover:bg-[#1c2b3c] rounded-lg cursor-pointer flex items-center justify-between transition-colors"
                                                >
                                                    <div>
                                                        <p className="text-xs font-semibold text-white">Invoice #{inv.id} — {inv.customerName}</p>
                                                        <p className="text-[10px] text-[#86948a]">{inv.date || "Date N/A"}</p>
                                                    </div>
                                                    <span className="text-xs font-bold text-[#4edea3]">
                                                        Rs. {Number(inv.total || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                </div>


                {/* TOP BAR ACTIONS */}
                <div className="hidden sm:flex items-center gap-4 ml-4">

                    <button
                        onClick={() => router.push("/Reports")}
                        className="text-[#bbcabf] hover:text-[#4edea3] text-sm font-semibold flex items-center gap-1"
                    >
                        <span>📊</span> Reports
                    </button>

                    <button
                        onClick={() => router.push("/Settings")}
                        className="text-[#bbcabf] hover:text-[#4edea3] text-sm font-semibold flex items-center gap-1"
                    >
                        <span>⚙</span> Settings
                    </button>

                    <div className="h-6 w-px bg-[#3c4a42]" />

                    <button
                        onClick={() =>
                            router.push("/Invoices")
                        }
                        className="bg-[#10b981] hover:bg-[#059669] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#10b981]/20 transition-all"
                    >
                        <span>+</span> New Entry
                    </button>

                </div>

            </header>

            {/* MOBILE MENU DRAWER */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed top-16 left-0 right-0 bg-[#0d1c2d] border-b border-[#3c4a42] p-4 space-y-2 z-40 shadow-2xl">
                    <button
                        onClick={() => {
                            setMobileMenuOpen(false);
                            router.push("/Home");
                        }}
                        className="w-full text-left py-2 px-3 text-[#4edea3] font-semibold flex items-center gap-2"
                    >
                        <span>▦</span> Dashboard
                    </button>
                    <button
                        onClick={() => {
                            setMobileMenuOpen(false);
                            router.push("/Inventory");
                        }}
                        className="w-full text-left py-2 px-3 text-[#bbcabf] hover:text-white flex items-center gap-2"
                    >
                        <span>📦</span> Inventory
                    </button>
                    <button
                        onClick={() => {
                            setMobileMenuOpen(false);
                            router.push("/Invoices");
                        }}
                        className="w-full text-left py-2 px-3 text-[#bbcabf] hover:text-white flex items-center gap-2"
                    >
                        <span>🧾</span> Invoicing
                    </button>
                    <button
                        onClick={() => {
                            setMobileMenuOpen(false);
                            router.push("/Reports");
                        }}
                        className="w-full text-left py-2 px-3 text-[#bbcabf] hover:text-white flex items-center gap-2"
                    >
                        <span>📊</span> Reports
                    </button>
                    <button
                        onClick={() => {
                            setMobileMenuOpen(false);
                            router.push("/Settings");
                        }}
                        className="w-full text-left py-2 px-3 text-[#bbcabf] hover:text-white flex items-center gap-2"
                    >
                        <span>⚙</span> Settings
                    </button>
                    <div className="border-t border-[#3c4a42]/50 pt-2">
                        <button
                            onClick={logout}
                            className="w-full text-left py-2 px-3 text-[#ffb4ab] font-semibold flex items-center gap-2"
                        >
                            <span>↪</span> Logout
                        </button>
                    </div>
                </div>
            )}


            {/* =====================================================
                MAIN CONTENT
            ===================================================== */}

            <main
                className={`${
                    sidebarCollapsed ? "md:ml-0" : "md:ml-[260px]"
                } md:pt-16 min-h-screen p-4 md:p-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}
            >


                {/* WELCOME */}

                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                    <div>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#d4e4fa]">
                            Dashboard Overview
                        </h2>

                        <p className="text-xs sm:text-sm md:text-base text-[#bbcabf] mt-1">
                            Here's what's happening with your inventory and invoices today.
                        </p>

                        {selectedDateRange !== "All Time" && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-[#86948a]">
                                <span>Showing data for: <strong className="text-[#4edea3]">{selectedDateRange} ({selectedDate})</strong></span>
                                <button
                                    onClick={() => {
                                        setSelectedDateRange("All Time");
                                        setSelectedDate(new Date().toISOString().split("T")[0]);
                                    }}
                                    className="text-[#4edea3] hover:underline font-semibold ml-1 cursor-pointer"
                                >
                                    Reset to All Time
                                </button>
                            </div>
                        )}

                    </div>


                    {/* RESPONSIVE TODAY & CALENDAR DROPDOWN */}
                    <div className="relative w-full sm:w-auto">
                        <button
                            onClick={() => setCalendarOpen(!calendarOpen)}
                            className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2.5 text-xs sm:text-sm text-[#4edea3] bg-[#0d1c2d] hover:bg-[#1c2b3c] px-3.5 py-2 rounded-xl border border-[#3c4a42] hover:border-[#10b981]/40 transition-all shadow-md cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                <span>📅</span>
                                <span className="font-semibold">
                                    {selectedDateRange === "All Time" ? "All Time Data" : `${selectedDateRange} (${selectedDate})`}
                                </span>
                            </span>
                            <span className="text-[10px] text-[#86948a]">{calendarOpen ? "▲" : "▼"}</span>
                        </button>

                        {calendarOpen && (
                            <div className="absolute right-0 sm:right-0 top-full mt-2 w-full sm:w-80 bg-[#0d1c2d] border border-[#3c4a42] rounded-2xl shadow-2xl p-4 z-50 text-xs text-[#d4e4fa]">
                                <div className="flex items-center justify-between border-b border-[#3c4a42]/60 pb-3 mb-3">
                                    <span className="font-bold text-white flex items-center gap-1.5">
                                        <span>🗓</span> Select Date Filter
                                    </span>
                                    <button
                                        onClick={() => setCalendarOpen(false)}
                                        className="text-[#86948a] hover:text-white font-bold text-xs"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Quick Range Selector Buttons */}
                                <div className="grid grid-cols-2 gap-1.5 mb-4">
                                    {["Today", "Yesterday", "This Week", "This Month", "All Time"].map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => {
                                                setSelectedDateRange(range);
                                                if (range === "Today") {
                                                    setSelectedDate(new Date().toISOString().split("T")[0]);
                                                } else if (range === "Yesterday") {
                                                    const y = new Date();
                                                    y.setDate(y.getDate() - 1);
                                                    setSelectedDate(y.toISOString().split("T")[0]);
                                                }
                                                setCalendarOpen(false);
                                            }}
                                            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all text-center ${
                                                selectedDateRange === range
                                                    ? "bg-[#10b981] text-white shadow-md"
                                                    : "bg-[#051424] text-[#bbcabf] hover:bg-[#1c2b3c] hover:text-white"
                                            } ${range === "All Time" ? "col-span-2" : ""}`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>

                                {/* Interactive Custom Date Picker */}
                                <div className="border-t border-[#3c4a42]/60 pt-3 space-y-2">
                                    <label className="block text-[11px] font-semibold text-[#86948a] uppercase">
                                        Pick Specific Custom Date
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => {
                                            setSelectedDate(e.target.value);
                                            setSelectedDateRange("Custom");
                                        }}
                                        className="w-full bg-[#051424] border border-[#3c4a42] rounded-lg px-3 py-2 text-xs text-[#d4e4fa] outline-none focus:border-[#10b981]"
                                    />
                                </div>

                                <div className="mt-4 pt-2 border-t border-[#3c4a42]/40 flex justify-end">
                                    <button
                                        onClick={() => setCalendarOpen(false)}
                                        className="bg-[#10b981] hover:bg-[#059669] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold"
                                    >
                                        Apply Filter
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>


                {/* =====================================================
                    METRIC CARDS
                ===================================================== */}

                {isAdmin ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                        {/* INVENTORY VALUE (ADMIN ONLY) */}
                        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#475569]/30 relative overflow-hidden hover:border-[#10b981]/50 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
                                    Total Inventory Value (Purchase)
                                </p>
                                <div className="w-8 h-8 rounded-full bg-[#10b981]/10 flex items-center justify-center">
                                    💰
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-[#d4e4fa]">
                                Rs. {totalInventoryValue.toLocaleString()}
                            </h3>
                            <p className="text-xs text-[#4edea3] mt-2">
                                Purchase cost valuation
                            </p>
                        </div>

                        {/* STOCK */}
                        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#475569]/30 relative overflow-hidden hover:border-[#ffb95f]/50 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
                                    Available Stock Items
                                </p>
                                <div className="w-8 h-8 rounded-full bg-[#ffb95f]/10 flex items-center justify-center">
                                    📦
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-[#d4e4fa]">
                                {totalStock.toLocaleString()}
                            </h3>
                            <p className="text-xs text-[#ffb95f] mt-2">
                                {totalProducts} product types
                            </p>
                        </div>

                        {/* INVOICES */}
                        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#475569]/30 relative overflow-hidden hover:border-[#ffb4ab]/50 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
                                    Total Invoices
                                </p>
                                <div className="w-8 h-8 rounded-full bg-[#ffb4ab]/10 flex items-center justify-center">
                                    🧾
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-[#d4e4fa]">
                                {totalInvoices}
                            </h3>
                            <p className="text-xs text-[#ffb4ab] mt-2">
                                Invoices recorded
                            </p>
                        </div>

                        {/* REVENUE (ADMIN ONLY) */}
                        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#475569]/30 relative overflow-hidden hover:border-[#71a1ff]/50 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
                                    Total Revenue
                                </p>
                                <div className="w-8 h-8 rounded-full bg-[#71a1ff]/10 flex items-center justify-center">
                                    💳
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-[#d4e4fa]">
                                Rs. {totalRevenue.toLocaleString()}
                            </h3>
                            <p className="text-xs text-[#4edea3] mt-2">
                                Revenue generated
                            </p>
                        </div>

                    </div>
                ) : (
                    /* SALES MANAGER OPERATIONAL METRICS */
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

                        {/* STOCK */}
                        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#475569]/30 relative overflow-hidden hover:border-[#ffb95f]/50 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
                                    Available Stock Items
                                </p>
                                <div className="w-8 h-8 rounded-full bg-[#ffb95f]/10 flex items-center justify-center">
                                    📦
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-[#d4e4fa]">
                                {totalStock.toLocaleString()}
                            </h3>
                            <p className="text-xs text-[#ffb95f] mt-2">
                                Total units in inventory
                            </p>
                        </div>

                        {/* INVOICES */}
                        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#475569]/30 relative overflow-hidden hover:border-[#ffb4ab]/50 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
                                    Total Invoices Generated
                                </p>
                                <div className="w-8 h-8 rounded-full bg-[#ffb4ab]/10 flex items-center justify-center">
                                    🧾
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-[#d4e4fa]">
                                {totalInvoices}
                            </h3>
                            <p className="text-xs text-[#ffb4ab] mt-2">
                                Active customer invoices
                            </p>
                        </div>

                        {/* PRODUCT TYPES */}
                        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#475569]/30 relative overflow-hidden hover:border-[#10b981]/50 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
                                    Product Catalogue
                                </p>
                                <div className="w-8 h-8 rounded-full bg-[#10b981]/10 flex items-center justify-center">
                                    📋
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-[#d4e4fa]">
                                {totalProducts}
                            </h3>
                            <p className="text-xs text-[#4edea3] mt-2">
                                Available product models
                            </p>
                        </div>

                    </div>
                )}


                {/* =====================================================
                    SECONDARY METRICS & QUICK ACTIONS
                ===================================================== */}

                {isAdmin ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#475569]/30 hover:border-[#10b981]/50 transition-all">
                            <p className="text-xs uppercase tracking-wider font-semibold text-[#bbcabf]">
                                Average Invoice Value
                            </p>
                            <p className="text-2xl font-bold text-[#4edea3] mt-2">
                                Rs. {averageInvoiceValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#475569]/30 hover:border-[#10b981]/50 transition-all">
                            <p className="text-xs uppercase tracking-wider font-semibold text-[#bbcabf]">
                                Total Products
                            </p>
                            <p className="text-2xl font-bold text-[#d4e4fa] mt-2">
                                {totalProducts}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-[#0d1c2d] to-[#16273b] border border-[#10b981]/30 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#4edea3] px-2.5 py-1 rounded bg-[#10b981]/10 border border-[#10b981]/30">
                                👤 Sales Manager Workspace
                            </span>
                            <h3 className="text-xl font-bold text-white mt-2">
                                Ready to issue a new retail customer invoice?
                            </h3>
                            <p className="text-xs text-[#bbcabf] mt-1">
                                Create invoices with retail price calculations, discounts, and instant PDF download.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/Invoices")}
                            className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#10b981]/25 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                        >
                            <span>🧾</span> Create New Invoice
                        </button>
                    </div>
                )}


                {/* =====================================================
                    CHARTS (ADMIN FINANCIAL ANALYTICS)
                ===================================================== */}

                {isAdmin && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">

                        {/* INVENTORY CHART */}
                        <div className="bg-[#1e293b] rounded-lg border border-[#475569]/30 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-[#d4e4fa]">
                                Inventory Valuation Trend
                            </h3>
                            <p className="text-sm text-[#bbcabf] mt-1 mb-5">
                                Purchase value vs selling value by product
                            </p>

                            {inventoryChartData.length === 0 ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <p className="text-[#86948a] text-sm">
                                        No inventory data available yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={inventoryChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                            <CartesianGrid stroke="#3c4a42" strokeDasharray="3 3" />
                                            <XAxis dataKey="product" tick={{ fill: "#86948a", fontSize: 11 }} axisLine={{ stroke: "#3c4a42" }} tickLine={false} />
                                            <YAxis tick={{ fill: "#86948a", fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: "#0d1c2d", border: "1px solid #3c4a42", borderRadius: "8px", color: "#d4e4fa" }} formatter={(value, name) => [`Rs. ${Number(value || 0).toLocaleString()}`, name]} />
                                            <Line type="monotone" dataKey="purchaseValue" name="Purchase Cost Value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="sellingValue" name="Selling Retail Value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981" }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        {/* REVENUE CHART */}
                        <div className="bg-[#1e293b] rounded-lg border border-[#475569]/30 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-[#d4e4fa]">
                                Revenue Trend
                            </h3>
                            <p className="text-sm text-[#bbcabf] mt-1 mb-5">
                                Revenue generated over time
                            </p>

                            {revenueChartData.length === 0 ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <p className="text-[#86948a] text-sm">
                                        No invoice data available yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={revenueChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                            <CartesianGrid stroke="#3c4a42" strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tick={{ fill: "#86948a", fontSize: 11 }} axisLine={{ stroke: "#3c4a42" }} tickLine={false} />
                                            <YAxis tick={{ fill: "#86948a", fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: "#0d1c2d", border: "1px solid #3c4a42", borderRadius: "8px", color: "#d4e4fa" }} formatter={(value) => `Rs. ${Number(value || 0).toLocaleString()}`} />
                                            <Line type="monotone" dataKey="revenue" stroke="#4edea3" strokeWidth={3} dot={{ r: 4, fill: "#4edea3" }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                    </div>
                )}


                {/* =====================================================
                    QUICK ACTIONS
                ===================================================== */}

                <div className="bg-[#1e293b] border border-[#475569]/30 rounded-lg p-6 mb-8">

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                        <div>

                            <h3 className="text-lg font-semibold text-[#d4e4fa]">
                                Quick Actions
                            </h3>

                            <p className="text-sm text-[#bbcabf] mt-1">
                                Manage your inventory and invoices
                            </p>

                        </div>


                        <div className="flex flex-wrap justify-center gap-3">

                            <button
                                onClick={() =>
                                    router.push("/Inventory")
                                }
                                className="bg-[#10b981] hover:bg-[#059669] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
                            >
                                Inventory Management
                            </button>


                            <button
                                onClick={() =>
                                    router.push("/Invoices")
                                }
                                className="bg-[#122131] hover:bg-[#1c2b3c] border border-[#3c4a42] text-[#d4e4fa] font-semibold px-5 py-2.5 rounded-lg transition-colors"
                            >
                                Invoice Management
                            </button>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    BOTTOM ACTIONS
                ===================================================== */}

                <div className="flex flex-wrap justify-center gap-3 pb-8">

                    <button
                        onClick={logout}
                        className="border border-[#ffb4ab]/30 bg-[#ffb4ab]/5 hover:bg-[#ffb4ab]/10 text-[#ffb4ab] font-medium px-5 py-2 rounded-lg transition-colors"
                    >
                        Logout
                    </button>


                    <button
                        onClick={() =>
                            router.push("/")
                        }
                        className="border border-[#3c4a42] bg-[#122131] hover:bg-[#1c2b3c] text-[#d4e4fa] font-medium px-5 py-2 rounded-lg transition-colors"
                    >
                        Go to Main Page
                    </button>

                </div>

            </main>

        </div>

    );

}