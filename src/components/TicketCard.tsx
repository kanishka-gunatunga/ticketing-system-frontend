"use client";

import React from "react";
import { Ticket } from "../../hooks/useLeads";
import { useCurrentUser } from "../../utils/auth";
import { AlertCircle, ArrowUpCircle, Bookmark, Calendar, CheckSquare, ShieldAlert, UserCheck } from "lucide-react";

export interface TicketCardProps extends Ticket {
    onViewDetails?: (id: number) => void;
    onAssign?: (id: number) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
    id,
    ticket_number,
    title,
    product,
    instant_id,
    status,
    priority,
    category,
    requester_name,
    created_at,
    createdAt,
    assignee,
    onViewDetails,
    onAssign
}) => {
    const user = useCurrentUser();

    // Color indicators for priority
    const getPriorityStyle = (p: string) => {
        switch (p) {
            case "Critical":
                return {
                    bg: "bg-red-50 text-red-700 border-red-200",
                    indicator: "bg-red-600",
                    Icon: ShieldAlert
                };
            case "High":
                return {
                    bg: "bg-orange-50 text-orange-700 border-orange-200",
                    indicator: "bg-orange-500",
                    Icon: AlertCircle
                };
            case "Medium":
                return {
                    bg: "bg-purple-50 text-purple-700 border-purple-200",
                    indicator: "bg-purple-500",
                    Icon: ArrowUpCircle
                };
            default:
                return {
                    bg: "bg-blue-50 text-blue-700 border-blue-200",
                    indicator: "bg-blue-500",
                    Icon: Bookmark
                };
        }
    };

    const pStyle = getPriorityStyle(priority);
    const PriorityIcon = pStyle.Icon;

    // Check if user is L1 or L2 agent and can assign themselves
    const canSelfAssign = 
        user && 
        !assignee && 
        (
            (user.role === 'AgentL1' && status === 'New') ||
            (user.role === 'AgentL2' && status === 'Escalated')
        );

    const formattedDate = (() => {
        const rawDate = created_at || createdAt;
        if (!rawDate) return "—";
        // Normalize MySQL-style "YYYY-MM-DD HH:MM:SS" to ISO format browsers can parse
        const normalized = typeof rawDate === "string"
            ? rawDate.replace(" ", "T")
            : rawDate;
        const d = new Date(normalized);
        if (isNaN(d.getTime())) return "—";
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    })();

    return (
        <div className="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-4 relative group">
            {/* Top Row: Ticket Number & Priority Badge */}
            <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 tracking-wider font-mono">
                    {ticket_number}
                </span>
                <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${pStyle.bg}`}>
                    <PriorityIcon className="w-3 h-3" />
                    {priority}
                </span>
            </div>

            {/* Core Info */}
            <div className="flex flex-col gap-1 cursor-pointer" onClick={() => onViewDetails && onViewDetails(id)}>
                <h4 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-red-600 transition">
                    {title}
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                    Product: <span className="font-bold text-gray-700 uppercase">{product}</span> ({instant_id})
                </p>
                <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-md text-[10px] uppercase font-bold tracking-wider">
                        {category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        status === 'New' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250/50' :
                        status === 'Escalated' ? 'bg-amber-50 text-amber-700 border border-amber-250/50' :
                        'bg-blue-50 text-blue-700 border border-blue-250/50'
                    }`}>
                        {status}
                    </span>
                </div>
            </div>

            <hr className="border-gray-100 my-0.5" />

            {/* Bottom Row: Assignee/Requester & Date */}
            <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    {assignee ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-600 truncate" title={`Assigned: ${assignee.name}`}>
                            <UserCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="truncate">{assignee.name}</span>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500 font-semibold truncate" title={`Requester: ${requester_name}`}>
                            Req: {requester_name}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    {formattedDate}
                </div>
            </div>

            {/* Quick Actions */}
            {canSelfAssign && onAssign && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAssign(id);
                    }}
                    className="w-full mt-1.5 py-2 border border-red-200 hover:border-red-600 text-red-600 hover:text-white hover:bg-red-600 text-xs font-bold rounded-xl active:scale-[0.98] transition cursor-pointer"
                >
                    Assign to me
                </button>
            )}
        </div>
    );
};
export default TicketCard;
