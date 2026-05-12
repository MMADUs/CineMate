export type ButtonVariant = "primary" | "google" | "outline";
export type ButtonShape = "pill" | "rounded" | "square"; 

export interface ButtonProps {
    label: string;
    variant?: ButtonVariant;
    shape?: ButtonShape; 
    type?: "button" | "submit" | "reset";
    fullWidth?: boolean;
    onClick?: () => void;
    icon?: React.ReactNode;
    disabled?: boolean;
}