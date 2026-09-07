"use client";

import { register, login } from "@/Services/authService";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ==========================================
// ROLE CONFIG
// ==========================================

const ROLES = {
    ADMIN: {
        key: "ADMIN",
        label: "Admin",
        icon: "🛡️",
        color: "purple",
        accent: "#a855f7",
        accentDim: "#a855f720",
        accentBorder: "#a855f740",
        accentHover: "#9333ea",
        description: "Full system control",
        perms: [
            "Manage all products & inventory",
            "Create, edit & delete invoices",
            "Access business reports",
            "System settings & configuration",
        ],
    },
    SALES_MANAGER: {
        key: "SALES_MANAGER",
        label: "Sales Manager",
        icon: "👤",
        color: "emerald",
        accent: "#10b981",
        accentDim: "#10b98120",
        accentBorder: "#10b98140",
        accentHover: "#059669",
        description: "Sales & invoicing access",
        perms: [
            "View full product catalogue",
            "Create & manage invoices",
            "Access sales reports",
            "Customer management",
        ],
    },
};

// ==========================================
// INPUT COMPONENT
// ==========================================

function FormInput({ id, label, type, placeholder, value, onChange, onKeyDown, icon }) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-xs font-semibold tracking-wider uppercase text-[#8899aa] mb-2">
                {label}
            </label>
            <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#55667a] text-base select-none">
                    {icon}
                </span>
                <input
                    id={id}
                    type={isPassword && show ? "text" : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    autoComplete={isPassword ? "current-password" : "email"}
                    className="w-full rounded-xl bg-[#0c1829] border border-[#1e3050] text-[#d4e4fa] placeholder-[#3a5070] pl-10 pr-10 py-3 text-sm outline-none transition-all focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
                />
                {isPassword && (
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShow(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#55667a] hover:text-[#99aabb] transition-colors text-sm"
                    >
                        {show ? "🙈" : "👁"}
                    </button>
                )}
            </div>
        </div>
    );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function LoginPage() {
    const router = useRouter();

    // Step 1: role selection  |  Step 2: auth (login/register)
    const [step, setStep] = useState("role"); // "role" | "auth"
    const [selectedRole, setSelectedRole] = useState(null);
    const [authTab, setAuthTab] = useState("login"); // "login" | "register"

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Auto-select role if passed in URL query e.g. /Login?role=ADMIN
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const r = params.get("role")?.toUpperCase();
            if (r && ROLES[r]) {
                setSelectedRole(r);
                setStep("auth");
            }
        }
    }, []);

    const role = ROLES[selectedRole];

    // ==========================================
    // SELECT ROLE → go to auth
    // ==========================================

    function handleSelectRole(roleKey) {
        setSelectedRole(roleKey);
        setStep("auth");
        setError("");
        setSuccess("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    }

    // ==========================================
    // REGISTER
    // ==========================================

    async function handleRegister() {
        setError("");
        setSuccess("");
        if (!email.trim()) return setError("Please enter your email address.");
        if (!password) return setError("Please enter a password.");
        if (password.length < 6) return setError("Password must be at least 6 characters.");
        if (password !== confirmPassword) return setError("Passwords do not match.");

        setLoading(true);
        try {
            await register(email, password, selectedRole);
            setSuccess("Account created! You can now sign in.");
            setAuthTab("login");
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // LOGIN
    // ==========================================

    async function handleLogin() {
        setError("");
        setSuccess("");
        if (!email.trim()) return setError("Please enter your email address.");
        if (!password) return setError("Please enter your password.");

        setLoading(true);
        try {
            const data = await login(email, password);

            // Role mismatch warning (soft check)
            if (data.role && data.role !== selectedRole) {
                // Still proceed — backend is source of truth
            }

            const stored = localStorage.getItem("accessToken");
            if (!stored) throw new Error("Login succeeded but token was not stored.");

            router.replace("/Home");
        } catch (err) {
            setError(err?.message || "Login failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    }

    function handleKey(e) {
        if (e.key !== "Enter") return;
        authTab === "login" ? handleLogin() : handleRegister();
    }

    // ==========================================
    // RENDER — STEP 1: ROLE SELECTION
    // ==========================================

    if (step === "role") {
        return (
            <main className="min-h-screen bg-[#040d1a] text-[#d4e4fa] flex items-center justify-center p-6 relative overflow-hidden">

                {/* Ambient glows */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full bg-purple-600/8 blur-[160px]" />
                    <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full bg-emerald-500/8 blur-[160px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 rounded-full bg-blue-500/5 blur-[120px]" />
                </div>

                <div className="relative z-10 w-full max-w-3xl">

                    {/* Back to Home Button */}
                    <div className="mb-6">
                        <button
                            onClick={() => router.push("/")}
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8899bb] hover:text-[#10b981] bg-[#0d1c2d] hover:bg-[#16273b] border border-[#1e3050] px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
                        >
                            <span>←</span> Back to Landing Page
                        </button>
                    </div>

                    {/* Brand */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0d1c2d] border border-[#1e3050] mb-5 shadow-2xl shadow-black/50">
                            <span className="text-4xl">📦</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            Inv<span className="text-[#10b981]">Pro</span> SaaS
                        </h1>
                        <p className="text-[#6680a0] mt-2 text-base font-medium">
                            Enterprise Inventory & Invoice Management
                        </p>
                    </div>

                    {/* Prompt */}
                    <div className="text-center mb-8">
                        <p className="text-[#8899bb] text-sm font-semibold tracking-widest uppercase">
                            Choose your access level to continue
                        </p>
                    </div>

                    {/* Role Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {Object.values(ROLES).map((r) => (
                            <button
                                key={r.key}
                                onClick={() => handleSelectRole(r.key)}
                                className="group relative text-left rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 cursor-pointer"
                                style={{
                                    background: `linear-gradient(135deg, #0d1c2d 0%, #091525 100%)`,
                                    borderColor: "#1e3050",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = r.accent;
                                    e.currentTarget.style.boxShadow = `0 20px 60px ${r.accent}20`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = "#1e3050";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                {/* Icon + Label */}
                                <div className="flex items-center gap-4 mb-5">
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg border"
                                        style={{ background: r.accentDim, borderColor: r.accentBorder }}
                                    >
                                        {r.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{r.label}</h2>
                                        <p className="text-xs mt-0.5" style={{ color: r.accent }}>
                                            {r.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Permissions list */}
                                <ul className="space-y-2.5 mb-6">
                                    {r.perms.map((p) => (
                                        <li key={p} className="flex items-start gap-2.5 text-sm text-[#8899bb]">
                                            <span className="mt-0.5 text-xs" style={{ color: r.accent }}>✓</span>
                                            {p}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <div
                                    className="flex items-center justify-between py-3 px-4 rounded-xl text-sm font-semibold text-white transition-colors"
                                    style={{ background: r.accentDim, border: `1px solid ${r.accentBorder}` }}
                                >
                                    <span>Continue as {r.label}</span>
                                    <span className="text-lg group-hover:translate-x-1 transition-transform inline-block">→</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Security badge */}
                    <div className="mt-8 flex justify-center items-center gap-2 text-[#3a5070] text-xs">
                        <span>🔐</span>
                        <span>Secured with 256-bit JWT encryption</span>
                    </div>
                </div>
            </main>
        );
    }

    // ==========================================
    // RENDER — STEP 2: AUTH FORM
    // ==========================================

    return (
        <main className="min-h-screen bg-[#040d1a] text-[#d4e4fa] flex items-center justify-center p-6 relative overflow-hidden">

            {/* Ambient glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute -top-1/3 -left-1/4 w-3/4 h-3/4 rounded-full blur-[160px] opacity-30"
                    style={{ background: role.accent }}
                />
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-blue-900/30 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-[440px]">

                {/* Back buttons navigation header */}
                <div className="mb-6 flex items-center justify-between text-xs">
                    <button
                        onClick={() => { setStep("role"); setError(""); setSuccess(""); }}
                        className="flex items-center gap-1.5 font-bold text-[#6680a0] hover:text-[#d4e4fa] transition-colors group cursor-pointer"
                    >
                        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                        Change role
                    </button>
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-1.5 font-bold text-[#10b981] hover:text-[#4edea3] transition-colors cursor-pointer"
                    >
                        <span>🏠</span> Back to Landing Page
                    </button>
                </div>

                {/* Brand */}
                <div className="text-center mb-7">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-2xl border text-3xl"
                        style={{ background: role.accentDim, borderColor: role.accentBorder }}
                    >
                        {role.icon}
                    </div>
                    <h1 className="text-3xl font-black text-white">InvPro SaaS</h1>
                    <div
                        className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold border"
                        style={{
                            background: role.accentDim,
                            borderColor: role.accentBorder,
                            color: role.accent,
                        }}
                    >
                        {role.icon} {role.label} Portal
                    </div>
                </div>

                {/* Card */}
                <div className="bg-[#0d1c2d] border border-[#1e3050] rounded-2xl p-7 shadow-2xl shadow-black/50">

                    {/* Tabs */}
                    <div className="flex rounded-xl bg-[#091525] border border-[#1e3050] p-1 mb-6 gap-1">
                        {["login", "register"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setAuthTab(tab); setError(""); setSuccess(""); }}
                                className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200"
                                style={
                                    authTab === tab
                                        ? { background: role.accent, color: "#fff", boxShadow: `0 4px 15px ${role.accent}40` }
                                        : { color: "#6680a0" }
                                }
                            >
                                {tab === "login" ? "Sign In" : "Register"}
                            </button>
                        ))}
                    </div>

                    {/* Heading */}
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-white">
                            {authTab === "login" ? `Welcome back` : `Create account`}
                        </h2>
                        <p className="text-sm text-[#6680a0] mt-1">
                            {authTab === "login"
                                ? `Sign in to your ${role.label} account.`
                                : `Register a new ${role.label} account.`}
                        </p>
                    </div>

                    {/* Success */}
                    {success && (
                        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                            <span className="mt-0.5 text-emerald-400">✓</span>
                            <p className="text-sm text-emerald-300">{success}</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                            <span className="mt-0.5 text-rose-400">⚠</span>
                            <p className="text-sm text-rose-300">{error}</p>
                        </div>
                    )}

                    {/* Email */}
                    <FormInput
                        id="email"
                        label="Email Address"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={handleKey}
                        icon="✉"
                    />

                    {/* Password */}
                    <FormInput
                        id="password"
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={handleKey}
                        icon="🔒"
                    />

                    {/* Confirm password (register only) */}
                    {authTab === "register" && (
                        <FormInput
                            id="confirm-password"
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            onKeyDown={handleKey}
                            icon="🔑"
                        />
                    )}

                    {/* Submit */}
                    <button
                        type="button"
                        disabled={loading}
                        onClick={authTab === "login" ? handleLogin : handleRegister}
                        className="w-full mt-2 py-3 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                        style={{
                            background: loading ? "#334455" : role.accent,
                            boxShadow: loading ? "none" : `0 8px 30px ${role.accent}40`,
                        }}
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {authTab === "login" ? "Signing in..." : "Creating account..."}
                            </>
                        ) : (
                            <>
                                {authTab === "login" ? "Sign In" : "Create Account"}
                                <span className="text-lg">→</span>
                            </>
                        )}
                    </button>

                    {/* Switch tab hint */}
                    <div className="mt-5 pt-5 border-t border-[#1e3050] text-center">
                        <p className="text-sm text-[#6680a0]">
                            {authTab === "login"
                                ? "Don't have an account? "
                                : "Already have an account? "}
                            <button
                                type="button"
                                onClick={() => { setAuthTab(authTab === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
                                className="font-semibold transition-colors"
                                style={{ color: role.accent }}
                            >
                                {authTab === "login" ? "Register here" : "Sign in"}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Security */}
                <div className="mt-6 flex justify-center items-center gap-2 text-[#3a5070] text-xs">
                    <span>🔐</span>
                    <span>256-bit JWT encryption · Role-based access control</span>
                </div>
            </div>
        </main>
    );
}