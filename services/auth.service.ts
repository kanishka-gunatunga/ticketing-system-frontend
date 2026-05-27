import axios from 'axios';
import { logInUser } from '../utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

export const AuthService = {
    login: async (credentials: { email: string; password: string }) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, credentials);
            if (response.data && response.data.accessToken) {
                logInUser(response.data.user, response.data.accessToken);
            }
            return response.data;
        } catch (error: any) {
            console.error("AuthService Login Error:", error);
            throw error;
        }
    },

    register: async (userData: {
        name: string;
        email: string;
        password?: string;
        role?: string;
        contact_no?: string;
        products?: string[];
        instant_ids?: Record<string, string>;
    }) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, userData);
            return response.data;
        } catch (error: any) {
            console.error("AuthService Register Error:", error);
            throw error;
        }
    }
};
