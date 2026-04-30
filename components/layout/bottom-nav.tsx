"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/vendors", label: "Vendors" },
  { href: "/attendance", label: "Attendance" },
  { href: "/receivables", label: "Receivables" },
  { href: "/partners", label: "Partners" },
  { href: "/expenses", label: "Expenses" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-3 z-20 mt-6 rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)]/95 p-2 shadow-[0_18px_60px_rgba(64,42,16,0.12)] backdrop-blur"
    >
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-3 py-3 text-center text-xs font-semibold transition ${
                active
                  ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                  : "bg-[color:var(--surface-muted)] text-[color:var(--foreground)] hover:bg-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
