"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser, logOutUser } from "../../utils/auth";
import { LogOut, Users, Ticket, Activity } from "lucide-react";

interface HeaderProps {
    title?: string;
    name?: string;
    location?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const user = useCurrentUser();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logOutUser();
        router.replace("/login");
    };

    if (!user) return null;

    // Determine role badge style
    const getRoleBadgeStyle = (role: string) => {
        switch (role) {
            case "Admin":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "Company":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "AgentL1":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "AgentL2":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
            <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/leads")}>
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 text-white shadow-lg shadow-red-500/20">
                        <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900">
                            {title || "Support Sphere"}
                        </h1>
                        <p className="text-xs text-gray-500 font-medium">Ticketing & Escalation Hub</p>
                    </div>
                </div>

                {/* Navigation Menu */}
                {/* <div className="flex items-center bg-gray-100/80 rounded-xl p-1 border border-gray-250/50 text-sm font-medium"> */}
                {/*<button*/}
                {/*    onClick={() => router.push("/leads")}*/}
                {/*    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${*/}
                {/*        pathname === "/leads"*/}
                {/*            ? "bg-white text-red-600 shadow-sm border border-gray-200/30 font-semibold"*/}
                {/*            : "text-gray-600 hover:text-gray-900 cursor-pointer"*/}
                {/*    }`}*/}
                {/*>*/}
                {/*    <Ticket className="w-4 h-4" />*/}
                {/*    Dashboard*/}
                {/*</button>*/}
                {/* {user.role === "Admin" && (
                        <button
                            onClick={() => router.push("/users")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                pathname === "/users"
                                    ? "bg-white text-red-600 shadow-sm border border-gray-200/30 font-semibold"
                                    : "text-gray-600 hover:text-gray-900 cursor-pointer"
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            User Management
                        </button>
                    )}
                </div> */}

                {/* User Settings & Logout */}
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <span className="block text-sm font-semibold text-gray-900">{user.full_name || user.name}</span>
                        <span className="block text-[10px] text-gray-500 font-medium uppercase tracking-wider">{user.email}</span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(user.role)}`}>
                        {user.role === "AgentL1" ? "Agent Level 1" : user.role === "AgentL2" ? "Agent Level 2" : user.role}
                    </span>

                    <button
                        onClick={handleLogout}
                        title="Sign Out"
                        className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-250 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 active:scale-95 transition cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
