import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footerText: string;
  footerLinkHref: string;
  footerLinkLabel: string;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  footerText,
  footerLinkHref,
  footerLinkLabel,
  children,
}: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6">
      <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)]/95 p-6 shadow-[0_18px_60px_rgba(64,42,16,0.12)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
          {description}
        </p>

        <div className="mt-6">{children}</div>

        <p className="mt-6 text-center text-sm text-[color:var(--muted)]">
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            className="font-semibold text-[color:var(--primary)]"
          >
            {footerLinkLabel}
          </Link>
        </p>
      </section>
    </main>
  );
}
