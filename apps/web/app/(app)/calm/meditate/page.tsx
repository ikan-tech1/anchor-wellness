"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MeditationTimer, PageShell, PageHeader } from "@anchor/ui";
import { recordMeditation } from "@/app/actions/data";

function MeditateContent() {
  const searchParams = useSearchParams();
  const duration = parseInt(searchParams.get("duration") || "300", 10);
  const ambient = searchParams.get("ambient") || "silence";

  async function onComplete(completedDuration: number) {
    await recordMeditation(completedDuration, ambient);
  }

  const mins = Math.round(duration / 60);

  return (
    <PageShell className="mx-auto max-w-lg">
      <PageHeader title="Meditate" description={`${mins} minute session`} />
      <MeditationTimer
        durationSec={duration}
        ambient={ambient}
        onComplete={onComplete}
      />
    </PageShell>
  );
}

export default function MeditatePage() {
  return (
    <Suspense
      fallback={
        <PageShell className="mx-auto max-w-lg">
          <div className="py-24 text-center text-muted-foreground">Loading...</div>
        </PageShell>
      }
    >
      <MeditateContent />
    </Suspense>
  );
}
