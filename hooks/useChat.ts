"use client";

import { useState } from "react";

export interface ChatItem {
    chat_id: string;
    channel: string;
    last_message_at: string;
    unread_count: number;
}

export function useAgentChat(agentId?: number) {
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [queue] = useState<ChatItem[]>([]);
    const [assigned] = useState<ChatItem[]>([]);
    const [messages] = useState<any[]>([]);
    const [isCustomerTyping] = useState<boolean>(false);

    const selectChat = (id: string | null) => {
        setSelectedChatId(id);
    };

    const acceptChat = (id: string) => {};
    const sendMessage = (msg: string, attachment?: any) => {};
    const closeChat = (id: string) => {};
    const sendTyping = () => {};
    const sendStopTyping = () => {};

    return {
        queue,
        assigned,
        selectedChatId,
        selectChat,
        messages,
        acceptChat,
        sendMessage,
        closeChat,
        isCustomerTyping,
        sendTyping,
        sendStopTyping
    };
}
