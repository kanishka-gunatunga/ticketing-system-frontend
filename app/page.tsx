"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../utils/auth";
import { Shield, Sparkles, Ticket } from "lucide-react";

export default function Home() {
    const user = useCurrentUser();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.replace("/leads");
        }
    }, [user, router]);

    return (
        <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-gradient-to-tr from-slate-900 via-zinc-900 to-red-950 text-white font-sans overflow-hidden relative">
            
            {/* Background glowing blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-650/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-650/10 rounded-full blur-3xl animate-pulse"></div>

            <div className="max-w-2xl mx-auto text-center px-6 relative z-10 flex flex-col items-center gap-6">
                
                {/* Logo Badge */}
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 shadow-xl shadow-red-500/20 animate-bounce">
                    <Ticket className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-red-400 bg-clip-text text-transparent">
                        Support Sphere
                    </h1>
                    <p className="text-base sm:text-lg text-zinc-400 font-medium max-w-lg mx-auto leading-relaxed">
                        A premium enterprise support system for product lines. Connect L1 agents, L2 product teams, and client inquiries seamlessly.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mt-4 text-left">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="block text-sm font-bold text-white">Dynamic Filters</span>
                            <span className="block text-xs text-zinc-400 mt-1">Inquiry forms populate DMS and HRIS licenses on demand.</span>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl flex items-start gap-3">
                        <Shield className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="block text-sm font-bold text-white">L1/L2 Escalations</span>
                            <span className="block text-xs text-zinc-400 mt-1">Self-assign queues and L2 transfer pipelines built-in.</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => router.push("/login")}
                    className="mt-6 px-8 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-2xl transition duration-200 shadow-lg shadow-red-500/20 flex items-center gap-2 cursor-pointer"
                >
                    Access Portal
                </button>
            </div>
        </div>
    );
}
