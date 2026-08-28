"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Sidebar from "@/app/components/Sidebar";
import useSidebarState from "@/hooks/useSidebarState";

export default function SettingsPage() {
    const { checkingAuth } = useAuth();
    const router = useRouter();

    // Active Settings Tab
    const [activeTab, setActiveTab] = useState("store");
    const [sidebarCollapsed, setSidebarCollapsed] = useSidebarState();

    // Store Profile State
    const [storeName, setStoreName] = useState("InvPro Enterprise");
    const [storeEmail, setStoreEmail] = useState("support@invpro.com");
    const [storePhone, setStorePhone] = useState("+92 300 1234567");
    const [storeAddress, setStoreAddress] = useState("Suite 404, Tech Tower, Lahore, Pakistan");
    const [currency, setCurrency] = useState("PKR");

    // Inventory Alert State
    const [lowStockThreshold, setLowStockThreshold] = useState(5);
    const [enableLowStockAlerts, setEnableLowStockAlerts] = useState(true);

    // Security State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [securityMessage, setSecurityMessage] = useState({ type: "", text: "" });

    // Success Banner
    const [saveMessage, setSaveMessage] = useState("");

    // Mobile Menu
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Load initial settings from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedStoreName = localStorage.getItem("setting_storeName");
            if (savedStoreName) setStoreName(savedStoreName);

            const savedStoreEmail = localStorage.getItem("setting_storeEmail");
            if (savedStoreEmail) setStoreEmail(savedStoreEmail);

            const savedCurrency = localStorage.getItem("setting_currency");
            if (savedCurrency) setCurrency(savedCurrency);

            const savedThreshold = localStorage.getItem("setting_lowStockThreshold");
            if (savedThreshold) setLowStockThreshold(Number(savedThreshold));
        }
    }, []);

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

    const handleSaveStoreSettings = (e) => {
        e.preventDefault();
        if (typeof window !== "undefined") {
            localStorage.setItem("setting_storeName", storeName);
            localStorage.setItem("setting_storeEmail", storeEmail);
            localStorage.setItem("setting_currency", currency);
            localStorage.setItem("setting_lowStockThreshold", String(lowStockThreshold));
        }
        setSaveMessage("Settings saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        setSecurityMessage({ type: "", text: "" });

        if (!currentPassword) {
            setSecurityMessage({ type: "error", text: "Current password is required." });
            return;
        }
        if (newPassword.length < 6) {
            setSecurityMessage({ type: "error", text: "New password must be at least 6 characters long." });
            return;
        }
        if (newPassword !== confirmPassword) {
            setSecurityMessage({ type: "error", text: "New passwords do not match." });
            return;
        }

        setSecurityMessage({ type: "success", text: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSecurityMessage({ type: "", text: "" }), 4000);
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-spin">⚙</div>
                    <p className="text-lg font-semibold text-[#4edea3]">Loading Settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex">
            <Sidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* MAIN CONTENT AREA */}
            <div className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarCollapsed ? "md:ml-0" : "md:ml-[260px]"} min-h-screen flex flex-col`}>
                {/* RESPONSIVE HEADER */}
                <header className="sticky top-0 bg-[#051424]/90 backdrop-blur-md border-b border-[#3c4a42] px-4 md:px-8 py-3.5 flex items-center justify-between z-30">
                    <div className="flex items-center gap-3">
                        {sidebarCollapsed && (
                            <button
                                onClick={() => setSidebarCollapsed(false)}
                                className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0d1c2d] border border-[#3c4a42] text-[#bbcabf] hover:text-[#4edea3] hover:border-[#10b981]/50 text-xs font-semibold transition-all cursor-pointer shadow-md"
                                title="Expand Sidebar Slider"
                            >
                                <svg className="w-4 h-4 text-[#4edea3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                                <span>Sidebar Slider</span>
                            </button>
                        )}
                        <div className="flex items-center gap-3 md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-[#bbcabf] hover:text-white text-xl"
                            >
                                ☰
                            </button>
                            <span className="text-lg font-bold text-[#4edea3]">InvPro</span>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <h2 className="text-sm font-semibold text-[#86948a]">System Preferences & Configuration</h2>
                    </div>

                    <button
                        onClick={() => router.push("/Home")}
                        className="bg-[#1c2b3c] hover:bg-[#25374c] text-[#bbcabf] hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold"
                    >
                        ← Back to Dashboard
                    </button>
                </header>

                {/* MOBILE DRAWER */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-[#0d1c2d] border-b border-[#3c4a42] p-4 space-y-2">
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                router.push("/Home");
                            }}
                            className="w-full text-left py-2 px-3 text-[#bbcabf] hover:text-white"
                        >
                            ▦ Dashboard
                        </button>
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                router.push("/Inventory");
                            }}
                            className="w-full text-left py-2 px-3 text-[#bbcabf] hover:text-white"
                        >
                            📦 Inventory
                        </button>
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                router.push("/Invoices");
                            }}
                            className="w-full text-left py-2 px-3 text-[#bbcabf] hover:text-white"
                        >
                            🧾 Invoicing
                        </button>
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                router.push("/Reports");
                            }}
                            className="w-full text-left py-2 px-3 text-[#bbcabf] hover:text-white"
                        >
                            📊 Reports
                        </button>
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                router.push("/Settings");
                            }}
                            className="w-full text-left py-2 px-3 text-[#4edea3] font-semibold"
                        >
                            ⚙ Settings
                        </button>
                    </div>
                )}

                {/* MAIN BODY */}
                <main className="p-4 md:p-8 space-y-8 flex-1 max-w-5xl">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">System Settings</h1>
                        <p className="text-sm text-[#86948a] mt-1">
                            Manage store profile, stock alerts, currency formats, and security options.
                        </p>
                    </div>

                    {saveMessage && (
                        <div className="bg-[#10b981]/15 border border-[#10b981]/40 text-[#4edea3] px-4 py-3 rounded-xl text-sm font-semibold animate-pulse">
                            ✓ {saveMessage}
                        </div>
                    )}

                    {/* SETTINGS TABS */}
                    <div className="flex border-b border-[#3c4a42] gap-4 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab("store")}
                            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
                                activeTab === "store"
                                    ? "border-[#4edea3] text-[#4edea3]"
                                    : "border-transparent text-[#86948a] hover:text-white"
                            }`}
                        >
                            🏪 Store Profile & Currency
                        </button>
                        <button
                            onClick={() => setActiveTab("inventory")}
                            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
                                activeTab === "inventory"
                                    ? "border-[#4edea3] text-[#4edea3]"
                                    : "border-transparent text-[#86948a] hover:text-white"
                            }`}
                        >
                            📦 Inventory & Alerts
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
                                activeTab === "security"
                                    ? "border-[#4edea3] text-[#4edea3]"
                                    : "border-transparent text-[#86948a] hover:text-white"
                            }`}
                        >
                            🔒 Security & Password
                        </button>
                    </div>

                    {/* TAB CONTENT: STORE PROFILE */}
                    {activeTab === "store" && (
                        <form onSubmit={handleSaveStoreSettings} className="bg-[#0d1c2d] border border-[#3c4a42] rounded-xl p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-white">Store Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs uppercase font-semibold text-[#86948a] mb-2">
                                        Business / Store Name
                                    </label>
                                    <input
                                        type="text"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        required
                                        className="w-full bg-[#051424] border border-[#3c4a42] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] outline-none focus:border-[#10b981]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase font-semibold text-[#86948a] mb-2">
                                        Official Support Email
                                    </label>
                                    <input
                                        type="email"
                                        value={storeEmail}
                                        onChange={(e) => setStoreEmail(e.target.value)}
                                        required
                                        className="w-full bg-[#051424] border border-[#3c4a42] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] outline-none focus:border-[#10b981]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase font-semibold text-[#86948a] mb-2">
                                        Contact Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={storePhone}
                                        onChange={(e) => setStorePhone(e.target.value)}
                                        className="w-full bg-[#051424] border border-[#3c4a42] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] outline-none focus:border-[#10b981]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase font-semibold text-[#86948a] mb-2">
                                        Primary Currency
                                    </label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full bg-[#051424] border border-[#3c4a42] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] outline-none focus:border-[#10b981]"
                                    >
                                        <option value="PKR">Pakistani Rupee (Rs.)</option>
                                        <option value="USD">US Dollar ($)</option>
                                        <option value="EUR">Euro (€)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase font-semibold text-[#86948a] mb-2">
                                    Business Address
                                </label>
                                <textarea
                                    rows="3"
                                    value={storeAddress}
                                    onChange={(e) => setStoreAddress(e.target.value)}
                                    className="w-full bg-[#051424] border border-[#3c4a42] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] outline-none focus:border-[#10b981]"
                                />
                            </div>

                            <button
                                type="submit"
                                className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-[#10b981]/20 transition-all"
                            >
                                Save Store Profile
                            </button>
                        </form>
                    )}

                    {/* TAB CONTENT: INVENTORY ALERTS */}
                    {activeTab === "inventory" && (
                        <form onSubmit={handleSaveStoreSettings} className="bg-[#0d1c2d] border border-[#3c4a42] rounded-xl p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-white">Stock Alert Thresholds</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase font-semibold text-[#86948a] mb-2">
                                        Low Stock Threshold Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={lowStockThreshold}
                                        onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                                        className="w-full md:w-64 bg-[#051424] border border-[#3c4a42] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] outline-none focus:border-[#10b981]"
                                    />
                                    <p className="text-xs text-[#86948a] mt-1">
                                        Products with stock below this quantity will be flagged as Low Stock.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="alerts"
                                        checked={enableLowStockAlerts}
                                        onChange={(e) => setEnableLowStockAlerts(e.target.checked)}
                                        className="w-4 h-4 accent-[#10b981]"
                                    />
                                    <label htmlFor="alerts" className="text-sm text-[#d4e4fa]">
                                        Enable dashboard low stock warning alerts
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-[#10b981]/20 transition-all"
                            >
                                Save Inventory Preferences
                            </button>
                        </form>
                    )}

                    {/* TAB CONTENT: SECURITY */}
                    {activeTab === "security" && (
                        <form onSubmit={handleChangePassword} className="bg-[#0d1c2d] border border-[#3c4a42] rounded-xl p-6 space-y-6">
                            <h2 className="text-lg font-semibold text-white">Change Account Password</h2>

                            {securityMessage.text && (
                                <div
                                    className={`px-4 py-3 rounded-lg text-sm font-semibold ${
                                        securityMessage.type === "error"
                                            ? "bg-rose-500/15 border border-rose-500/40 text-rose-300"
                                            : "bg-[#10b981]/15 border border-[#10b981]/40 text-[#4edea3]"
                                    }`}
                                >
                                    {securityMessage.text}
                                </div>
                            )}

                            <div className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-xs uppercase font-semibold text-[#86948a] mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        className="w-full bg-[#051424] border border-[#3c4a42] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] outline-none focus:border-[#10b981]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase font-semibold text-[#86948a] mb-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full bg-[#051424] border border-[#3c4a42] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] outline-none focus:border-[#10b981]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase font-semibold text-[#86948a] mb-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full bg-[#051424] border border-[#3c4a42] rounded-lg px-4 py-2.5 text-sm text-[#d4e4fa] outline-none focus:border-[#10b981]"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-[#10b981]/20 transition-all"
                            >
                                Update Password
                            </button>
                        </form>
                    )}
                </main>
            </div>
        </div>
    );
}
