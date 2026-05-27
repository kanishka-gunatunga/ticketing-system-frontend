"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { logOutUser, useCurrentUser } from "../../utils/auth";

interface SideMenuProps {
    /** Pass this when you want to show the chat icon (ticket details pages) */
    ticketId?: string | number;
}

const SideMenu: React.FC<SideMenuProps> = ({ ticketId }) => {
    const router = useRouter();
    const pathname = usePathname();
    const user = useCurrentUser();

    const handleLogout = () => {
        logOutUser();
        router.replace("/login");
    };

    /** Returns the pill classes: active = red bg + white icon, inactive = translucent white */
    const getLinkClasses = (path: string, exact = false) => {
        const isActive = exact
            ? pathname === path
            : pathname === path || pathname.startsWith(path + "/");
        const base =
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer";
        return isActive
            ? `${base} bg-[#DB2727] text-white shadow-lg shadow-red-500/25`
            : `${base} bg-white/55 backdrop-blur-sm text-[#575757] hover:bg-red-50 hover:text-[#DB2727] border border-white/40`;
    };

    const isChatActive =
        ticketId !== undefined &&
        pathname === `/leads/${ticketId}/chat`;

    return (
        <aside className="hidden md:flex fixed top-32 left-8 flex-col gap-4 z-40">

            {/* ── Back ── */}
            <button
                onClick={() => router.back()}
                id="back-button"
                title="Go Back"
                className="w-12 h-12 bg-white/55 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 hover:text-[#DB2727] transition-all duration-200 text-[#575757] border border-white/40 cursor-pointer"
            >
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="mask0_sm_back" maskUnits="userSpaceOnUse" x="0" y="0" width="19" height="19">
                        <rect width="19" height="19" transform="matrix(-1 0 0 1 19 0)" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_sm_back)">
                        <path d="M12.6469 17.4167L14.0521 16.0115L7.54067 9.49999L14.0521 2.98854L12.6469 1.58333L4.73025 9.49999L12.6469 17.4167Z" fill="currentColor" />
                    </g>
                </svg>
            </button>

            {/* ── Dashboard ── */}
            <Link href="/leads" title="Dashboard">
                <div className={getLinkClasses("/leads", true)}>
                    {/* Grid/Dashboard icon */}
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 13H10C10.55 13 11 12.55 11 12V4C11 3.45 10.55 3 10 3H4C3.45 3 3 3.45 3 4V12C3 12.55 3.45 13 4 13ZM4 21H10C10.55 21 11 20.55 11 20V16C11 15.45 10.55 15 10 15H4C3.45 15 3 15.45 3 16V20C3 20.55 3.45 21 4 21ZM14 21H20C20.55 21 21 20.55 21 20V12C21 11.45 20.55 11 20 11H14C13.45 11 13 11.45 13 12V20C13 20.55 13.45 21 14 21ZM14 3V9C14 9.55 14.45 10 15 10H20C20.55 10 21 9.55 21 9V4C21 3.45 20.55 3 20 3H15C14.45 3 14 3.45 14 4Z" fill="currentColor" />
                    </svg>
                </div>
            </Link>

            {/* ── Users (only visible to Admins) ── */}
            {user?.role === "Admin" && (
                <Link href="/users" title="User Management">
                    <div className={getLinkClasses("/users")}>
                        {/* Users outline icon */}
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.33 4 18V20H20V18C20 15.33 14.67 14 12 14Z" fill="currentColor" />
                        </svg>
                    </div>
                </Link>
            )}

            {/* ── Chat (only on ticket detail pages) ── */}
            {ticketId !== undefined && (
                <Link href={`/leads/${ticketId}/chat`} title="Ticket Chat">
                    <div
                        className={
                            isChatActive
                                ? "w-12 h-12 rounded-full flex items-center justify-center cursor-pointer bg-[#DB2727] text-white shadow-lg shadow-red-500/25 relative transition-all duration-200"
                                : "w-12 h-12 rounded-full flex items-center justify-center cursor-pointer bg-white/55 backdrop-blur-sm text-[#575757] hover:bg-red-50 hover:text-[#DB2727] border border-white/40 transition-all duration-200 relative"
                        }
                    >
                        {/* Live pulse indicator */}
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-400 border border-white animate-pulse" />
                        {/* Chat bubble icon */}
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 11.5H19.5C20.435 11.5 20.902 11.5 21.25 11.701C21.478 11.8326 21.6674 12.022 21.799 12.25C22 12.598 22 13.065 22 14C22 14.935 22 15.402 21.799 15.75C21.6674 15.978 21.478 16.1674 21.25 16.299C20.902 16.5 20.435 16.5 19.5 16.5H19M5 11.5H4.5C3.565 11.5 3.098 11.5 2.75 11.701C2.52199 11.8326 2.33265 12.022 2.201 12.25C2 12.598 2 13.065 2 14C2 14.935 2 15.402 2.201 15.75C2.33265 15.978 2.52199 16.1674 2.75 16.299C3.098 16.5 3.565 16.5 4.5 16.5H5M12 5C12.3978 5 12.7794 4.84196 13.0607 4.56066C13.342 4.27936 13.5 3.89782 13.5 3.5C13.5 3.10218 13.342 2.72064 13.0607 2.43934C12.7794 2.15804 12.3978 2 12 2C11.6022 2 11.2206 2.15804 10.9393 2.43934C10.658 2.72064 10.5 3.10218 10.5 3.5C10.5 3.89782 10.658 4.27936 10.9393 4.56066C11.2206 4.84196 11.6022 5 12 5ZM12 5V8M9 12V13M15 12V13M11 8H13C15.828 8 17.243 8 18.121 8.879C19 9.757 19 11.172 19 14C19 16.828 19 18.243 18.121 19.121C17.243 20 15.828 20 13 20H12C12 20 11.5 22 8 22C8 22 9 20.991 9 19.983C7.447 19.936 6.52 19.763 5.879 19.121C5 18.243 5 16.828 5 14C5 11.172 5 9.757 5.879 8.879C6.757 8 8.172 8 11 8Z"
                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 16.5C10 16.5 10.667 17 12 17C13.333 17 14 16.5 14 16.5"
                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </Link>
            )}

            {/* ── Settings (placeholder) ── */}
            {/* <button
                id="settings"
                title="Settings"
                className="w-12 h-12 bg-white/55 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 hover:text-[#DB2727] transition-all duration-200 text-[#575757] border border-white/40 cursor-pointer"
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.9 12.66C19.7397 12.4775 19.6513 12.2429 19.6513 12C19.6513 11.7571 19.7397 11.5225 19.9 11.34L21.18 9.9C21.3211 9.74267 21.4087 9.54469 21.4302 9.33449C21.4518 9.1243 21.4062 8.91267 21.3 8.73L19.3 5.27C19.1949 5.08751 19.0349 4.94286 18.8428 4.85667C18.6506 4.77048 18.4362 4.74714 18.23 4.79L16.35 5.17C16.1108 5.21942 15.8618 5.17958 15.6499 5.05799C15.438 4.9364 15.278 4.74147 15.2 4.51L14.59 2.68C14.5229 2.48137 14.3951 2.30885 14.2246 2.18683C14.0542 2.06481 13.8497 1.99945 13.64 2H9.64C9.42195 1.9886 9.20615 2.04891 9.02558 2.1717C8.84501 2.29449 8.7096 2.47301 8.64 2.68L8.08 4.51C8.00202 4.74147 7.84199 4.9364 7.63013 5.05799C7.41827 5.17958 7.16924 5.21942 6.93 5.17L5 4.79C4.80457 4.76237 4.60532 4.79321 4.42737 4.87863C4.24941 4.96404 4.10072 5.10021 4 5.27L2 8.73C1.89118 8.91064 1.84224 9.12107 1.8602 9.33121C1.87816 9.54135 1.9621 9.74043 2.1 9.9L3.37 11.34C3.53034 11.5225 3.61875 11.7571 3.61875 12C3.61875 12.2429 3.53034 12.4775 3.37 12.66L2.1 14.1C1.9621 14.2595 1.87816 14.4586 1.8602 14.6688C1.84224 14.8789 1.89118 15.0893 2 15.27L4 18.73C4.10512 18.9125 4.26514 19.0571 4.45727 19.1433C4.6494 19.2295 4.86384 19.2528 5.07 19.21L6.95 18.83C7.18924 18.7806 7.43827 18.8204 7.65013 18.942C7.86199 19.0636 8.02202 19.2585 8.1 19.49L8.71 21.32C8.7796 21.527 8.91501 21.7055 9.09558 21.8283C9.27615 21.9511 9.49195 22.0114 9.71 22H13.71C13.9197 22.0005 14.1242 21.9352 14.2946 21.8131C14.4651 21.6911 14.5929 21.5186 14.66 21.32L15.27 19.49C15.348 19.2585 15.508 19.0636 15.7199 18.942C15.9318 18.8204 16.1808 18.7806 16.42 18.83L18.3 19.21C18.5062 19.2528 18.7206 19.2295 18.9128 19.1433C19.1049 19.0571 19.2649 18.9125 19.37 18.73L21.37 15.27C21.4762 15.0873 21.5218 14.8757 21.5002 14.6655C21.4787 14.4553 21.3911 14.2573 21.25 14.1L19.9 12.66ZM11.64 15C10.8489 15 10.0755 14.7654 9.41774 14.3259C8.75994 13.8864 8.24725 13.2616 7.9445 12.5307C7.64175 11.7998 7.56254 10.9956 7.71688 10.2197C7.87122 9.44372 8.25218 8.731 8.81159 8.17159C9.371 7.61218 10.0837 7.23122 10.8597 7.07688C11.6356 6.92254 12.4398 7.00175 13.1708 7.3045C13.9017 7.60725 14.5264 8.11994 14.9659 8.77774C15.4054 9.43554 15.64 10.2089 15.64 11C15.64 12.0609 15.2186 13.0783 14.4684 13.8284C13.7183 14.5786 12.7009 15 11.64 15Z" fill="currentColor" />
                </svg>
            </button> */}

            {/* ── Log Out (pinned to bottom) ── */}
            <button
                id="log-out"
                onClick={handleLogout}
                title="Sign Out"
                className="fixed bottom-8 left-8 w-12 h-12 bg-white/55 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 hover:text-[#DB2727] transition-all duration-200 text-[#575757] border border-white/40 cursor-pointer"
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 21C4.45 21 3.97933 20.8043 3.588 20.413C3.19667 20.0217 3.00067 19.5507 3 19V5C3 4.45 3.196 3.97933 3.588 3.588C3.98 3.19667 4.45067 3.00067 5 3H12V5H5V19H12V21H5ZM16 17L14.625 15.55L17.175 13H9V11H17.175L14.625 8.45L16 7L21 12L16 17Z" fill="currentColor" />
                </svg>
            </button>
        </aside>
    );
};

export default SideMenu;
