"use client";

import { useEffect } from "react";
import { MobilePage } from "@/components/layout/mobile-page";
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
    <MobilePage
      eyebrow="PillarPro"
      title="Something went wrong"
      description="The app hit an unexpected error while loading this screen."
    >
      <Card>
        <p className="text-sm text-[color:var(--muted)]">
          {error.message || "Unexpected error."}
        </p>
        <Button className="mt-4" onClick={reset} type="button">
          Try again
        </Button>
      </Card>
    </MobilePage>
  );
}
