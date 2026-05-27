"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { Ticket } from "lucide-react";

interface SideMenuProps {
    // optional props if needed
}

const SideMenu: React.FC<SideMenuProps> = () => {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/login"); // or wherever you want to redirect
    };

    const getLinkClasses = (path: string) => {
        const isActive = pathname === path || pathname.startsWith(path);
        const baseClasses = "w-12 h-12 rounded-full flex items-center justify-center transition duration-200 z-50";

        if (isActive) {
            return `${baseClasses} bg-[#DB2727] text-white shadow-md`;
        }
        return `${baseClasses} bg-[#FFFFFF8C] bg-opacity/55 text-[#575757] hover:bg-red-100`;
    };

    return (
        <aside className="hidden md:flex fixed top-32 left-8 flex-col gap-6 z-40">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                id="back-button"
                className="w-12 h-12 bg-[#FFFFFF8C] cursor-pointer bg-opacity/55 rounded-full flex items-center justify-center hover:bg-red-100 transition text-[#575757]"
                title="Go Back"
            >
                <svg
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <mask
                        id="mask0_555_795"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="19"
                        height="19"
                    >
                        <rect
                            width="19"
                            height="19"
                            transform="matrix(-1 0 0 1 19 0)"
                            fill="#D9D9D9"
                        />
                    </mask>
                    <g mask="url(#mask0_555_795)">
                        <path
                            d="M12.6469 17.4167L14.0521 16.0115L7.54067 9.49999L14.0521 2.98854L12.6469 1.58333L4.73025 9.49999L12.6469 17.4167Z"
                            fill="currentColor"
                        />
                    </g>
                </svg>
            </button>

            {/* Chat Dashboard Link */}
            <Link href="/chat-dashboard">
                <div className={getLinkClasses("/chat-dashboard")} title="Chat Dashboard">
                    {/* Reuse the chat icon from snippet or similar */}
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M19 11.5H19.5C20.435 11.5 20.902 11.5 21.25 11.701C21.478 11.8326 21.6674 12.022 21.799 12.25C22 12.598 22 13.065 22 14C22 14.935 22 15.402 21.799 15.75C21.6674 15.978 21.478 16.1674 21.25 16.299C20.902 16.5 20.435 16.5 19.5 16.5H19M5 11.5H4.5C3.565 11.5 3.098 11.5 2.75 11.701C2.52199 11.8326 2.33265 12.022 2.201 12.25C2 12.598 2 13.065 2 14C2 14.935 2 15.402 2.201 15.75C2.33265 15.978 2.52199 16.1674 2.75 16.299C3.098 16.5 3.565 16.5 4.5 16.5H5M12 5C12.3978 5 12.7794 4.84196 13.0607 4.56066C13.342 4.27936 13.5 3.89782 13.5 3.5C13.5 3.10218 13.342 2.72064 13.0607 2.43934C12.7794 2.15804 12.3978 2 12 2C11.6022 2 11.2206 2.15804 10.9393 2.43934C10.658 2.72064 10.5 3.10218 10.5 3.5C10.5 3.89782 10.658 4.27936 10.9393 4.56066C11.2206 4.84196 11.6022 5 12 5ZM12 5V8M9 12V13M15 12V13M11 8H13C15.828 8 17.243 8 18.121 8.879C19 9.757 19 11.172 19 14C19 16.828 19 18.243 18.121 19.121C17.243 20 15.828 20 13 20H12C12 20 11.5 22 8 22C8 22 9 20.991 9 19.983C7.447 19.936 6.52 19.763 5.879 19.121C5 18.243 5 16.828 5 14C5 11.172 5 9.757 5.879 8.879C6.757 8 8.172 8 11 8Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M10 16.5C10 16.5 10.667 17 12 17C13.333 17 14 16.5 14 16.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </Link>

            {/* Tickets Link */}
            <Link href="/tickets">
                <div className={getLinkClasses("/tickets")} title="Tickets">
                    <Ticket className="w-5 h-5" />
                </div>
            </Link>

            {/* Log Out */}
            <button
                id="log-out"
                onClick={handleLogout}
                className="fixed bottom-8 left-8 w-12 h-12 bg-[#FFFFFF8C] cursor-pointer bg-opacity/55 rounded-full flex items-center justify-center hover:bg-red-100 transition text-[#575757]"
                title="Log Out"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M5 21C4.45 21 3.97933 20.8043 3.588 20.413C3.19667 20.0217 3.00067 19.5507 3 19V5C3 4.45 3.196 3.97933 3.588 3.588C3.98 3.19667 4.45067 3.00067 5 3H12V5H5V19H12V21H5ZM16 17L14.625 15.55L17.175 13H9V11H17.175L14.625 8.45L16 7L21 12L16 17Z"
                        fill="currentColor"
                    />
                </svg>
            </button>
        </aside>
    );
};

export default SideMenu;
