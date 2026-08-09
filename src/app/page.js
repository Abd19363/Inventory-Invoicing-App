"use client";

import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function LandingPage() {
  const router = useRouter();
  useAuth();

  return (
    <main className="min-h-screen bg-gray-100">

      
      <section className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-600 to-cyan-500 text-white">

        <h1 className="text-5xl font-bold mb-5">
          Inventory & Invoicing System
        </h1>

        <p className="text-xl w-2/3 text-center">
          Manage inventory, create invoices, monitor sales, and track
          business performance from a single dashboard.
        </p>

        <button
          onClick={() => router.push("/Login")}
          className="mt-10 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-black hover:text-white"
        >
          Get Started
        </button>

      </section>

      
      <section className="py-20 px-10 bg-gray-500">

        <h2 className="text-4xl font-bold text-center mb-12 " >
          Features
        </h2>

        <div className="grid grid-cols-3 gap-8">

          <div className="shadow-2xl rounded-lg p-6 transition-tranform duration-200 hover:translate-x-2 cursor-pointer">
            <h3 className="text-2xl font-semibold mb-3">
              Inventory Management
            </h3>

            <p>
              Add, edit, delete and manage products with ease.
            </p>
          </div>

          <div className="shadow-2xl rounded-lg p-6 transition-tranform duration-200 hover:translate-x-2 cursor-pointer">
            <h3 className="text-2xl font-semibold mb-3">
              Invoice Management
            </h3>

            <p>
              Create professional invoices and maintain sales history.
            </p>
          </div>

          <div className="shadow-2xl rounded-lg p-6 transition-tranform duration-200 hover:translate-x-2 cursor-pointer">
            <h3 className="text-2xl font-semibold mb-3">
              Dashboard Analytics
            </h3>

            <p>
              Monitor revenue, stock levels and business performance.
            </p>
          </div>

        </div>

      </section>

     
      <footer className="bg-black text-white py-6 text-center">
        © 2026 Inventory & Invoicing System
      </footer>

    </main>
  );
}