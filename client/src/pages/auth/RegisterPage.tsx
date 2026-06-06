import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui_manual/Button";
import { Input } from "../../components/ui_manual/Input";
import { Link } from "../../components/ui_manual/Link";
import { useRegister } from "../../api/mutations/Admin/useRegister"; 

const registerSchema = z
    .object({
        fullName: z
            .string()
            .min(3, { message: "Full name must be at least 3 characters." }),
        phoneNum: z
            .string()
            .min(10, { message: "Phone number must be at least 10 digits." })
            .regex(/^[0-9+]+$/, { message: "Phone number can only contain numbers and '+' sign." }),
        email: z
            .string()
            .min(1, { message: "Email address is required." })
            .email({ message: "Please enter a valid email address." }),
        password: z
            .string()
            .min(6, { message: "Password must be at least 6 characters." }),
        confirmPassword: z
            .string()
            .min(1, { message: "Please confirm your password." }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

export interface RegisterPageProps {
    loginHref?: string;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
    loginHref = "/login",
}) => {
    const navigate = useNavigate();
    const [apiError, setApiError] = useState<string | null>(null);

    const { mutate: registerUser, isPending } = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            phoneNum: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (data: RegisterFormValues) => {
        setApiError(null); 

        registerUser(
            {
                fullName: data.fullName,
                email: data.email,
                phoneNum: data.phoneNum,
                password: data.password,
            },
            {
                onSuccess: () => {
                    alert('Registration Successful! Please login.');
                    navigate("/login");
                },
                onError: (error) => {
                    const errorMsg = error.response?.data?.message || "An unexpected error occurred. Please try again.";
                    setApiError(errorMsg);
                }
            }
        );
    };

    return (
        <div className="bg-auth-grid min-h-screen w-full flex flex-col items-center justify-center px-4 py-10 font-sans relative">
            <div className="relative z-10 flex flex-col items-center w-full max-w-115 gap-6">
                <div className="w-full rounded-3xl border border-white/10 bg-[#121212]/80 backdrop-blur-md px-10 py-12 shadow-2xl">
                    <div className="text-center mb-10">
                        <h1 className="text-[2.5rem] font-bold text-white tracking-tight leading-none mb-2">
                            Register
                        </h1>
                        <p className="text-sm text-white/50">
                            Your Movie, Your Choice
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        
                        {apiError && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-lg text-center font-medium">
                                {apiError}
                            </div>
                        )}
                        
                        <Input
                            id="fullName"
                            label="Full Name"
                            type="text"
                            placeholder="Enter Your Full Name"
                            required
                            autoComplete="name"
                            {...register("fullName")}
                            errorMessage={errors.fullName?.message}
                        />

                        <Input
                            id="phoneNum"
                            label="Phone Number"
                            type="tel"
                            placeholder="Enter Your Phone Number"
                            required
                            autoComplete="tel"
                            {...register("phoneNum")}
                            errorMessage={errors.phoneNum?.message}
                        />

                        <Input
                            id="email"
                            label="Email Address"
                            type="email"
                            placeholder="Enter Your Email"
                            required
                            autoComplete="email"
                            {...register("email")}
                            errorMessage={errors.email?.message}
                        />

                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            placeholder="Enter Your Password"
                            required
                            autoComplete="new-password"
                            {...register("password")}
                            errorMessage={errors.password?.message}
                        />

                        <Input
                            id="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm Password"
                            required
                            autoComplete="new-password"
                            {...register("confirmPassword")}
                            errorMessage={errors.confirmPassword?.message}
                        />

                        <div className="mt-2">
                            <Button
                                label={isPending ? "Registering..." : "Register"}
                                variant="primary"
                                type="submit"
                                disabled={isPending}
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