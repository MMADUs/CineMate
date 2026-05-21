import React from "react";

interface LinkProps {
    href: string;
    label: string;
    variant?: "default" | "accent";
    external?: boolean;
}

export const Link: React.FC<LinkProps> = ({
    href,
    label,
    variant = "default",
    external = false,
}) => {
    const colorClass =
        variant === "accent"
        ? "text-[#e51c23] font-semibold hover:text-[#ff3b41]"
        : "text-white hover:text-white/70";

    return (
        <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className={`transition-colors duration-200 no-underline ${colorClass}`}
        >
            {label}
        </a>
    );
};