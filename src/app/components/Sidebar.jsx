"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getUserRole } from "@/Services/authService";

export default function Sidebar({ sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen }) {
    const router = useRouter();
    const pathname = usePathname();
    const [role, setRole] = useState(null);

    useEffect(() => {
        setRole(getUserRole());
    }, []);

    const canCreateInvoice = role === "ADMIN" || role === "SALES_MANAGER";

    const logout = async () => {
        try {
            const { logout: authLogout } = await import("@/Services/authService");
            await authLogout();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            router.replace("/Login");
        }
    };

    const navItems = [
        { label: "Dashboard", path: "/Home", icon: "▦" },
        { label: "Inventory", path: "/Inventory", icon: "📦" },
        { label: "Invoicing", path: "/Invoices", icon: "🧾" },
        { label: "Reports", path: "/Reports", icon: "📊" },
        { label: "Settings", path: "/Settings", icon: "⚙" },
    ];

    const isActive = (itemPath) => {
        if (itemPath === "/Home") return pathname === "/Home" || pathname === "/";
        return pathname.startsWith(itemPath);
    };

    return (
        <>
            {/* DESKTOP SIDEBAR WITH SLIDER TOGGLE */}
            <aside
                className={`fixed left-0 top-0 hidden md:flex h-screen w-[260px] flex-col bg-[#0d1c2d]/95 backdrop-blur-xl border-r border-[#3c4a42]/80 z-40 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    sidebarCollapsed ? "-translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
                }`}
            >
                {/* BRAND HEADER & SLIDER COLLAPSE BUTTON */}
                <div className="px-6 py-6 flex items-center justify-between">
                    <div
                        onClick={() => router.push("/Home")}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-xl group-hover:scale-105 transition-all">
                            📦
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-[#4edea3] tracking-tight">InvPro SaaS</h1>
                            <p className="text-xs text-[#86948a]">Enterprise Edition</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setSidebarCollapsed(true)}
                        className="w-8 h-8 rounded-lg bg-[#051424] hover:bg-[#1c2b3c] border border-[#3c4a42] text-[#86948a] hover:text-[#4edea3] flex items-center justify-center transition-all cursor-pointer shadow-sm"
                        title="Collapse Sidebar Slider"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* ROLE BADGE */}
                {role && (
                    <div className="px-6 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border w-full justify-center ${
                            role === "ADMIN"
                                ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        }`}>
                            {role === "ADMIN" ? "🛡️ Admin" : "👤 Sales Manager"}
                        </span>
                    </div>
                )}

                {/* CREATE INVOICE QUICK ACTION - SALES_MANAGER & ADMIN */}
                {canCreateInvoice && (
                <div className="px-6 mb-6">
                    <button
                        onClick={() => router.push("/Invoices/Create")}
                        className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#10b981]/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                        <span>🧾</span>
                        Create Invoice
                    </button>
                </div>
                )}

                {/* NAVIGATION ITEMS */}
                <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => router.push(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                                    active
                                        ? "text-[#4edea3] font-semibold border-r-2 border-[#4edea3] bg-[#4edea3]/10 shadow-inner"
                                        : "text-[#bbcabf] hover:bg-[#1c2b3c]/80 hover:text-white"
                                }`}
                            >
                                <span className="text-base">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* LOGOUT FOOTER */}
                <div className="px-3 py-5 border-t border-[#3c4a42]/40">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#bbcabf] hover:bg-[#1c2b3c] hover:text-[#ffb4ab] transition-colors text-left cursor-pointer"
                    >
                        <span>↪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* MOBILE MENU DRAWER */}
            {mobileMenuOpen && setMobileMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-16 bg-[#0d1c2d] border-b border-[#3c4a42] p-4 space-y-2 z-40 shadow-2xl animate-in slide-in-from-top-2 duration-200">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => {
                                setMobileMenuOpen(false);
                                router.push(item.path);
                            }}
                            className={`w-full text-left py-2.5 px-4 rounded-lg text-sm flex items-center gap-3 ${
                                isActive(item.path)
                                    ? "bg-[#4edea3]/10 text-[#4edea3] font-semibold"
                                    : "text-[#bbcabf] hover:text-white"
                            }`}
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                    <button
                        onClick={logout}
                        className="w-full text-left py-2.5 px-4 text-[#ffb4ab] hover:bg-[#1c2b3c] rounded-lg text-sm flex items-center gap-3"
                    >
                        <span>↪</span> Logout
                    </button>
                </div>
            )}
        </>
    );
}
