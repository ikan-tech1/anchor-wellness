"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MeditationTimer } from "@anchor/ui";
import { recordMeditation } from "@/app/actions/data";

function MeditateContent() {
  const searchParams = useSearchParams();
  const duration = parseInt(searchParams.get("duration") || "300", 10);
  const ambient = searchParams.get("ambient") || "silence";

  async function onComplete(completedDuration: number) {
    await recordMeditation(completedDuration, ambient);
  }

  return (
    <div className="p-4 md:p-6">
      <MeditationTimer
        durationSec={duration}
        ambient={ambient}
        onComplete={onComplete}
      />
    </div>
  );
}

export default function MeditatePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <MeditateContent />
    </Suspense>
  );
}
