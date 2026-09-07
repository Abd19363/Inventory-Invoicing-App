"use client";

import {
    useState,
    useEffect
} from "react";

import {
    useParams,
    useRouter
} from "next/navigation";

import toast from "react-hot-toast";
import InventoryForm from "@/app/components/InventoryForm";

import {
    getItemById,
    updateItem,
    uploadProductImage,
} from "@/Services/inventoryService";

import useAuth from "@/hooks/useAuth";
import Sidebar from "@/app/components/Sidebar";
import useSidebarState from "@/hooks/useSidebarState";


// ======================================================
// EDIT PRODUCT PAGE
// ======================================================

export default function EditProduct() {

    const {
        checkingAuth,
        isAdmin
    } = useAuth();

    const [sidebarCollapsed, setSidebarCollapsed] = useSidebarState();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const router =
        useRouter();

    const params =
        useParams();

    const id =
        params?.id;

    // Redirect non-admins
    useEffect(() => {
        if (!checkingAuth && !isAdmin) {
            router.replace("/Inventory");
        }
    }, [checkingAuth, isAdmin, router]);


    // ==================================================
    // STATE
    // ==================================================

    const [product, setProduct] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");


    // ==================================================
    // LOAD PRODUCT
    // ==================================================

    useEffect(() => {

        if (
            !id ||
            checkingAuth
        ) {
            return;
        }


        async function loadProduct() {

            try {

                setLoading(true);

                setError("");


                const data =
                    await getItemById(id);


                console.log(
                    "Product received from backend:",
                    data
                );


                const normalizedProduct = {

                    id:
                        data?.id ??
                        Number(id),

                    name:
                        data?.name ??
                        "",

                    category:
                        data?.category ??
                        "",

                    description:
                        data?.description ??
                        "",

                    quantity:
                        Number(
                            data?.quantity ??
                            0
                        ),

                    purchasePrice:
                        Number(
                            data?.purchasePrice ??
                            data?.purchase_price ??
                            0
                        ),

                    retailPrice:
                        Number(
                            data?.retailPrice ??
                            data?.retail_price ??
                            0
                        ),

                    discount:
                        Number(
                            data?.discount ??
                            0
                        ),

                    salePrice:
                        Number(
                            data?.salePrice ??
                            data?.sale_price ??
                            0
                        ),

                    supplierId:
                        data?.supplierId ??
                        data?.supplier_id ??
                        null,

                    // ==================================
                    // EXISTING IMAGES
                    // ==================================

                    thumbnailUrl:
                        data?.thumbnailUrl ??
                        data?.thumbnail_url ??
                        null,

                    fullImageUrl:
                        data?.fullImageUrl ??
                        data?.full_image_url ??
                        null,

                };


                console.log(
                    "Normalized product:",
                    normalizedProduct
                );


                setProduct(
                    normalizedProduct
                );


            } catch (error) {

                console.error(
                    "Failed to load product:",
                    error
                );


                setError(
                    error?.message ||
                    "Failed to load product."
                );


            } finally {

                setLoading(false);

            }

        }


        loadProduct();

    }, [
        id,
        checkingAuth
    ]);


    // ==================================================
    // UPDATE PRODUCT
    // ==================================================

    async function handleSubmit(values) {

        if (!id) {

            toast.error(
                "Product ID is missing."
            );

            return;

        }


        // ==================================================
        // IMAGE SELECTION VALIDATION
        // ==================================================
        //
        // If the user selects one image, both image fields
        // must contain a file before the update can continue.
        //
        // If neither image is selected, the existing images
        // will remain unchanged.
        //

        const imageFile =
            (values.imageFile instanceof File && values.imageFile) ||
            (values.fullImageFile instanceof File && values.fullImageFile) ||
            (values.thumbnailFile instanceof File && values.thumbnailFile) ||
            null;


        try {

            setIsSubmitting(true);

            setError("");


            console.log(
                "Values received from InventoryForm:",
                values
            );


            // ==================================================
            // PRODUCT DATA
            // ==================================================

            const updatedData = {

                name:
                    values.name ??
                    "",

                category:
                    values.category ??
                    "",

                description:
                    values.description ||
                    null,

                quantity:
                    Number(
                        values.quantity ??
                        0
                    ),

                purchasePrice:
                    Number(
                        values.purchasePrice ??
                        0
                    ),

                retailPrice:
                    Number(
                        values.retailPrice ??
                        0
                    ),

                discount:
                    Number(
                        values.discount ??
                        0
                    ),

                salePrice:
                    Number(
                        values.salePrice ??
                        0
                    ),

                supplierId:
                    values.supplierId
                        ? Number(
                            values.supplierId
                        )
                        : null,

            };


            // ==================================================
            // UPDATE PRODUCT INFORMATION
            // ==================================================

            const updatedProduct =
                await updateItem(
                    Number(id),
                    updatedData
                );


            console.log(
                "Product information updated:",
                updatedProduct
            );


            // ==================================================
            // IMAGE UPDATE
            // ==================================================

            if (imageFile) {

                console.log(
                    "New product image selected:",
                    imageFile.name
                );


                await uploadProductImage(
                    Number(id),
                    imageFile
                );

                console.log(
                    "Product image updated successfully (thumbnail auto-generated)."
                );

            } else {

                console.log(
                    "No new image selected. Existing images remain unchanged."
                );

            }


            // ==================================================
            // SUCCESS
            // ==================================================

            toast.success(
                "Product has been updated successfully."
            );


            router.push(
                "/Inventory"
            );

            router.refresh();


        } catch (error) {

            console.error(
                "Product update failed:",
                error
            );


            toast.error(
                error?.message ||
                "Failed to update product."
            );


        } finally {

            setIsSubmitting(false);

        }

    }


    // ==================================================
    // AUTH CHECK
    // ==================================================

    if (checkingAuth) {

        return (

            <main className="min-h-screen bg-slate-950 text-white px-4 py-10 flex items-center justify-center">

                <div className="text-center">

                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500 mx-auto" />

                    <p className="mt-4 text-slate-400">
                        Checking authentication...
                    </p>

                </div>

            </main>

        );

    }


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <main className="min-h-screen bg-slate-950 text-white px-4 py-10">

                <div className="max-w-5xl mx-auto">

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

                        <p className="text-slate-400">
                            Loading product...
                        </p>

                    </div>

                </div>

            </main>

        );

    }


    // ==================================================
    // ERROR
    // ==================================================

    if (error) {

        return (

            <main className="min-h-screen bg-slate-950 text-white px-4 py-10">

                <div className="max-w-5xl mx-auto">

                    <div className="rounded-2xl border border-rose-500/30 bg-slate-900 p-8">

                        <h2 className="text-xl font-semibold text-rose-400">
                            Failed to load product
                        </h2>

                        <p className="mt-2 text-slate-400">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/Inventory"
                                )
                            }
                            className="mt-6 rounded-xl bg-slate-700 px-5 py-3 font-semibold text-white hover:bg-slate-600"
                        >
                            Back to Inventory
                        </button>

                    </div>

                </div>

            </main>

        );

    }


    // ==================================================
    // PRODUCT NOT FOUND
    // ==================================================

    if (!product) {

        return (

            <main className="min-h-screen bg-slate-950 text-white px-4 py-10">

                <div className="max-w-5xl mx-auto">

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

                        <h2 className="text-xl font-semibold">
                            Product not found
                        </h2>

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/Inventory"
                                )
                            }
                            className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500"
                        >
                            Back to Inventory
                        </button>

                    </div>

                </div>

            </main>

        );

    }


    // ==================================================
    // EDIT PAGE
    // ==================================================

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

                {/* HEADER */}

                <div className="mb-8">

                    <div className="mb-2 flex items-center gap-2">

                        <div className="h-8 w-1 rounded-full bg-emerald-500" />

                        <span className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
                            Inventory
                        </span>

                    </div>


                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Edit Product
                    </h1>


                    <p className="mt-2 text-slate-400">
                        Update the product information, pricing, stock details and image.
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
                            Modify the details below and save your changes.
                        </p>

                    </div>


                    {/* FORM */}

                    <div className="p-6">

                        <InventoryForm
                            initialValues={product}
                            onSubmit={handleSubmit}
                            buttontext={
                                isSubmitting
                                    ? "Updating Product..."
                                    : "Update Product"
                            }
                            isEdit={true}
                        />

                    </div>

                </div>

            </div>
                </main>
            </div>
        </div>

    );

}