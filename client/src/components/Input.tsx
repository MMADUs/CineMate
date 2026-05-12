import React, { useState } from "react";
import type { InputProps } from "../types/input";

export const Input: React.FC<InputProps> = ({
    id,
    name,
    label,
    type = "text",
    placeholder = "",
    required = false,
    autoComplete,
    value,
    onChange,
    errorMessage,
}) => {
    const [focused, setFocused] = useState(false);
    const hasError = !!errorMessage;

    const borderClass = hasError
        ? "border border-[#e51c23] shadow-[0_0_0_3px_rgba(229,28,35,0.15)]"
        : focused
        ? "border border-[#e51c23] shadow-[0_0_0_3px_rgba(229,28,35,0.15)]"
        : "border border-transparent";

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-medium text-white">
                {label}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                placeholder={placeholder}
                required={required}
                autoComplete={autoComplete}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={`w-full bg-white/5 rounded-xl px-4 py-3.5 text-[15px] text-white placeholder-white/25 outline-none transition-all duration-200 ${borderClass}`}
            />
            {hasError && (
                <span className="text-xs text-[#e51c23]">{errorMessage}</span>
            )}
        </div>
    );
};