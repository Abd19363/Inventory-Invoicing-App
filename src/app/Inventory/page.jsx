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


    return (

        <div
            className="
                flex
                flex-col
                items-center
                justify-center
                flex-1
                p-8
                text-center
                rounded-xl
                border
                border-slate-700/70
                backdrop-blur-md
                shadow-xl
                w-[95%]
                mx-auto
                my-8
                bg-[radial-gradient(circle_at_50%_50%,_#334155_0%,_#1e293b_35%,_#111827_70%,_#020617_100%)]
            "
        >


            {/* ========================= */}
            {/* HEADING */}
            {/* ========================= */}

            <div className="space-y-2">

                <h1
                    className="
                        text-4xl
                        font-extrabold
                        tracking-tight
                        text-amber-500
                        drop-shadow-md
                        transition-transform
                        duration-200
                        hover:scale-105
                        cursor-pointer
                    "
                >
                    Welcome to Inventory
                </h1>


                <p
                    className="
                        text-sm
                        md:text-base
                        font-medium
                        text-amber-700
                    "
                >
                    Please click the button below to add a product
                </p>

            </div>


            {/* ========================= */}
            {/* SEARCH BAR */}
            {/* ========================= */}

            <div className="w-full mt-8">

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by product name or category..."
                    className="
                        w-full
                        px-5
                        py-4
                        rounded-lg
                        border
                        border-slate-600
                        bg-slate-900/70
                        text-white
                        placeholder-slate-400
                        outline-none
                        focus:border-amber-500
                        focus:ring-2
                        focus:ring-amber-500/20
                    "
                />

            </div>


            {/* ========================= */}
            {/* RESULT COUNT */}
            {/* ========================= */}

            <div className="w-full text-left mt-3">

                <p className="text-slate-400">

                    Showing {filteredProducts.length} of {products.length} products

                </p>

            </div>


            {/* ========================= */}
            {/* INVENTORY TABLE */}
            {/* ========================= */}

            <div className="w-full overflow-x-auto mt-8">

                <table className="w-full border border-gray-300">

                    <thead>

                        <tr>

                            <th className="border p-2">
                                Name
                            </th>

                            <th className="border p-2">
                                Category
                            </th>

                            <th className="border p-2">
                                Stock
                            </th>

                            <th className="border p-2">
                                Purchase Price
                            </th>

                            <th className="border p-2">
                                Retail Price
                            </th>

                            <th className="border p-2">
                                Discount
                            </th>

                            <th className="border p-2">
                                Sale Price
                            </th>

                            <th className="border p-2">
                                Total Price
                            </th>

                            <th className="border p-2">
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredProducts.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={9}
                                    className="
                                        border
                                        p-6
                                        text-center
                                        text-slate-400
                                    "
                                >
                                    No products found.
                                </td>

                            </tr>

                        ) : (

                            filteredProducts.map((product) => {

                                const purchasePrice =
                                    Number(product.purchasePrice || 0);

                                const retailPrice =
                                    Number(product.retailPrice || 0);

                                const discount =
                                    Number(product.discount || 0);

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
                                    Number(product.quantity || 0);

                                const totalValue =
                                    quantity * salePrice;


                                return (

                                    <tr
                                        key={product.id}
                                        className="
                                            hover:bg-slate-700/50
                                            transition-colors
                                        "
                                    >

                                        {/* NAME */}

                                        <td className="border p-2">

                                            {product.name}

                                        </td>


                                        {/* CATEGORY */}

                                        <td className="border p-2">

                                            {product.category}

                                        </td>


                                        {/* STOCK */}

                                        <td className="border p-2">

                                            {quantity}

                                        </td>


                                        {/* PURCHASE PRICE */}

                                        <td className="border p-2">

                                            {purchasePrice.toLocaleString()}

                                        </td>


                                        {/* RETAIL PRICE */}

                                        <td className="border p-2">

                                            {retailPrice.toLocaleString()}

                                        </td>


                                        {/* DISCOUNT */}

                                        <td className="border p-2">

                                            {discount}%

                                        </td>


                                        {/* SALE PRICE */}

                                        <td
                                            className="
                                                border
                                                p-2
                                                font-semibold
                                                text-emerald-400
                                            "
                                        >

                                            {salePrice.toLocaleString()}

                                        </td>


                                        {/* TOTAL INVENTORY VALUE */}

                                        <td
                                            className="
                                                border
                                                p-2
                                                font-semibold
                                            "
                                        >

                                            {totalValue.toLocaleString()}

                                        </td>


                                        {/* ACTIONS */}

                                        <td className="border p-2">

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    justify-center
                                                    gap-3
                                                "
                                            >

                                                {/* EDIT */}

                                                <button
                                                    type="button"
                                                    onClick={() => {

                                                        router.push(
                                                            `/Inventory/Edit/${product.id}`
                                                        );

                                                    }}
                                                    className="
                                                        bg-blue-400
                                                        hover:bg-blue-800
                                                        text-white
                                                        font-semibold
                                                        px-6
                                                        py-3
                                                        rounded-lg
                                                        transition-all
                                                        duration-200
                                                        cursor-pointer
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
                                                        bg-red-400
                                                        hover:bg-red-800
                                                        text-white
                                                        font-semibold
                                                        px-6
                                                        py-3
                                                        rounded-lg
                                                        transition-all
                                                        duration-200
                                                        cursor-pointer
                                                    "
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                );

                            })

                        )}

                    </tbody>

                </table>

            </div>


            {/* ========================= */}
            {/* ADD PRODUCT */}
            {/* ========================= */}

            <button
                type="button"
                onClick={() => router.push("/Inventory/Add")}
                className="
                    bg-emerald-800
                    hover:bg-yellow-600
                    text-white
                    font-semibold
                    mt-8
                    px-6
                    py-3
                    rounded-lg
                    shadow-lg
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    cursor-pointer
                    flex
                    items-center
                    gap-2
                "
            >

                <span>+</span>

                Add Product

            </button>


            {/* ========================= */}
            {/* HOME */}
            {/* ========================= */}

            <button
                type="button"
                onClick={() => router.push("/Home")}
                className="
                    bg-yellow-600
                    hover:bg-emerald-800
                    text-white
                    font-semibold
                    mt-8
                    px-6
                    py-3
                    rounded-lg
                    shadow-lg
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    cursor-pointer
                    flex
                    items-center
                    gap-2
                "
            >

                Go to Home Page

            </button>


        </div>

    );

}