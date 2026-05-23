import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    errorMessage?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ id, label, errorMessage, className, ...props }, ref) => {
        const hasError = !!errorMessage;

        return (
            <div className="flex flex-col gap-2">
                <label htmlFor={id} className="text-sm font-medium text-white">
                    {label}
                </label>
                
                <input
                    id={id}
                    ref={ref}
                    className={`w-full bg-white/5 rounded-xl px-4 py-3.5 text-[15px] text-white placeholder-white/25 outline-none transition-all duration-300 border ${
                        hasError
                            ? "border-[#e51c23] shadow-[0_0_0_3px_rgba(229,28,35,0.15)]"
                            : "border-transparent focus:border-[#e51c23] focus:shadow-[0_0_0_3px_rgba(229,28,35,0.15)]"
                    } ${className || ""}`}
                    {...props}
                />
                
                {errorMessage && (
                    <p className="text-xs text-[#e51c23] font-medium tracking-wide mt-0.5">
                        {errorMessage}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";