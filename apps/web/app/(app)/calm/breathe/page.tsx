"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BreathingExercise, PageShell, PageHeader, breathingPatterns } from "@anchor/ui";
import { recordBreathing } from "@/app/actions/data";

function BreatheContent() {
  const searchParams = useSearchParams();
  const pattern = (searchParams.get("pattern") || "box") as keyof typeof breathingPatterns;
  const cycles = parseInt(searchParams.get("cycles") || "4", 10);

  async function onComplete() {
    await recordBreathing(pattern, cycles);
  }

  const config = breathingPatterns[pattern] || breathingPatterns.box;

  return (
    <PageShell className="mx-auto max-w-lg">
      <PageHeader title="Breathe" description={config.name} />
      <BreathingExercise pattern={pattern} cycles={cycles} onComplete={onComplete} />
    </PageShell>
  );
}

export default function BreathePage() {
  return (
    <Suspense
      fallback={
        <PageShell className="mx-auto max-w-lg">
          <div className="py-24 text-center text-muted-foreground">Loading...</div>
        </PageShell>
      }
    >
      <BreatheContent />
    </Suspense>
  );
}
