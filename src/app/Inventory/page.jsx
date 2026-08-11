"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
    getItems,
    deleteItem
} from "@/Services/inventoryService";

export default function Inventory() {

    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");

    // =========================
    // LOAD PRODUCTS
    // =========================

    async function loadProducts() {

        try {

            const data = await getItems();

            console.log("Inventory Products:", data);

            setProducts(data || []);

        } catch (error) {

            alert(error.message);

        }

    }

    useEffect(() => {

        loadProducts();

    }, []);

    // =========================
    // DELETE PRODUCT
    // =========================

    async function handledelete(id) {

        console.log("Deleting Product ID:", id);

        try {

            await deleteItem(id);

            await loadProducts();

        } catch (error) {

            alert(error.message);

        }

    }

    // =========================
    // SEARCH PRODUCTS
    // =========================

    const filteredProducts = products.filter((product) => {

        const searchText = search.toLowerCase();

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

    // =========================
    // PAGE
    // =========================

    return (

        <div className="
            min-h-screen
            w-full
            bg-zinc-950
            text-zinc-100
            p-4
            sm:p-6
            lg:p-8
        ">

            {/* ==================================
                MAIN CONTAINER
            ================================== */}

            <div className="
                w-full
                max-w-7xl
                mx-auto
                bg-zinc-900
                border
                border-zinc-800
                rounded-2xl
                shadow-2xl
                p-5
                sm:p-7
                lg:p-8
            ">

                {/* ==================================
                    HEADER
                ================================== */}

                <div className="
                    flex
                    flex-col
                    sm:flex-row
                    items-start
                    sm:items-center
                    justify-between
                    gap-5
                    mb-8
                ">

                    <div>

                        <p className="
                            text-sm
                            font-medium
                            text-emerald-400
                            mb-1
                        ">
                            INVENTORY MANAGEMENT
                        </p>

                        <h1 className="
                            text-3xl
                            sm:text-4xl
                            font-bold
                            text-white
                        ">
                            Inventory
                        </h1>

                        <p className="
                            text-zinc-400
                            mt-2
                        ">
                            Manage your products, stock and pricing.
                        </p>

                    </div>


                    {/* TOTAL PRODUCTS */}

                    <div className="
                        bg-zinc-800
                        border
                        border-zinc-700
                        rounded-xl
                        px-5
                        py-3
                        min-w-[130px]
                        text-center
                    ">

                        <p className="
                            text-xs
                            text-zinc-400
                        ">
                            Total Products
                        </p>

                        <p className="
                            text-2xl
                            font-bold
                            text-emerald-400
                        ">
                            {products.length}
                        </p>

                    </div>

                </div>


                {/* ==================================
                    SEARCH + ADD PRODUCT
                ================================== */}

                <div className="
                    flex
                    flex-col
                    lg:flex-row
                    gap-4
                    mb-5
                ">

                    {/* SEARCH */}

                    <div className="flex-1">

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search by product name or category..."
                            className="
                                w-full
                                px-5
                                py-3.5
                                rounded-xl
                                bg-zinc-950
                                border
                                border-zinc-700
                                text-white
                                placeholder-zinc-500
                                outline-none
                                focus:border-emerald-500
                                focus:ring-2
                                focus:ring-emerald-500/20
                                transition-all
                            "
                        />

                    </div>


                    {/* ADD PRODUCT */}

                    <button
                        type="button"
                        onClick={() =>
                            router.push("/Inventory/Add")
                        }
                        className="
                            bg-emerald-600
                            hover:bg-emerald-500
                            text-white
                            font-semibold
                            px-6
                            py-3.5
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
                            whitespace-nowrap
                        "
                    >

                        <span className="text-xl">
                            +
                        </span>

                        Add Product

                    </button>

                </div>


                {/* ==================================
                    RESULT COUNT
                ================================== */}

                <div className="
                    flex
                    justify-between
                    items-center
                    mb-4
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
                            className="
                                text-sm
                                text-zinc-500
                                hover:text-emerald-400
                                transition-colors
                            "
                        >
                            Clear Search
                        </button>

                    )}

                </div>


                {/* ==================================
                    INVENTORY TABLE
                ================================== */}

                <div className="
                    overflow-x-auto
                    rounded-2xl
                    border
                    border-zinc-800
                    shadow-xl
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
                                bg-zinc-800
                                text-zinc-300
                                font-semibold
                                border-b
                                border-zinc-700
                            ">

                                <th className="
                                    p-4
                                    whitespace-nowrap
                                ">
                                    Name
                                </th>

                                <th className="p-4">
                                    Category
                                </th>

                                <th className="
                                    p-4
                                    text-center
                                ">
                                    Stock
                                </th>

                                <th className="
                                    p-4
                                    text-right
                                ">
                                    Purchase Price
                                </th>

                                <th className="
                                    p-4
                                    text-right
                                ">
                                    Retail Price
                                </th>

                                <th className="
                                    p-4
                                    text-center
                                ">
                                    Discount
                                </th>

                                <th className="
                                    p-4
                                    text-right
                                ">
                                    Sale Price
                                </th>

                                <th className="
                                    p-4
                                    text-right
                                ">
                                    Total Price
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
                        ">

                            {filteredProducts.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={9}
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
                                                flex
                                                items-center
                                                justify-center
                                                mb-4
                                            ">

                                                <span className="
                                                    text-2xl
                                                    text-zinc-500
                                                ">
                                                    📦
                                                </span>

                                            </div>


                                            <p className="
                                                text-zinc-400
                                                font-medium
                                            ">
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
                                                    className="
                                                        mt-4
                                                        text-emerald-400
                                                        hover:text-emerald-300
                                                        font-medium
                                                    "
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


                                        return (

                                            <tr
                                                key={product.id}
                                                className="
                                                    hover:bg-zinc-800/60
                                                    transition-colors
                                                    duration-200
                                                "
                                            >

                                                {/* NAME */}

                                                <td className="
                                                    p-4
                                                    font-medium
                                                    text-zinc-100
                                                ">
                                                    {product.name}
                                                </td>


                                                {/* CATEGORY */}

                                                <td className="
                                                    p-4
                                                    text-zinc-400
                                                ">
                                                    {product.category}
                                                </td>


                                                {/* STOCK */}

                                                <td className="
                                                    p-4
                                                    text-center
                                                    font-medium
                                                    text-zinc-200
                                                ">
                                                    {quantity}
                                                </td>


                                                {/* PURCHASE PRICE */}

                                                <td className="
                                                    p-4
                                                    text-right
                                                    text-zinc-400
                                                ">
                                                    {purchasePrice.toLocaleString()}
                                                </td>


                                                {/* RETAIL PRICE */}

                                                <td className="
                                                    p-4
                                                    text-right
                                                    text-zinc-300
                                                ">
                                                    {retailPrice.toLocaleString()}
                                                </td>


                                                {/* DISCOUNT */}

                                                <td className="
                                                    p-4
                                                    text-center
                                                    text-zinc-400
                                                ">
                                                    {discount}%
                                                </td>


                                                {/* SALE PRICE */}

                                                <td className="
                                                    p-4
                                                    text-right
                                                    font-semibold
                                                    text-emerald-400
                                                ">
                                                    {salePrice.toLocaleString()}
                                                </td>


                                                {/* TOTAL VALUE */}

                                                <td className="
                                                    p-4
                                                    text-right
                                                    font-semibold
                                                    text-white
                                                ">
                                                    {totalValue.toLocaleString()}
                                                </td>


                                                {/* ACTIONS */}

                                                <td className="p-4">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                    ">

                                                        {/* EDIT */}

                                                        <button
                                                            type="button"
                                                            onClick={() => {

                                                                router.push(
                                                                    `/Inventory/Edit/${product.id}`
                                                                );

                                                            }}
                                                            className="
                                                                bg-blue-600
                                                                hover:bg-blue-500
                                                                text-white
                                                                font-medium
                                                                text-xs
                                                                px-4
                                                                py-2
                                                                rounded-lg
                                                                transition-all
                                                                duration-200
                                                                hover:-translate-y-0.5
                                                            "
                                                        >
                                                            Edit
                                                        </button>


                                                        {/* DELETE */}

                                                        <button
                                                            type="button"
                                                            onClick={() => {

                                                                handledelete(
                                                                    product.id
                                                                );

                                                            }}
                                                            className="
                                                                bg-red-600
                                                                hover:bg-red-500
                                                                text-white
                                                                font-medium
                                                                text-xs
                                                                px-4
                                                                py-2
                                                                rounded-lg
                                                                transition-all
                                                                duration-200
                                                                hover:-translate-y-0.5
                                                            "
                                                        >
                                                            Delete
                                                        </button>

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


                {/* ==================================
                    BOTTOM ACTIONS
                ================================== */}

                <div className="
                    flex
                    justify-center
                    mt-8
                ">

                    <button
                        type="button"
                        onClick={() =>
                            router.push("/Home")
                        }
                        className="
                            bg-zinc-800
                            hover:bg-zinc-700
                            text-zinc-100
                            font-semibold
                            px-6
                            py-3
                            rounded-xl
                            border
                            border-zinc-700
                            shadow-md
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                        "
                    >
                        ← Go to Home Page
                    </button>

                </div>

            </div>

        </div>
    );
}