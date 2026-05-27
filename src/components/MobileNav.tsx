"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";
import { Ticket, LayoutDashboard, MessageSquare } from "lucide-react";

const MobileNav = () => {
    const pathname = usePathname();

    const getLinkClasses = (path: string) => {
        const isActive = pathname === path || pathname.startsWith(path);
        const baseClasses = "flex flex-col items-center justify-center w-full h-full transition duration-200";

        if (isActive) {
            return `${baseClasses} text-[#DB2727] font-medium`;
        }
        return `${baseClasses} text-gray-500 hover:text-red-400`;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around z-50 md:hidden pb-safe">
            <Link href="/chat-dashboard" className="w-full h-full">
                <div className={getLinkClasses("/chat-dashboard")}>
                    <MessageSquare className="w-6 h-6 mb-1" />
                    <span className="text-[10px]">Chat</span>
                </div>
            </Link>

            <Link href="/tickets" className="w-full h-full">
                <div className={getLinkClasses("/tickets")}>
                    <Ticket className="w-6 h-6 mb-1" />
                    <span className="text-[10px]">Tickets</span>
                </div>
            </Link>
        </div>
    );
};

export default MobileNav;
