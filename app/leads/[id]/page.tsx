/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { ArrowLeft, Clock, User, Mail, Phone, Briefcase, Globe, Info, PlusCircle, Paperclip } from "lucide-react";
import { message } from "antd";

import Header from "@/components/Header";
import FlowBar, { ComplainStatus } from "@/components/FlowBar";
import TicketInfoRow from "@/components/TicketInfoRow";
import TicketDetailsTab from "@/components/TicketDetailsTab";
import Modal from "@/components/Modal";
import RedSpinner from "@/components/RedSpinner";
import Toast from "@/components/Toast";
import { useCurrentUser } from "@/utils/auth";
import { useToast } from "@/hooks/useToast";
import { LeadsService, Ticket } from "@/hooks/useLeads";
import TicketChat from "@/components/TicketChat";

export default function TicketDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params?.id as string;
    const user = useCurrentUser();
    const { toast, showToast, hideToast } = useToast();

    // --- State Management ---
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    // Dialog & Activity states
    const [isActivityModalOpen, setActivityModalOpen] = useState(false);
    const [isReminderModalOpen, setReminderModalOpen] = useState(false);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);

    // Form inputs
    const [activityText, setActivityText] = useState("");
    const [reminderTitle, setReminderTitle] = useState("");
    const [reminderDate, setReminderDate] = useState("");
    const [reminderNote, setReminderNote] = useState("");

    // Admin agent assign list
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState<string>("");
    const [isSubmittingAction, setIsSubmittingAction] = useState(false);

    // Fetch ticket details
    const fetchTicketDetails = useCallback(async () => {
        if (!ticketId) return;
        setIsLoading(true);
        try {
            const details = await LeadsService.getTicketDetails(Number(ticketId));
            setTicket(details);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching ticket details:", err);
            setError(err);
            showToast("Failed to load ticket details", "error");
        } finally {
            setIsLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        fetchTicketDetails();
    }, [fetchTicketDetails]);

    // Fetch Agents for manual Admin assignment
    useEffect(() => {
        if (user && user.role === "Admin") {
            axios.get("http://localhost:8081/api/users")
                .then(res => {
                    const filtered = res.data.filter((u: any) => u.role === "AgentL1" || u.role === "AgentL2");
                    setAgents(filtered);
                })
                .catch(err => console.error("Error fetching agents list in details:", err));
        }
    }, [user]);

    // --- Role-Based Action Handlers ---
    const handleSelfAssign = async () => {
        if (!user || !ticket) return;
        setIsSubmittingAction(true);
        try {
            await LeadsService.selfAssign(ticket.id, user.id);
            showToast("Ticket successfully assigned to you", "success");
            await fetchTicketDetails();
        } catch (err: any) {
            showToast("Failed to self-assign ticket", "error");
        } finally {
            setIsSubmittingAction(false);
        }
    };

    const handleEscalate = async () => {
        if (!user || !ticket) return;
        setIsSubmittingAction(true);
        try {
            await LeadsService.escalate(ticket.id, user.id);
            showToast("Ticket escalated to Level 2 Support", "success");
            await fetchTicketDetails();
        } catch (err: any) {
            showToast("Failed to escalate ticket", "error");
        } finally {
            setIsSubmittingAction(false);
        }
    };

    const handleResolve = async () => {
        if (!user || !ticket) return;
        setIsSubmittingAction(true);
        try {
            await LeadsService.updateTicketStatus(ticket.id, "Resolved", user.id);
            showToast("Ticket resolved successfully", "success");
            await fetchTicketDetails();
        } catch (err: any) {
            showToast("Failed to resolve ticket", "error");
        } finally {
            setIsSubmittingAction(false);
        }
    };

    const handleAdminAssign = async () => {
        if (!user || !ticket || !selectedAgentId) return;
        setIsSubmittingAction(true);
        try {
            await LeadsService.adminAssign(ticket.id, Number(selectedAgentId), user.id);
            showToast("Agent manually assigned successfully", "success");
            setSelectedAgentId("");
            setAssignModalOpen(false);
            await fetchTicketDetails();
        } catch (err: any) {
            showToast("Failed to assign agent", "error");
        } finally {
            setIsSubmittingAction(false);
        }
    };

    // --- Follow-ups and Reminders Save Handlers ---
    const handleActivitySave = async () => {
        if (!activityText.trim() || !ticket || !user) return;
        setIsSubmittingAction(true);
        try {
            await axios.post(`http://localhost:8081/api/tickets/${ticket.id}/followups`, {
                activity: activityText,
                activity_date: new Date().toISOString().split('T')[0],
                userId: user.id
            });
            setActivityText("");
            setActivityModalOpen(false);
            showToast("Activity log saved successfully", "success");
            await fetchTicketDetails();
        } catch (err: any) {
            console.error("Error creating followup activity:", err);
            showToast("Failed to save activity", "error");
        } finally {
            setIsSubmittingAction(false);
        }
    };

    const handleReminderSave = async () => {
        if (!reminderTitle.trim() || !reminderDate || !ticket || !user) return;
        setIsSubmittingAction(true);
        try {
            await axios.post(`http://localhost:8081/api/tickets/${ticket.id}/reminders`, {
                task_title: reminderTitle,
                task_date: reminderDate,
                note: reminderNote,
                userId: user.id
            });
            setReminderTitle("");
            setReminderDate("");
            setReminderNote("");
            setReminderModalOpen(false);
            showToast("Reminder created successfully", "success");
            await fetchTicketDetails();
        } catch (err: any) {
            console.error("Error creating reminder:", err);
            showToast("Failed to save reminder", "error");
        } finally {
            setIsSubmittingAction(false);
        }
    };

    // Mapping dynamic ticket status to FlowBar's ComplainStatus
    const getFlowBarStatus = (status: Ticket["status"]): ComplainStatus => {
        switch (status) {
            case "New":
                return "New";
            case "Assigned L1":
                return "In Review";
            case "Escalated":
                return "Processing";
            case "Assigned L2":
                return "Approval";
            case "Resolved":
            case "Closed":
                return "Completed";
            default:
                return "New";
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#E6E6E6B2]/70 backdrop-blur-md">
                <RedSpinner />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#E6E6E6B2]/70 backdrop-blur-md">
                <RedSpinner />
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#E6E6E6B2]/70 backdrop-blur-md p-6">
                <div className="bg-white/80 p-8 rounded-[30px] border border-red-200 text-center shadow-md max-w-md">
                    <p className="text-lg font-semibold text-gray-800 mb-4">Ticket not found or error loading details.</p>
                    <button onClick={() => router.push("/leads")} className="px-6 py-3 bg-[#DB2727] text-white rounded-2xl font-bold transition hover:bg-red-700">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const flowStatus = getFlowBarStatus(ticket.status);

    // Action button states mapping
    const getActionButton = () => {
        if (user.role === "Admin") {
            return (
                <button
                    onClick={() => setAssignModalOpen(true)}
                    className="h-[40px] rounded-[22.98px] px-6 font-medium text-sm bg-[#DB2727] text-white hover:bg-red-700 transition duration-200 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer border border-transparent"
                    disabled={isSubmittingAction}
                >
                    {ticket.assignee ? `Reassign Agent` : "Assign Sales/Support Agent"}
                </button>
            );
        }

        if (user.role === "AgentL1") {
            if (ticket.status === "New") {
                return (
                    <button
                        onClick={handleSelfAssign}
                        className="h-[40px] rounded-[22.98px] px-6 font-medium text-sm bg-[#DB2727] text-white hover:bg-red-700 transition duration-200 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer border border-transparent"
                        disabled={isSubmittingAction}
                    >
                        {isSubmittingAction ? "Assigning..." : "Assign to me"}
                    </button>
                );
            }
            if (ticket.status === "Assigned L1") {
                return (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleEscalate}
                            className="h-[40px] rounded-[22.98px] px-6 font-medium text-sm bg-orange-500 text-white hover:bg-orange-600 transition duration-200 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer border border-transparent"
                            disabled={isSubmittingAction}
                        >
                            {isSubmittingAction ? "Escalating..." : "Escalate to L2"}
                        </button>
                        <button
                            onClick={handleResolve}
                            className="h-[40px] rounded-[22.98px] px-6 font-medium text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition duration-200 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer border border-transparent"
                            disabled={isSubmittingAction}
                        >
                            {isSubmittingAction ? "Resolving..." : "Resolve Ticket"}
                        </button>
                    </div>
                );
            }
        }

        if (user.role === "AgentL2") {
            if (ticket.status === "Escalated") {
                return (
                    <button
                        onClick={handleSelfAssign}
                        className="h-[40px] rounded-[22.98px] px-6 font-medium text-sm bg-[#DB2727] text-white hover:bg-red-700 transition duration-200 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer border border-transparent"
                        disabled={isSubmittingAction}
                    >
                        {isSubmittingAction ? "Assigning..." : "Assign to me"}
                    </button>
                );
            }
            if (ticket.status === "Assigned L2") {
                return (
                    <button
                        onClick={handleResolve}
                        className="h-[40px] rounded-[22.98px] px-6 font-medium text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition duration-200 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer border border-transparent"
                        disabled={isSubmittingAction}
                    >
                        {isSubmittingAction ? "Resolving..." : "Resolve Ticket"}
                    </button>
                );
            }
        }

        return null;
    };

    return (
        <div className="relative w-full min-h-screen bg-[#E6E6E6B2]/70 backdrop-blur-md text-gray-900 montserrat overflow-x-hidden pb-16">
            <Toast
                message={toast.message}
                type={toast.type}
                visible={toast.visible}
                onClose={hideToast}
            />

            <main className="pt-30 px-16 ml-16 max-w-[1440px] mx-auto flex flex-col gap-6">

                {/* Header Panel */}
                <Header title="Support Sphere Portal" />

                {/* Back Nav Link */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push("/leads")}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#DB2727] transition font-medium cursor-pointer"
                    >
                        <ArrowLeft size={16} /> Back to dashboard
                    </button>

                    {ticket.assignee && (
                        <div className="px-4 py-1.5 rounded-full bg-white/60 text-xs font-semibold text-gray-700 border border-[#E0E0E0]">
                            Assigned Agent: <span className="text-[#DB2727]">{ticket.assignee.name}</span>
                        </div>
                    )}
                </div>

                {/* Ticket Details Board */}
                <section className="relative bg-[#FFFFFF4D] mb-5 bg-opacity-30 rounded-[45px] border border-[#E0E0E0] px-9 py-10 flex flex-col gap-8 shadow-sm">

                    {/* Top Status & Controls Row */}
                    <div className="flex flex-col xl:flex-row w-full justify-between items-start xl:items-center gap-6 pb-6 border-b border-gray-200/50">

                        {/* Meta Tags Column */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="font-bold text-[24px] text-gray-900">
                                {ticket.ticket_number}
                            </span>
                            <span className="px-3 py-1 bg-white/80 rounded-full border border-gray-200 text-xs font-semibold uppercase text-gray-600">
                                {ticket.product}
                            </span>
                            <span className="px-3 py-1 bg-white/80 rounded-full border border-gray-200 text-xs font-semibold text-gray-600">
                                ID: {ticket.instant_id}
                            </span>

                            {/* Priority Badge */}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.priority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-100' :
                                ticket.priority === 'High' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                    ticket.priority === 'Medium' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                        'bg-blue-50 text-blue-700 border border-blue-100'
                                }`}>
                                {ticket.priority} Priority
                            </span>
                        </div>

                        {/* FlowBar Progress Chevron */}
                        <div className="w-full xl:w-auto overflow-x-auto no-scrollbar py-1">
                            <FlowBar<ComplainStatus>
                                variant="complains"
                                status={flowStatus}
                            />
                        </div>
                    </div>

                    {/* Quick Action Button block */}
                    <div className="flex flex-wrap items-center gap-4 w-full">
                        {getActionButton()}

                        <div className="ml-auto px-4 py-2 bg-white/80 rounded-[20px] border border-gray-200 text-xs font-semibold text-gray-500">
                            Ticket Status: <span className="text-gray-900 font-bold uppercase">{ticket.status}</span>
                        </div>
                    </div>

                    {/* Details Columns */}
                    <div className="w-full flex flex-col lg:flex-row gap-10 mt-2">

                        {/* Left Side: Ticket Metadata fields */}
                        <div className="w-full lg:w-2/5 flex flex-col gap-6">

                            {/* Section: Submitter Details */}
                            <div>
                                <h3 className="mb-4 font-bold text-[18px] text-gray-800 border-b border-gray-200/50 pb-2">
                                    Requester Profile
                                </h3>
                                <div className="space-y-1">
                                    <TicketInfoRow label="Submitted By:" value={ticket.requester_name || "N/A"} />
                                    <TicketInfoRow label="Email Address:" value={ticket.requester_email || "N/A"} />
                                    <TicketInfoRow label="Contact No:" value={ticket.requester_phone || "N/A"} />
                                    <TicketInfoRow label="Department:" value={ticket.requester_department || "-"} />
                                    <TicketInfoRow label="Branch Location:" value={ticket.requester_branch || "-"} />
                                </div>
                            </div>

                            {/* Section: Category & Description */}
                            <div>
                                <h3 className="mb-4 font-bold text-[18px] text-gray-800 border-b border-gray-200/50 pb-2">
                                    Ticket Description
                                </h3>
                                <div className="space-y-1">
                                    <TicketInfoRow label="Category:" value={ticket.category || "N/A"} />
                                    <TicketInfoRow label="Impact Scope:" value={ticket.impact_level || "Single User"} />

                                    {ticket.impact_user_details && (
                                        <div className="mb-4 text-[16px] max-[1140px]:text-[14px]">
                                            <span className="block font-medium text-[#575757] mb-1">Impacted Users:</span>
                                            <div className="bg-white/80 p-3 rounded-2xl text-gray-700 text-sm whitespace-pre-wrap">
                                                {ticket.impact_user_details}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-4 text-[16px] max-[1140px]:text-[14px]">
                                        <span className="block font-medium text-[#575757] mb-1">Issue Details:</span>
                                        <div className="bg-white/80 p-4 rounded-[22px] text-gray-850 text-sm leading-relaxed whitespace-pre-wrap">
                                            {ticket.description}
                                        </div>
                                    </div>

                                    {ticket.attachments && (() => {
                                        // Parse: support both JSON array (new) and plain URL string (legacy)
                                        let urls: string[] = [];
                                        try {
                                            const parsed = JSON.parse(ticket.attachments);
                                            urls = Array.isArray(parsed) ? parsed : [ticket.attachments];
                                        } catch {
                                            urls = [ticket.attachments];
                                        }
                                        return (
                                            <div className="mt-4">
                                                <span className="block font-semibold text-xs text-gray-400 uppercase mb-2 tracking-wide">
                                                    <Paperclip className="inline w-3.5 h-3.5 mr-1" />
                                                    Attached Evidence ({urls.length})
                                                </span>
                                                <div className="flex flex-wrap gap-2">
                                                    {urls.map((url, i) => {
                                                        const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url) || url.includes('blob.vercel-storage.com');
                                                        return isImage ? (
                                                            <a key={i} href={url} target="_blank" rel="noreferrer"
                                                                className="block w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 hover:border-red-300 transition shadow-sm flex-shrink-0"
                                                                title={`Attachment ${i + 1}`}>
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img src={url} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover" />
                                                            </a>
                                                        ) : (
                                                            <a key={i} href={url} target="_blank" rel="noreferrer"
                                                                className="flex items-center gap-1.5 text-xs text-red-600 hover:underline font-bold bg-white/80 py-2 px-3 rounded-xl border border-gray-200">
                                                                <Paperclip className="w-3.5 h-3.5" /> File {i + 1}
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Followup & Reminders Tab Log */}
                        <div className="w-full lg:w-3/5 flex flex-col min-h-[450px]">
                            <h3 className="mb-4 font-bold text-[18px] text-gray-800 border-b border-gray-200/50 pb-2">
                                Activity Logs & Tasks
                            </h3>

                            <TicketDetailsTab
                                status={flowStatus}
                                onOpenActivity={() => setActivityModalOpen(true)}
                                onOpenReminder={() => setReminderModalOpen(true)}
                                followups={ticket.followups || []}
                                reminders={ticket.reminders || []}
                            />
                        </div>
                    </div>
                </section>

                {/* Backwards History Log (System Events Timeline) */}
                {/* <section className="relative bg-[#FFFFFF4D] bg-opacity-30 rounded-[45px] border border-[#E0E0E0] px-9 py-8 shadow-sm">
                    <h3 className="mb-6 font-bold text-[18px] text-gray-800 border-b border-gray-200/50 pb-2 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-500" /> System Journey Timeline
                    </h3>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar pl-4">
                        {ticket.activities && ticket.activities.length > 0 ? (
                            ticket.activities.map((act, index) => (
                                <div key={act.id} className="flex gap-4 relative">
                                    {index < ticket.activities!.length - 1 && (
                                        <span className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-gray-250"></span>
                                    )}
                                    <div className="w-7 h-7 rounded-full bg-white text-gray-400 border border-gray-200 flex items-center justify-center z-10 flex-shrink-0">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div className="text-sm bg-white/80 px-4 py-2.5 rounded-2xl border border-gray-150 flex-1">
                                        <p className="font-semibold text-gray-800 leading-tight">{act.details}</p>
                                        <span className="text-[10px] text-gray-400 font-medium mt-1 block">
                                            {new Date(act.created_at).toLocaleString()} {act.user ? `by ${act.user.name} (${act.user.role})` : ''}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 italic">No system event logs recorded for this ticket.</p>
                        )}
                    </div>
                </section> */}

                {/* Ticket Chat Section */}
                {ticket && user && (
                    <TicketChat
                        ticketId={ticket.id}
                        ticketStatus={ticket.status}
                        currentUser={{ id: user.id, name: user.name, role: user.role }}
                        assignedToId={ticket.assigned_to}
                        companyUserId={ticket.company_user_id}
                    />
                )}
            </main>

            {/* --- Modals and Dialog Blocks --- */}

            {/* Activity Modal */}
            {/* {isActivityModalOpen && (
                <Modal
                    title="Add New Activity Log"
                    onClose={() => setActivityModalOpen(false)}
                    actionButton={{
                        label: isSubmittingAction ? "Saving..." : "Save Log",
                        onClick: handleActivitySave,
                        disabled: isSubmittingAction || !activityText.trim(),
                    }}
                >
                    <div className="w-[500px] max-w-full pb-4 font-montserrat">
                        <label className="block mb-2 font-semibold text-gray-700 text-sm">Follow-up Activity Details</label>
                        <textarea
                            value={activityText}
                            onChange={(e) => setActivityText(e.target.value)}
                            placeholder="Describe action taken, customer feedback, progress details..."
                            rows={4}
                            className="w-full rounded-[20px] bg-white border border-[#E0E0E0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#DB2727]/30 transition"
                        />
                    </div>
                </Modal>
            )} */}

            {/* Reminder Modal */}
            {/* {isReminderModalOpen && (
                <Modal
                    title="Add Task Reminder"
                    onClose={() => setReminderModalOpen(false)}
                    actionButton={{
                        label: isSubmittingAction ? "Saving..." : "Save Reminder",
                        onClick: handleReminderSave,
                        disabled: isSubmittingAction || !reminderTitle.trim() || !reminderDate,
                    }}
                >
                    <div className="flex flex-col gap-4 w-[500px] max-w-full pb-4 font-montserrat">
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 text-sm">Reminder Title</label>
                            <input
                                type="text"
                                value={reminderTitle}
                                onChange={(e) => setReminderTitle(e.target.value)}
                                placeholder="e.g. Follow up on tech logs review"
                                className="w-full h-[45px] rounded-[18px] bg-white border border-[#E0E0E0] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#DB2727]/30"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 text-sm">Scheduled Date</label>
                            <input
                                type="date"
                                value={reminderDate}
                                onChange={(e) => setReminderDate(e.target.value)}
                                className="w-full h-[45px] rounded-[18px] bg-white border border-[#E0E0E0] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#DB2727]/30"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-gray-700 text-sm">Optional Notes</label>
                            <textarea
                                value={reminderNote}
                                onChange={(e) => setReminderNote(e.target.value)}
                                placeholder="Additional details, specific tasks or context..."
                                rows={3}
                                className="w-full rounded-[18px] bg-white border border-[#E0E0E0] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#DB2727]/30"
                            />
                        </div>
                    </div>
                </Modal>
            )} */}

            {/* Admin Manual Assign Modal */}
            {isAssignModalOpen && (
                <Modal
                    title="Assign Support Agent"
                    onClose={() => setAssignModalOpen(false)}
                    actionButton={{
                        label: isSubmittingAction ? "Assigning..." : "Assign Agent",
                        onClick: handleAdminAssign,
                        disabled: !selectedAgentId || isSubmittingAction,
                    }}
                >
                    <div className="w-[400px] max-w-full pb-4 font-montserrat">
                        <label className="block mb-2 font-medium text-gray-700 text-sm">Select Support Representative</label>
                        <select
                            className="w-full h-[48px] rounded-[18px] bg-white border border-[#E0E0E0] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#DB2727]/30 cursor-pointer"
                            onChange={(e) => setSelectedAgentId(e.target.value)}
                            value={selectedAgentId}
                        >
                            <option value="">Choose L1 or L2 Agent...</option>
                            {agents.map((agent: any) => (
                                <option key={agent.id} value={agent.id}>
                                    {agent.name} ({agent.role})
                                </option>
                            ))}
                        </select>
                    </div>
                </Modal>
            )}
        </div>
    );
}
