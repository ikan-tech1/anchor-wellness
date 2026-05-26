"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BreathingExercise } from "@anchor/ui";
import { createClient } from "@anchor/db/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function BreatheContent() {
  const searchParams = useSearchParams();
  const pattern = (searchParams.get("pattern") || "box") as "box" | "478" | "physiological_sigh" | "calm";
  const cycles = parseInt(searchParams.get("cycles") || "4", 10);
  const supabase = createClient();

  async function handleComplete() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("breathing_sessions").insert({
      user_id: user.id,
      pattern,
      cycles,
    });
  }

  return (
    <div className="p-4 md:p-6">
      <Link href="/today" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <BreathingExercise pattern={pattern} cycles={cycles} onComplete={handleComplete} />
    </div>
  );
}

export default function BreathePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <BreatheContent />
    </Suspense>
  );
}
