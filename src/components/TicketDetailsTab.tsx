"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import type { ComplainStatus } from "./FlowBar";
import { useCurrentUser } from "@/utils/auth";

interface Followup {
    id: number;
    activity: string;
    activity_date: string;
    creator?: { name: string };
}

interface Reminder {
    id: number;
    task_title: string;
    task_date: string;
    note?: string;
    creator?: { name: string };
}

interface TicketDetailsTabProps {
    status: ComplainStatus; // Using ComplainStatus as it matches Ticket statuses
    onOpenActivity: () => void;
    onOpenReminder: () => void;
    followups: Followup[];
    reminders: Reminder[];
}

export default function TicketDetailsTab({
    status,
    onOpenActivity,
    onOpenReminder,
    followups,
    reminders
}: TicketDetailsTabProps) {
    const user = useCurrentUser();

    // "Events" tab removed as requested.
    const tabs = ["Follow up", "Reminders"];
    const [activeTab, setActiveTab] = useState(0);

    const isAddDisabled = status === "Completed";

    const formatDate = (isoDate: string) => {
        if (!isoDate) return "N/A";
        return new Date(isoDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="w-full relative">
            {/* Tabs */}
            <div className="flex border-b border-gray-300">
                {tabs.map((tab, index) => (
                    <div
                        key={tab}
                        className={`flex-1 py-4 cursor-pointer text-lg px-3 relative ${activeTab === index
                            ? "font-medium text-[#575757]"
                            : "text-gray-600"
                            }`}
                        onClick={() => setActiveTab(index)}
                    >
                        {tab}
                        {activeTab === index && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#DB2727] rounded-t"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Tab content */}
            <div className="mt-4">
                {activeTab === 0 && (
                    <div className="mt-8 bg-white rounded-[30px]  py-8 px-8 relative h-[300px] border border-gray-100 shadow-sm">
                        <div className="h-full pr-2 flex flex-col">
                            {/* Table header */}
                            <div className="flex font-medium text-[#575757] min-w-[400px] mb-2">
                                <div className="w-1/3 px-2">Activity</div>
                                <div className="w-1/3 px-2">Date</div>
                                <div className="w-1/3 px-2">Created By</div>
                            </div>
                            <hr className="border-gray-200 mb-4" />

                            <div className="overflow-y-auto flex-1 no-scrollbar">
                                {followups.length === 0 ? (
                                    <div className="text-gray-500 italic p-2">No followups available.</div>
                                ) : (
                                    followups.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${idx > 0 ? "mt-3" : ""
                                                } font-medium text-black min-w-[400px] py-2 hover:bg-gray-50 rounded`}
                                        >
                                            <div className="w-1/3 px-2 break-words">{item.activity}</div>
                                            <div className="w-1/3 px-2">{formatDate(item.activity_date)}</div>
                                            <div className="w-1/3 px-2">{item.creator?.name || "System"}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Floating Add button */}
                        {/* {!isAdmin && ( */}
                        <button
                            disabled={isAddDisabled}
                            onClick={onOpenActivity}
                            className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition transform hover:scale-105 active:scale-95 ${isAddDisabled
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#DB2727] hover:bg-red-700"
                                }`}
                        >
                            <FiPlus size={24} />
                        </button>
                        {/* )} */}
                    </div>
                )}

                {activeTab === 1 && (
                    <div className="mt-8 bg-white rounded-[30px] py-8 px-8 relative h-[300px] border border-gray-100 shadow-sm">
                        <div className="h-full pr-2 flex flex-col">
                            {/* Table header */}
                            <div className="flex font-medium text-[#575757] min-w-[400px] mb-2">
                                <div className="w-1/4 px-2">Task Title</div>
                                <div className="w-1/4 px-2">Task Date</div>
                                <div className="w-1/4 px-2">Note</div>
                                <div className="w-1/4 px-2">Created By</div>
                            </div>
                            <hr className="border-gray-200 mb-4" />

                            <div className="overflow-y-auto flex-1 no-scrollbar">
                                {reminders.length === 0 ? (
                                    <div className="text-gray-500 italic p-2">No reminders available.</div>
                                ) : (
                                    reminders.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${idx > 0 ? "mt-3" : ""
                                                } font-medium text-black min-w-[400px] py-2 hover:bg-gray-50 rounded`}
                                        >
                                            <div className="w-1/4 px-2 break-words">{item.task_title}</div>
                                            <div className="w-1/4 px-2">{formatDate(item.task_date)}</div>
                                            <div className="w-1/4 px-2 break-words">{item.note}</div>
                                            <div className="w-1/4 px-2">{item.creator?.name || "System"}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Floating Add button */}
                        {/* {!isAdmin && ( */}
                        <button
                            disabled={isAddDisabled}
                            onClick={onOpenReminder}
                            className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition transform hover:scale-105 active:scale-95 ${isAddDisabled
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#DB2727] hover:bg-red-700"
                                }`}
                        >
                            <FiPlus size={24} />
                        </button>
                        {/* )} */}
                    </div>
                )}
            </div>
        </div>
    );
}
