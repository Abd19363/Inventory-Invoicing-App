import {configureStore} from "@reduxjs/toolkit";
import invoiceDraftSlice from "./invoiceDraftSlice";

export const store= configureStore({
    reducer:{
        invoiceDraft: invoiceDraftSlice,
    }

});