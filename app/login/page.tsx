"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthService } from "@/services/auth.service";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await AuthService.login({ email, password });
            console.log("[Login] Success, redirecting to /leads");
            router.replace("/leads");
        } catch (err: any) {
            console.error("[Login] Error:", err);
            setError(err.response?.data?.message || "Invalid email or password");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 font-sans">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
                    <p className="text-sm text-gray-500 mt-2">Sign in to your product support portal</p>
                </div>
                {error && (
                    <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                            id="email"
                            type="email"
                            placeholder="agent@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                            id="password"
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <button
                        className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                            isLoading 
                                ? "bg-red-400 cursor-not-allowed" 
                                : "bg-red-600 hover:bg-red-700 shadow-red-500/20 active:scale-[0.98]"
                        }`}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500">Don't have an account? </span>
                    <Link href="/register" className="font-semibold text-red-600 hover:text-red-700 transition">
                        Register Portal
                    </Link>
                </div>
            </div>
        </div>
    );
}
