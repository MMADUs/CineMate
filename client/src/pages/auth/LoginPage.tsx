import React, { useState } from "react";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Divider } from "../../components/Divider";
import { Link } from "../../components/Link";
import { GoogleIcon } from "../../components/GoogleIcon";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email || !email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password || password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validate()) {
      onLogin?.(email, password);
    }
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input
              id="email"
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter Your Email"
              required
              autoComplete="email"
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              errorMessage={errors.password}
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