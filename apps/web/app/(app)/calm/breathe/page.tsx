"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BreathingExercise } from "@anchor/ui";
import { recordBreathing } from "@/app/actions/data";

function BreatheContent() {
  const searchParams = useSearchParams();
  const pattern = (searchParams.get("pattern") || "box") as "box" | "478" | "physiological_sigh" | "calm";
  const cycles = parseInt(searchParams.get("cycles") || "4", 10);

  async function onComplete() {
    await recordBreathing(pattern, cycles);
  }

  return (
    <div className="p-4 md:p-6">
      <BreathingExercise pattern={pattern} cycles={cycles} onComplete={onComplete} />
    </div>
  );
}

export default function BreathePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <BreatheContent />
    </Suspense>
  );
}
