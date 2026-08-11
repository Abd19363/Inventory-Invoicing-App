"use client";

import { login } from "@/Services/authService";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.push("/Home");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-[#051424] text-[#d4e4fa] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[#10b981]/10 blur-[120px]" />

        <div className="absolute bottom-[-10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#71a1ff]/10 blur-[120px]" />

      </div>


      {/* Login Container */}
      <div className="relative z-10 w-full max-w-[440px]">

        {/* Brand Header */}
        <div className="text-center mb-6">

          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#1c2b3c] border border-[#3c4a42] mb-3 shadow-lg">

            <span className="text-3xl">
              📦
            </span>

          </div>


          {/* Brand */}
          <h1 className="text-3xl font-bold text-[#4edea3]">
            InvPro SaaS
          </h1>

          <p className="text-sm text-[#bbcabf] mt-1">
            Enterprise Edition
          </p>

        </div>


        {/* Login Card */}
        <div className="bg-[#1e293b] border border-[#475569] rounded-xl p-6 md:p-8 shadow-2xl">

          {/* Heading */}
          <h2 className="text-xl font-semibold text-[#d4e4fa] mb-2">
            Sign In
          </h2>

          <p className="text-sm text-[#bbcabf] mb-6">
            Access your inventory and invoice management dashboard.
          </p>


          {/* Email */}
          <div className="mb-4">

            <label
              htmlFor="email"
              className="block text-xs font-semibold tracking-wider uppercase text-[#bbcabf] mb-2"
            >
              Email Address
            </label>


            <div className="relative">

              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86948a]">
                ✉
              </span>

              <input
                id="email"
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-[#0f172a] border border-[#334155] text-[#d4e4fa] placeholder-[#64748b] pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
              />

            </div>

          </div>


          {/* Password */}
          <div className="mb-4">

            <div className="flex justify-between items-center mb-2">

              <label
                htmlFor="password"
                className="block text-xs font-semibold tracking-wider uppercase text-[#bbcabf]"
              >
                Password
              </label>

              <button
                type="button"
                className="text-xs text-[#4edea3] hover:text-[#6ffbbe]"
              >
                Forgot password?
              </button>

            </div>


            <div className="relative">

              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86948a]">
                🔒
              </span>

              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-[#0f172a] border border-[#334155] text-[#d4e4fa] placeholder-[#64748b] pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
              />

            </div>

          </div>


          {/* Remember Me */}
          <div className="flex items-center mb-6">

            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-[#3c4a42] bg-[#122131] text-[#10b981] focus:ring-[#10b981]"
            />

            <label
              htmlFor="remember-me"
              className="ml-2 text-sm text-[#bbcabf]"
            >
              Remember me for 30 days
            </label>

          </div>


          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-[#10b981] text-white py-3 px-6 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#059669] active:bg-[#047857] shadow-lg shadow-[#10b981]/10"
          >
            Sign In

            <span className="text-lg">
              →
            </span>

          </button>


          {/* Home Button */}
          <button
            onClick={() => router.push("/")}
            className="w-full mt-3 rounded-lg border border-[#3c4a42] bg-[#122131] text-[#d4e4fa] py-3 px-6 font-semibold text-sm hover:bg-[#1c2b3c]"
          >
            View Home Page
          </button>


          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-[#3c4a42]/50 text-center">

            <p className="text-sm text-[#bbcabf]">
              Don't have an account?{" "}

              <button
                type="button"
                className="text-[#4edea3] hover:text-[#6ffbbe] font-medium"
              >
                Contact Administrator
              </button>

            </p>

          </div>

        </div>


        {/* Security Badge */}
        <div className="mt-6 flex justify-center items-center text-[#86948a] opacity-80">

          <span className="mr-2">
            🔐
          </span>

          <span className="text-sm">
            Secure 256-bit Encryption
          </span>

        </div>

      </div>

    </main>
  );
}