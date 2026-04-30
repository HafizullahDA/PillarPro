import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  busy?: boolean;
  children: ReactNode;
};

export function Button({ children, busy = false, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[color:var(--primary)] px-4 py-3 text-sm font-semibold text-[color:var(--primary-foreground)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      disabled={busy || props.disabled}
      {...props}
    >
      {busy ? "Saving..." : children}
    </button>
  );
}
