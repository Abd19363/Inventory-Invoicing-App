import { fakeApi } from "./fakeApi";

const STORAGE_KEY = "invoices";

// ==========================================
// GET ALL INVOICES
// ==========================================

export async function getInvoices() {

    return fakeApi(() => {

        return (
            JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            ) || []
        );

    });

}


// ==========================================
// GET INVOICE BY ID
// ==========================================

export async function getInvoiceById(id) {

    return fakeApi(() => {

        const invoices =
            JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            ) || [];

        return invoices.find(
            (invoice) =>
                invoice.id === Number(id)
        );

    });

}


// ==========================================
// SAVE INVOICE
// ==========================================

export async function saveInvoice(invoice) {

    return fakeApi(() => {

        const invoices =
            JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            ) || [];

        invoices.push(invoice);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(invoices)
        );

        return invoices;

    });

}


// ==========================================
// UPDATE INVOICE
// ==========================================

export async function updateInvoice(
    id,
    updatedInvoice
) {

    return fakeApi(() => {

        const invoices =
            JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            ) || [];

        const updatedInvoices =
            invoices.map((invoice) => {

                return invoice.id === Number(id)
                    ? updatedInvoice
                    : invoice;

            });

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updatedInvoices)
        );

        return updatedInvoice;

    });

}


// ==========================================
// DELETE INVOICE
// ==========================================

export async function deleteInvoice(id) {

    return fakeApi(() => {

        const invoices =
            JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            ) || [];

        const updatedInvoices =
            invoices.filter((invoice) => {

                return invoice.id !== Number(id);

            });

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updatedInvoices)
        );

        return true;

    });

}