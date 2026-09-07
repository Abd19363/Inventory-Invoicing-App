"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import InventoryForm from "@/app/components/InventoryForm";

import {
    addItems,
    uploadProductImage,
} from "@/Services/inventoryService";

import useAuth from "@/hooks/useAuth";
import Sidebar from "@/app/components/Sidebar";
import useSidebarState from "@/hooks/useSidebarState";
import { useRouter } from "next/navigation";


// =====================================================
// ADD PRODUCT PAGE
// =====================================================

export default function AddProduct() {

    const { checkingAuth, isAdmin } = useAuth();
    const router = useRouter();

    const [sidebarCollapsed, setSidebarCollapsed] = useSidebarState();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Redirect non-admins
    useEffect(() => {
        if (!checkingAuth && !isAdmin) {
            router.replace("/Inventory");
        }
    }, [checkingAuth, isAdmin, router]);

    // =====================================================
    // STATE
    // =====================================================

    const [isSubmitting, setIsSubmitting] =
        useState(false);


    // =====================================================
    // INITIAL VALUES
    // =====================================================

    const initialValues = {

        name: "",

        category: "",

        description: "",

        quantity: "",

        purchasePrice: "",

        retailPrice: "",

        discount: 0,

        salePrice: 0,

        thumbnailFile: null,

        fullImageFile: null,

    };


    // =====================================================
    // HANDLE PRODUCT SUBMIT
    // =====================================================

    const handleSubmit = async (values) => {

        console.log(
            "================================="
        );

        console.log(
            "ADD PRODUCT SUBMIT"
        );

        console.log(
            "Product values:",
            values
        );

        console.log(
            "Thumbnail:",
            values.thumbnailFile
        );

        console.log(
            "Full image:",
            values.fullImageFile
        );

        console.log(
            "================================="
        );


        setIsSubmitting(true);


        try {

            // =================================================
            // STEP 1
            // CREATE PRODUCT
            // =================================================

            const createdProduct =
                await addItems(values);


            console.log(
                "Product created:",
                createdProduct
            );


            // =================================================
            // STEP 2
            // GET PRODUCT ID
            // =================================================

            const productId =
                createdProduct?.id;


            if (!productId) {

                throw new Error(
                    "Product was created but no product ID was returned."
                );

            }


            // =================================================
            // STEP 3
            // UPLOAD PRODUCT IMAGE
            // =================================================

            const imageFile =
                values.imageFile ||
                values.fullImageFile ||
                values.thumbnailFile;

            if (imageFile) {

                console.log(
                    "Uploading product image..."
                );


                await uploadProductImage(
                    productId,
                    imageFile
                );


                console.log(
                    "Product image uploaded successfully (thumbnail automatically generated)."
                );

            }


            // =================================================
            // SUCCESS
            // =================================================

            toast.success(
                "Product added successfully."
            );

            router.push("/Inventory");


        } catch (error) {

            console.error(
                "Add product error:",
                error
            );


            toast.error(
                error?.message ||
                "Failed to add product."
            );


        } finally {

            setIsSubmitting(false);

        }

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex">
            <Sidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <div className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarCollapsed ? "md:ml-0" : "md:ml-[260px]"} min-h-screen flex flex-col`}>
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
                </header>

                <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-5xl w-full mx-auto">
                    <div className="mx-auto">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="mb-8">

                    <div
                        className="
                            mb-2
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <div
                            className="
                                h-8
                                w-1
                                rounded-full
                                bg-emerald-500
                            "
                        />

                        <span
                            className="
                                text-sm
                                font-semibold
                                uppercase
                                tracking-wider
                                text-emerald-400
                            "
                        >
                            Inventory
                        </span>

                    </div>


                    <h1
                        className="
                            text-3xl
                            sm:text-4xl
                            font-bold
                            tracking-tight
                        "
                    >
                        Add New Product
                    </h1>


                    <p
                        className="
                            mt-2
                            text-slate-400
                        "
                    >
                        Add a new product to your inventory
                        with its pricing, stock and images.
                    </p>

                </div>


                {/* =================================================
                    FORM CARD
                ================================================= */}

                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-800
                        bg-slate-900
                        shadow-2xl
                        overflow-hidden
                    "
                >

                    {/* =================================================
                        CARD HEADER
                    ================================================= */}

                    <div
                        className="
                            border-b
                            border-slate-800
                            px-6
                            py-5
                        "
                    >

                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-white
                            "
                        >
                            Product Information
                        </h2>


                        <p
                            className="
                                mt-1
                                text-sm
                                text-slate-400
                            "
                        >
                            Enter the details below to create your product.
                        </p>

                    </div>


                    {/* =================================================
                        FORM
                    ================================================= */}

                    <div className="p-6">

                        <InventoryForm
                            initialValues={initialValues}
                            onSubmit={handleSubmit}
                            buttontext={
                                isSubmitting
                                    ? "Adding Product..."
                                    : "Add Product"
                            }
                        />

                    </div>

                </div>

            </div>
                </main>
            </div>
        </div>

    );

}