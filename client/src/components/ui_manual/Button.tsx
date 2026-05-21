import React from "react";

export type ButtonVariant = "primary" | "google" | "outline";
export type ButtonShape = "pill" | "rounded" | "square"; 

interface ButtonProps {
    label: string;
    variant?: ButtonVariant;
    shape?: ButtonShape; 
    type?: "button" | "submit" | "reset";
    fullWidth?: boolean;
    onClick?: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    label,
    variant = "primary",
    shape = "pill", 
    type = "button",
    fullWidth = true,
    onClick,
    icon,
    disabled = false,
}) => {
    const base = "flex items-center justify-center gap-3 px-6 py-[14px] text-base font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

    const variants: Record<ButtonVariant, string> = {
        primary: "bg-[#e51c23] text-white hover:bg-[#c71118] hover:shadow-[0_4px_20px_rgba(229,28,35,0.45)] hover:-translate-y-px active:translate-y-0",
        google: "bg-white text-[#1f1f1f] font-medium border border-[#e0e0e0] hover:bg-[#f5f5f5] hover:shadow-md hover:-translate-y-px active:translate-y-0",
        outline: "bg-transparent text-white border border-white/20 hover:border-white/40 hover:-translate-y-px",
    };

    const shapes: Record<ButtonShape, string> = {
        pill: "rounded-full",     
        rounded: "rounded-lg",   
        square: "rounded-none",   
    };

    return (
        <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${base} ${variants[variant]} ${shapes[shape]} ${fullWidth ? "w-full" : ""}`}
        >
            {
                icon && <span className="flex items-center shrink-0">{icon}</span>
            }
            <span className="flex-1 text-center">{label}</span>
        </button>
    );
};