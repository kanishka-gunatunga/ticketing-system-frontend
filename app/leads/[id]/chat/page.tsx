/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Ticket } from "lucide-react";

import Header from "@/components/Header";
import SideMenu from "@/components/SideMenu";
import RedSpinner from "@/components/RedSpinner";
import TicketChat from "@/components/TicketChat";
import { useCurrentUser } from "@/utils/auth";
import { LeadsService, Ticket as TicketType } from "@/hooks/useLeads";

export default function TicketChatPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params?.id as string;
    const user = useCurrentUser();

    const [ticket, setTicket] = useState<TicketType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTicket = useCallback(async () => {
        if (!ticketId) return;
        try {
            const data = await LeadsService.getTicketDetails(Number(ticketId));
            setTicket(data);
        } catch (err) {
            console.error("Failed to load ticket for chat:", err);
        } finally {
            setIsLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#E6E6E6B2]/70">
                <RedSpinner />
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-screen bg-[#E6E6E6B2]/70 backdrop-blur-md text-gray-900 montserrat pb-16">
            {/* Top nav header */}
            <Header title="Support Sphere Portal" />

            {/* Left side menu — passes ticketId so the chat icon stays highlighted */}
            <SideMenu ticketId={ticketId} />

            <main className="pt-28 px-16 ml-16 max-w-[1440px] mx-auto flex flex-col gap-6">

                {/* Back nav row */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push(`/leads/${ticketId}`)}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#DB2727] transition font-medium cursor-pointer text-sm"
                    >
                        <ArrowLeft size={16} />
                        Back to Ticket
                    </button>

                    {ticket && (
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-gray-200 text-xs font-semibold text-gray-700">
                            <Ticket className="w-3.5 h-3.5 text-[#DB2727]" />
                            {ticket.ticket_number}
                            <span className="ml-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase text-[10px] tracking-wide">
                                {ticket.status}
                            </span>
                        </div>
                    )}
                </div>

                {/* Page heading */}
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Ticket Chat
                    </h2>
                    <p className="text-sm text-gray-500">
                        Direct conversation channel between the ticket owner and assigned support agent.
                    </p>
                </div>

                {/* Chat section */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <RedSpinner />
                    </div>
                ) : ticket ? (
                    <TicketChat
                        ticketId={ticket.id}
                        ticketStatus={ticket.status}
                        currentUser={{ id: user.id, name: user.name, role: user.role }}
                        assignedToId={ticket.assigned_to}
                        companyUserId={ticket.company_user_id}
                    />
                ) : (
                    <div className="bg-white/70 rounded-[30px] p-10 text-center text-gray-500 border border-gray-200">
                        <p className="font-semibold text-lg mb-2">Ticket not found</p>
                        <button
                            onClick={() => router.push("/leads")}
                            className="mt-2 px-6 py-2 bg-[#DB2727] text-white rounded-2xl text-sm font-bold hover:bg-red-700 transition cursor-pointer"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
