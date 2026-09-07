"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#051424] text-[#d4e4fa] overflow-x-hidden font-sans">

      {/* ==========================================
          HEADER NAVIGATION
      ========================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-[#3c4a42]/40 bg-[#051424]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

          {/* Logo */}
          <div
            onClick={() => router.push("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-2xl shadow-lg shadow-[#10b981]/10 group-hover:scale-105 transition-all">
              📦
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#4edea3] tracking-tight">
                InvPro <span className="text-white font-medium text-xs px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 ml-1">SaaS</span>
              </h1>
              <p className="text-xs text-[#86948a]">Enterprise Inventory & Invoicing</p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-sm font-medium text-[#bbcabf] hover:text-[#4edea3] transition-colors mr-2">
              Features
            </a>
            <a href="#roles" className="text-sm font-medium text-[#bbcabf] hover:text-[#4edea3] transition-colors mr-4">
              Stakeholder Roles
            </a>

            <button
              onClick={() => router.push("/Login")}
              className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#10b981]/20 cursor-pointer hover:-translate-y-0.5"
            >
              <span>🔑</span> Stakeholder Logins
              <span>→</span>
            </button>
          </div>
        </div>
      </header>


      {/* ==========================================
          HERO SECTION
      ========================================== */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#10b981]/10 blur-[150px]" />
          <div className="absolute top-40 right-10 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[160px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#10b981]/40 bg-[#10b981]/10 text-[#4edea3] text-xs font-semibold mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            Enterprise Multi-Stakeholder Management Platform
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight text-white">
            Smart Inventory &{" "}
            <span className="bg-gradient-to-r from-[#4edea3] via-[#10b981] to-[#60a5fa] bg-clip-text text-transparent">
              Role-Protected Invoicing
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto mt-6 text-lg md:text-xl text-[#94a3b8] leading-relaxed">
            A centralized SaaS solution engineered for seamless business operations. Strictly isolate sensitive purchase costs with Role-Based Access Control (RBAC) while empowering sales managers with automated retail discount invoicing.
          </p>

          {/* MAIN STAKEHOLDER PORTAL BUTTON */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mt-10">

            <button
              onClick={() => router.push("/Login")}
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#10b981]/25 hover:-translate-y-1 cursor-pointer text-base"
            >
              <span>🔑</span>
              Access Stakeholder Login System
              <span className="text-xl">→</span>
            </button>

            <button
              onClick={() => router.push("/Login?role=ADMIN")}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <span>🛡️</span> Admin Portal
            </button>

            <button
              onClick={() => router.push("/Login?role=SALES_MANAGER")}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <span>👤</span> Sales Manager Portal
            </button>

          </div>
        </div>
      </section>


      {/* ==========================================
          STAKEHOLDER ROLES OVERVIEW
      ========================================== */}
      <section id="roles" className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest text-[#4edea3] font-bold bg-[#10b981]/10 border border-[#10b981]/30 px-3.5 py-1 rounded-full">
            Dual Stakeholder System
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-4">
            Designed for Admins & Sales Managers
          </h2>
          <p className="text-[#94a3b8] max-w-2xl mx-auto mt-2 text-sm">
            Select your role to access dedicated workflow capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ADMIN CARD */}
          <div className="bg-[#0d1c2d] border border-purple-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-purple-500/60 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-3xl mb-6 shadow-lg">
              🛡️
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Administrator Portal</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed mb-6">
              Full enterprise control with access to confidential purchase prices, inventory valuation, financial revenue analytics, product creation, editing, and deletion.
            </p>
            <ul className="space-y-2.5 mb-8 text-xs text-[#cbd5e1]">
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span> Full Product & Inventory CRUD
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span> Real-Time Business Financial Analytics & Valuation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span> Purchase Price Confidentiality Management
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">✓</span> Complete System Settings & Audit Controls
              </li>
            </ul>
            <button
              onClick={() => router.push("/Login?role=ADMIN")}
              className="w-full py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
            >
              Go to Admin Login <span>→</span>
            </button>
          </div>

          {/* SALES MANAGER CARD */}
          <div className="bg-[#0d1c2d] border border-emerald-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-emerald-500/60 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl mb-6 shadow-lg">
              👤
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Sales Manager Portal</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed mb-6">
              Streamlined invoicing suite for quick retail sales, item-level discount applications, and customer invoice generation without exposing business purchase costs.
            </p>
            <ul className="space-y-2.5 mb-8 text-xs text-[#cbd5e1]">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Create & Generate PDF Sales Invoices
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Automatic Retail Price & Discount Calculations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> View Product Catalogue & Available Stock
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Protected View (Purchase Cost Secret)
              </li>
            </ul>
            <button
              onClick={() => router.push("/Login?role=SALES_MANAGER")}
              className="w-full py-3.5 px-6 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#10b981]/20 cursor-pointer"
            >
              Go to Sales Manager Login <span>→</span>
            </button>
          </div>

        </div>
      </section>


      {/* ==========================================
          SYSTEM FEATURES & CAPABILITIES
      ========================================== */}
      <section id="features" className="py-20 px-6 bg-[#091525] border-t border-[#1e3050]">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#4edea3] font-bold bg-[#10b981]/10 border border-[#10b981]/30 px-3.5 py-1 rounded-full">
              Enterprise Architecture
            </span>
            <h2 className="text-4xl font-black text-white mt-4">
              Everything Your Business Needs
            </h2>
            <p className="text-[#94a3b8] max-w-2xl mx-auto mt-2 text-sm">
              Engineered with security, automated retail invoice generation, and database persistence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Feature 1 */}
            <div className="bg-[#0d1c2d] border border-[#1e3050] rounded-2xl p-7 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl mb-5">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Role-Based Access Control</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                Strict permission enforcement between Admins and Sales Managers at both API and UI levels.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0d1c2d] border border-[#1e3050] rounded-2xl p-7 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl mb-5">
                🧾
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Retail Discount Invoices</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                Automatic calculation of retail price, item discounts, and final sale prices with PDF exports.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0d1c2d] border border-[#1e3050] rounded-2xl p-7 hover:border-blue-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl mb-5">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-white mb-2">High-Performance Dashboard</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                Fast keyboard shortcuts, collapsible sidebar sliders, and instant live inventory search.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#1e3050] bg-[#051424] text-center text-xs text-[#64748b]">
        <p>© 2026 InvPro SaaS Enterprise. All rights reserved.</p>
      </footer>

    </main>
  );
}