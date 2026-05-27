"use client";

import React, { useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
    message: string;
    type: ToastType;
    visible: boolean;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, visible, onClose }) => {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [visible, onClose]);

    if (!visible) return null;

    const bgColor =
        type === "success" ? "bg-green-100 border-green-500" :
            type === "error" ? "bg-red-100 border-red-500" : "bg-blue-100 border-blue-500";

    const textColor =
        type === "success" ? "text-green-800" :
            type === "error" ? "text-red-800" : "text-blue-800";

    const Icon = type === "success" ? CheckCircle : type === "error" ? XCircle : CheckCircle;

    return (
        <div className={`fixed top-24 right-4 z-[99999] flex items-center gap-2 px-4 py-3 rounded shadow-md border ${bgColor}`}>
            <Icon className={`w-5 h-5 ${textColor}`} />
            <span className={`font-medium ${textColor}`}>{message}</span>
            <button onClick={onClose} className={`ml-4 ${textColor} hover:opacity-75`}>
                X
            </button>
        </div>
    );
};

export default Toast;
