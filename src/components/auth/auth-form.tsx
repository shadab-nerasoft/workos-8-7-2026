"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, LoginCurve, ProfileAdd, ShieldTick } from "iconsax-react";
import { z } from "zod";
import { authApi } from "@/src/services";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid work email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Enter your full name."),
});

export function AuthForm({ mode }: AuthFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState("");
  const router = useRouter();

  function handleSubmit(formData: FormData): void {
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
    const result = mode === "login" ? loginSchema.safeParse(payload) : registerSchema.safeParse(payload);

    if (!result.success) {
      const nextErrors: FormErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];

        if ((field === "name" || field === "email" || field === "password") && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }

      setErrors(nextErrors);
      setSuccess("");
      return;
    }

    setErrors({});

    if (mode === "login") {
      // Strict login through the auth service — unknown emails are rejected.
      authApi
        .login(payload.email, payload.password)
        .then(() => {
          setSuccess("Login validated. Redirecting to workspace...");
          router.push("/");
        })
        .catch((err: unknown) => {
          setSuccess("");
          setErrors({
            email: err instanceof Error ? err.message : "Invalid email or password.",
          });
        });
    } else {
      setSuccess("Account details validated. Registration is ready for backend integration.");
    }
  }

  const title = mode === "login" ? "Login to your workspace" : "Create your workspace account";
  const description =
    mode === "login"
      ? "Access dashboards, project health, and team execution tools."
      : "Set up a role-ready profile for the project management workspace.";
  const Icon = mode === "login" ? LoginCurve : ProfileAdd;

  return (
    <section className="surface-card w-full max-w-md p-8">
      <div className="mb-8 flex items-start gap-4">
        <span className="primary-cta flex h-12 w-12 items-center justify-center">
          <Icon size={22} color="currentColor" variant="Outline" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-8 text-slate-950">{title}</h1>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      <form action={handleSubmit} className="space-y-5" noValidate>
        {mode === "register" ? (
          <Field label="Full name" name="name" type="text" autoComplete="name" error={errors.name} />
        ) : null}
        <Field label="Work email" name="email" type="email" autoComplete="email" error={errors.email} />
        <Field label="Password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} error={errors.password} />
        {success ? (
          <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700" role="status">
            <ShieldTick size={18} color="currentColor" variant="Outline" aria-hidden="true" />
            {success}
          </p>
        ) : null}
        <button type="submit" className="primary-cta flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold transition hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2">
          <Icon size={18} color="currentColor" variant="Outline" aria-hidden="true" />
          {mode === "login" ? "Login" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm leading-6 text-slate-600">
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <Link href={mode === "login" ? "/signup" : "/login"} className="font-semibold text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600">
          {mode === "login" ? "Sign up" : "Login"}
        </Link>
      </p>
    </section>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  error,
}: {
  label: string;
  name: "name" | "email" | "password";
  type: "text" | "email" | "password";
  autoComplete: string;
  error?: string;
}) {
  const id = `auth-${name}`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold leading-6 text-slate-950">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-11 w-full rounded-xl border border-primary-200/60 bg-white/80 px-4 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
        />
        {type === "password" ? (
          <Eye size={18} color="currentColor" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" variant="Outline" aria-hidden="true" />
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-xs font-medium leading-5 text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
