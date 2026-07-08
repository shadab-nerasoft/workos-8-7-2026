"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/src/components/common/auth-shell";
import { Sms, ArrowLeft } from "iconsax-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock forgot password logic
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <AuthShell
      title="Reset Password"
      description={isSubmitted 
        ? "We've sent a password reset link to your official email address."
        : "Enter your official email address and we'll send you a link to reset your password."
      }
    >
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Official Email
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Sms size={20} className="text-slate-400" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="john@gtftechnologies.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full primary-cta flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all"
          >
            {isLoading ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <Sms size={24} variant="Bold" />
          </div>
          <p className="text-sm text-slate-600 mb-6">
            Check your inbox for <strong>{email}</strong> and follow the instructions to reset your password.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-sm font-bold text-primary-600 hover:text-primary-500"
          >
            Didn&apos;t receive the email? Try again
          </button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary-600 transition">
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </AuthShell>
  );
}
