"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthService } from "@/services/auth.service";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("AgentL1");
    const [contactNo, setContactNo] = useState("");

    // Company specific configuration
    const [hasDMS, setHasDMS] = useState(false);
    const [hasHRIS, setHasHRIS] = useState(false);
    const [dmsInstantId, setDmsInstantId] = useState("");
    const [hrisInstantId, setHrisInstantId] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            // Prepare product licenses and instant IDs
            const products: string[] = [];
            const instant_ids: Record<string, string> = {};

            if (role === "Company") {
                if (hasDMS) {
                    products.push("DMS");
                    if (dmsInstantId) instant_ids["DMS"] = dmsInstantId;
                }
                if (hasHRIS) {
                    products.push("HRIS");
                    if (hrisInstantId) instant_ids["HRIS"] = hrisInstantId;
                }
            }

            await AuthService.register({
                name,
                email,
                password,
                role,
                contact_no: contactNo || undefined,
                products: role === "Company" ? products : undefined,
                instant_ids: role === "Company" ? instant_ids : undefined
            });

            setSuccess("Registration successful! Redirecting to login...");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            console.error("Registration error:", err);
            setError(err.response?.data?.message || "Registration failed. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                    <p className="text-sm text-gray-500 mt-2">Join your support platform as agent or company</p>
                </div>
                {error && (
                    <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                        {success}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1" htmlFor="name">
                            Full Name / Company Name
                        </label>
                        <input
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                            id="name"
                            type="text"
                            placeholder="John Doe / Acme Corp"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                            id="email"
                            type="email"
                            placeholder="example@portal.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1" htmlFor="role">
                            Register As (Role)
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white"
                        >
                            <option value="AgentL1">Level 1 Agent (Company Side Support)</option>
                            <option value="AgentL2">Level 2 Agent (Product Owned Team)</option>
                            <option value="Company">Customer Company (End-User)</option>
                            <option value="Admin">Administrator</option>
                        </select>
                    </div>

                    {role === "Company" && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-150 space-y-3 animate-in fade-in duration-200">
                            <span className="block text-xs font-bold uppercase tracking-wider text-gray-600">Company licensed Products</span>
                            
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={hasDMS} onChange={(e) => setHasDMS(e.target.checked)} className="rounded text-red-600 focus:ring-red-500" />
                                    DMS Product
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={hasHRIS} onChange={(e) => setHasHRIS(e.target.checked)} className="rounded text-red-600 focus:ring-red-500" />
                                    HRIS Product
                                </label>
                            </div>

                            {hasDMS && (
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-500">DMS Instant ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., HNBLife"
                                        value={dmsInstantId}
                                        onChange={(e) => setDmsInstantId(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                                    />
                                </div>
                            )}

                            {hasHRIS && (
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-500">HRIS Instant ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., HNBHR"
                                        value={hrisInstantId}
                                        onChange={(e) => setHrisInstantId(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1" htmlFor="contactNo">
                            Contact Number
                        </label>
                        <input
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                            id="contactNo"
                            type="text"
                            placeholder="0771234567"
                            value={contactNo}
                            onChange={(e) => setContactNo(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                            id="password"
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1" htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <input
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                            id="confirmPassword"
                            type="password"
                            placeholder="********"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition-all shadow-lg mt-4 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                            isLoading 
                                ? "bg-red-400 cursor-not-allowed" 
                                : "bg-red-600 hover:bg-red-700 shadow-red-500/20 active:scale-[0.98]"
                        }`}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating Account..." : "Register"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500">Already have an account? </span>
                    <Link href="/login" className="font-semibold text-red-600 hover:text-red-700 transition">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
