"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { Send, MessageSquare, Lock, Loader2, Paperclip, X, ImageIcon, FileText } from "lucide-react";
import { uploadToBlob } from "@/utils/uploadBlob";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";
const POLL_INTERVAL_MS = 3000;

const ACTIVE_STATUSES = ["Assigned L1", "Assigned L2", "Escalated"];

export interface ChatUser {
    id: number;
    name: string;
    role: string;
}

interface ChatMessage {
    id: number;
    ticket_id: number;
    sender_id: number;
    message: string;
    attachment_url?: string | null;
    created_at: string;
    sender?: ChatUser;
}

interface TicketChatProps {
    ticketId: number;
    ticketStatus: string;
    currentUser: ChatUser;
    assignedToId?: number;
    companyUserId?: number;
}

/** Safely parses a date string and falls back gracefully */
function safeDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    const normalized = typeof dateStr === "string" ? dateStr.replace(" ", "T") : dateStr;
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
}

function formatTime(dateStr: string): string {
    const d = safeDate(dateStr);
    if (!d) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string): string {
    const d = safeDate(dateStr);
    if (!d) return "Unknown date";
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function groupByDate(messages: ChatMessage[]): { date: string; items: ChatMessage[] }[] {
    const groups: Record<string, ChatMessage[]> = {};
    for (const msg of messages) {
        const d = safeDate(msg.created_at || (msg as any).createdAt);
        const key = d ? d.toDateString() : "unknown";
        if (!groups[key]) groups[key] = [];
        groups[key].push(msg);
    }
    return Object.entries(groups).map(([, items]) => ({
        date: formatDate(items[0].created_at || (items[0] as any).createdAt),
        items,
    }));
}

export default function TicketChat({
    ticketId,
    ticketStatus,
    currentUser,
    assignedToId,
    companyUserId,
}: TicketChatProps) {
    const isActive = ACTIVE_STATUSES.includes(ticketStatus);

    const canChat =
        isActive &&
        (currentUser.id === companyUserId || currentUser.id === assignedToId);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);

    // Attachment state for chat
    const [pendingImage, setPendingImage] = useState<{ file: File; preview: string; url?: string; uploading: boolean } | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await axios.get<ChatMessage[]>(
                `${API_BASE}/tickets/${ticketId}/messages`
            );
            setMessages(res.data);
        } catch {
            // silently fail on poll errors
        } finally {
            setIsLoadingInitial(false);
        }
    }, [ticketId]);

    const hasScrolledInitial = useRef(false);

    useEffect(() => {
        if (ticketStatus === "New") {
            setIsLoadingInitial(false);
            return;
        }
        fetchMessages();
        if (isActive) {
            pollingRef.current = setInterval(fetchMessages, POLL_INTERVAL_MS);
        }
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [fetchMessages, isActive, ticketStatus]);

    useEffect(() => {
        if (messages.length > 0 && !hasScrolledInitial.current) {
            bottomRef.current?.scrollIntoView({ behavior: "auto" });
            hasScrolledInitial.current = true;
        }
    }, [messages]);

    // Handle image selection for chat
    const handleImageSelect = async (file: File) => {
        const preview = URL.createObjectURL(file);
        setPendingImage({ file, preview, uploading: true });
        setTimeout(() => {
            inputRef.current?.focus();
        }, 50);
        try {
            const url = await uploadToBlob(file);
            setPendingImage(prev => prev ? { ...prev, url, uploading: false } : null);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        } catch {
            setPendingImage(null);
            URL.revokeObjectURL(preview);
        }
    };

    const clearPendingImage = () => {
        if (pendingImage) URL.revokeObjectURL(pendingImage.preview);
        setPendingImage(null);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 50);
    };

    const handleSend = async () => {
        const trimmed = inputText.trim();
        const hasContent = trimmed || (pendingImage && pendingImage.url);
        if (!hasContent || isSending || !canChat) return;
        if (pendingImage?.uploading) return;

        setIsSending(true);
        try {
            await axios.post(`${API_BASE}/tickets/${ticketId}/messages`, {
                senderId: currentUser.id,
                message: trimmed || "",
                attachment_url: pendingImage?.url || null,
            });
            setInputText("");
            clearPendingImage();
            await fetchMessages();
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            inputRef.current?.focus();
        } catch (err) {
            console.error("Failed to send message:", err);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const grouped = groupByDate(messages);

    // -- Disabled state --
    if (ticketStatus === "New") {
        return (
            <section className="ticket-chat-section">
                <div className="ticket-chat-header">
                    <div className="ticket-chat-header-left">
                        <div className="ticket-chat-icon">
                            <MessageSquare size={18} />
                        </div>
                        <div>
                            <h3 className="ticket-chat-title">Ticket Chat</h3>
                            <p className="ticket-chat-subtitle">Direct conversation channel</p>
                        </div>
                    </div>
                    <span className="ticket-chat-badge ticket-chat-badge--disabled">
                        {ticketStatus}
                    </span>
                </div>

                <div className="ticket-chat-disabled-body">
                    <div className="ticket-chat-lock-icon">
                        <Lock size={28} />
                    </div>
                    <p className="ticket-chat-lock-title">Chat Unavailable</p>
                    <p className="ticket-chat-lock-desc">
                        Chat is only available for active tickets. This ticket is currently{" "}
                        <strong>{ticketStatus}</strong>. Once assigned to an agent, the chat
                        channel will open automatically.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="ticket-chat-section">
            {/* Header */}
            <div className="ticket-chat-header">
                <div className="ticket-chat-header-left">
                    <div className="ticket-chat-icon">
                        <MessageSquare size={18} />
                    </div>
                    <div>
                        <h3 className="ticket-chat-title">Ticket Chat</h3>
                        <p className="ticket-chat-subtitle">
                            {!isActive
                                ? "Conversation history (Read-only)"
                                : assignedToId
                                    ? "Live channel between you and the assigned agent"
                                    : "Waiting for agent assignment"}
                        </p>
                    </div>
                </div>
                {isActive ? (
                    <span className="ticket-chat-badge ticket-chat-badge--active">
                        <span className="ticket-chat-pulse" />
                        Live
                    </span>
                ) : (
                    <span className="ticket-chat-badge ticket-chat-badge--disabled">
                        {ticketStatus}
                    </span>
                )}
            </div>

            {/* Messages area */}
            <div className="ticket-chat-messages">
                {isLoadingInitial ? (
                    <div className="ticket-chat-loading">
                        <Loader2 size={24} className="ticket-chat-spinner" />
                        <span>Loading conversation...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="ticket-chat-empty">
                        <MessageSquare size={36} className="ticket-chat-empty-icon" />
                        <p className="ticket-chat-empty-title">No messages yet</p>
                        <p className="ticket-chat-empty-desc">
                            {canChat
                                ? "Start the conversation by sending a message below."
                                : "The conversation between the ticket owner and agent will appear here."}
                        </p>
                    </div>
                ) : (
                    grouped.map((group) => (
                        <div key={group.date}>
                            <div className="ticket-chat-date-divider">
                                <span className="ticket-chat-date-label">{group.date}</span>
                            </div>

                            {group.items.map((msg) => {
                                const isMine = msg.sender_id === currentUser.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`ticket-chat-message-row ${isMine ? "ticket-chat-message-row--mine" : ""}`}
                                    >
                                        <div className={`ticket-chat-bubble-wrap ${isMine ? "ticket-chat-bubble-wrap--mine" : ""}`}>
                                            {!isMine && (
                                                <span className="ticket-chat-sender-name">
                                                    {msg.sender?.name}{" "}
                                                    <span className="ticket-chat-sender-role">
                                                        ({msg.sender?.role})
                                                    </span>
                                                </span>
                                            )}

                                            {/* Attachment */}
                                            {msg.attachment_url && (() => {
                                                const cleanUrl = msg.attachment_url.split('?')[0];
                                                const isPdf = /\.pdf$/i.test(cleanUrl);

                                                if (isPdf) {
                                                    const filename = (() => {
                                                        try {
                                                            const parts = msg.attachment_url.split('/');
                                                            const lastPart = parts[parts.length - 1];
                                                            return decodeURIComponent(lastPart.split('?')[0]);
                                                        } catch {
                                                            return "Document.pdf";
                                                        }
                                                    })();
                                                    return (
                                                        <a
                                                            href={msg.attachment_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className={`ticket-chat-pdf-wrap ${isMine ? "ticket-chat-pdf-wrap--mine" : ""}`}
                                                            title={filename}
                                                        >
                                                            <FileText size={28} className="text-red-500 flex-shrink-0" />
                                                            <div className="ticket-chat-pdf-info">
                                                                <span className="ticket-chat-pdf-filename">{filename}</span>
                                                                <span className="ticket-chat-pdf-label">PDF Document</span>
                                                            </div>
                                                        </a>
                                                    );
                                                }

                                                return (
                                                    <a
                                                        href={msg.attachment_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={`ticket-chat-img-wrap ${isMine ? "ticket-chat-img-wrap--mine" : ""}`}
                                                    >
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={msg.attachment_url}
                                                            alt="attachment"
                                                            className="ticket-chat-img"
                                                        />
                                                    </a>
                                                );
                                            })()}

                                            {/* Text message */}
                                            {msg.message && (
                                                <div className={`ticket-chat-bubble ${isMine ? "ticket-chat-bubble--mine" : "ticket-chat-bubble--other"}`}>
                                                    {msg.message}
                                                </div>
                                            )}

                                            <span className="ticket-chat-time">
                                                {formatTime(msg.created_at || (msg as any).createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="ticket-chat-input-area">
                {canChat ? (
                    <>
                        {/* Pending attachment preview */}
                        {pendingImage && (
                            <div className="ticket-chat-img-preview-bar">
                                <div className="ticket-chat-img-preview-item">
                                    {pendingImage.file.type === "application/pdf" || pendingImage.file.name.toLowerCase().endsWith(".pdf") ? (
                                        <div className="ticket-chat-pdf-preview-thumb">
                                            <FileText size={24} className="text-red-500" />
                                            <span className="ticket-chat-pdf-preview-text">PDF</span>
                                        </div>
                                    ) : (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={pendingImage.preview} alt="preview" className="ticket-chat-img-preview-thumb" />
                                    )}
                                    {pendingImage.uploading && (
                                        <div className="ticket-chat-img-preview-overlay">
                                            <Loader2 size={16} className="ticket-chat-spinner" />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        className="ticket-chat-img-preview-remove"
                                        onClick={clearPendingImage}
                                        disabled={pendingImage.uploading}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="ticket-chat-input-bar">
                            {/* Attachment button */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleImageSelect(f);
                                    e.target.value = "";
                                }}
                            />
                            <button
                                type="button"
                                className="ticket-chat-attach-btn"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!!pendingImage || isSending}
                                title="Attach image or PDF"
                            >
                                <Paperclip size={18} />
                            </button>

                            <textarea
                                ref={inputRef}
                                className="ticket-chat-input"
                                placeholder="Type your message… (Enter to send)"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                disabled={isSending}
                            />
                            <button
                                className="ticket-chat-send-btn"
                                onClick={handleSend}
                                disabled={isSending || (!inputText.trim() && !pendingImage?.url)}
                                aria-label="Send message"
                            >
                                {isSending ? (
                                    <Loader2 size={18} className="ticket-chat-spinner" />
                                ) : (
                                    <Send size={18} />
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="ticket-chat-input-bar">
                        <div className="ticket-chat-readonly-notice">
                            <Lock size={14} />
                            <span>
                                {ticketStatus === "Resolved" || ticketStatus === "Closed"
                                    ? `This ticket is currently ${ticketStatus}. Chat is read-only.`
                                    : "You can view this conversation but cannot send messages."}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .ticket-chat-section {
                    position: relative;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 45px;
                    border: 1px solid rgba(224, 224, 224, 0.8);
                    overflow: hidden;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
                    backdrop-filter: blur(12px);
                }

                .ticket-chat-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 22px 36px 18px 36px;
                    border-bottom: 1px solid rgba(224, 224, 224, 0.5);
                    background: rgba(255, 255, 255, 0.4);
                }
                .ticket-chat-header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .ticket-chat-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #db2727, #ff6b6b);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px rgba(219, 39, 39, 0.3);
                }
                .ticket-chat-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin: 0 0 2px 0;
                }
                .ticket-chat-subtitle {
                    font-size: 12px;
                    color: #888;
                    margin: 0;
                }
                .ticket-chat-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 14px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .ticket-chat-badge--active {
                    background: rgba(16, 185, 129, 0.1);
                    color: #059669;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }
                .ticket-chat-badge--disabled {
                    background: rgba(100, 100, 100, 0.08);
                    color: #666;
                    border: 1px solid rgba(100, 100, 100, 0.12);
                }
                .ticket-chat-pulse {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #10b981;
                    animation: pulse 2s ease-in-out infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }

                .ticket-chat-disabled-body {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 56px 36px;
                    text-align: center;
                    gap: 10px;
                }
                .ticket-chat-lock-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: rgba(100, 100, 100, 0.06);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #aaa;
                    margin-bottom: 6px;
                }
                .ticket-chat-lock-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #555;
                    margin: 0;
                }
                .ticket-chat-lock-desc {
                    font-size: 13px;
                    color: #888;
                    max-width: 440px;
                    line-height: 1.6;
                    margin: 0;
                }

                .ticket-chat-messages {
                    min-height: 340px;
                    max-height: 460px;
                    overflow-y: auto;
                    padding: 24px 36px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(219, 39, 39, 0.15) transparent;
                }
                .ticket-chat-messages::-webkit-scrollbar { width: 4px; }
                .ticket-chat-messages::-webkit-scrollbar-track { background: transparent; }
                .ticket-chat-messages::-webkit-scrollbar-thumb {
                    background: rgba(219, 39, 39, 0.2);
                    border-radius: 99px;
                }

                .ticket-chat-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    flex: 1;
                    padding: 60px 0;
                    color: #999;
                    font-size: 13px;
                }
                .ticket-chat-spinner {
                    animation: spin 1s linear infinite;
                    color: #db2727;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .ticket-chat-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    flex: 1;
                    padding: 60px 0;
                    text-align: center;
                }
                .ticket-chat-empty-icon { color: #ddd; margin-bottom: 4px; }
                .ticket-chat-empty-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: #888;
                    margin: 0;
                }
                .ticket-chat-empty-desc {
                    font-size: 12px;
                    color: #aaa;
                    max-width: 320px;
                    line-height: 1.5;
                    margin: 0;
                }

                .ticket-chat-date-divider {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 14px 0;
                }
                .ticket-chat-date-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: #aaa;
                    background: rgba(255, 255, 255, 0.7);
                    padding: 4px 14px;
                    border-radius: 20px;
                    border: 1px solid rgba(220, 220, 220, 0.5);
                }

                .ticket-chat-message-row {
                    display: flex;
                    align-items: flex-end;
                    gap: 10px;
                    margin-bottom: 8px;
                }
                .ticket-chat-message-row--mine {
                    flex-direction: row-reverse;
                }

                .ticket-chat-bubble-wrap {
                    display: flex;
                    flex-direction: column;
                    max-width: 62%;
                    gap: 3px;
                }
                .ticket-chat-bubble-wrap--mine {
                    align-items: flex-end;
                }

                .ticket-chat-sender-name {
                    font-size: 11px;
                    font-weight: 600;
                    color: #777;
                    padding: 0 6px;
                }
                .ticket-chat-sender-role {
                    font-weight: 400;
                    color: #aaa;
                }

                /* Image attachment in messages */
                .ticket-chat-img-wrap {
                    display: block;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid rgba(220, 220, 220, 0.6);
                    max-width: 220px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    transition: transform 0.15s, box-shadow 0.15s;
                }
                .ticket-chat-img-wrap--mine {
                    border-color: rgba(219, 39, 39, 0.25);
                    box-shadow: 0 2px 10px rgba(219, 39, 39, 0.12);
                }
                .ticket-chat-img-wrap:hover {
                    transform: scale(1.02);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.14);
                }
                .ticket-chat-img {
                    width: 100%;
                    height: auto;
                    display: block;
                    max-height: 220px;
                    object-fit: cover;
                }

                .ticket-chat-bubble {
                    padding: 10px 16px;
                    border-radius: 18px;
                    font-size: 13.5px;
                    line-height: 1.55;
                    word-break: break-word;
                    white-space: pre-wrap;
                }
                .ticket-chat-bubble--other {
                    background: rgba(255, 255, 255, 0.85);
                    color: #2d2d2d;
                    border: 1px solid rgba(220, 220, 220, 0.6);
                    border-bottom-left-radius: 4px;
                    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
                }
                .ticket-chat-bubble--mine {
                    background: linear-gradient(135deg, #db2727, #e84444);
                    color: #fff;
                    border-bottom-right-radius: 4px;
                    box-shadow: 0 4px 12px rgba(219, 39, 39, 0.25);
                }

                .ticket-chat-time {
                    font-size: 10px;
                    color: #bbb;
                    padding: 0 6px;
                }

                /* Input area wrapper */
                .ticket-chat-input-area {
                    border-top: 1px solid rgba(224, 224, 224, 0.5);
                    background: rgba(255, 255, 255, 0.5);
                }

                /* Image preview bar */
                .ticket-chat-img-preview-bar {
                    padding: 10px 28px 0 28px;
                    display: flex;
                    gap: 8px;
                }
                .ticket-chat-img-preview-item {
                    position: relative;
                    width: 72px;
                    height: 72px;
                    border-radius: 14px;
                    overflow: hidden;
                    border: 1px solid rgba(219, 39, 39, 0.2);
                    flex-shrink: 0;
                }
                .ticket-chat-img-preview-thumb {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .ticket-chat-img-preview-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .ticket-chat-img-preview-remove {
                    position: absolute;
                    top: 3px;
                    right: 3px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #db2727;
                    color: #fff;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }

                .ticket-chat-input-bar {
                    display: flex;
                    align-items: flex-end;
                    gap: 10px;
                    padding: 14px 28px 22px 28px;
                }

                /* Attach button */
                .ticket-chat-attach-btn {
                    width: 46px;
                    height: 46px;
                    border-radius: 50%;
                    border: 1.5px solid rgba(219, 39, 39, 0.2);
                    background: rgba(255, 255, 255, 0.8);
                    color: #db2727;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: background 0.15s, border-color 0.15s;
                }
                .ticket-chat-attach-btn:hover:not(:disabled) {
                    background: rgba(219, 39, 39, 0.06);
                    border-color: rgba(219, 39, 39, 0.45);
                }
                .ticket-chat-attach-btn:disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                }

                .ticket-chat-input {
                    flex: 1;
                    resize: none;
                    border: 1.5px solid rgba(219, 39, 39, 0.15);
                    border-radius: 24px;
                    padding: 12px 18px;
                    font-size: 13.5px;
                    font-family: inherit;
                    color: #2d2d2d;
                    background: rgba(255, 255, 255, 0.9);
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    max-height: 120px;
                    overflow-y: auto;
                    line-height: 1.5;
                }
                .ticket-chat-input::placeholder { color: #b0b0b0; }
                .ticket-chat-input:focus {
                    border-color: rgba(219, 39, 39, 0.45);
                    box-shadow: 0 0 0 3px rgba(219, 39, 39, 0.08);
                }
                .ticket-chat-input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .ticket-chat-send-btn {
                    width: 46px;
                    height: 46px;
                    border-radius: 50%;
                    border: none;
                    background: linear-gradient(135deg, #db2727, #e84444);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s;
                    box-shadow: 0 4px 14px rgba(219, 39, 39, 0.35);
                }
                .ticket-chat-send-btn:hover:not(:disabled) {
                    transform: scale(1.07);
                    box-shadow: 0 6px 18px rgba(219, 39, 39, 0.45);
                }
                .ticket-chat-send-btn:active:not(:disabled) {
                    transform: scale(0.95);
                }
                .ticket-chat-send-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .ticket-chat-readonly-notice {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #aaa;
                    font-size: 12.5px;
                    font-style: italic;
                    padding: 10px 14px;
                    background: rgba(240, 240, 240, 0.5);
                    border-radius: 20px;
                    width: 100%;
                    justify-content: center;
                }

                .ticket-chat-pdf-preview-thumb {
                    width: 100%;
                    height: 100%;
                    background: #fdf2f2;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                }
                .ticket-chat-pdf-preview-text {
                    font-size: 9px;
                    font-weight: 700;
                    color: #dc2626;
                    margin-top: 2px;
                    text-transform: uppercase;
                }
                .ticket-chat-pdf-wrap {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 16px;
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid rgba(220, 220, 220, 0.6);
                    max-width: 280px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                    transition: transform 0.15s, box-shadow 0.15s;
                    text-decoration: none;
                }
                .ticket-chat-pdf-wrap--mine {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.25);
                    color: #fff;
                }
                .ticket-chat-pdf-wrap:hover {
                    transform: scale(1.02);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }
                .ticket-chat-pdf-info {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }
                .ticket-chat-pdf-filename {
                    font-size: 13px;
                    font-weight: 600;
                    color: #2d2d2d;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .ticket-chat-pdf-label {
                    font-size: 10px;
                    font-weight: 500;
                    color: #888;
                }

            `}</style>
        </section>
    );
}
