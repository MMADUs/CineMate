export type InputType = "text" | "email" | "password" | "number" | "tel";

export interface InputProps {
    id: string;
    name: string;
    label: string;
    type?: InputType;
    placeholder?: string;
    required?: boolean;
    autoComplete?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errorMessage?: string;
}