import { type ReactNode } from "react";

interface FormFieldProps {
  label: string;
  id: string;
  error?: string;
  description?: string;
  children: ReactNode;
  required?: boolean;
}

export function FormField({ label, id, error, description, children, required }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-semibold leading-6 text-slate-950">
          {label}
          {required && <span className="ml-1 text-primary-600">*</span>}
        </label>
      </div>
      {children}
      {description && !error && (
        <p className="text-xs leading-5 text-slate-500">{description}</p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium leading-5 text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  const { className = "", hasError, ...rest } = props;
  
  return (
    <input
      {...rest}
      className={`h-11 w-full rounded-xl border bg-white px-4 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
        hasError
          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
          : "border-primary-200/60 focus:border-primary-600 focus:ring-primary-100"
      } ${className}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }) {
  const { className = "", hasError, ...rest } = props;
  
  return (
    <textarea
      {...rest}
      className={`w-full rounded-xl border bg-white p-4 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 min-h-24 resize-y ${
        hasError
          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
          : "border-primary-200/60 focus:border-primary-600 focus:ring-primary-100"
      } ${className}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }) {
  const { className = "", hasError, children, ...rest } = props;
  
  return (
    <select
      {...rest}
      className={`h-11 w-full appearance-none rounded-xl border bg-white px-4 text-sm leading-6 text-slate-950 outline-none transition focus:ring-2 ${
        hasError
          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
          : "border-primary-200/60 focus:border-primary-600 focus:ring-primary-100"
      } ${className}`}
    >
      {children}
    </select>
  );
}
