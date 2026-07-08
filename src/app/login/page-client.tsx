"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/src/components/common/auth-shell";
import { useAuthStore, useEmployeeStore } from "@/src/store";
import { Eye, EyeOff, User, Lock, ShieldCheck, Briefcase } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const allUsers = useEmployeeStore((s) => s.getAllUsers());

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Mock login logic
    setTimeout(() => {
      const user = allUsers.find(
        (u) => (u.email === identifier || u.id === identifier)
      );

      if (user && (password === "password123" || password === "admin123")) {
        // Handle admin specifically if password is admin123 and user is admin
        if (password === "admin123" && user.role !== "admin") {
          setError("Invalid credentials for this role.");
          setIsLoading(false);
          return;
        }

        login(user);
        router.push("/");
      } else {
        setError("Invalid identifier or password. Try 'password123'.");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickLogin = (role: "admin" | "manager" | "employee") => {
    setError(null);
    setIsLoading(true);

    // Find first user matching the role
    const targetUser = allUsers.find((u) => u.role === role);
    if (!targetUser) {
      setError(`No user found with the role: ${role}`);
      setIsLoading(false);
      return;
    }

    // Set fields for visual feedback
    setIdentifier(targetUser.email);
    setPassword("password123");

    // Perform login with delay to show the animation
    setTimeout(() => {
      login(targetUser);
      router.push("/");
      setIsLoading(false);
    }, 800);
  };

  return (
    <AuthShell
      title="Welcome back"
      description="Access daily reporting, team management, and analytics from one secure workspace."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-slate-700">
            Employee ID or Email
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="e.g. EMP-101 or email@workos.test"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-slate-400" />
              ) : (
                <Eye className="h-5 w-5 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full primary-cta flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
            Quick Demo Login
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin")}
              disabled={isLoading}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all hover:scale-[1.02] active:scale-[0.98] group disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors mb-1.5">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("manager")}
              disabled={isLoading}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all hover:scale-[1.02] active:scale-[0.98] group disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors mb-1.5">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">Manager</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("employee")}
              disabled={isLoading}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all hover:scale-[1.02] active:scale-[0.98] group disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors mb-1.5">
                <User className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-700">Employee</span>
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-primary-600 hover:text-primary-500">
            Sign up
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
