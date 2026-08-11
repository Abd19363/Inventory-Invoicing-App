"use client";

import InventoryForm from "@/app/components/InventoryForm";
import { addItems } from "@/Services/inventoryService";
import useAuth from "@/hooks/useAuth";

export default function AddProduct() {
    useAuth();

    const initialValues = {
        name: "",
        category: "",
        quantity: "",
        purchasePrice: "",
        retailPrice: "",
        discount: 0,
    };

    const handlesubmit = async (values) => {
        console.log("submitted values:", values);

        try {
            await addItems(values);

            alert("Product added successfully.");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white px-4 py-10">

            <div className="max-w-5xl mx-auto">

                {/* PAGE HEADER */}
                <div className="mb-8">

                    <div className="mb-2 flex items-center gap-2">
                        <div className="h-8 w-1 rounded-full bg-emerald-500"></div>

                        <span className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                            Inventory
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Add New Product
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Add a new product to your inventory with its pricing and stock details.
                    </p>

                </div>


                {/* FORM CARD */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">

                    {/* CARD HEADER */}
                    <div className="border-b border-slate-800 px-6 py-5">

                        <h2 className="text-lg font-semibold text-white">
                            Product Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Enter the details below to create your product.
                        </p>

                    </div>


                    {/* EXISTING FORM */}
                    <div className="p-6">

                        <InventoryForm
                            initialValues={initialValues}
                            onSubmit={handlesubmit}
                            buttontext="Add Product"
                        />

                    </div>

                </div>

            </div>

        </main>
    );
}