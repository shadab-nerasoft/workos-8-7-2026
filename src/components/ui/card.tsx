import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <section className={`surface-card ${className}`} {...rest}>
      {children}
    </section>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function CardHeader({ title, action, children, className = "", ...rest }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-4 border-b px-6 py-5 divider-accent ${className}`} {...rest}>
      {children ? children : (
        <>
          <h2 className="text-lg font-semibold leading-[26px] text-slate-950">{title}</h2>
          {action}
        </>
      )}
    </div>
  );
}
