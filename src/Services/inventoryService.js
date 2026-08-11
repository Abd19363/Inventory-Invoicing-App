import { fakeApi } from "./fakeApi";

const storage_key = "inventory";


/* =========================
   GET ALL PRODUCTS
========================= */

export async function getItems() {

    return fakeApi(() => {

        const items =
            JSON.parse(
                localStorage.getItem(storage_key)
            ) || [];

        return items;

    });

}


/* =========================
   GET PRODUCT BY ID
========================= */

export async function getItemById(id) {

    return fakeApi(() => {

        const items =
            JSON.parse(
                localStorage.getItem(storage_key)
            ) || [];

        return items.find(
            (item) => item.id === Number(id)
        );

    });

}


/* =========================
   ADD PRODUCT
========================= */

export async function addItems(item) {

    return fakeApi(() => {

        const items =
            JSON.parse(
                localStorage.getItem(storage_key)
            ) || [];


        const newItem = {

            ...item,

            id: Date.now(),

            quantity:
                Number(item.quantity),

            purchasePrice:
                Number(item.purchasePrice),

            retailPrice:
                Number(item.retailPrice),

            discount:
                Number(item.discount),

            salePrice:
                Number(item.salePrice)

        };

        items.push(newItem);

        localStorage.setItem(
            storage_key,
            JSON.stringify(items)
        );

        console.log(
            "New Product Added:",
            newItem
        );

        return newItem;

    });

}


/* =========================
   DELETE PRODUCT
========================= */

export async function deleteItem(id) {

    return fakeApi(() => {

        const items =
            JSON.parse(
                localStorage.getItem(storage_key)
            ) || [];


        const updatedItems =
            items.filter(
                (item) => item.id !== Number(id)
            );

        localStorage.setItem(
            storage_key,
            JSON.stringify(updatedItems)
        );

        return true;

    });

}


/* =========================
   UPDATE PRODUCT
========================= */

export async function updateItem(id, updatedData) {

    return fakeApi(() => {

        const items =
            JSON.parse(
                localStorage.getItem(storage_key)
            ) || [];


        const index =
            items.findIndex(
                (item) => item.id === Number(id)
            );


        if (index === -1) {

            throw new Error(
                "Product not found"
            );

        }

        const updatedProduct = {

            ...items[index],

            ...updatedData,

            quantity:
                Number(updatedData.quantity),

            purchasePrice:
                Number(updatedData.purchasePrice),

            retailPrice:
                Number(updatedData.retailPrice),

            discount:
                Number(updatedData.discount),

            salePrice:
                Number(updatedData.salePrice)

        };


        items[index] =
            updatedProduct;

        localStorage.setItem(
            storage_key,
            JSON.stringify(items)
        );

        return updatedProduct;

    });

}