"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import useAuth from "@/hooks/useAuth";

import {
    getItems,
    deleteItem
} from "@/Services/inventoryService";


export default function Inventory() {

    useAuth();

    const router = useRouter();


    // ==========================================
    // PRODUCTS
    // ==========================================

    const [products, setProducts] = useState([]);


    // ==========================================
    // SEARCH
    // ==========================================

    const [searchTerm, setSearchTerm] = useState("");

    const [filteredProducts, setFilteredProducts] = useState([]);


    // ==========================================
    // LOAD PRODUCTS
    // ==========================================

    async function loadProducts() {

        try {

            const data = await getItems();

            console.log(data);

            setProducts(data);

            setFilteredProducts(data);

        } catch (error) {

            alert(error.message);

        }

    }


    useEffect(() => {

        loadProducts();

    }, []);


    // ==========================================
    // DEBOUNCED SEARCH
    // ==========================================

    useEffect(() => {

        const timer = setTimeout(() => {

            const search = searchTerm
                .toLowerCase()
                .trim();


            if (search === "") {

                setFilteredProducts(products);

                return;

            }


            const filtered = products.filter((product) => {

                return (
                    product.name
                        ?.toLowerCase()
                        .includes(search)

                    ||

                    product.category
                        ?.toLowerCase()
                        .includes(search)
                );

            });


            setFilteredProducts(filtered);

        }, 500);


        // Cleanup previous timer

        return () => {

            clearTimeout(timer);

        };

    }, [searchTerm, products]);


    // ==========================================
    // DELETE PRODUCT
    // ==========================================

    async function handledelete(id) {

        console.log("Id: ", id);

        try {

            await deleteItem(id);

            await loadProducts();

        } catch (error) {

            alert(error.message);

        }

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div
            className="flex flex-col items-center justify-center flex-1 p-8 text-center rounded-xl border border-slate-700/70 backdrop-blur-md shadow-xl w-300 mx-auto my-8 bg-[radial-gradient(circle_at_50%_50%,_#334155_0%,_#1e293b_35%,_#111827_70%,_#020617_100%)]"
        >


            {/* ==================================
                HEADING
            ================================== */}

            <div className="space-y-2">

                <h1
                    className="text-4xl font-extrabold tracking-tight text-amber-500 drop-shadow-md transition-transform duration-200 hover:scale-105 cursor-pointer"
                >
                    Welcome to Inventory
                </h1>


                <p
                    className="text-sm md:text-base font-medium text-amber-700"
                >
                    Please click the button below to add a product
                </p>

            </div>


            {/* ==================================
                SEARCH BAR
            ================================== */}

            <div className="w-full mt-8">

                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) =>
                        setSearchTerm(e.target.value)
                    }
                    placeholder="Search by product name or category..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder-slate-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />

                <p className="text-sm text-slate-400 text-left mt-2">

                    Showing {filteredProducts.length} of{" "}
                    {products.length} products

                </p>

            </div>


            {/* ==================================
                PRODUCT TABLE
            ================================== */}

            <table className="w-full mt-6 border border-gray-300">

                <thead>

                    <tr>

                        <th className="border p-2">
                            Name
                        </th>

                        <th className="border p-2">
                            Category
                        </th>

                        <th className="border p-2">
                            Quantity
                        </th>

                        <th className="border p-2">
                            Price Per Quantity
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
                                colSpan="6"
                                className="border p-6 text-gray-400"
                            >
                                No products found.
                            </td>

                        </tr>

                    ) : (

                        filteredProducts.map((product) => (

                            <tr key={product.id}>

                                <td className="border p-2">
                                    {product.name}
                                </td>


                                <td className="border p-2">
                                    {product.category}
                                </td>


                                <td className="border p-2">
                                    {product.quantity}
                                </td>


                                <td className="border p-2">
                                    {product.priceperquantity}
                                </td>


                                <td className="border p-2">

                                    {
                                        product.quantity *
                                        product.priceperquantity
                                    }

                                </td>


                                {/* ACTIONS */}

                                <td className="border p-2">

                                    {/* EDIT */}

                                    <button
                                        onClick={() => {

                                            router.push(
                                                `/Inventory/Edit/${product.id}`
                                            );

                                        }}
                                        className="bg-blue-400 hover:bg-blue-800 text-white font-semibold mt-2 px-6 py-2 rounded-lg shadow-lg transition-all duration-200 cursor-pointer"
                                    >
                                        Edit
                                    </button>


                                    {/* DELETE */}

                                    <button
                                        type="button"
                                        onClick={() => {

                                            console.log("Clicked");

                                            console.log(
                                                "product: ",
                                                product
                                            );

                                            handledelete(
                                                product.id
                                            );

                                        }}
                                        className="bg-red-400 hover:bg-red-800 text-white font-semibold mt-2 ml-3 px-6 py-2 rounded-lg shadow-lg transition-all duration-200 cursor-pointer"
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        ))

                    )}

                </tbody>

            </table>


            {/* ==================================
                ADD PRODUCT
            ================================== */}

            <button
                onClick={() =>
                    router.push("/Inventory/Add")
                }
                className="bg-emerald-800 hover:bg-yellow-600 text-white font-semibold mt-8 px-6 py-3 rounded-lg shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-2"
            >

                <span>+</span>

                Add Product

            </button>


            {/* ==================================
                HOME
            ================================== */}

            <button
                onClick={() =>
                    router.push("/Home")
                }
                className="bg-yellow-600 hover:bg-emerald-800 text-white font-semibold mt-8 px-6 py-3 rounded-lg shadow-lg transition-all duration-200 cursor-pointer"
            >

                Go to Home Page

            </button>


        </div>

    );

}