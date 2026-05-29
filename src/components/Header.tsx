"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser, logOutUser } from "../../utils/auth";
import { LogOut, Users, Ticket, Activity } from "lucide-react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface HeaderProps {
    title?: string;
    name?: string;
    location?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const user = useCurrentUser();
    const router = useRouter();
    const pathname = usePathname();

    const [notifications, setNotifications] = useState<any[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [lastChecked, setLastChecked] = useState<number>(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

    useEffect(() => {
        if (typeof window !== "undefined" && user) {
            const saved = localStorage.getItem(`notifications_last_checked_${user.id}`);
            if (saved) {
                setLastChecked(Number(saved));
            }
        }
    }, [user]);

    const fetchNotifications = async () => {
        if (!user || user.role === "Company") return;
        try {
            const res = await axios.get(`${API_URL}/reminders/user`, {
                params: {
                    userId: user.id,
                    role: user.role
                }
            });
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };

    useEffect(() => {
        if (user && user.role !== "Company") {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggleDropdown = () => {
        const now = Date.now();
        setLastChecked(now);
        if (typeof window !== "undefined" && user) {
            localStorage.setItem(`notifications_last_checked_${user.id}`, String(now));
        }
        setIsDropdownOpen(!isDropdownOpen);
    };

    const unreadCount = notifications.filter(
        n => new Date(n.created_at || (n as any).createdAt).getTime() > lastChecked
    ).length;

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
                            {title || "Digitrust Ticketing System"}
                        </h1>
                        <p className="text-xs text-gray-500 font-medium">Secure Ticketing & SLA Escalation Hub</p>
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
                {/* User Settings & Logout */}
                <div className="flex items-center gap-4">
                    {user.role !== "Company" && (
                        <div className="relative" ref={dropdownRef}>
                            {/* Trigger Button */}
                            <button
                                onClick={handleToggleDropdown}
                                className="relative w-12 h-12 bg-[#FFFFFFB2]/70 rounded-full flex items-center justify-center hover:bg-gray-100 transition active:scale-95 border-0 focus:outline-none outline-none shadow-sm cursor-pointer"
                                title="Notifications"
                            >
                                {/* Bell Icon */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M18.134 11C18.715 16.375 21 18 21 18H3C3 18 6 15.867 6 8.4C6 6.703 6.632 5.075 7.757 3.875C8.882 2.675 10.41 2 12 2C12.338 2 12.6713 2.03 13 2.09M13.73 21C13.5542 21.3031 13.3018 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21M19 8C19.7956 8 20.5587 7.68393 21.1213 7.12132C21.6839 6.55871 22 5.79565 22 5C22 4.20435 21.6839 3.44129 21.1213 2.87868C20.5587 2.31607 19.7956 2 19 2C18.2044 2 17.4413 2.31607 16.8787 2.87868C16.3161 3.44129 16 4.20435 16 5C16 5.79565 16.3161 6.55871 16.8787 7.12132C17.4413 7.68393 18.2044 8 19 8Z"
                                        stroke="#575757"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>

                                {/* Red Badge */}
                                {unreadCount > 0 && (
                                    <span className="absolute right-2 flex h-3 w-3" style={{ top: "10px" }}>
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DB2727] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#DB2727]"></span>
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Panel */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 top-14 min-w-[320px] w-[400px] bg-white rounded-[25px] shadow-2xl border-0 origin-top-left overflow-hidden z-50">
                                    <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                        <h3 className="font-bold text-gray-800 px-3">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <span className="bg-[#DB2727]/10 text-[#DB2727] text-xs font-semibold px-2 py-1 rounded-full animate-pulse">
                                                {unreadCount} New
                                            </span>
                                        )}
                                    </div>

                                    <div className="max-h-[380px] overflow-y-auto custom-scrollbar py-2">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500 text-sm">
                                                No notifications yet.
                                            </div>
                                        ) : (
                                            notifications.map((item) => {
                                                const dateRaw = item.created_at || (item as any).createdAt;
                                                const ticketNum = item.Ticket?.ticket_number || "TKT-xxxx";
                                                const isUnread = new Date(dateRaw).getTime() > lastChecked;

                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => {
                                                            setIsDropdownOpen(false);
                                                            router.push(`/leads/${item.ticket_id}`);
                                                        }}
                                                        className={`mx-4 my-2.5 p-5 rounded-[20px] transition-all cursor-pointer text-left block border-0 focus:outline-none outline-none ${isUnread ? 'bg-blue-50/45 hover:bg-blue-100/30' : 'bg-gray-50/45 hover:bg-gray-100/50'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-1.5">
                                                            <h4 className={`text-sm ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                                {ticketNum}
                                                            </h4>
                                                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                                                {dayjs(dateRaw).fromNow()}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-semibold text-gray-800 line-clamp-1 leading-snug">
                                                            {item.task_title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-1">
                                                            {item.note || item.Ticket?.title}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                router.push("/leads");
                                            }}
                                            className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition cursor-pointer border-0 outline-none focus:outline-none bg-transparent"
                                        >
                                            View Inquiry Board
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
