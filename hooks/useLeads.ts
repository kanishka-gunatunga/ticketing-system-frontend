import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useCurrentUser } from '../utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

export interface Ticket {
    id: number;
    ticket_number: string;
    title: string;
    product: string;
    instant_id: string;
    status: 'New' | 'Assigned L1' | 'Escalated' | 'Assigned L2' | 'Resolved' | 'Closed';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    category: string;
    description: string;
    requester_name: string;
    requester_email: string;
    requester_phone: string;
    requester_department?: string;
    requester_branch?: string;
    impact_level?: string;
    impact_user_details?: string;
    attachments?: string;
    company_user_id?: number;
    assigned_to?: number;
    created_at: string;
    updated_at: string;
    companyCreator?: { id: number; name: string; email: string; contact_no: string };
    assignee?: { id: number; name: string; email: string; role: string };
    activities?: Array<{
        id: number;
        activity_type: string;
        details: string;
        created_at: string;
        user?: { id: number; name: string; role: string };
    }>;
    followups?: Array<{
        id: number;
        activity: string;
        activity_date: string;
        creator?: { name: string };
    }>;
    reminders?: Array<{
        id: number;
        task_title: string;
        task_date: string;
        note?: string;
        creator?: { name: string };
    }>;
}

export function useLeads(filters: any = {}) {
    const user = useCurrentUser();
    const [data, setData] = useState<{ data: Ticket[]; meta: any } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchLeads = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/tickets`, {
                params: {
                    role: user.role,
                    userId: user.id,
                    status: filters.status,
                    priority: filters.priority
                }
            });

            const allTickets = response.data as Ticket[];

            // Apply search filter locally for extreme speed and robustness
            let filtered = allTickets;
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filtered = allTickets.filter(t => 
                    t.ticket_number.toLowerCase().includes(searchLower) ||
                    t.requester_name.toLowerCase().includes(searchLower) ||
                    t.requester_phone.toLowerCase().includes(searchLower) ||
                    t.title.toLowerCase().includes(searchLower)
                );
            }

            // Client-side pagination matching the frontend meta expectation
            const page = filters.page || 1;
            const limit = filters.limit || 10;
            const startIndex = (page - 1) * limit;
            const paginatedData = filtered.slice(startIndex, startIndex + limit);

            setData({
                data: paginatedData,
                meta: {
                    total: filtered.length,
                    page,
                    limit,
                    totalPages: Math.ceil(filtered.length / limit)
                }
            });
            setError(null);
        } catch (err) {
            console.error("useLeads fetch error:", err);
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [user, filters.status, filters.priority, filters.search, filters.page, filters.limit]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchLeads
    };
}

export const LeadsService = {
    createTicket: async (ticketData: any) => {
        const response = await axios.post(`${API_URL}/tickets`, ticketData);
        return response.data;
    },

    getTicketDetails: async (id: number): Promise<Ticket> => {
        const response = await axios.get(`${API_URL}/tickets/${id}`);
        return response.data;
    },

    updateTicketStatus: async (id: number, status: string, userId: number) => {
        const response = await axios.put(`${API_URL}/tickets/${id}`, { status, userId });
        return response.data;
    },

    selfAssign: async (id: number, agentId: number) => {
        const response = await axios.post(`${API_URL}/tickets/${id}/assign`, { agentId });
        return response.data;
    },

    escalate: async (id: number, agentId: number) => {
        const response = await axios.post(`${API_URL}/tickets/${id}/escalate`, { agentId });
        return response.data;
    },

    adminAssign: async (id: number, agentId: number, adminId: number) => {
        const response = await axios.post(`${API_URL}/tickets/${id}/admin-assign`, { agentId, adminId });
        return response.data;
    },

    remindAgent: async (id: number, userId: number) => {
        const response = await axios.post(`${API_URL}/tickets/${id}/remind`, { userId });
        return response.data;
    }
};
