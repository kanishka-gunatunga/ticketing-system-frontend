"use client";

import React, { createContext, useContext } from "react";

interface WidgetContextType {
    isAgentDashboardOpen: boolean;
    setAgentDashboardOpen: (open: boolean) => void;
    selectionResetTrigger: number;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function useWidget() {
    const context = useContext(WidgetContext);
    if (!context) {
        return {
            isAgentDashboardOpen: false,
            setAgentDashboardOpen: () => {},
            selectionResetTrigger: 0
        };
    }
    return context;
}
