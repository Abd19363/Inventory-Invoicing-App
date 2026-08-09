"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

import InventoryForm from "@/app/components/InventoryForm";
import { getItemById, updateItem } from "@/Services/inventoryService";
import useAuth from "@/hooks/useAuth";

export default function EditProduct(){

    useAuth();

    const router= useRouter();

    const{id}=useParams();

    const [product, setProduct]=useState(null);

    useEffect(() =>{
        loadProduct();
    
    }, [])

    async function loadProduct(){
    
     try{
         const product= await getItemById(id);
         setProduct(product);

     }catch(error){
        console.log(error)

      }
    }

    async function handleSubmit(values){

      try{
          await updateItem({
              ...values,
              id: Number(id)
            })

          alert("Product has been Updated successfully");
          router.push("/Inventory");

        }catch(error){
            alert("error.message");
 
        }

    }

    if(product === null){

     return (
         <div>
              <h2>Loading...</h2>
         </div>

     );
    }

    console.log(product);

   return(
       <div>
          <InventoryForm 
            initialValues={product}
            onSubmit={handleSubmit}
            buttontext="update Product"
        
           />
        </div>

    );

}

