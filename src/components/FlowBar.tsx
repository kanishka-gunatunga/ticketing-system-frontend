"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

// Types for each variant
export type SalesStatus = "New" | "Ongoing" | "Won" | "Lost";
export type ComplainStatus =
    | "New"
    | "In Review"
    | "Processing"
    | "Approval"
    | "Completed";

// Generic props interface
interface FlowBarProps<T extends string> {
    variant: "sales" | "complains";
    status: T;
    onStatusChange?: (status: T) => void;
}

export default function FlowBar<T extends string>({
    variant,
    status,
    onStatusChange,
}: FlowBarProps<T>) {
    const stepsMap = {
        sales: ["New", "Ongoing", "WonLost"],
        complains: ["New", "In Review", "Processing", "Approval", "Completed"],
    };

    const steps = stepsMap[variant];

    const [currentStatus, setCurrentStatus] = useState(status);
    const [selectedWonLost, setSelectedWonLost] = useState<"" | "Won" | "Lost">("");

    useEffect(() => {
        setCurrentStatus(status);
    }, [status]);

    const handleDropdownChange = (value: "Won" | "Lost") => {
        if (currentStatus === "Ongoing") {
            setSelectedWonLost(value);
            setCurrentStatus(value as T);
            onStatusChange?.(value as T);
        }
    };

    const getColor = (step: string) => {
        if (variant === "sales") {
            if (step === "New")
                return currentStatus === "New" ? "#DB2727" : "#9ca3af";
            if (step === "Ongoing")
                return currentStatus === "Ongoing" ? "#DB2727" : "#9ca3af";
            if (step === "WonLost")
                return currentStatus === "Won" || currentStatus === "Lost"
                    ? "#DB2727"
                    : "#9ca3af";
        } else {
            // Complains colors
            if (currentStatus === step) {
                switch (step) {
                    case "New": return "#DB2727"; // Red
                    case "In Review": return "#F59E0B"; // Amber
                    case "Processing": return "#3B82F6"; // Blue (Fixed hex)
                    case "Approval": return "#8B5CF6"; // Purple
                    case "Completed": return "#10B981"; // Green
                    default: return "#DB2727";
                }
            }
            return "#9ca3af";
        }
        return "#9ca3af";
    };

    const getSVG = (index: number, total: number) => {
        if (index === 0) return "/flow_bar1.svg";
        if (index === total - 1) return "/flow_bar3.svg";
        return "/flow_bar2.svg";
    };

    const MaskedSVG = ({
        src,
        color,
        variant,
    }: {
        src: string;
        color: string;
        variant: "sales" | "complains";
    }) => {
        // widths based on variant
        const baseClass =
            variant === "sales"
                ? "w-[282px] h-[50px] max-[1250px]:w-[240px] max-[1130px]:w-[210px] max-[1060px]:w-[190px] max-[1000px]:w-[190px]"
                : "w-[170px] h-[50px] max-[1250px]:w-[160px] max-[1130px]:w-[150px] max-[1060px]:w-[130px] max-[1000px]:w-[130px]";

        return (
            <div
                className={baseClass}
                style={{
                    backgroundColor: color,
                    WebkitMaskImage: `url(${src})`,
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskSize: "100% 100%",
                    maskImage: `url(${src})`,
                    maskRepeat: "no-repeat",
                    maskSize: "100% 100%",
                }}
            />
        );
    };

    const currentIndex = steps.indexOf(currentStatus as string);

    return (
        <div className="flex justify-center gap-4 mx-auto max-w-[1000px]">
            {steps.map((step, i) => {
                // For complains: Lock if it's NOT the immediate next step
                // (i.e. prevent going back, prevent staying on same, prevent skipping forward)
                const isLocked = variant === "complains" && i !== currentIndex + 1;

                return (
                    <div
                        key={step}
                        onClick={() => {
                            if (variant !== "sales" && !isLocked && onStatusChange) {
                                setCurrentStatus(step as T);
                                onStatusChange(step as T);
                            }
                        }}
                        className={`relative ${variant !== "sales"
                            ? isLocked
                                ? "cursor-not-allowed opacity-80"
                                : "cursor-pointer"
                            : ""
                            } ${i !== steps.length - 1
                                ? variant === "sales"
                                    ? "-mr-14 max-[1250px]:-mr-10 max-[1130px]:-mr-[36px] max-[1060px]:-mr-[32px] max-[1000px]:-mr-8"
                                    : "-mr-8 max-[1250px]:-mr-8 max-[1130px]:-mr-8 max-[1060px]:-mr-[27px] max-[1000px]:-mr-2"
                                : ""
                            }`}
                    >
                        <MaskedSVG
                            src={getSVG(i, steps.length)}
                            color={getColor(step)}
                            variant={variant}
                        />

                        {/* Sales special case: Won/Lost dropdown */}
                        {variant === "sales" && step === "WonLost" ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                    <select
                                        value={selectedWonLost}
                                        disabled={currentStatus !== "Ongoing"}
                                        onChange={(e) =>
                                            handleDropdownChange(e.target.value as "Won" | "Lost")
                                        }
                                        className={`appearance-none bg-transparent text-white font-semibold text-[16px] pr-6
                    cursor-pointer rounded-md py-1 pl-2
                    focus:outline-none focus:ring-2 ${currentStatus !== "Ongoing"
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                            }`}
                                    >
                                        <option value="" disabled>Won / Lost</option>
                                        <option className="bg-[#1e1e1e] text-white" value="Won">
                                            Won
                                        </option>
                                        <option className="bg-[#1e1e1e] text-white" value="Lost">
                                            Lost
                                        </option>
                                    </select>
                                    <ChevronDown
                                        className="absolute right-1 top-1/2 -translate-y-1/2 text-white w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                        ) : (
                            <span
                                className="absolute inset-0 flex items-center justify-center text-white font-semibold text-[16px] max-[1060px]:text-[14px] text-center px-2">
                                {step}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}