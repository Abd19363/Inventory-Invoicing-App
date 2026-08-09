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
        <div className="min-h-screen flex justify-center items-center bg-gray-900 p-4">

            {/* Login Card with subtle hover glow & border shift */}
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl w-full max-w-md transition-all duration-300 hover:border-zinc-700 hover:shadow-2xl hover:shadow-emerald-500/5">

                <h1 className="text-3xl font-bold mb-6 text-center text-white">
                    Login
                </h1>

                {/* Email Input with subtle border highlight */}
                <input
                    type="email"
                    placeholder="Enter Email"
                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-400 p-3 mb-4 rounded-xl transition-colors duration-200 hover:border-zinc-500 focus:border-emerald-500 focus:outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {/* Password Input with subtle border highlight */}
                <input
                    type="password"
                    placeholder="Enter Password"
                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-400 p-3 mb-6 rounded-xl transition-colors duration-200 hover:border-zinc-500 focus:border-emerald-500 focus:outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* Primary Action Button */}
                <button
                    onClick={handleLogin}
                    className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 hover:bg-emerald-500 active:bg-emerald-700 shadow-md hover:shadow-emerald-600/20"
                >
                    Login
                </button>

                {/* Secondary Action Button */}
                <button
                    onClick={() => router.push("/")}
                    className="w-full bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-semibold py-3 rounded-xl transition-all duration-200 hover:bg-zinc-700 hover:text-white active:bg-zinc-900 mt-3"
                >
                    View Home Page
                </button>

            </div>

        </div>
    );
}