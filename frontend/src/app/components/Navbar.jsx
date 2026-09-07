"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/Services/authService";

export default function Navbar() {
  const router = useRouter();

  const handlelogout =() =>{
    logout();
    router.push("/Login")
  }

  return (
    <nav className="flex justify-between items-center bg-blue-700 text-white px-8 py-4">
      <h1 className="text-2xl font-bold">
        Inventory System
      </h1>

      <button
        onClick={handlelogout}
        className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </nav>
  );
}