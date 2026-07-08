"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  side?: "top" | "bottom";
}

export function DropdownMenu({ trigger, children, align = "right", side = "bottom" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      
      {isOpen && (
        <div
          className={`absolute z-50 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 ${
            align === "right" ? "right-0" : "left-0"
          } ${
            side === "top"
              ? `bottom-full mb-2 origin-bottom-${align === "right" ? "right" : "left"}`
              : `top-full mt-2 origin-top-${align === "right" ? "right" : "left"}`
          }`}
          onClick={() => setIsOpen(false)}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ 
  children, 
  onClick, 
  danger = false 
}: { 
  children: ReactNode; 
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
        danger ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-slate-700"
      }`}
      role="menuitem"
    >
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 border-t divider-accent" />;
}
