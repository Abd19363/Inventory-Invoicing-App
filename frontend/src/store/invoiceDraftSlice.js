import { createSlice } from "@reduxjs/toolkit";

const invoiceslice = createSlice({
    name: "invoiceDraft",
    initialState: {
        customerName: "",
        date: "",
        items: []

    },

    reducers: {

        addItem: (state, action) => {
            state.items.push(action.payload);
        },

        updateQuantity: (state, action) => {
            const item = state.items.find(
                (item) => item.id === action.payload.productId
            );

            if (item) {
                item.invoiceQuantity = action.payload.quantity;
            }
        },

        deleteProduct: (state, action) => {
            state.items = state.items.filter(
                (item) => item.id !== action.payload.productId
            );
        },

        setCustomerName: (state, action) => {
            state.customerName = action.payload;
        },

        setDate: (state, action) => {
            state.date = action.payload;
        },

        clearDraft: (state) => {
            state.customerName = "";
            state.date = "";
            state.items = [];
        }
    }



});

export const { addItem, updateQuantity, deleteProduct, setCustomerName, setDate, clearDraft } = invoiceslice.actions;

export default invoiceslice.reducer;

