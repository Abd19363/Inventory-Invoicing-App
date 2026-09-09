"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Sidebar from "@/app/components/Sidebar";
import useSidebarState from "@/hooks/useSidebarState";
import { useAdminTheme } from "@/app/components/AdminThemeProvider";

export default function SettingsPage() {
    const { checkingAuth, isAdmin } = useAuth();
    const router = useRouter();
    const { currentTheme, setTheme, resetTheme, themes } = useAdminTheme();

    // Active Settings Tab
    const [activeTab, setActiveTab] = useState("store");
    const [sidebarCollapsed, setSidebarCollapsed] = useSidebarState();
    const [themeSaveMessage, setThemeSaveMessage] = useState("");

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
                        {isAdmin && (
                            <button
                                onClick={() => setActiveTab("theme")}
                                className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                                    activeTab === "theme"
                                        ? "border-[#4edea3] text-[#4edea3]"
                                        : "border-transparent text-[#86948a] hover:text-white"
                                }`}
                            >
                                <span>🎨</span>
                                <span>Theme & Appearance</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#10b981]/20 text-[#4edea3] uppercase tracking-wider">
                                    Admin
                                </span>
                            </button>
                        )}
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

                    {/* TAB CONTENT: THEME & APPEARANCE (ADMIN ONLY) */}
                    {activeTab === "theme" && isAdmin && (
                        <div className="space-y-6">
                            {/* INTRO CARD */}
                            <div className="bg-[#0d1c2d] border border-[#3c4a42] rounded-xl p-6 relative overflow-hidden">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xl">🎨</span>
                                            <h2 className="text-lg font-bold text-white tracking-tight">Admin Theme Customization</h2>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#10b981]/20 text-[#4edea3] uppercase tracking-wider">
                                                Admin Only
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#86948a] max-w-2xl leading-relaxed">
                                            Choose an exclusive color scheme for your admin account. The selected theme consistently styles your Dashboard, Inventory, Invoices, Reports, Settings, Sidebar, and charts. Non-admin accounts (such as Sales Managers) will always see the default app theme.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                resetTheme();
                                                setThemeSaveMessage("Reset to Default App Theme!");
                                                setTimeout(() => setThemeSaveMessage(""), 3000);
                                            }}
                                            className="px-3.5 py-2 rounded-lg bg-[#1c2b3c] hover:bg-[#25374c] text-xs font-semibold text-[#bbcabf] hover:text-white transition-all cursor-pointer border border-[#3c4a42]"
                                        >
                                            Reset to Default
                                        </button>
                                    </div>
                                </div>

                                {themeSaveMessage && (
                                    <div className="mt-4 bg-[#10b981]/15 border border-[#10b981]/40 text-[#4edea3] px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                                        <span>✓</span>
                                        <span>{themeSaveMessage}</span>
                                    </div>
                                )}
                            </div>

                            {/* 4 THEME CARDS GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {themes.map((theme) => {
                                    const isSelected = currentTheme === theme.id;
                                    return (
                                        <div
                                            key={theme.id}
                                            onClick={() => {
                                                setTheme(theme.id);
                                                setThemeSaveMessage(`Active theme set to "${theme.name}"!`);
                                                setTimeout(() => setThemeSaveMessage(""), 3000);
                                            }}
                                            className={`relative rounded-xl border p-5 transition-all cursor-pointer group flex flex-col justify-between ${
                                                isSelected
                                                    ? "bg-[#0d1c2d] border-[#10b981] shadow-lg shadow-[#10b981]/10 ring-1 ring-[#10b981]/50"
                                                    : "bg-[#0d1c2d]/70 hover:bg-[#0d1c2d] border-[#3c4a42] hover:border-[#10b981]/40"
                                            }`}
                                        >
                                            <div>
                                                {/* CARD HEADER */}
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                                                isSelected
                                                                    ? "border-[#10b981] bg-[#10b981]"
                                                                    : "border-[#86948a] group-hover:border-[#bbcabf]"
                                                            }`}
                                                        >
                                                            {isSelected && (
                                                                <span className="text-white text-[10px] font-bold">✓</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="text-sm font-bold text-white group-hover:text-[#4edea3] transition-colors">
                                                                    {theme.name}
                                                                </h3>
                                                                {theme.id === "default" && (
                                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1c2b3c] text-[#86948a] font-medium border border-[#3c4a42]">
                                                                        Default
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-[#86948a] font-medium">{theme.tagline}</p>
                                                        </div>
                                                    </div>

                                                    {isSelected ? (
                                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#10b981]/20 text-[#4edea3] border border-[#10b981]/40 shrink-0">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium text-[#86948a] group-hover:text-white shrink-0">
                                                            Click to apply
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-[#bbcabf] mb-4 leading-relaxed">
                                                    {theme.description}
                                                </p>

                                                {/* COLOR SWATCHES */}
                                                <div className="mb-4">
                                                    <div className="text-[10px] uppercase font-bold text-[#86948a] tracking-wider mb-2">
                                                        Palette Swatches
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-7 h-7 rounded-lg border border-white/10 shadow-inner flex items-center justify-center text-[9px] font-mono text-white/70"
                                                            style={{ backgroundColor: theme.colors.bg }}
                                                            title={`Background: ${theme.colors.bg}`}
                                                        >
                                                            BG
                                                        </div>
                                                        <div
                                                            className="w-7 h-7 rounded-lg border border-white/10 shadow-inner flex items-center justify-center text-[9px] font-mono text-white/70"
                                                            style={{ backgroundColor: theme.colors.surface }}
                                                            title={`Surface: ${theme.colors.surface}`}
                                                        >
                                                            Card
                                                        </div>
                                                        <div
                                                            className="w-7 h-7 rounded-lg border border-white/10 shadow-inner flex items-center justify-center text-[9px] font-mono text-white/90"
                                                            style={{ backgroundColor: theme.colors.accent }}
                                                            title={`Accent: ${theme.colors.accent}`}
                                                        >
                                                            CTA
                                                        </div>
                                                        <div
                                                            className="w-7 h-7 rounded-lg border border-white/10 shadow-inner flex items-center justify-center text-[9px] font-mono text-white/90"
                                                            style={{ backgroundColor: theme.colors.highlight }}
                                                            title={`Highlight: ${theme.colors.highlight}`}
                                                        >
                                                            HL
                                                        </div>
                                                        <div
                                                            className="w-7 h-7 rounded-lg border border-white/10 shadow-inner flex items-center justify-center text-[9px] font-mono text-white/70"
                                                            style={{ backgroundColor: theme.colors.border }}
                                                            title={`Border: ${theme.colors.border}`}
                                                        >
                                                            Brd
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* MINI LIVE PREVIEW BOX */}
                                            <div
                                                className="rounded-lg p-3 border transition-all text-xs"
                                                style={{
                                                    backgroundColor: theme.colors.bg,
                                                    borderColor: theme.colors.border,
                                                    color: theme.colors.text,
                                                }}
                                            >
                                                <div className="flex items-center justify-between pb-2 mb-2 border-b" style={{ borderColor: theme.colors.border }}>
                                                    <div className="flex items-center gap-1.5 font-bold" style={{ color: theme.colors.highlight }}>
                                                        <span>📦</span>
                                                        <span className="text-[11px]">InvPro SaaS</span>
                                                    </div>
                                                    <span
                                                        className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                                                        style={{
                                                            backgroundColor: `${theme.colors.accent}25`,
                                                            color: theme.colors.highlight,
                                                            border: `1px solid ${theme.colors.accent}50`,
                                                        }}
                                                    >
                                                        Admin
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <div
                                                        className="p-2 rounded border text-[10px]"
                                                        style={{
                                                            backgroundColor: theme.colors.surface,
                                                            borderColor: theme.colors.border,
                                                        }}
                                                    >
                                                        <div style={{ color: theme.colors.muted }}>Total Revenue</div>
                                                        <div className="font-bold text-xs mt-0.5" style={{ color: theme.colors.text }}>$48,920</div>
                                                    </div>
                                                    <div
                                                        className="p-2 rounded border text-[10px]"
                                                        style={{
                                                            backgroundColor: theme.colors.surface,
                                                            borderColor: theme.colors.border,
                                                        }}
                                                    >
                                                        <div style={{ color: theme.colors.muted }}>Active Invoices</div>
                                                        <div className="font-bold text-xs mt-0.5" style={{ color: theme.colors.highlight }}>128 Paid</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-1">
                                                    <button
                                                        type="button"
                                                        className="px-2.5 py-1 rounded text-[10px] font-bold text-white shadow-sm transition-opacity"
                                                        style={{ backgroundColor: theme.colors.accent }}
                                                    >
                                                        + New Invoice
                                                    </button>
                                                    <span className="text-[10px]" style={{ color: theme.colors.muted }}>
                                                        Live Preview
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ACTIVE THEME SUMMARY & ACTIONS */}
                            <div className="bg-[#0d1c2d] border border-[#3c4a42] rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-xs text-[#86948a] flex items-center gap-2">
                                    <span className="text-base">🛡️</span>
                                    <span>
                                        Current Active Theme:{" "}
                                        <strong className="text-white">
                                            {themes.find((t) => t.id === currentTheme)?.name || "Default Theme"}
                                        </strong>{" "}
                                        (Applied throughout your admin account only)
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setThemeSaveMessage("All theme preferences are saved and active!");
                                            setTimeout(() => setThemeSaveMessage(""), 3000);
                                        }}
                                        className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-lg text-xs font-semibold shadow-md shadow-[#10b981]/20 transition-all cursor-pointer"
                                    >
                                        Save Theme Preference
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
