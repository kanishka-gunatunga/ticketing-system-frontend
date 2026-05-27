"use client";

// import { Role } from "@/types/role";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useCurrentUser } from "@/utils/auth";
import { usePathname } from "next/navigation";
// import NotificationDropdown from "@/components/NotificationDropdown";

// Define Role locally if types/role doesn't exist
export type Role = "ADMIN" | "CALLAGENT" | "SALES01" | "SALES02" | "TELEMARKETER" | string;


const Navbar = () => {

    const user = useCurrentUser();
    const pathname = usePathname();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div>
            <header className="fixed top-0 left-0 right-0 backdrop-blur-md montserrat z-50 px-6 flex items-center h-24 max-w-[2500px] mx-auto container">
                <div className="flex flex-row w-full items-center justify-between">
                    {/* Logo */}
                    <Link href="/public">
                        <div className="w-20 h-20 mt-6 relative">
                            {/* Assuming indra-logo.png exists in public folder as per user code */}
                            {/* If using Next.js Image try to use it if possible, but bg-[url] was requested */}
                            {/* <div className="w-25 h-25 bg-[url('/Harbour-Lane-Logo-1.png')] bg-contain bg-no-repeat" /> */}
                            <h2>LOGO</h2>
                        </div>
                    </Link>

                    {/* Navigation Tabs */}
                    <div className="flex-1 flex justify-center">
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-4">
                        {/* Search Button */}
                        <button className="w-12 h-12 bg-[#FFFFFFB2]/70 rounded-full flex items-center justify-center hover:bg-gray-100 transition">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M16.893 16.92L19.973 20M19 11.5C19 13.4891 18.2098 15.3968 16.8033 16.8033C15.3968 18.2098 13.4891 19 11.5 19C9.51088 19 7.60322 18.2098 6.1967 16.8033C4.79018 15.3968 4 13.4891 4 11.5C4 9.51088 4.79018 7.60322 6.1967 6.1967C7.60322 4.79018 9.51088 4 11.5 4C13.4891 4 15.3968 4.79018 16.8033 6.1967C18.2098 7.60322 19 9.51088 19 11.5Z"
                                    stroke="#575757"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>


                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-center focus:outline-none ring-2 ring-transparent focus:ring-gray-200 rounded-full transition cursor-pointer"
                            >
                                <Image
                                    width={44}
                                    height={44}
                                    src="/avatar.png"
                                    alt="User Avatar"
                                    className="w-11 h-11 rounded-full object-cover border border-gray-200 bg-gray-200"
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 origin-top-right animation-fade-in">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm text-gray-500">Signed in as</p>
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {(user as any)?.full_name || "User"}
                                        </p>
                                    </div>

                                    <Link
                                        href="/profile"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                                    >
                                        View Profile
                                    </Link>

                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            signOut({ callbackUrl: "/login" });
                                        }}
                                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header >
        </div >
    );
};

export default Navbar;
