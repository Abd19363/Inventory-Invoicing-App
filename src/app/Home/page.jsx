"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { isAuthenticated } from "@/Services/authService";
import { getItems } from "@/Services/inventoryService";
import { getInvoices } from "@/Services/invoicesService";

import useAuth from "@/hooks/useAuth";

import Header from "../components/Header";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
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

                console.log(
                    "Dashboard Products:",
                    productData
                );

                console.log(
                    "Dashboard Invoices:",
                    invoiceData
                );

                setProducts(productData);
                setInvoices(invoiceData);

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


    const totalStock = products.reduce(
        (total, product) => {

            return total + Number(
                product.quantity || 0
            );

        },
        0
    );


    const totalInventoryValue = products.reduce(
        (total, product) => {

            return (
                total +
                Number(product.quantity || 0) *
                Number(product.priceperquantity || 0)
            );

        },
        0
    );


    // ==========================================
    // INVENTORY CHART DATA
    // ==========================================

    const inventoryChartData = products.map(
        (product) => ({

            product: product.name,

            inventoryValue:
                Number(product.quantity || 0) *
                Number(product.priceperquantity || 0)

        })
    );


    // ==========================================
    // INVOICE ANALYTICS
    // ==========================================

    const totalInvoices = invoices.length;


    const totalRevenue = invoices.reduce(
        (total, invoice) => {

            return (
                total +
                Number(invoice.total || 0)
            );

        },
        0
    );


    const averageInvoiceValue =
        totalInvoices > 0
            ? totalRevenue / totalInvoices
            : 0;


    // ==========================================
    // INVOICE REVENUE BY DATE
    // ==========================================

    const revenueByDate = {};


    invoices.forEach((invoice) => {

        const date = invoice.date;

        const revenue =
            Number(invoice.total || 0);


        if (revenueByDate[date]) {

            revenueByDate[date] += revenue;

        } else {

            revenueByDate[date] = revenue;

        }

    });


    const revenueChartData = Object.entries(
        revenueByDate
    ).map(([date, revenue]) => ({

        date,
        revenue

    }));


    // Sort invoices by date

    revenueChartData.sort(
        (a, b) =>
            new Date(a.date) -
            new Date(b.date)
    );


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="min-h-screen bg-zinc-500">

                <Header />

                <div className="flex justify-center items-center min-h-[80vh]">

                    <p className="text-xl font-semibold text-white">
                        Loading Dashboard...
                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="min-h-screen bg-zinc-500">

            {/* HEADER */}

            <Header />


            <div className="p-8">


                {/* ==================================
                    DASHBOARD TITLE
                ================================== */}

                <div className="mb-8 text-center p-6 rounded-2xl border border-transparent transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-800/40 hover:border-zinc-700/60 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer group">

                    <h1 className="text-4xl font-bold text-white transition-colors duration-300 group-hover:text-emerald-400">
                        Welcome to Dashboard
                    </h1>

                    <p className="text-zinc-200 mt-2 transition-colors duration-300 group-hover:text-zinc-100">
                        Overview of your inventory and invoices
                    </p>

                </div>


                {/* ==================================
                    SUMMARY CARDS
                ================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                    {/* TOTAL PRODUCTS */}
                    <div className="bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-800/80 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-800/80 hover:shadow-2xl hover:shadow-zinc-800/50 cursor-pointer group">
                        <h2 className="text-zinc-400 text-sm font-medium transition-colors duration-300 group-hover:text-zinc-300">
                            Total Products
                        </h2>
                        <p className="text-3xl font-bold text-white mt-2 transition-transform duration-300 group-hover:scale-105 origin-left">
                            {totalProducts}
                        </p>
                    </div>

                    {/* TOTAL STOCK */}
                    <div className="bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-800/80 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-800/80 hover:shadow-2xl hover:shadow-zinc-800/50 cursor-pointer group">
                        <h2 className="text-zinc-400 text-sm font-medium transition-colors duration-300 group-hover:text-zinc-300">
                            Total Stock
                        </h2>
                        <p className="text-3xl font-bold text-white mt-2 transition-transform duration-300 group-hover:scale-105 origin-left">
                            {totalStock}
                        </p>
                    </div>

                    {/* TOTAL INVOICES */}
                    <div className="bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-800/80 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-800/80 hover:shadow-2xl hover:shadow-zinc-800/50 cursor-pointer group">
                        <h2 className="text-zinc-400 text-sm font-medium transition-colors duration-300 group-hover:text-zinc-300">
                            Total Invoices
                        </h2>
                        <p className="text-3xl font-bold text-white mt-2 transition-transform duration-300 group-hover:scale-105 origin-left">
                            {totalInvoices}
                        </p>
                    </div>

                    {/* TOTAL REVENUE */}
                    <div className="bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-800/80 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-zinc-800/80 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer group">
                        <h2 className="text-zinc-400 text-sm font-medium transition-colors duration-300 group-hover:text-emerald-300">
                            Total Revenue
                        </h2>
                        <p className="text-3xl font-bold text-emerald-400 mt-2 transition-transform duration-300 group-hover:scale-105 origin-left">
                            ${totalRevenue.toLocaleString()}
                        </p>
                    </div>

                </div>


                {/* ==================================
    SECONDARY ANALYTICS
================================== */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                    {/* INVENTORY VALUE */}
                    <div className="bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-800/80 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-800/80 hover:shadow-2xl hover:shadow-zinc-800/50 cursor-pointer group">
                        <h2 className="text-zinc-400 text-sm font-medium transition-colors duration-300 group-hover:text-zinc-300">
                            Total Inventory Value
                        </h2>
                        <p className="text-2xl font-bold text-white mt-2 transition-transform duration-300 group-hover:scale-105 origin-left">
                            ${totalInventoryValue.toLocaleString()}
                        </p>
                    </div>

                    {/* AVERAGE INVOICE */}
                    <div className="bg-zinc-900 rounded-xl p-6 shadow-lg border border-zinc-800/80 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-zinc-800/80 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer group">
                        <h2 className="text-zinc-400 text-sm font-medium transition-colors duration-300 group-hover:text-emerald-300">
                            Average Invoice Value
                        </h2>
                        <p className="text-2xl font-bold text-emerald-400 mt-2 transition-transform duration-300 group-hover:scale-105 origin-left">
                            ${averageInvoiceValue.toLocaleString(
                                undefined,
                                {
                                    maximumFractionDigits: 2
                                }
                            )}
                        </p>
                    </div>

                </div>

                {/* ==================================
                    TWO LINE CHARTS
                ================================== */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">


                    {/* ==================================
                        INVENTORY CHART
                    ================================== */}

                    <div className="bg-zinc-900 rounded-xl p-5 shadow-lg">

                        <h2 className="text-lg font-bold text-white mb-1">
                            Inventory Trend
                        </h2>

                        <p className="text-sm text-zinc-400 mb-4">
                            Inventory value by product
                        </p>


                        {inventoryChartData.length === 0 ? (

                            <div className="h-[260px] flex items-center justify-center">

                                <p className="text-zinc-500">
                                    No inventory data available yet.
                                </p>

                            </div>

                        ) : (

                            <div className="w-full h-[260px]">

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <LineChart
                                        data={inventoryChartData}
                                        margin={{
                                            top: 5,
                                            right: 10,
                                            left: 0,
                                            bottom: 5
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="product"
                                            tick={{
                                                fontSize: 11
                                            }}
                                        />

                                        <YAxis
                                            tick={{
                                                fontSize: 11
                                            }}
                                        />

                                        <Tooltip
                                            formatter={(value) =>
                                                Number(
                                                    value
                                                ).toLocaleString()
                                            }
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="inventoryValue"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            dot={{
                                                r: 4
                                            }}
                                            activeDot={{
                                                r: 6
                                            }}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            </div>

                        )}

                    </div>


                    {/* ==================================
                        INVOICE CHART
                    ================================== */}

                    <div className="bg-zinc-900 rounded-xl p-5 shadow-lg">

                        <h2 className="text-lg font-bold text-white mb-1">
                            Invoice Trend
                        </h2>

                        <p className="text-sm text-zinc-400 mb-4">
                            Revenue generated over time
                        </p>


                        {revenueChartData.length === 0 ? (

                            <div className="h-[260px] flex items-center justify-center">

                                <p className="text-zinc-500">
                                    No invoice data available yet.
                                </p>

                            </div>

                        ) : (

                            <div className="w-full h-[260px]">

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <LineChart
                                        data={revenueChartData}
                                        margin={{
                                            top: 5,
                                            right: 10,
                                            left: 0,
                                            bottom: 5
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="date"
                                            tick={{
                                                fontSize: 11
                                            }}
                                        />

                                        <YAxis
                                            tick={{
                                                fontSize: 11
                                            }}
                                        />

                                        <Tooltip
                                            formatter={(value) =>
                                                Number(
                                                    value
                                                ).toLocaleString()
                                            }
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            dot={{
                                                r: 4
                                            }}
                                            activeDot={{
                                                r: 6
                                            }}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            </div>

                        )}

                    </div>

                </div>


                {/* ==================================
                    QUICK ACTIONS
                ================================== */}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">


                    <button
                        onClick={() =>
                            router.push("/Inventory")
                        }
                        className="bg-blue-500 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                    >
                        Inventory Management
                    </button>


                    <button
                        onClick={() =>
                            router.push("/Invoices")
                        }
                        className="bg-emerald-500 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                    >
                        Invoice Management
                    </button>

                </div>


                {/* ==================================
                    LOGOUT
                ================================== */}

                <div className="flex justify-center">

                    <button
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-700 text-white font-medium px-5 py-2 rounded transition-colors"
                    >
                        Logout
                    </button>

                </div>


                {/* ==================================
                    MAIN PAGE
                ================================== */}

                <div className="flex justify-center mt-6">

                    <button
                        onClick={() =>
                            router.push("/")
                        }
                        className="bg-zinc-800 hover:bg-zinc-950 text-white font-medium px-5 py-2 rounded transition-colors"
                    >
                        Go to Main Page
                    </button>

                </div>


            </div>

        </div>

    );

}