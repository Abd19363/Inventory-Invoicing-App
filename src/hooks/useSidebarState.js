"use client";

import { useState, useEffect } from "react";

export default function useSidebarState() {
    const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("invpro_sidebar_collapsed");
            if (saved !== null) {
                setSidebarCollapsedState(saved === "true");
            }
        }
    }, []);

    const setSidebarCollapsed = (collapsed) => {
        const value = typeof collapsed === "function" ? collapsed(sidebarCollapsed) : collapsed;
        setSidebarCollapsedState(value);
        if (typeof window !== "undefined") {
            localStorage.setItem("invpro_sidebar_collapsed", String(value));
        }
    };

    return [sidebarCollapsed, setSidebarCollapsed];
}
