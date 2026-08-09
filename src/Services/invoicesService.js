import { fakeApi } from "./fakeApi";

const Storage_key="invoice";

//getting invoice items

export async function getInvoices(){
    return fakeApi(()=>{
        return JSON.parse(localStorage.getItem(Storage_key)) || [];

    })

}

// get invoice by id

export async function getInvoiceById(id){
    return fakeApi(()=>{
        const items= JSON.parse(localStorage.getItem(Storage_key)) || [];

        return items.find((item)=>{

           return item.id=== Number(id);

        });
    });
}

//save invoice

export async function saveInvoice(invoice){
    return fakeApi(()=>{
       
        const invoices=JSON.parse(localStorage.getItem(Storage_key)) || [];
        invoices.push(invoice);

           localStorage.setItem(Storage_key, JSON.stringify(invoices));
           
        return invoices;

    });

}

// update the invoice

export async function updateInvoice(id, updatedInvoice){
    return fakeApi(()=>{
            const items=JSON.parse(localStorage.getItem(Storage_key)) || [];
            const updatedInvoices= items.map((item)=>{
                return item.id===Number(id) ? updatedInvoice: item;
            });
            localStorage.setItem(Storage_key,JSON.stringify(updatedInvoices));
            return updatedInvoice;

    });

}

export async function deleteInvoice(id){
    return fakeApi(()=>{
        const items=JSON.parse(localStorage.getItem(Storage_key)) || [];
        const deletedInvoices= items.filter((item)=>{
            return item.id!== Number(id);
        })

        localStorage.setItem(Storage_key, JSON.stringify(deletedInvoices));

        return true;

    });
}

