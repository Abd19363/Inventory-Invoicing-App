"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuth from "@/hooks/useAuth"

import {
    addItem,
    updateQuantity,
    deleteProduct,
    setCustomerName,
    setDate,
    clearDraft
} from "@/store/invoiceDraftSlice";

import { useEffect, useState } from "react";

import { saveInvoice } from "@/Services/invoicesService";
import { getItems } from "@/Services/inventoryService";


const invoiceSchema = z.object({

    customerName: z
        .string()
        .trim()
        .min(1, "Customer name is required"),

    date: z
        .string()
        .min(1, "Invoice date is required"),

});


export default function InvoiceHome() {

    useAuth();

    const draft = useSelector((state) => state.invoiceDraft);

    const dispatch = useDispatch();

    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(invoiceSchema),

        defaultValues: {
            customerName: draft.customerName,
            date: draft.date
        }
    });


    console.log("Invoice Draft State: ", draft);

    const [products, setProducts] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState("");

    async function loadProducts() {

        try {

            const data = await getItems();

            console.log("Inventory Products: ", data);

            setProducts(data);

        } catch (error) {

            alert(error.message);

        }

    }

    useEffect(() => {

        loadProducts();

    }, []);

    function handleaddItem() {

        const product = products.find(
            (product) =>
                product.id === Number(selectedProduct)
        );


        console.log(
            "Selected Product Id: ",
            selectedProduct
        );

        console.log(
            "Product found: ",
            product
        );

        if (product) {

            const invoiceItem = {

                ...product,

                invoiceQuantity: 1

            };

            dispatch(addItem(invoiceItem));
            setSelectedProduct("");

        }

    }

    const grandtotal = draft.items.reduce(

        (total, item) => {

            return (
                total +
                Number(item.invoiceQuantity || 0) *
                Number(item.priceperquantity || 0)
            );

        },

        0

    );

    async function handleSaveInvoice(data) {

        try {

            // Check whether products exist

            if (draft.items.length === 0) {

                alert(
                    "Please add at least one product to the invoice."
                );

                return;

            }


            const invoice = {

                id: Date.now(),

                customerName: data.customerName,

                date: data.date,

                items: draft.items,

                total: grandtotal

            };


            console.log(
                "Invoice before saving: ",
                invoice
            );


            await saveInvoice(invoice);


            alert(
                "Invoice saved successfully!"
            );


            console.log(
                "New Invoice is: ",
                invoice
            );


            dispatch(clearDraft());


        } catch (error) {

            alert(error.message);

        }

    }


    return (

        <div className="bg-zinc-500 min-h-screen">


            {/* MAIN CONTAINER */}

            <div className="max-w-4xl mx-auto w-full flex flex-col items-center gap-6 my-auto py-8">


                {/* ================================= */}
                {/* INVOICE FORM */}
                {/* ================================= */}

                <form
                    onSubmit={handleSubmit(handleSaveInvoice)}
                    className="w-full"
                >


                    {/* ================================= */}
                    {/* CUSTOMER NAME + DATE */}
                    {/* ================================= */}

                    <div className="w-full flex gap-6 mb-6">


                        {/* CUSTOMER NAME */}

                        <div className="flex-1">

                            <label className="block mb-2 font-semibold">

                                Customer Name

                            </label>


                            <input
                                type="text"

                                {...register("customerName")}

                                value={draft.customerName}

                                onChange={(e) => {

                                    dispatch(
                                        setCustomerName(
                                            e.target.value
                                        )
                                    );

                                }}

                                placeholder="Enter customer name"

                                className="w-full border border-gray-300 rounded-md p-3
                                focus:outline-none focus:ring-2 focus:ring-blue-500"

                            />


                            {errors.customerName && (

                                <p className="text-red-500 mt-1">

                                    {errors.customerName.message}

                                </p>

                            )}

                        </div>


                        {/* DATE */}

                        <div className="flex-1">

                            <label className="block mb-2 font-semibold">

                                Invoice Date

                            </label>


                            <input
                                type="date"

                                {...register("date")}

                                value={draft.date}

                                onChange={(e) => {

                                    dispatch(
                                        setDate(
                                            e.target.value
                                        )
                                    );

                                }}

                                className="w-full border border-gray-300 rounded-md p-3
                                focus:outline-none focus:ring-2 focus:ring-blue-500"

                            />


                            {errors.date && (

                                <p className="text-red-500 mt-1">

                                    {errors.date.message}

                                </p>

                            )}

                        </div>

                    </div>


                    {/* ================================= */}
                    {/* PRODUCT SELECT */}
                    {/* ================================= */}

                    <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">


                        <select

                            value={selectedProduct}

                            onChange={(e) =>
                                setSelectedProduct(
                                    e.target.value
                                )
                            }

                            className="w-full px-4 py-3 text-sm font-medium text-zinc-100 bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm outline-none cursor-pointer focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"

                        >

                            <option
                                value=""
                                className="bg-zinc-900 text-zinc-400"
                            >

                                Select Product

                            </option>


                            {products.map((product) => (

                                <option
                                    key={product.id}
                                    value={product.id}
                                    className="bg-zinc-900 text-zinc-100"
                                >

                                    {product.name}

                                </option>

                            ))}

                        </select>


                        <button

                            type="button"

                            onClick={handleaddItem}

                            className="w-full sm:w-auto min-h-[42px] justify-center bg-black hover:bg-emerald-700 active:bg-emerald-700 text-white font-semibold text-sm px-8 rounded-lg shadow-lg shadow-emerald-600/20 transition-all duration-200 cursor-pointer"

                        >

                            Add Item

                        </button>

                    </div>


                    {/* ================================= */}
                    {/* INVOICE ITEMS TABLE */}
                    {/* ================================= */}

                    <div className="w-full mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">


                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">

                            <h2 className="text-lg sm:text-xl font-bold text-white">

                                Invoice Items

                            </h2>


                            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">

                                {draft.items.length}

                                {" "}

                                {draft.items.length === 1
                                    ? "Item"
                                    : "Items"}

                            </span>

                        </div>


                        <div className="overflow-x-auto rounded-xl border border-zinc-800/80">

                            <table className="w-full text-left border-collapse">


                                <thead>

                                    <tr className="bg-zinc-950/80 text-zinc-400 text-xs font-semibold uppercase tracking-wider border-b border-zinc-800">

                                        <th className="py-3.5 px-4">
                                            Product
                                        </th>

                                        <th className="py-3.5 px-4 text-center">
                                            Quantity
                                        </th>

                                        <th className="py-3.5 px-4 text-right">
                                            Price / Unit
                                        </th>

                                        <th className="py-3.5 px-4 text-right">
                                            Total
                                        </th>

                                        <th className="py-3.5 px-4 text-center">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-zinc-800/60 text-sm">


                                    {draft.items.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan={5}
                                                className="py-8 text-center text-zinc-500 italic"
                                            >

                                                No items added to invoice draft yet.

                                            </td>

                                        </tr>

                                    ) : (

                                        draft.items.map((item) => (

                                            <tr
                                                key={item.id}
                                                className="hover:bg-zinc-800/40 transition-colors"
                                            >


                                                {/* PRODUCT */}

                                                <td className="py-4 px-4 font-medium text-zinc-100">

                                                    {item.name}

                                                </td>


                                                {/* QUANTITY */}

                                                <td className="py-4 px-4">

                                                    <div className="flex items-center justify-center gap-2">


                                                        <button

                                                            type="button"

                                                            onClick={() => {

                                                                if (
                                                                    item.invoiceQuantity > 1
                                                                ) {

                                                                    dispatch(
                                                                        updateQuantity({

                                                                            productId:
                                                                                item.id,

                                                                            quantity:
                                                                                item.invoiceQuantity - 1

                                                                        })
                                                                    );

                                                                }

                                                            }}

                                                            disabled={
                                                                item.invoiceQuantity <= 1
                                                            }

                                                            className="w-7 h-7 flex items-center justify-center rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"

                                                        >

                                                            -

                                                        </button>


                                                        <span className="w-8 text-center font-semibold text-white">

                                                            {item.invoiceQuantity}

                                                        </span>


                                                        <button

                                                            type="button"

                                                            onClick={() => {

                                                                dispatch(
                                                                    updateQuantity({

                                                                        productId:
                                                                            item.id,

                                                                        quantity:
                                                                            item.invoiceQuantity + 1

                                                                    })
                                                                );

                                                            }}

                                                            className="w-7 h-7 flex items-center justify-center rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold transition-all"

                                                        >

                                                            +

                                                        </button>

                                                    </div>

                                                </td>


                                                {/* PRICE */}

                                                <td className="py-4 px-4 text-right font-medium text-zinc-300">

                                                    {Number(
                                                        item.priceperquantity || 0
                                                    ).toLocaleString()}

                                                </td>


                                                {/* ITEM TOTAL */}

                                                <td className="py-4 px-4 text-right font-bold text-emerald-400">

                                                    {(
                                                        Number(
                                                            item.invoiceQuantity || 0
                                                        ) *
                                                        Number(
                                                            item.priceperquantity || 0
                                                        )
                                                    ).toLocaleString()}

                                                </td>


                                                {/* DELETE */}

                                                <td className="py-4 px-4 text-center">

                                                    <button

                                                        type="button"

                                                        onClick={() => {

                                                            dispatch(
                                                                deleteProduct({

                                                                    productId:
                                                                        item.id

                                                                })
                                                            );

                                                        }}

                                                        className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-md transition-all"

                                                    >

                                                        Delete

                                                    </button>

                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        </div>

                        <div className="mt-6 text-center">

                            <h2 className="text-2xl font-bold text-white">

                                Grand Total:{" "}

                                {grandtotal.toLocaleString()}

                            </h2>

                            <button

                                type="submit"

                                className="mt-4 mr-3 bg-green-500 hover:bg-green-800 text-white px-6 py-3 rounded-lg"

                            >

                                Save Invoice

                            </button>

                            <button

                                type="button"

                                onClick={() => {

                                    dispatch(clearDraft());

                                }}

                                className="mt-4 bg-red-500 hover:bg-red-800 text-white px-6 py-3 rounded-lg"

                            >

                                Clear Invoice

                            </button>

                        </div>
                    </div>
                </form>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md pt-2">

                    <button

                        type="button"

                        onClick={() =>
                            router.push("/Home")
                        }

                        className="w-full sm:w-auto min-h-[48px] justify-center bg-yellow-400 hover:bg-yellow-700 text-white font-semibold text-sm px-6 rounded-lg"

                    >

                        Go to Home Page

                    </button>

                    <button

                        type="button"

                        onClick={() =>
                            router.push("/Invoices")
                        }

                        className="w-full sm:w-auto min-h-[48px] justify-center bg-yellow-400 hover:bg-yellow-700 text-white font-semibold text-sm px-6 rounded-lg"

                    >

                        Go to Invoice Page

                    </button>

                </div>


            </div>

        </div>

    );

}