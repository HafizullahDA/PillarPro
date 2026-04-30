"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6">
      <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)]/95 p-6 shadow-[0_18px_60px_rgba(64,42,16,0.12)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
          PillarPro
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
          The app hit an unexpected error while loading this screen.
        </p>
        <Card className="mt-6">
          <p className="text-sm text-[color:var(--muted)]">
            {error.message || "Unexpected error."}
          </p>
          <Button className="mt-4" onClick={reset} type="button">
            Try again
          </Button>
        </Card>
      </section>
    </main>
  );
}
