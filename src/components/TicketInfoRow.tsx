import React from "react";

interface InfoRowProps {
    label: string;
    value: string | number;
}

const TicketInfoRow: React.FC<InfoRowProps> = ({ label, value }) => {
    return (
        <div className="flex mb-4 text-[16px] max-[1140px]:text-[14px]">
            <span className="font-medium text-[#575757] w-[180px] shrink-0">
                {label}
            </span>
            <span className="font-semibold text-black break-words flex-1">
                {value}
            </span>
        </div>
    );
};

export default TicketInfoRow;
