"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);

    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      router.push("/sign-in");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-2xl border border-[color:var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--foreground)]"
      disabled={busy}
    >
      {busy ? "Signing out..." : "Sign out"}
    </button>
  );
}
