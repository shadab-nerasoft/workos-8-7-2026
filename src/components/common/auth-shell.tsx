"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-3 mb-6">
          <span className="primary-cta flex h-12 w-12 items-center justify-center text-lg font-bold shadow-sm">W</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">WorkOS PM</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">{title}</h2>
        <p className="mt-2 text-center text-sm text-slate-600 max-w">
          {description}
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200 sm:rounded-2xl sm:px-10">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
