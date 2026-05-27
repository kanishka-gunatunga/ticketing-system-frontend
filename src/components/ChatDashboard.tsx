"use client"
import React, { useState, useEffect, useRef } from "react";
import { useAgentChat } from "@/hooks/useChat";
import Image from "next/image";
import { useCurrentUser } from "@/utils/auth";
import { ChatService } from "@/services/chatService";


import { useWidget } from "@/context/WidgetContext";

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path
            d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
    </svg>
);

const AttachIcon = () => (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
);
const UserIcon = () => (
    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);
const DoubleCheck = () => (
    <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-red-500" viewBox="0 0 16 16">
        <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z" />
    </svg>
);


const ChatTimer = ({ startTime }: { startTime: string }) => {
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        // Calculate initial difference
        const start = new Date(startTime).getTime();

        const updateTimer = () => {
            const now = Date.now();
            const diff = Math.floor((now - start) / 1000); // Difference in seconds
            setDuration(diff > 0 ? diff : 0);
        };

        updateTimer(); // Run immediately
        const interval = setInterval(updateTimer, 1000); // Update every second

        return () => clearInterval(interval);
    }, [startTime]);

    // Format seconds into MM:SS or HH:MM:SS
    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="text-gray-600" viewBox="0 0 16 16">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
            </svg>
            <span className="text-xs font-mono font-medium text-gray-700 min-w-[40px] text-center">
                {formatTime(duration)}
            </span>
        </div>
    );
};



const ImageLightbox = ({ src, onClose }: { src: string, onClose: () => void }) => {
    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center p-4 animate-fadeIn">
            <button onClick={onClose}
                className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition">
                <CloseIcon />
            </button>
            <img src={src} alt="Full Preview" className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl" />
            <a
                href={src}
                download
                target="_blank"
                className="mt-4 px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition"
            >
                Download Original
            </a>
        </div>
    );
};

const ChatMessageContent = ({ msg, onImageClick }: { msg: any, onImageClick: (url: string) => void }) => {
    // Fallback for old messages or flat structure if any, but prioritize nested 'attachment' object
    const attachment = msg.attachment || {};
    const { url, type, name } = attachment;

    // Check old fields if new ones missing (backward compatibility)
    const attachmentUrl = url || msg.attachment_url;
    const attachmentType = type || msg.attachment_type;
    const fileName = name || msg.file_name;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
    const fullUrl = attachmentUrl ? (attachmentUrl.startsWith('http') ? attachmentUrl : `${API_URL}${attachmentUrl}`) : null;

    return (
        <div className="flex flex-col gap-1">
            {attachmentType === 'image' && fullUrl && (
                <div className="mb-1 mt-1 relative w-full max-w-[250px] rounded-lg overflow-hidden border border-gray-200 group">
                    <img
                        src={fullUrl}
                        alt="attachment"
                        className="w-full h-auto object-cover cursor-zoom-in hover:opacity-95 transition"
                        loading="lazy"
                        onClick={() => onImageClick(fullUrl)}
                    />
                </div>
            )}

            {attachmentType === 'document' && fullUrl && (
                <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white/10 border border-black/5 rounded-lg hover:bg-black/5 transition mb-1 no-underline group"
                >
                    <div className="p-2 bg-white rounded-full shadow-sm text-red-500 group-hover:scale-110 transition">
                        <DocumentIcon />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-medium truncate max-w-[180px] text-gray-700">{fileName || "Document"}</span>
                        <span className="text-[9px] text-gray-500 uppercase font-semibold">Click to download</span>
                    </div>
                </a>
            )}

            {msg.message && (
                <div className="whitespace-pre-wrap word-break-normal overflow-wrap-anywhere">
                    {msg.message}
                </div>
            )}
        </div>
    );
};


interface ChatDashboardProps {
    isWidget?: boolean;
}

