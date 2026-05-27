"use client";

import { useEffect, useState } from 'react';

export interface User {
    id: number;
    name: string;
    full_name: string;
    email: string;
    role: 'Admin' | 'Company' | 'AgentL1' | 'AgentL2';
    user_role: 'Admin' | 'Company' | 'AgentL1' | 'AgentL2'; // Compatibility mapping
    contact_no?: string;
    products?: string[];
    instant_ids?: Record<string, string>;
}

export function useCurrentUser() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const checkUser = () => {
            const stored = localStorage.getItem("user");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored) as User;
                    parsed.user_role = parsed.role; // map role to user_role for layout pages
                    setUser(parsed);
                } catch (e) {
                    console.error("Failed to parse user session", e);
                }
            } else {
                setUser(null);
            }
        };

        checkUser();

        // Listen for standard storage events to keep sync
        window.addEventListener('storage', checkUser);
        return () => window.removeEventListener('storage', checkUser);
    }, []);

    return user;
}

export const logInUser = (userData: any, token: string) => {
    localStorage.setItem("token", token);
    const formattedUser = {
        ...userData,
        user_role: userData.role // Ensure alias is present
    };
    localStorage.setItem("user", JSON.stringify(formattedUser));
    // Trigger custom event to notify listeners immediately on the same window
    window.dispatchEvent(new Event('storage'));
};

export const logOutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event('storage'));
};
