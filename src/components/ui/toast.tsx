"use client";

import { useEffect, useState } from "react";
import { TickCircle, InfoCircle, Warning2, Danger } from "iconsax-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  id: string;
  title: string;
  message?: string;
  type?: ToastType;
}

let toastCount = 0;
type ToastFunction = (props: Omit<ToastProps, "id">) => void;

// Simple event bus for toasts
const listeners = new Set<(toast: ToastProps) => void>();

export const toast: ToastFunction = (props) => {
  const id = `toast-${++toastCount}`;
  listeners.forEach((listener) => listener({ ...props, id }));
};

const icons = {
  success: <TickCircle size={20} className="text-emerald-600" variant="Bold" />,
  error: <Danger size={20} className="text-red-600" variant="Bold" />,
  info: <InfoCircle size={20} className="text-primary-600" variant="Bold" />,
  warning: <Warning2 size={20} className="text-amber-600" variant="Bold" />,
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    const handleToast = (newToast: ToastProps) => {
      setToasts((current) => [...current, newToast]);
      
      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    listeners.add(handleToast);
    return () => {
      listeners.delete(handleToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-50 flex w-full flex-col gap-2 p-4 sm:w-[420px] md:p-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/5 animate-in slide-in-from-right-full fade-in"
        >
          <div className="shrink-0 pt-0.5">
            {icons[t.type || "info"]}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold leading-6 text-slate-950">{t.title}</h3>
            {t.message && <p className="mt-1 text-sm leading-5 text-slate-500">{t.message}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
