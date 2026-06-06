import React from "react";

interface DividerProps {
    text?: string;
}

export const Divider: React.FC<DividerProps> = ({ text }) => {
    if (!text) {
        return <hr className="border-none border-t border-white/10 my-0" />;
    }

    return (
        <div className="flex items-center gap-3">
            <span className="flex-1 h-px bg-white/10" />
            <span className="text-[13px] text-white/40 whitespace-nowrap">{text}</span>
            <span className="flex-1 h-px bg-white/10" />
        </div>
    );
};