import { MobilePage } from "@/components/layout/mobile-page";
import { LoadingCard } from "@/components/ui/loading-card";

export default function GlobalLoading() {
  return (
    <MobilePage
      eyebrow="PillarPro"
      title="Loading"
      description="Fetching ledger data and module details."
    >
      <LoadingCard title="Loading dashboard" lines={2} />
      <LoadingCard title="Loading records" lines={4} />
    </MobilePage>
  );
}
