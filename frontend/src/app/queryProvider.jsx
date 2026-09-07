"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { children, useState } from "react";

export default function QueryProvicer({children}){
    const [queryClient]=useState(()=>new QueryClient());
    
    return(
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>

    );
}



