"use client";

import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { getItems } from "@/Services/inventoryService";
import { getInvoices } from "@/Services/invoicesService";


export default function LandingPage() {
  const router = useRouter();

  useAuth();

  const [dashboardData, setDashboardData] = useState({
    inventoryValue: 0,
    stockItems: 0,
    invoices: 0,
    revenueYTD: 0,
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [inventory, invoices] = await Promise.all([
          getItems(),
          getInvoices(),
        ]);

        // ==============================
        // INVENTORY VALUE
        // ==============================

        const inventoryValue = inventory.reduce(
          (total, item) => {
            const quantity = Number(item.quantity) || 0;
            const purchasePrice =
              Number(item.purchasePrice) || 0;

            return total + quantity * purchasePrice;
          },
          0
        );

        // ==============================
        // TOTAL STOCK ITEMS
        // ==============================

        const stockItems = inventory.reduce(
          (total, item) => {
            return total + (Number(item.quantity) || 0);
          },
          0
        );

        // ==============================
        // TOTAL INVOICES
        // ==============================

        const invoiceCount = invoices.length;

        // ==============================
        // REVENUE YTD
        // ==============================

        const currentYear = new Date().getFullYear();

        const revenueYTD = invoices.reduce(
          (total, invoice) => {

            if (!invoice.date) {
              return total;
            }

            const invoiceDate = new Date(
              invoice.date
            );

            if (
              invoiceDate.getFullYear() === currentYear
            ) {
              return (
                total +
                (Number(invoice.total) || 0)
              );
            }

            return total;
          },
          0
        );

        setDashboardData({
          inventoryValue,
          stockItems,
          invoices: invoiceCount,
          revenueYTD,
        });

      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error
        );
      }
    }

    loadDashboardData();
  }, []);

  return (
    <main className="min-h-screen bg-[#051424] text-[#d4e4fa] overflow-hidden">

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[#3c4a42]/40 bg-[#051424]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center">
              <span className="text-[#4edea3] text-xl">
                📦
              </span>
            </div>

            <div>
              <h1 className="text-lg font-bold text-[#4edea3]">
                InvPro SaaS
              </h1>

              <p className="text-xs text-[#bbcabf]">
                Enterprise Edition
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-[#bbcabf] hover:text-[#4edea3]"
            >
              Features
            </a>

            <a
              href="#about"
              className="text-sm text-[#bbcabf] hover:text-[#4edea3]"
            >
              About
            </a>

            <button
              onClick={() => router.push("/Login")}
              className="bg-[#10b981] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#059669]"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>


      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">

        {/* Background Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">

          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#10b981]/10 blur-[120px]" />

          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#71a1ff]/10 blur-[120px]" />

        </div>


        <div className="relative z-10 max-w-5xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#3c4a42] bg-[#122131] text-[#4edea3] text-sm mb-8">

            <span className="w-2 h-2 rounded-full bg-[#10b981]" />

            Smart Inventory & Invoicing

          </div>


          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">

            Manage Your Business

            <span className="block text-[#4edea3]">
              Smarter & Faster
            </span>

          </h1>


          {/* Description */}
          <p className="max-w-2xl mx-auto mt-6 text-lg md:text-xl text-[#bbcabf] leading-relaxed">

            Manage inventory, create invoices, monitor sales,
            and track your business performance from a single
            powerful dashboard.

          </p>


          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">

            <button
              onClick={() => router.push("/Login")}
              className="px-8 py-3 rounded-lg bg-[#10b981] text-white font-semibold hover:bg-[#059669] shadow-lg shadow-[#10b981]/20"
            >
              Get Started
              <span className="ml-2">→</span>
            </button>

            <a
              href="#features"
              className="px-8 py-3 rounded-lg border border-[#3c4a42] bg-[#122131] text-[#d4e4fa] font-semibold hover:bg-[#1c2b3c]"
            >
              Explore Features
            </a>

          </div>


          {/* Dashboard Preview */}
          <div className="mt-20 rounded-xl border border-[#3c4a42] bg-[#0d1c2d]/80 shadow-2xl overflow-hidden">

            {/* Fake Browser Header */}
            <div className="h-10 border-b border-[#3c4a42] bg-[#122131] flex items-center px-4 gap-2">

              <span className="w-3 h-3 rounded-full bg-[#ff6b6b]" />
              <span className="w-3 h-3 rounded-full bg-[#ffb95f]" />
              <span className="w-3 h-3 rounded-full bg-[#4edea3]" />

            </div>


            {/* Preview */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-left">

              <div className="md:col-span-1 bg-[#1c2b3c] rounded-lg p-5 border border-[#3c4a42] hover:border-[#4edea3]">

                <p className="text-xs text-[#bbcabf]">
                  Inventory Value
                </p>

                <p className="text-2xl font-bold mt-2">
                  Rs.{" "}
                  {dashboardData.inventoryValue.toLocaleString()}
                </p>

                <p className="text-xs text-[#4edea3] mt-2">
                  Inventory at purchase Cost
                </p>

              </div>


              <div className="md:col-span-1 bg-[#1c2b3c] rounded-lg p-5 border border-[#3c4a42] hover:border-[#ffb95f]">

                <p className="text-xs text-[#bbcabf]">
                  Stock Items
                </p>

                <p className="text-2xl font-bold mt-2">
                  {dashboardData.stockItems.toLocaleString()}
                </p>

                <p className="text-xs text-[#ffb95f] mt-2">
                  Total Quantity in Stock
                </p>

              </div>

              <div className="md:col-span-1 bg-[#1c2b3c] rounded-lg p-5 border border-[#3c4a42] hover:border-[#ffb4ab]">

                <p className="text-xs text-[#bbcabf]">
                  Invoices
                </p>

                <p className="text-2xl font-bold mt-2">
                  {dashboardData.invoices.toLocaleString()}
                </p>

                <p className="text-xs text-[#ffb4ab] mt-2">
                  Total Invoices generated
                </p>

              </div>


              <div className="md:col-span-1 bg-[#1c2b3c] rounded-lg p-5 border border-[#3c4a42] hover:border-[#E8F5E9]">

                <p className="text-xs text-[#bbcabf]">
                  Revenue YTD
                </p>

                <p className="text-2xl font-bold mt-2">
                  Rs.{" "}
                  {dashboardData.revenueYTD.toLocaleString()}
                </p>

                <p className="text-xs text-[#E8F5E9] mt-2">
                  Revenue generated this year
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* Features */}
      <section
        id="features"
        className="py-24 px-6 bg-[#0d1c2d]"
      >

        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">

            <p className="text-sm uppercase tracking-widest text-[#4edea3] font-semibold">
              Powerful Features
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mt-3">
              Everything You Need
            </h2>

            <p className="text-[#bbcabf] max-w-2xl mx-auto mt-4">
              Manage your inventory and invoicing operations
              from one centralized platform.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


            {/* Feature 1 */}
            <div className="bg-[#1c2b3c] border border-[#3c4a42] rounded-xl p-7 hover:border-[#10b981]/50 transition-all">

              <div className="w-12 h-12 rounded-lg bg-[#10b981]/10 flex items-center justify-center mb-5">

                <span className="text-2xl">
                  📦
                </span>

              </div>

              <h3 className="text-xl font-semibold mb-3">
                Inventory Management
              </h3>

              <p className="text-[#bbcabf] leading-relaxed">
                Add, edit, delete and manage products
                while keeping track of stock levels.
              </p>

            </div>


            {/* Feature 2 */}
            <div className="bg-[#1c2b3c] border border-[#3c4a42] rounded-xl p-7 hover:border-[#10b981]/50 transition-all">

              <div className="w-12 h-12 rounded-lg bg-[#ffb95f]/10 flex items-center justify-center mb-5">

                <span className="text-2xl">
                  🧾
                </span>

              </div>

              <h3 className="text-xl font-semibold mb-3">
                Invoice Management
              </h3>

              <p className="text-[#bbcabf] leading-relaxed">
                Create professional invoices and
                maintain complete sales history.
              </p>

            </div>


            {/* Feature 3 */}
            <div className="bg-[#1c2b3c] border border-[#3c4a42] rounded-xl p-7 hover:border-[#10b981]/50 transition-all">

              <div className="w-12 h-12 rounded-lg bg-[#71a1ff]/10 flex items-center justify-center mb-5">

                <span className="text-2xl">
                  📊
                </span>

              </div>

              <h3 className="text-xl font-semibold mb-3">
                Dashboard Analytics
              </h3>

              <p className="text-[#bbcabf] leading-relaxed">
                Monitor revenue, stock levels and
                overall business performance.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* CTA */}
      <section
        id="about"
        className="py-24 px-6 bg-[#051424]"
      >

        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to manage your business?
          </h2>

          <p className="text-[#bbcabf] mt-5 text-lg">
            Get started with InvPro SaaS today.
          </p>

          <button
            onClick={() => router.push("/Login")}
            className="mt-8 bg-[#10b981] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#059669]"
          >
            Get Started
          </button>

        </div>

      </section>


      {/* Footer */}
      <footer className="border-t border-[#3c4a42] bg-[#010f1f] py-8 px-6">

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">

          <div>
            <p className="font-semibold text-[#4edea3]">
              InvPro SaaS
            </p>

            <p className="text-sm text-[#86948a] mt-1">
              Inventory & Invoicing Management System
            </p>
          </div>

          <p className="text-sm text-[#86948a]">
            © 2026 InvPro SaaS. All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}