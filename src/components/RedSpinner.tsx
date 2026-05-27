"use client";

import React from "react";

const RedSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative w-12 h-12">
                {/* Outter Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-pulse"></div>
                {/* Spinning Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
            <span className="text-sm font-semibold tracking-wide text-red-600 animate-pulse">
                Loading...
            </span>
        </div>
    );
};

export default RedSpinner;
