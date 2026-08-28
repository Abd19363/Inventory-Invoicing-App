"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import {
    getItems,
    deleteItem,
} from "@/Services/inventoryService";

import useAuth from "@/hooks/useAuth";
import Sidebar from "@/app/components/Sidebar";
import useSidebarState from "@/hooks/useSidebarState";
import ConfirmModal from "@/app/components/ConfirmModal";

const API_URL = "http://localhost:8000";

function InventoryContent() {

    const { isAdmin } = useAuth();

    const router = useRouter();
    const searchParams = useSearchParams();

    const [sidebarCollapsed, setSidebarCollapsed] = useSidebarState();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [deletingId, setDeletingId] = useState(null);
    const [deletePendingId, setDeletePendingId] = useState(null);


    // ==========================================
    // LOAD PRODUCTS FROM BACKEND
    // ==========================================

    const loadProducts = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            console.log(
                "Loading latest products from backend..."
            );

            const data = await getItems();

            console.log(
                "Latest products received:",
                data
            );

            setProducts(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Failed to load products:",
                error
            );

            setError(
                error?.message ||
                "Failed to load products."
            );

        } finally {

            setLoading(false);

        }

    }, []);


    // ==========================================
    // LOAD PRODUCTS WHEN PAGE OPENS
    // ==========================================

    useEffect(() => {

        loadProducts();

    }, [loadProducts, searchParams]);


    // ==========================================
    // DELETE PRODUCT
    // ==========================================

    async function handleDelete(id) {

        // Show custom confirmation modal instead of native window.confirm
        setDeletePendingId(id);

    }

    async function confirmDelete(id) {

        setDeletePendingId(null);

        try {

            setDeletingId(id);

            console.log(
                "Deleting Product ID:",
                id
            );

            await deleteItem(id);

            toast.success("Product deleted successfully.");

            await loadProducts();

        } catch (error) {

            console.error(
                "Failed to delete product:",
                error
            );

            toast.error(
                error?.message ||
                "Failed to delete product."
            );

        } finally {

            setDeletingId(null);

        }

    }


    // ==========================================
    // SEARCH PRODUCTS
    // ==========================================

    const filteredProducts =
        products.filter((product) => {

            const searchText =
                search
                    .trim()
                    .toLowerCase();

            if (!searchText) {
                return true;
            }

            return (
                product.name
                    ?.toLowerCase()
                    .includes(searchText)
                ||
                product.category
                    ?.toLowerCase()
                    .includes(searchText)
            );

        });


    // ==========================================
    // GET IMAGE URL
    // ==========================================

    function getImageUrl(thumbnailUrl) {

        if (!thumbnailUrl) {
            return null;
        }

        if (
            thumbnailUrl.startsWith("http://") ||
            thumbnailUrl.startsWith("https://")
        ) {
            return thumbnailUrl;
        }

        return `${API_URL}${thumbnailUrl}`;

    }


    // ==========================================
    // PAGE
    // ==========================================

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

                    <div className="flex items-center gap-3">
                        {isAdmin && (
                        <button
                            onClick={() => router.push("/Inventory/Add")}
                            className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-[#10b981]/20 cursor-pointer"
                        >
                            + Add Product
                        </button>
                        )}
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
                    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-5 sm:p-7 lg:p-8">

                {/* ==================================
                    HEADER
                ================================== */}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-8">

                    <div>

                        <p className="text-sm font-medium text-emerald-400 mb-1">
                            INVENTORY MANAGEMENT
                        </p>

                        <h1 className="text-3xl sm:text-4xl font-bold text-white">
                            Inventory
                        </h1>

                        <p className="text-zinc-400 mt-2">
                            Manage your products, stock and pricing.
                        </p>

                    </div>


                    {/* TOTAL PRODUCTS */}

                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-5 py-3 min-w-[130px] text-center">

                        <p className="text-xs text-zinc-400">
                            Total Products
                        </p>

                        <p className="text-2xl font-bold text-emerald-400">
                            {products.length}
                        </p>

                    </div>

                </div>


                {/* ==================================
                    ERROR
                ================================== */}

                {error && (

                    <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                            <p>
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={loadProducts}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                            >
                                Retry
                            </button>

                        </div>

                    </div>

                )}


                {/* ==================================
                    SEARCH + ADD PRODUCT
                ================================== */}

                <div className="flex flex-col lg:flex-row gap-4 mb-5">

                    {/* SEARCH */}

                    <div className="flex-1">

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search by product name or category..."
                            className="w-full px-5 py-3.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        />

                    </div>


                    {/* ADD PRODUCT - ADMIN ONLY */}

                    {isAdmin && (
                    <button
                        type="button"
                        onClick={() =>
                            router.push("/Inventory/Add")
                        }
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
                    >

                        <span className="text-xl">
                            +
                        </span>

                        Add Product

                    </button>
                    )}

                </div>


                {/* ==================================
                    RESULT COUNT
                ================================== */}

                <div className="flex justify-between items-center mb-4">

                    <p className="text-sm text-zinc-500">

                        Showing{" "}

                        <span className="text-emerald-400 font-semibold">
                            {filteredProducts.length}
                        </span>

                        {" "}of{" "}

                        <span className="text-zinc-300">
                            {products.length}
                        </span>

                        {" "}products

                    </p>


                    {search && (

                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                            className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors"
                        >
                            Clear Search
                        </button>

                    )}

                </div>


                {/* ==================================
                    LOADING
                ================================== */}

                {loading ? (

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">

                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-500" />

                        <p className="mt-4 text-zinc-400">
                            Loading inventory...
                        </p>

                    </div>

                ) : (

                    /* ==================================
                       INVENTORY TABLE
                    ================================== */

                    <div className="overflow-x-auto rounded-2xl border border-zinc-800 shadow-xl bg-zinc-900">

                        <table className="w-full border-collapse text-left text-sm">

                            {/* TABLE HEADER */}

                            <thead>

                                <tr className="bg-zinc-800 text-zinc-300 font-semibold border-b border-zinc-700">

                                    <th className="p-4 whitespace-nowrap">
                                        Image
                                    </th>

                                    <th className="p-4 whitespace-nowrap">
                                        Name
                                    </th>

                                    <th className="p-4">
                                        Category
                                    </th>

                                    <th className="p-4 text-center">
                                        Stock
                                    </th>

                                    {isAdmin && (
                                        <th className="p-4 text-right">
                                            Purchase Price
                                        </th>
                                    )}

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
                                        Total Price
                                    </th>

                                    <th className="p-4 text-center">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            {/* TABLE BODY */}

                            <tbody className="divide-y divide-zinc-800">

                                {filteredProducts.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan={isAdmin ? 10 : 9}
                                            className="p-12 text-center"
                                        >

                                            <div className="flex flex-col items-center">

                                                <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mb-4">

                                                    <span className="text-2xl text-zinc-500">
                                                        📦
                                                    </span>

                                                </div>

                                                <p className="text-zinc-400 font-medium">
                                                    No products found.
                                                </p>

                                                {search === "" && (

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.push(
                                                                "/Inventory/Add"
                                                            )
                                                        }
                                                        className="mt-4 text-emerald-400 hover:text-emerald-300 font-medium"
                                                    >
                                                        Add your first product →
                                                    </button>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                ) : (

                                    filteredProducts.map(
                                        (product) => {

                                            const purchasePrice =
                                                Number(
                                                    product.purchasePrice || 0
                                                );

                                            const retailPrice =
                                                Number(
                                                    product.retailPrice || 0
                                                );

                                            const discount =
                                                Number(
                                                    product.discount || 0
                                                );

                                            const salePrice =
                                                Number(
                                                    product.salePrice ??
                                                    (
                                                        retailPrice -
                                                        (
                                                            retailPrice *
                                                            discount
                                                        ) / 100
                                                    )
                                                );

                                            const quantity =
                                                Number(
                                                    product.quantity || 0
                                                );

                                            const totalValue =
                                                quantity * salePrice;

                                            const imageUrl =
                                                getImageUrl(
                                                    product.thumbnailUrl
                                                );


                                            return (

                                                <tr
                                                    key={product.id}
                                                    className="hover:bg-zinc-800/60 transition-colors duration-200"
                                                >

                                                    {/* IMAGE */}

                                                    <td className="p-4">

                                                        {imageUrl ? (

                                                            <img
                                                                src={imageUrl}
                                                                alt={product.name || "Product"}
                                                                className="h-16 w-16 rounded-xl object-cover border border-zinc-700 bg-zinc-950"
                                                                onLoad={() => {

                                                                    console.log(
                                                                        "Product image loaded:",
                                                                        imageUrl
                                                                    );

                                                                }}
                                                                onError={(event) => {

                                                                    console.error(
                                                                        "Failed to load product image:",
                                                                        imageUrl
                                                                    );

                                                                    event.currentTarget.style.display =
                                                                        "none";

                                                                }}
                                                            />

                                                        ) : (

                                                            <div className="h-16 w-16 rounded-xl border border-zinc-700 bg-zinc-950 flex items-center justify-center text-2xl">
                                                                📦
                                                            </div>

                                                        )}

                                                    </td>


                                                    {/* NAME */}

                                                    <td className="p-4 font-medium text-zinc-100">
                                                        {product.name}
                                                    </td>


                                                    {/* CATEGORY */}

                                                    <td className="p-4 text-zinc-400">
                                                        {product.category || "-"}
                                                    </td>


                                                    {/* STOCK */}

                                                    <td className="p-4 text-center font-medium text-zinc-200">
                                                        {quantity}
                                                    </td>


                                                    {/* PURCHASE PRICE (ADMIN ONLY) */}

                                                    {isAdmin && (
                                                        <td className="p-4 text-right text-zinc-400">
                                                            {purchasePrice.toLocaleString()}
                                                        </td>
                                                    )}


                                                    {/* RETAIL PRICE */}

                                                    <td className="p-4 text-right text-zinc-300">
                                                        {retailPrice.toLocaleString()}
                                                    </td>


                                                    {/* DISCOUNT */}

                                                    <td className="p-4 text-center text-zinc-400">
                                                        {discount}%
                                                    </td>


                                                    {/* SALE PRICE */}

                                                    <td className="p-4 text-right font-semibold text-emerald-400">
                                                        {salePrice.toLocaleString()}
                                                    </td>


                                                    {/* TOTAL VALUE */}

                                                    <td className="p-4 text-right font-semibold text-white">
                                                        {totalValue.toLocaleString()}
                                                    </td>


                                                    {/* ACTIONS */}

                                                    <td className="p-4">

                                                        <div className="flex items-center justify-center gap-2">

                                                            {isAdmin ? (
                                                            <>
                                                            {/* EDIT */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    router.push(
                                                                        `/Inventory/Edit/${product.id}`
                                                                    )
                                                                }
                                                                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                                                            >
                                                                Edit
                                                            </button>


                                                            {/* DELETE */}

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    deletingId ===
                                                                    product.id
                                                                }
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        product.id
                                                                    )
                                                                }
                                                                className="bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:cursor-not-allowed text-white font-medium text-xs px-4 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                                                            >

                                                                {deletingId ===
                                                                    product.id
                                                                    ? "Deleting..."
                                                                    : "Delete"}

                                                            </button>
                                                            </>
                                                            ) : (
                                                                <span className="text-xs text-zinc-500 italic">View only</span>
                                                            )}

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                )}


                {/* ==================================
                    REFRESH BUTTON
                ================================== */}

                {!loading && (

                    <div className="flex justify-center gap-3 mt-8">

                        <button
                            type="button"
                            onClick={loadProducts}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold px-6 py-3 rounded-xl border border-zinc-700 shadow-md transition-all duration-200 hover:-translate-y-0.5"
                        >
                            ↻ Refresh Inventory
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                router.push("/Home")
                            }
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold px-6 py-3 rounded-xl border border-zinc-700 shadow-md transition-all duration-200 hover:-translate-y-0.5"
                        >
                            ← Go to Home Page
                        </button>

                    </div>

                )}

            </div>
                </main>
            </div>

            {/* =======================================
                DELETE CONFIRMATION MODAL
            ======================================= */}
            <ConfirmModal
                isOpen={deletePendingId !== null}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmLabel="Delete Product"
                variant="danger"
                onConfirm={() => confirmDelete(deletePendingId)}
                onCancel={() => setDeletePendingId(null)}
            />

        </div>

    );

}

export default function Inventory() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
                Loading...
            </div>
        }>
            <InventoryContent />
        </Suspense>
    );
}