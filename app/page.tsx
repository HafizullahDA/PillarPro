import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-8 pt-6 sm:max-w-5xl sm:px-6 lg:justify-center">
      <section className="overflow-hidden rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)]/95 shadow-[0_24px_80px_rgba(64,42,16,0.14)]">
        <div className="bg-[color:var(--primary)] px-5 py-8 text-[color:var(--primary-foreground)] sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f5d7a4]">
              Construction ERP
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              PillarPro
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#f7f5ef]/85">
              Run projects, site attendance, vendors, receivables, partners, and expenses from a ledger-first system built for construction teams on the move.
            </p>
            <div className="mt-6 grid gap-3 sm:flex">
              <Link
                href="/sign-up"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#f7f5ef] px-5 text-sm font-bold text-[color:var(--primary)]"
              >
                Create account
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#f7f5ef]/45 px-5 text-sm font-bold text-[#f7f5ef]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:grid-cols-3 sm:px-8 lg:px-10">
          <SplashMetric label="Today on site" value="42" detail="workers marked by supervisors" />
          <SplashMetric label="Ledger status" value="Live" detail="expenses and payments tied to projects" />
          <SplashMetric label="Month close" value="Ready" detail="attendance export and salary trail" />
        </div>

        <div className="border-t border-[color:var(--border)] px-5 py-5 sm:px-8 lg:px-10">
          <div className="grid gap-3 sm:grid-cols-2">
            <SplashPoint title="Site-first attendance" text="Supervisors can mark one day at a time without wrestling a spreadsheet on a phone." />
            <SplashPoint title="Project-centered money" text="Every bill, receipt, salary entry, and partner movement stays connected to the project ledger." />
            <SplashPoint title="Cleaner follow-up" text="Outstanding vendor, receivable, and partner balances stay visible from the dashboard." />
            <SplashPoint title="Mobile ERP surface" text="Forms and summaries are shaped for field use, not desktop-only accounting." />
          </div>
        </div>
      </section>
    </main>
  );
}

function SplashMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-white/70 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-[color:var(--foreground)]">{value}</p>
      <p className="mt-1 text-xs leading-5 text-[color:var(--muted)]">{detail}</p>
    </div>
  );
}

function SplashPoint({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-[color:var(--surface-muted)] p-4">
      <h2 className="text-sm font-bold text-[color:var(--foreground)]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{text}</p>
    </div>
  );
}
