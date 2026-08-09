"use client";

import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <header className="w-full h-26 bg-gray-900 text-white px-6 flex items-center justify-between border-b border-gray-800">


      <nav className="flex items-center gap-6 ml-160">
        <button
          onClick={() => router.push("/Home")}
          className="hover:text-yellow-400 text-sm font-medium transition"
        >
          Home
        </button>

        <button
          onClick={() => router.push("/Inventory")}
          className="hover:text-yellow-400 text-sm font-medium transition"
        >
          Inventory
        </button>

        <button
          onClick={() => router.push("/Invoices")}
          className="hover:text-yellow-400 text-sm font-medium transition"
        >
          Invoices
        </button>
      </nav>

    </header>
  );
}