const ChatDashboard: React.FC<ChatDashboardProps> = ({ isWidget = false }) => {

    const user = useCurrentUser();

    const agentId = user ? Number((user as any).id) : undefined;

    const {
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
    } = useAgentChat(agentId);

    const [inputText, setInputText] = useState("");

    const [acceptingChatId, setAcceptingChatId] = useState<string | null>(null);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const [channelFilter, setChannelFilter] = useState<string>("All");
    const { isAgentDashboardOpen, setAgentDashboardOpen, selectionResetTrigger } = useWidget();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (selectionResetTrigger > 0) {
            selectChat(null);
        }
    }, [selectionResetTrigger]);

    useEffect(() => {
        // Only clear accepting state if the chat is successfully added to assigned
        // and removed from queue, or if the queue fetch confirms it's gone.
        if (acceptingChatId) {
            const isStillInQueue = queue.some(c => c.chat_id === acceptingChatId);
            const isNowAssigned = assigned.some(c => c.chat_id === acceptingChatId);
            if (!isStillInQueue || isNowAssigned) {
                setAcceptingChatId(null);
            }
        }
    }, [queue, assigned]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isCustomerTyping]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        sendTyping();
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            sendStopTyping();
        }, 1000);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChatId || !inputText.trim()) return;
        sendMessage(inputText);
        setInputText("");
        sendStopTyping();
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedChatId) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large. Max size is 5MB.");
            return;
        }

        setIsUploading(true);
        try {
            const data = await ChatService.uploadFile(file);
            const type = file.type.startsWith("image/") ? "image" : "document";
            sendMessage("", {
                url: data.url,
                type: type,
                name: data.filename
            });

        } catch (error) {
            console.error("Agent Upload Error:", error);
            alert("Failed to upload file.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const currentActiveChat = assigned.find(c => c.chat_id === selectedChatId);

    const filteredQueue = queue.filter(chat => {
        // Defensive filtering: Ensure we don't show chats that are already assigned
        // (prevents stale queue fetches from showing accepted chats)
        if (assigned.some(a => a.chat_id === chat.chat_id)) return false;

        if (channelFilter === "All") return true;
        if (channelFilter === "Messenger") return chat.channel === "Facebook";
        return chat.channel === channelFilter;
    });

    const filteredAssigned = assigned.filter(chat => {
        if (channelFilter === "All") return true;
        if (channelFilter === "Messenger") return chat.channel === "Facebook";
        return chat.channel === channelFilter;
    });

    if (!agentId) {
        return (
            <div className={isWidget ? "h-full w-full flex items-center justify-center bg-gray-50" : "flex items-center justify-center min-h-screen w-full bg-[#e0e0e0] p-6"}>
                Loading Agent Dashboard...
            </div>
        )
    }

    return (
        <div className={isWidget ? "flex flex-col w-full h-full bg-white overflow-hidden" : "flex items-center justify-center min-h-screen w-full bg-[#e0e0e0] p-6 pt-28 pb-20 md:p-24 md:pt-32"}>
            {lightboxUrl && <ImageLightbox src={lightboxUrl} onClose={() => setLightboxUrl(null)} />}

            {/* --- Main Card Container --- */}
            <div
                className={isWidget
                    ? "flex flex-1 h-full overflow-hidden"
                    : "flex w-full md:max-w-6xl h-[calc(100vh-3rem)] md:h-[75vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
                }
            >
                {/* --- LEFT SIDEBAR (Lists) --- */}
                <aside className={`flex-col border-r border-gray-200 bg-white 
                    ${isWidget ? (selectedChatId ? 'hidden' : 'flex w-full') : (selectedChatId ? 'hidden md:flex w-full md:w-[320px]' : 'flex w-full md:w-[320px]')}
                `}>

                    {/* Header */}
                    <div className="h-16 bg-[#F0F2F5] px-4 flex items-center gap-3 border-b border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden border border-gray-300 flex-shrink-0">
                            <Image src="/agent.png" width={32} height={32} alt="Agent"
                                className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-semibold text-gray-700 text-[13px] truncate">Agent Dashboard</span>
                        </div>
                        <select
                            value={channelFilter}
                            onChange={(e) => setChannelFilter(e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 text-[10px] rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-red-500 transition-all cursor-pointer"
                        >
                            <option value="All">All Channels</option>
                            <option value="Web">Web</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Messenger">Messenger</option>
                            <option value="Instagram">Instagram</option>
                        </select>
                    </div>

                    {/* Queue Section */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* Queue List */}
                        {filteredQueue.length > 0 && (
                            <div className="mb-2">
                                <div
                                    className="bg-[#DB2727] text-white text-[11px] font-bold px-4 py-2 uppercase tracking-wide sticky top-0 z-10">
                                    Waiting Queue ({filteredQueue.length})
                                </div>
                                {filteredQueue.map((chat) => (
                                    <div key={chat.chat_id}
                                        className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition cursor-default">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    <UserIcon />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">Guest User</p>
                                                    <p className="text-[10px] text-gray-500">{chat.chat_id.substring(0, 8)}...</p>
                                                </div>
                                            </div>
                                            <button
                                                disabled={acceptingChatId === chat.chat_id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAcceptingChatId(chat.chat_id);
                                                    acceptChat(chat.chat_id);
                                                }}
                                                className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-sm transition"
                                            >
                                                {acceptingChatId === chat.chat_id ? 'Accepting...' : 'Accept'}
                                            </button>
                                        </div>
                                        <div
                                            className="mt-1 flex justify-between items-center text-[10px] text-gray-400">
                                            <span>{new Date(chat.last_message_at).toLocaleTimeString([], { timeStyle: 'short' })}</span>
                                            <span className="bg-gray-100 px-2 rounded">{chat.channel || 'Web'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Assigned Chats List */}
                        <div>
                            <div
                                className="bg-gray-100 text-gray-500 text-[11px] font-bold px-4 py-2 uppercase tracking-wide sticky top-0 z-10">
                                My Active Chats ({filteredAssigned.length})
                            </div>
                            {filteredAssigned.map((chat) => (
                                <div
                                    key={chat.chat_id}
                                    onClick={() => selectChat(chat.chat_id)}
                                    className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition relative
                                        ${selectedChatId === chat.chat_id ? 'bg-[#F0F2F5]' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3 overflow-hidden">
                                            <div
                                                className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                                                <UserIcon />
                                            </div>
                                            <div className="flex flex-col justify-center min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900 truncate">{chat.chat_id}</h4>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-gray-500 truncate">
                                                        View conversation
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span
                                                className={`text-[10px] ${chat.unread_count > 0 ? 'text-[#DB2727] font-bold' : 'text-gray-400'}`}>
                                                {new Date(chat.last_message_at).toLocaleTimeString([], { timeStyle: 'short' })}
                                            </span>
                                            {chat.unread_count > 0 && (
                                                <span
                                                    className="bg-[#DB2727] text-white text-[10px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full">
                                                    {chat.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <main className={`flex-1 flex-col relative bg-[#EFE7DD] bg-opacity-40 
                    ${isWidget ? (selectedChatId ? 'flex' : 'hidden') : (selectedChatId ? 'flex' : 'hidden md:flex')}
                `}>
                    <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                        style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}></div>

                    {selectedChatId ? (
                        <>
                            {/* Chat Header */}
                            <header
                                className={`h-16 bg-[#F0F2F5] px-4 md:px-6 flex items-center justify-between border-b border-gray-300 z-10 ${isWidget ? 'pr-16 md:pr-16' : ''}`}>
                                <div className="flex items-center gap-3">
                                    {/* Back Button for Mobile/Widget */}
                                    <button
                                        onClick={() => selectChat(null)}
                                        className={`${(isWidget) ? 'flex' : 'md:hidden flex'} p-2 -ml-2 text-gray-600 hover:bg-gray-200 rounded-full`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                                        </svg>
                                    </button>

                                    <div
                                        className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-white">
                                        <UserIcon />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-800 text-sm">Guest Customer</h3>
                                            {currentActiveChat?.channel && (
                                                <span className="bg-white text-[9px] text-gray-600 px-2 py-0.5 rounded uppercase font-bold border border-gray-300 shadow-sm">
                                                    {currentActiveChat.channel}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 hidden md:block">{selectedChatId}</p>
                                        <p className="text-[10px] text-gray-500 md:hidden">{selectedChatId!.substring(0, 8)}...</p>
                                    </div>
                                </div>

                                {/* {currentActiveChat && (
                                    <ChatTimer startTime={currentActiveChat.updatedAt || currentActiveChat.last_message_at} />
                                )} */}

                                {/* <button
                                    onClick={() => closeChat(selectedChatId!)}
                                    className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded border border-transparent hover:border-red-200 text-xs font-medium transition"
                                >
                                    End Chat
                                </button> */}
                            </header>

                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 z-10 custom-scrollbar">
                                {messages.map((msg: any, index: number) => {

                                    if (index > 0 && messages[index - 1].id === msg.id) return null;

                                    const isOutbound = msg.sender === "agent" || msg.sender === "bot";
                                    const isSystem = msg.sender === "system";

                                    if (isSystem) {
                                        return (
                                            <div key={msg.id} className="flex justify-center w-full my-2">
                                                <div className="bg-gray-200/70 border border-gray-300 px-3 py-1 rounded-full flex items-center gap-2">
                                                    <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wide">
                                                        {msg.message}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={msg.id}
                                            className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
                                            <div
                                                className={`
                                                    max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 text-sm shadow-sm relative
                                                    ${isOutbound ? "bg-[#DB2727] text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none"}
                                                `}
                                                style={{
                                                    wordBreak: "normal",
                                                    overflowWrap: "anywhere",
                                                }}
                                            >

                                                {msg.sender === "bot" && (
                                                    <span className="block text-[10px] font-bold opacity-75 mb-1 text-red-100">
                                                        AI Bot
                                                    </span>
                                                )}

                                                <ChatMessageContent msg={msg} onImageClick={setLightboxUrl} />

                                                <div
                                                    className={`text-[9px] flex items-center justify-end gap-1 ${isOutbound ? "text-red-100" : "text-gray-400"}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { timeStyle: "short" })}
                                                    {isOutbound && <DoubleCheck />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {isCustomerTyping && (
                                    <div className="flex justify-start animate-fadeIn">
                                        <div
                                            className="bg-white px-4 py-2.5 rounded-full rounded-tl-none shadow-sm flex space-x-1 items-center">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div
                                                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                            <div
                                                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <footer className="bg-[#F0F2F5] px-4 py-3 z-10">
                                <form onSubmit={handleSend} className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                        accept="image/*,.pdf,.doc,.docx,.txt"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleAttachClick}
                                        disabled={isUploading}
                                        className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500 relative"
                                        title="Attach File"
                                    >
                                        {isUploading ? (
                                            <div
                                                className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                                        ) : (
                                            <AttachIcon />
                                        )}
                                    </button>
                                    <div
                                        className="flex-1 bg-white rounded-lg overflow-hidden flex items-center border border-gray-300 focus-within:ring-1 focus-within:ring-red-500 transition-shadow">
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 outline-none text-gray-700 text-sm"
                                            placeholder="Type a message"
                                            value={inputText}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className={`p-2.5 rounded-full shadow-md transition transform active:scale-95 
                                            ${(inputText.trim() || isUploading) ? 'bg-[#DB2727] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                        disabled={(!inputText.trim() && !isUploading)}
                                    >
                                        <SendIcon />
                                    </button>
                                </form>
                            </footer>
                        </>
                    ) : (
                        <div
                            className="flex-1 flex flex-col items-center justify-center bg-[#F8F9FA] border-b-[6px] border-[#DB2727] z-10">
                            <div className="w-40 h-40 relative mb-4 opacity-60">
                                <Image src="/agent.png" width={98} height={98}
                                    className="grayscale w-full h-full object-contain" alt="Welcome" />
                            </div>
                            <h2 className="text-2xl font-light text-gray-600 mb-2">Agent Workspace</h2>
                            <p className="text-gray-400 text-sm">Select a conversation to start messaging</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ChatDashboard;
