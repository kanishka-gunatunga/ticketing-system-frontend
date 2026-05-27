import { useState, useCallback } from 'react';
import { ToastType } from '../src/components/Toast';

export function useToast() {
    const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
        message: "",
        type: "info",
        visible: false
    });

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        setToast({ message, type, visible: true });
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, visible: false }));
    }, []);

    return {
        toast,
        showToast,
        hideToast
    };
}
