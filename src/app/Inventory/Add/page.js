"use client";

import InventoryForm from "@/app/components/InventoryForm";
// import { useRouter } from "next/navigation";
import { addItems } from "@/Services/inventoryService";
import useAuth from "@/hooks/useAuth";

export default function AddProduct(){
    useAuth();
    // const router= useRouter();
    const initialValues ={
        name:"",
        category:"",
        quantity:"",
        purchasePrice:"",
        retailPrice: "",
        discount: 0,
        
    };

    const handlesubmit=async(values)=>{
        console.log("submitted values:", values);
        try{
            await addItems(values);
            alert("Product added successfully.")
            // router.push("/Inventory")
        } catch(error){
            alert(error.message);
        }

    };
    return(
        <div>
            <InventoryForm 
             initialValues={initialValues}
             onSubmit={handlesubmit}
             buttontext="Add Product"

            />
        </div>

    );
}