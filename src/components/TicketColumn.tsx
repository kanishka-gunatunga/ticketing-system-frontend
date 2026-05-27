"use client";

import React from "react";
import { Ticket } from "../../hooks/useLeads";
import TicketCard from "./TicketCard";

interface TicketColumnProps {
    title: string;
    tickets: Ticket[];
    draggable?: boolean;
    onViewDetails?: (id: number) => void;
    onAssign?: (id: number) => void;
}

export const TicketColumn: React.FC<TicketColumnProps> = ({
    title,
    tickets,
    onViewDetails,
    onAssign
}) => {
    // Format header label and colors based on column title
    const getColumnStyle = (colTitle: string) => {
        switch (colTitle) {
            case "New":
                return {
                    label: "Unassigned Queue",
                    bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
                    indicator: "bg-emerald-500"
                };
            case "Assigned L1":
            case "Assigned L2":
                return {
                    label: "In Progress",
                    bg: "bg-blue-50 text-blue-800 border-blue-200",
                    indicator: "bg-blue-500"
                };
            case "Escalated":
                return {
                    label: "Escalated L2 Queue",
                    bg: "bg-amber-50 text-amber-800 border-amber-200",
                    indicator: "bg-amber-500"
                };
            case "Resolved":
                return {
                    label: "Resolved",
                    bg: "bg-gray-100 text-gray-800 border-gray-250",
                    indicator: "bg-gray-500"
                };
            default:
                return {
                    label: colTitle,
                    bg: "bg-slate-50 text-slate-800 border-slate-200",
                    indicator: "bg-slate-500"
                };
        }
    };

    const cStyle = getColumnStyle(title);

    return (
        <div className="flex flex-col w-full bg-gray-100/50 rounded-2xl border border-gray-200/50 p-4 h-[calc(100vh-280px)] overflow-hidden">
            {/* Column Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cStyle.indicator}`}></span>
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                        {cStyle.label}
                    </span>
                </div>
                <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-500 text-xs font-bold rounded-lg shadow-sm">
                    {tickets.length}
                </span>
            </div>

            {/* Cards List */}
            <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar flex-1 pr-1 pb-4">
                {tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 text-center h-48 select-none">
                        <span className="text-xs font-semibold text-gray-400">Empty Queue</span>
                    </div>
                ) : (
                    tickets.map((t) => (
                        <TicketCard
                            key={t.id}
                            {...t}
                            onViewDetails={onViewDetails}
                            onAssign={onAssign}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
export default TicketColumn;
