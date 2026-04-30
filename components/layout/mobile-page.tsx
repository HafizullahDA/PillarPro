import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";

type MobilePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function MobilePage({
  eyebrow,
  title,
  description,
  children,
}: MobilePageProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-6 sm:max-w-2xl sm:px-6">
      <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)]/95 p-5 shadow-[0_18px_60px_rgba(64,42,16,0.12)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
          {description}
        </p>
      </section>

      <div className="mt-5 flex flex-col gap-4">{children}</div>
      <BottomNav />
    </main>
  );
}
