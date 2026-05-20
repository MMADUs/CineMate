import React, { useState } from "react";
import { Button } from "../../components/ui_manual/Button";
import { Input } from "../../components/ui_manual/Input";
import { Link } from "../../components/ui_manual/Link";

export interface RegisterPageProps {
    loginHref?: string;
    onRegister?: (email: string, password: string) => void;
    onGoogleLogin?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
    loginHref = "/login",
    onRegister,
}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

    const validate = (): boolean => {
        const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};
        
        if (!email || !email.includes("@")) {
        newErrors.email = "Please enter a valid email address.";
        }
        
        if (!password || password.length < 6) {
        newErrors.password = "Password must be at least 6 characters.";
        }
        
        if (confirmPassword !== password) {
        newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (validate()) {
        onRegister?.(email, password);
        }
    };

    return (
        <div className="bg-auth-grid min-h-screen w-full flex flex-col items-center justify-center px-4 py-10 font-sans relative">
        
            <div className="relative z-10 flex flex-col items-center w-full max-w-115 gap-6">

            <div className="w-full rounded-3xl border border-white/10 bg-[#121212]/80 backdrop-blur-md px-10 py-12 shadow-2xl">

            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-[2.5rem] font-bold text-white tracking-tight leading-none mb-2">
                Register
                </h1>
                <p className="text-sm text-white/50">
                Your Movie, Your Choice
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <Input
                id="email"
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter Your Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                errorMessage={errors.email}
                />

                <Input
                id="password"
                name="password"
                label="Password"
                type="password"
                placeholder="Enter Your Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                errorMessage={errors.password}
                />

                <Input
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                errorMessage={errors.confirmPassword}
                />

                <div className="mt-2">
                <Button
                    label="Register"
                    variant="primary"
                    type="submit"
                />
                </div>

            </form>
            </div>

            <p className="text-sm text-white/50 text-center mt-2">
            Already Have an Account?{" "}
            <Link href={loginHref} label="Login" variant="accent" />
            </p>
        </div>
        </div>
    );
};