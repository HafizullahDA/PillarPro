import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[0_10px_30px_rgba(64,42,16,0.08)] ${className}`}
    >
      {children}
    </section>
  );
}
