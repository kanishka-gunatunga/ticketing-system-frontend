"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import RedSpinner from "@/components/RedSpinner";
import TicketColumn from "@/components/TicketColumn";
import Toast from "@/components/Toast";
import { useLeads, LeadsService, Ticket } from "@/hooks/useLeads";
import { useCurrentUser } from "@/utils/auth";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/useToast";
import { Table } from "antd";
import SideMenu from "@/components/SideMenu";
import {
    Search,
    LayoutGrid,
    Clock,
    User,
    Mail,
    Phone,
    Briefcase,
    Globe,
    Info,
    PlusCircle
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

export default function Leads() {
    const user = useCurrentUser();
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();

    // --- State Management ---
    const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
    const [searchTerm, setSearchTerm] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState("All Status");
    const [filterPriority, setFilterPriority] = useState("All Priority");
    const [filterCategory, setFilterCategory] = useState("All Categories");

    const filterRef = useRef<HTMLDivElement>(null);

    // Dialog & Detail states
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    // List of active agents (for Admin manual assignment)
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState<string>("");

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // --- Filters ---
    const queryFilters = useMemo(() => ({
        page: 1,
        limit: 100, // Large limit for dashboard view
        search: debouncedSearchTerm,
        status: filterStatus === "All Status" ? undefined : filterStatus,
        priority: filterPriority === "All Priority" ? undefined : filterPriority,
        category: filterCategory === "All Categories" ? undefined : filterCategory
    }), [debouncedSearchTerm, filterStatus, filterPriority, filterCategory]);

    const { data: leadsResponse, isLoading, refetch } = useLeads(queryFilters);

    // Fetch Agents for manual Admin assignment
    useEffect(() => {
        if (user && user.role === "Admin") {
            axios.get(`${API_URL}/users`)
                .then(res => {
                    const filtered = res.data.filter((u: any) => u.role === "AgentL1" || u.role === "AgentL2");
                    setAgents(filtered);
                })
                .catch(err => console.error("Error fetching agents list:", err));
        }
    }, [user]);

    // Safe getters for flat lists
    const tickets = leadsResponse?.data || [];

    // --- Actions ---
    const handleSelfAssign = async (ticketId: number) => {
        if (!user) return;
        try {
            await LeadsService.selfAssign(ticketId, user.id);
            showToast("Ticket successfully assigned to you", "success");
            refetch();
            if (isDetailModalOpen && selectedTicket?.id === ticketId) {
                handleOpenDetails(ticketId); // Refresh details
            }
        } catch (err: any) {
            showToast("Failed to self-assign ticket", "error");
        }
    };

    const handleEscalate = async (ticketId: number) => {
        if (!user) return;
        try {
            await LeadsService.escalate(ticketId, user.id);
            showToast("Ticket escalated to Level 2 Support queue", "success");
            refetch();
            setIsDetailModalOpen(false);
        } catch (err) {
            showToast("Failed to escalate ticket", "error");
        }
    };

    const handleResolve = async (ticketId: number) => {
        if (!user) return;
        try {
            await LeadsService.updateTicketStatus(ticketId, "Resolved", user.id);
            showToast("Ticket resolved successfully", "success");
            refetch();
            setIsDetailModalOpen(false);
        } catch (err) {
            showToast("Failed to resolve ticket", "error");
        }
    };

    const handleAdminAssign = async (ticketId: number) => {
        if (!user || !selectedAgentId) return;
        try {
            await LeadsService.adminAssign(ticketId, Number(selectedAgentId), user.id);
            showToast("Agent manually assigned successfully", "success");
            setSelectedAgentId("");
            refetch();
            setIsDetailModalOpen(false);
        } catch (err) {
            showToast("Failed to assign agent", "error");
        }
    };

    const handleOpenDetails = (ticketId: number) => {
        router.push(`/leads/${ticketId}`);
    };

    // --- Table Column Settings ---
    const tableColumns = [
        {
            title: (
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Lead/Ticket ID
                </div>
            ),
            dataIndex: "ticket_number",
            key: "ticket_number",
            render: (text: string, record: Ticket) => (
                <button onClick={() => handleOpenDetails(record.id)} className="font-bold text-[#DB2727] hover:underline text-left cursor-pointer">
                    {text}
                </button>
            )
        },
        {
            title: (
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Title
                </div>
            ),
            dataIndex: "title",
            key: "title",
            render: (text: string) => <span className="font-semibold text-gray-900">{text}</span>
        },
        {
            title: (
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product
                </div>
            ),
            key: "product",
            render: (_: any, record: Ticket) => (
                <span className="px-2 py-1 bg-gray-150 rounded text-xs font-bold text-gray-600 uppercase">
                    {record.product} ({record.instant_id})
                </span>
            )
        },
        {
            title: (
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Requester
                </div>
            ),
            dataIndex: "requester_name",
            key: "requester_name",
            render: (name: string) => <span className="font-medium text-gray-900">{name}</span>
        },
        {
            title: (
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                </div>
            ),
            dataIndex: "category",
            key: "category",
            render: (category: string) => (
                <span className="px-2.5 py-1 bg-gray-100 rounded-[6px] text-xs font-medium text-gray-600">
                    {category}
                </span>
            )
        },
        {
            title: (
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Priority
                </div>
            ),
            dataIndex: "priority",
            key: "priority",
            render: (priority: string) => {
                const priorityStyles: Record<string, string> = {
                    Critical: "bg-[#FFDDD1] text-[#B54708]",
                    High: "bg-[#FFEFD1] text-[#B54708]",
                    Medium: "bg-[#E9D7FE] text-[#6941C6]",
                    Low: "bg-[#D1E9FF] text-[#026AA2]"
                };
                const badgeStyle = priorityStyles[priority] || priorityStyles.Low;
                return (
                    <span className={`px-2.5 py-0.5 rounded-[6px] text-xs font-medium border border-transparent ${badgeStyle}`}>
                        {priority}
                    </span>
                );
            }
        },
        {
            title: (
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                </div>
            ),
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                let colorClass = "bg-gray-100 text-gray-800";
                if (status === 'Resolved') colorClass = "bg-[#ECFDF3] text-[#027A48]";
                if (status === 'Closed') colorClass = "bg-[#F2F4F7] text-[#344054]";
                if (status.startsWith('Assigned') || status === 'Escalated') colorClass = "bg-[#FFFAEB] text-[#B54708]";
                if (status === 'New') colorClass = "bg-[#F9FAFB] text-[#344054]";

                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center justify-center w-[110px] ${colorClass}`}>
                        {status}
                    </span>
                );
            }
        },
        {
            title: (
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Assignee
                </div>
            ),
            key: "assignee",
            render: (_: any, record: Ticket) => (
                <span className="text-gray-700 text-xs font-semibold">
                    {record.assignee ? record.assignee.name : "-"}
                </span>
            )
        },
        {
            title: (
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                </div>
            ),
            key: "actions",
            render: (_: any, record: Ticket) => (
                <button
                    onClick={() => handleOpenDetails(record.id)}
                    className="text-[#DB2727] hover:text-red-700 text-xs font-bold transition-colors cursor-pointer"
                >
                    View Details
                </button>
            )
        }
    ];

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#E6E6E6B2]/70 backdrop-blur-md">
                <RedSpinner />
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-screen bg-[#E6E6E6B2]/70 backdrop-blur-md text-gray-900 montserrat overflow-x-hidden pb-10">
            <Toast
                message={toast.message}
                type={toast.type}
                visible={toast.visible}
                onClose={hideToast}
            />

            <Header title="Digitrust Ticketing System" />
            <SideMenu />

            <main className="pt-30 px-16 ml-16 min-[1500px]:ml-auto max-w-[1440px] mx-auto flex flex-col gap-8">
                
                {/* Controls Section (Search, Filters, Create Inquiry Button) */}
                <div className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        
                        {/* Search Input styled without black outlines */}
                        <div className="relative w-full flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search support tickets by ID, name or title..."
                                className="w-full pl-12 pr-4 py-3 rounded-[20px] bg-white border border-[#E0E0E0] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DB2727] focus:border-transparent text-[#667085] transition"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filters & Actions buttons */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-2 px-6 py-3 border border-[#E0E0E0] cursor-pointer rounded-[20px] transition-colors ${
                                    isFilterOpen
                                        ? 'bg-red-50 border-red-200 text-[#DB2727] font-semibold'
                                        : 'bg-white text-[#344054] hover:bg-gray-50'
                                }`}
                            >
                                <span className="font-medium text-sm">Filters</span>
                            </button>

                            {user.role === "Company" && (
                                <button
                                    onClick={() => router.push("/leads/create")}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#DB2727] hover:bg-red-700 active:scale-95 text-white text-sm font-bold rounded-[20px] transition shadow-md shadow-red-500/10 cursor-pointer border border-transparent"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Create Inquiry
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Expandable Filter Grid panel */}
                    {isFilterOpen && (
                        <div
                            ref={filterRef}
                            className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-200/50 animate-in fade-in slide-in-from-top-2 duration-200"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-500">Status</label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                                    >
                                        <option>All Status</option>
                                        <option value="New">New</option>
                                        <option value="Assigned L1">Assigned L1</option>
                                        <option value="Escalated">Escalated</option>
                                        <option value="Assigned L2">Assigned L2</option>
                                        <option value="Resolved">Resolved</option>
                                        {/*<option value="Closed">Closed</option>*/}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-500">Priority</label>
                                    <select
                                        value={filterPriority}
                                        onChange={(e) => setFilterPriority(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                                    >
                                        <option>All Priority</option>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-500">Category</label>
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-100"
                                    >
                                        <option>All Categories</option>
                                        <option value="Technical Issue">Technical Issue</option>
                                        <option value="Bug Report">Bug Report</option>
                                        <option value="Login & Access">Login & Access</option>
                                        <option value="Feature Request">Feature Request</option>
                                        <option value="Data Issue">Data Issue</option>
                                        <option value="UI/UX Issue">UI/UX Issue</option>
                                        <option value="Security Issue">Security Issue</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Board styled in premium transparent styling */}
                <section className="relative bg-[#FFFFFF4D] bg-opacity-30 border border-[#E0E0E0] rounded-[45px] p-6 min-h-[500px] shadow-sm">
                    
                    {/* Inner header of board */}
                    <div className="w-full flex justify-between items-center mb-6 px-4">
                        <div className="flex flex-col">
                            <span className="font-semibold text-[22px]">
                                {viewMode === "kanban" && user.role !== "Company" ? "Support Inquiry Board" : `All Inquiries (${tickets.length})`}
                            </span>
                            <div className="text-sm text-gray-500">
                                Showing support tickets based on active filtering
                            </div>
                        </div>

                        {/* Layout Toggle buttons */}
                        {user.role !== "Company" && (
                            <div className="flex bg-white rounded-[14px] border border-gray-200 p-1">
                                <button
                                    onClick={() => setViewMode("kanban")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium transition-all ${
                                        viewMode === "kanban" ? "bg-red-50 text-[#DB2727] shadow-sm font-bold" : "text-gray-500 hover:text-gray-700 cursor-pointer"
                                    }`}
                                >
                                    <LayoutGrid size={16} />
                                    Kanban
                                </button>
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium transition-all ${
                                        viewMode === "table" ? "bg-[#DB2727] text-white shadow-sm font-bold" : "text-gray-500 hover:text-gray-700 cursor-pointer"
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="8" y1="6" x2="21" y2="6"></line>
                                        <line x1="8" y1="12" x2="21" y2="12"></line>
                                        <line x1="8" y1="18" x2="21" y2="18"></line>
                                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                    </svg>
                                    Table
                                </button>
                            </div>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <RedSpinner />
                        </div>
                    ) : viewMode === "kanban" && user.role !== "Company" ? (
                        
                        /* Kanban Column Board Grid */
                        <div className="w-full flex flex-row gap-4 items-start overflow-x-auto pb-4">
                            {user.role === "Admin" ? (
                                <>
                                    <div className="flex-1 min-w-[220px]"><TicketColumn title="New" tickets={tickets.filter(t => t.status === "New")} onViewDetails={handleOpenDetails} /></div>
                                    <div className="flex-1 min-w-[220px]"><TicketColumn title="Assigned L1" tickets={tickets.filter(t => t.status === "Assigned L1")} onViewDetails={handleOpenDetails} /></div>
                                    <div className="flex-1 min-w-[220px]"><TicketColumn title="Escalated" tickets={tickets.filter(t => t.status === "Escalated")} onViewDetails={handleOpenDetails} /></div>
                                    <div className="flex-1 min-w-[220px]"><TicketColumn title="Assigned L2" tickets={tickets.filter(t => t.status === "Assigned L2")} onViewDetails={handleOpenDetails} /></div>
                                    <div className="flex-1 min-w-[220px]"><TicketColumn title="Resolved" tickets={tickets.filter(t => t.status === "Resolved")} onViewDetails={handleOpenDetails} /></div>
                                </>
                            ) : user.role === "AgentL1" ? (
                                <>
                                    <div className="flex-1 min-w-[220px]"><TicketColumn title="New" tickets={tickets.filter(t => t.status === "New")} onViewDetails={handleOpenDetails} onAssign={handleSelfAssign} /></div>
                                    <div className="flex-1 min-w-[220px]"><TicketColumn title="Assigned L1" tickets={tickets.filter(t => t.status === "Assigned L1")} onViewDetails={handleOpenDetails} /></div>
                                    <div className="flex-1 min-w-[220px]"><TicketColumn title="Resolved" tickets={tickets.filter(t => t.status === "Resolved")} onViewDetails={handleOpenDetails} /></div>
                                </>
                            ) : (
                                <>
                                    <div className="flex-1 min-w-[220px]"><TicketColumn title="Escalated" tickets={tickets.filter(t => t.status === "Escalated")} onViewDetails={handleOpenDetails} onAssign={handleSelfAssign} /></div>
                                    <div className="flex-1 min-w-[220px]"><TicketColumn title="Assigned L2" tickets={tickets.filter(t => t.status === "Assigned L2")} onViewDetails={handleOpenDetails} /></div>
                                    <div className="flex-1 min-w-[220px]"><TicketColumn title="Resolved" tickets={tickets.filter(t => t.status === "Resolved")} onViewDetails={handleOpenDetails} /></div>
                                </>
                            )}
                        </div>
                    ) : (
                        
                        /* Tabular view wrapped in clean white borders container */
                        <div className="flex flex-col gap-6">
                            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                <Table
                                    columns={tableColumns}
                                    dataSource={tickets}
                                    rowKey="id"
                                    pagination={{ pageSize: 10 }}
                                />
                            </div>
                        </div>
                    )}
                </section>
            </main>


        </div>
    );
}
