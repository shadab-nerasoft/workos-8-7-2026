import { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

const variantClasses = {
  primary: "bg-primary-600 hover:bg-primary-700 text-white font-bold transition shadow-xs active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500/30",
  secondary: "bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold transition active:scale-[0.98] focus:outline-none",
  outline: "border border-slate-250 hover:bg-slate-50 text-slate-700 font-semibold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-500/10",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition rounded-lg focus:outline-none",
  danger: "bg-red-600 hover:bg-red-700 text-white font-bold transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500/30",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-5 py-2.5 text-base rounded-2xl",
  icon: "p-2 rounded-lg flex items-center justify-center shrink-0",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const combinedClasses = `${variantClasses[variant]} ${sizeClasses[size]} ${className} inline-flex items-center justify-center gap-1.5 select-none font-sans font-semibold leading-none cursor-pointer duration-150`;

  return (
    <button type={type} className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
