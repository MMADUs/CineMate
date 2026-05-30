import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../components/ui_manual/Button";
import { Input } from "../../components/ui_manual/Input";
import { Divider } from "../../components/ui_manual/Divider";
import { Link } from "../../components/ui_manual/Link";
import { useNavigate, useLocation } from "react-router-dom";
import { useLogin } from "../../api/mutations/Auth/useLogin"; 
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleAuth } from '../../api/mutations/Auth/useGoogleAuth';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(5, "Password must be at least 5 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export interface LoginPageProps {
  registerHref?: string;
  onGoogleLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  registerHref = "/register",
}) => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [apiError, setApiError] = useState<string | null>(null);

  const isAdminLogin = location.pathname.includes('/admin');

  const { mutate: loginUser, isPending } = useLogin();
  const { mutate: googleAuthBackend } = useGoogleAuth();

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
    setApiError(null);

    loginUser(
      {
        payload: {
            email: data.email,
            password: data.password,
        },
        isAdmin: isAdminLogin
      },
      {
        onSuccess: () => {
          navigate(isAdminLogin ? "/admin" : "/");
        },
        onError: (error) => {
          const errorMsg = error.response?.data?.message || "Login failed.";
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
            {/* Judul bisa disesuaikan sedikit untuk Admin */}
            <h1 className="text-[2.5rem] font-bold text-white tracking-tight leading-none mb-2">
              {isAdminLogin ? "Admin Login" : "Login"}
            </h1>
            <p className="text-sm text-white/50">
              {isAdminLogin ? "CineMate Administrative Access" : "Your Movie, Your Choice"}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            
            {apiError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-lg text-center font-medium">
                    {apiError}
                </div>
            )}

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
                label={isPending ? "Logging in..." : "Login"}
                variant="primary"
                type="submit"
                disabled={isPending}
              />
            </div>

            {/* 4. Sembunyikan Google Login jika ini adalah halaman Admin */}
            {!isAdminLogin && (
                <>
                    <div className="py-2">
                      <Divider text="Or" />
                    </div>

                    <div className="flex justify-center w-full">
                        <div className="w-full h-13 [&>div]:w-full! [&>div]:h-full! [&>div>div]:h-full! flex justify-center">
                            <GoogleLogin
                              onSuccess={(credentialResponse) => {
                                if (credentialResponse.credential) {
                                    googleAuthBackend(
                                        { idToken: credentialResponse.credential },
                                        {
                                            onSuccess: () => navigate("/"),
                                            onError: (err) => setApiError(err.response?.data?.message || "Google Login failed")
                                        }
                                    );
                                }
                              }}
                              onError={() => {
                                setApiError("Google Login was canceled or failed.");
                              }}
                              theme="outline" 
                              shape="rectangular"
                              size="large"
                              width="100%"
                            />
                        </div>
                    </div>
                </>
            )}
          </form>
        </div>

        {/* 5. Sembunyikan Register jika ini adalah halaman Admin */}
        {!isAdminLogin && (
            <p className="text-sm text-white/50 text-center mt-2">
              Doesn't Have an Account?{" "}
              <Link href={registerHref} label="Register Here" variant="accent" />
            </p>
        )}
      </div>
    </div>
  );
};