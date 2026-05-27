import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

export function useUsers(filters: any = {}) {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/users`, {
                params: filters
            });
            setData(response.data);
            setError(null);
        } catch (err) {
            console.error("useUsers fetch error:", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [filters.user_role, filters.department, filters.branch, filters.search]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { data, isLoading, error, refetch: fetchUsers };
}

export function useCreateUser() {
    const [isLoading, setIsLoading] = useState(false);

    const mutateAsync = async (payload: any) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/users`, payload);
            return response.data;
        } catch (error) {
            console.error("useCreateUser mutate error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutateAsync, isLoading };
}

export function useUpdateUser() {
    const [isLoading, setIsLoading] = useState(false);

    const mutateAsync = async ({ id, data }: { id: number; data: any }) => {
        setIsLoading(true);
        try {
            const response = await axios.put(`${API_URL}/users/${id}`, data);
            return response.data;
        } catch (error) {
            console.error("useUpdateUser mutate error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutateAsync, isLoading };
}

export function useCheckHandover() {
    const [isLoading, setIsLoading] = useState(false);

    const mutateAsync = async (id: number) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/users/${id}/handover`);
            return response.data;
        } catch (error) {
            console.error("useCheckHandover mutate error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutateAsync, isLoading };
}
