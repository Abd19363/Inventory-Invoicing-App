"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { isAuthenticated } from "@/Services/authService";
import { getItems } from "@/Services/inventoryService";
import { getInvoices } from "@/Services/invoicesService";

import useAuth from "@/hooks/useAuth";

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
    useAuth();

    const router = useRouter();

    // ==========================================
    // STATE
    // ==========================================

    const [products, setProducts] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // AUTHENTICATION
    // ==========================================

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn");

        if (!isLoggedIn) {
            router.push("/Login");
        }
    }, [router]);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/Login");
        }
    }, [router]);

    // ==========================================
    // LOAD DASHBOARD DATA
    // ==========================================

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const productData = await getItems();
                const invoiceData = await getInvoices();

                console.log("Dashboard Products:", productData);
                console.log("Dashboard Invoices:", invoiceData);

                setProducts(productData);
                setInvoices(invoiceData);
            } catch (error) {
                console.error("Dashboard data error:", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {
        localStorage.removeItem("isLoggedIn");
        router.push("/Login");
    };

    // ==========================================
    // INVENTORY ANALYTICS
    // ==========================================

    const totalProducts = products.length;

    const totalStock = products.reduce((total, product) => {
        return total + Number(product.quantity || 0);
    }, 0);

    const totalInventoryValue = products.reduce((total, product) => {
        return (
            total +
            Number(product.quantity || 0) *
            Number(product.priceperquantity || 0)
        );
    }, 0);

    // ==========================================
    // INVENTORY CHART DATA
    // ==========================================

    const inventoryChartData = products.map((product) => ({
        product: product.name,

        purchaseValue:
            Number(product.quantity || 0) *
            Number(product.purchasePrice || 0),

        sellingValue:
            Number(product.quantity || 0) *
            Number(product.salePrice || 0),
    }));

    // ==========================================
    // INVOICE ANALYTICS
    // ==========================================

    const totalInvoices = invoices.length;

    const totalRevenue = invoices.reduce((total, invoice) => {
        return total + Number(invoice.total || 0);
    }, 0);

    const averageInvoiceValue =
        totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    // ==========================================
    // INVOICE REVENUE BY DATE
    // ==========================================

    const revenueByDate = {};

    invoices.forEach((invoice) => {
        const date = invoice.date;
        const revenue = Number(invoice.total || 0);

        if (revenueByDate[date]) {
            revenueByDate[date] += revenue;
        } else {
            revenueByDate[date] = revenue;
        }
    });

    const revenueChartData = Object.entries(revenueByDate).map(
        ([date, revenue]) => ({
            date,
            revenue,
        })
    );

    revenueChartData.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">📦</div>

                    <p className="text-lg font-semibold text-[#4edea3]">
                        Loading Dashboard...
                    </p>

                    <p className="text-sm text-[#86948a] mt-2">
                        Preparing your inventory and invoice data
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="min-h-screen bg-[#051424] text-[#d4e4fa]">

            {/* =====================================================
          SIDEBAR
      ===================================================== */}

            <aside className="fixed left-0 top-0 hidden md:flex h-screen w-[260px] flex-col bg-[#0d1c2d] border-r border-[#3c4a42] z-40">

                {/* Logo */}
                <div className="px-6 py-6 flex items-center gap-3">

                    <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center">

                        <span className="text-xl">
                            📦
                        </span>

                    </div>

                    <div>
                        <h1 className="text-lg font-bold text-[#4edea3]">
                            InvPro SaaS
                        </h1>

                        <p className="text-xs text-[#86948a]">
                            Enterprise Edition
                        </p>
                    </div>

                </div>


                {/* Create Invoice */}
                <div className="px-6 mb-6">

                    <button
                        onClick={() => router.push("/Invoices")}
                        className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#10b981]/10"
                    >
                        <span>🧾</span>
                        Create Invoice
                    </button>

                </div>


                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1">

                    {/* Dashboard */}
                    <button
                        onClick={() => router.push("/Home")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-r-lg text-[#4edea3] font-semibold border-r-2 border-[#4edea3] bg-[#4edea3]/5 text-left"
                    >
                        <span>▦</span>
                        Dashboard
                    </button>


                    {/* Inventory */}
                    <button
                        onClick={() => router.push("/Inventory")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#bbcabf] hover:bg-[#1c2b3c] hover:text-white transition-colors text-left"
                    >
                        <span>📦</span>
                        Inventory
                    </button>


                    {/* Invoicing */}
                    <button
                        onClick={() => router.push("/Invoices")}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#bbcabf] hover:bg-[#1c2b3c] hover:text-white transition-colors text-left"
                    >
                        <span>🧾</span>
                        Invoicing
                    </button>


                    {/* Reports */}
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#bbcabf] hover:bg-[#1c2b3c] hover:text-white transition-colors text-left"
                    >
                        <span>📊</span>
                        Reports
                    </button>


                    {/* Settings */}
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#bbcabf] hover:bg-[#1c2b3c] hover:text-white transition-colors text-left"
                    >
                        <span>⚙</span>
                        Settings
                    </button>

                </nav>


                {/* Logout */}
                <div className="px-3 py-5 border-t border-[#3c4a42]/40">

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#bbcabf] hover:bg-[#1c2b3c] hover:text-[#ffb4ab] transition-colors text-left"
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>


            {/* =====================================================
          TOP BAR
      ===================================================== */}

            <header className="fixed top-0 right-0 hidden md:flex h-16 w-[calc(100%-260px)] bg-[#051424]/80 backdrop-blur-md border-b border-[#3c4a42] items-center justify-between px-8 z-30">

                {/* Search */}
                <div className="w-full max-w-md">

                    <div className="relative">

                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86948a]">
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search inventory, invoices..."
                            className="w-full bg-[#0d1c2d] border border-[#3c4a42] rounded-lg text-sm text-[#d4e4fa] placeholder-[#86948a] pl-10 pr-4 py-2.5 outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
                        />

                    </div>

                </div>


                {/* Right Actions */}
                <div className="flex items-center gap-4 ml-6">

                    <button className="text-[#bbcabf] hover:text-[#4edea3] text-xl">
                        🔔
                    </button>

                    <button className="text-[#bbcabf] hover:text-[#4edea3] text-xl">
                        ?
                    </button>

                    <div className="h-6 w-px bg-[#3c4a42]" />

                    <button className="text-sm text-[#bbcabf] hover:text-white">
                        Support
                    </button>

                    <button
                        onClick={() => router.push("/Invoices")}
                        className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                    >
                        <span>+</span>
                        New Entry
                    </button>

                </div>

            </header>


            {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

            <main className="md:ml-[260px] md:pt-16 min-h-screen p-4 md:p-8">

                {/* =====================================================
            WELCOME SECTION
        ===================================================== */}

                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">

                    <div>

                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#d4e4fa]">
                            Dashboard Overview
                        </h2>

                        <p className="text-sm md:text-base text-[#bbcabf] mt-2">
                            Here's what's happening with your inventory and invoices today.
                        </p>

                    </div>


                    <div className="flex items-center gap-2 text-sm text-[#bbcabf] bg-[#122131] px-3 py-2 rounded-lg border border-[#3c4a42]">
                        <span>📅</span>
                        <span>Today</span>
                    </div>

                </div>


                {/* =====================================================
            METRIC CARDS
        ===================================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                    {/* Total Inventory Value */}
                    <div className="bg-[#1e293b] rounded-lg p-6 border border-[#475569]/30 relative overflow-hidden hover:border-[#10b981]/50 transition-all">

                        <div className="flex justify-between items-start mb-6">

                            <p className="text-xs font-semibold uppercase tracking-wider text-[#bbcabf]">
                                Total Inventory Value
                            </p>

                            <div className="w-8 h-8 rounded-full bg-[#10b981]/10 flex items-center justify-center">
                                💰
                            </div>

                        </div>

                        <h3 className="text-2xl font-bold text-[#d4e4fa]">
                            ${totalInventoryValue.toLocaleString()}
                        </h3>

                        <p className="text-xs text-[#4edea3] mt-2">
                            Current inventory value
                        </p>

                    </div>


                    {/* Stock */}
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


                    {/* Outstanding Invoices */}
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


                    {/* Revenue */}
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
                            ${totalRevenue.toLocaleString()}
                        </h3>

                        <p className="text-xs text-[#4edea3] mt-2">
                            Revenue generated
                        </p>

                    </div>

                </div>


                {/* =====================================================
            SECONDARY METRICS
        ===================================================== */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

                    <div className="bg-[#1e293b] rounded-lg p-6 border border-[#475569]/30 hover:border-[#10b981]/50 transition-all">

                        <p className="text-xs uppercase tracking-wider font-semibold text-[#bbcabf]">
                            Average Invoice Value
                        </p>

                        <p className="text-2xl font-bold text-[#4edea3] mt-2">
                            ${averageInvoiceValue.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                            })}
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


                {/* =====================================================
            CHARTS
        ===================================================== */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">


                    {/* Inventory Chart */}
                    <div className="bg-[#1e293b] rounded-lg border border-[#475569]/30 p-6 shadow-sm">

                        <h3 className="text-lg font-semibold text-[#d4e4fa]">
                            Inventory Trend
                        </h3>

                        <p className="text-sm text-[#bbcabf] mt-1 mb-5">
                            Inventory value by product
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

                                    <LineChart
                                        data={inventoryChartData}
                                        margin={{
                                            top: 5,
                                            right: 10,
                                            left: 0,
                                            bottom: 5,
                                        }}
                                    >

                                        <CartesianGrid
                                            stroke="#3c4a42"
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="product"
                                            tick={{
                                                fill: "#86948a",
                                                fontSize: 11,
                                            }}
                                            axisLine={{
                                                stroke: "#3c4a42",
                                            }}
                                            tickLine={false}
                                        />

                                        <YAxis
                                            tick={{
                                                fill: "#86948a",
                                                fontSize: 11,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />

                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#0d1c2d",
                                                border: "1px solid #3c4a42",
                                                borderRadius: "8px",
                                                color: "#d4e4fa",
                                            }}
                                            formatter={(value, name) => [
                                                `Rs. ${Number(value || 0).toLocaleString()}`,
                                                name
                                            ]}
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="purchaseValue"
                                            name="Purchase Value"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{
                                                r: 4,
                                                fill: "#3b82f6",
                                            }}
                                            activeDot={{
                                                r: 6,
                                            }}
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="sellingValue"
                                            name="Selling Value"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            dot={{
                                                r: 4,
                                                fill: "#10b981",
                                            }}
                                            activeDot={{
                                                r: 6,
                                            }}
                                        />


                                    </LineChart>
                                    

                                </ResponsiveContainer>

                            </div>

                        )}

                    </div>


                    {/* Revenue Chart */}
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

                                    <LineChart
                                        data={revenueChartData}
                                        margin={{
                                            top: 5,
                                            right: 10,
                                            left: 0,
                                            bottom: 5,
                                        }}
                                    >

                                        <CartesianGrid
                                            stroke="#3c4a42"
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="date"
                                            tick={{
                                                fill: "#86948a",
                                                fontSize: 11,
                                            }}
                                            axisLine={{
                                                stroke: "#3c4a42",
                                            }}
                                            tickLine={false}
                                        />

                                        <YAxis
                                            tick={{
                                                fill: "#86948a",
                                                fontSize: 11,
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />

                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#0d1c2d",
                                                border: "1px solid #3c4a42",
                                                borderRadius: "8px",
                                                color: "#d4e4fa",
                                            }}
                                            formatter={(value) =>
                                                Number(value).toLocaleString()
                                            }
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#4edea3"
                                            strokeWidth={3}
                                            dot={{
                                                r: 4,
                                                fill: "#4edea3",
                                            }}
                                            activeDot={{
                                                r: 6,
                                            }}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            </div>

                        )}

                    </div>

                </div>


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
                                onClick={() => router.push("/Inventory")}
                                className="bg-[#10b981] hover:bg-[#059669] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
                            >
                                Inventory Management
                            </button>


                            <button
                                onClick={() => router.push("/Invoices")}
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
                        onClick={() => router.push("/")}
                        className="border border-[#3c4a42] bg-[#122131] hover:bg-[#1c2b3c] text-[#d4e4fa] font-medium px-5 py-2 rounded-lg transition-colors"
                    >
                        Go to Main Page
                    </button>

                </div>

            </main>

        </div>
    );
}