import { Card } from "@/components/ui/card";

type LoadingCardProps = {
  title?: string;
  lines?: number;
};

export function LoadingCard({
  title = "Loading",
  lines = 3,
}: LoadingCardProps) {
  return (
    <Card>
      <div className="animate-pulse">
        <div className="h-5 w-32 rounded-full bg-[color:var(--surface-muted)]" />
        <p className="mt-3 text-sm text-[color:var(--muted)]">{title}...</p>
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className="h-12 rounded-2xl bg-[color:var(--surface-muted)]"
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
