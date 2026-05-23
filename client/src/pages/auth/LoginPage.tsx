import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../components/ui_manual/Button";
import { Input } from "../../components/ui_manual/Input";
import { Divider } from "../../components/ui_manual/Divider";
import { Link } from "../../components/ui_manual/Link";
import { GoogleIcon } from "../../components/ui_manual/GoogleIcon";
import { useNavigate } from "react-router-dom";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export interface LoginPageProps {
  registerHref?: string;
  onLogin?: (email: string, password: string) => void;
  onGoogleLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  registerHref = "/register",
  onLogin,
  onGoogleLogin,
}) => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    onLogin?.(data.email, data.password);
    navigate("/");
  };

  return (
    <div className="bg-auth-grid min-h-screen w-full flex flex-col items-center justify-center px-4 py-10 font-sans relative">      
      
      <div className="relative z-10 flex flex-col items-center w-full max-w-115 gap-6">

        <div className="w-full rounded-3xl border border-white/10 bg-[#121212]/80 backdrop-blur-md px-10 py-12 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-[2.5rem] font-bold text-white tracking-tight leading-none mb-2">
              Login
            </h1>
            <p className="text-sm text-white/50">
              Your Movie, Your Choice
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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
              autoComplete="current-password"
              {...register("password")}
              errorMessage={errors.password?.message}
            />

            <div className="mt-2">
              <Button
                label="Login"
                variant="primary"
                type="submit"
              />
            </div>

            <div className="py-2">
              <Divider text="Or" />
            </div>

            <Button
              label="Sign In With Google"
              variant="google"
              type="button" 
              icon={<GoogleIcon />}
              onClick={onGoogleLogin}
            />
          </form>
        </div>

        <p className="text-sm text-white/50 text-center mt-2">
          Doesn't Have an Account?{" "}
          <Link href={registerHref} label="Register Here" variant="accent" />
        </p>
      </div>
    </div>
  );
};