"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MeditationTimer } from "@anchor/ui";
import { createClient } from "@anchor/db/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function MeditateContent() {
  const searchParams = useSearchParams();
  const duration = parseInt(searchParams.get("duration") || "300", 10);
  const ambient = searchParams.get("ambient") || "silence";
  const supabase = createClient();

  async function handleComplete(durationSec: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("meditation_sessions").insert({
      user_id: user.id,
      duration_sec: durationSec,
      ambient,
    });
  }

  return (
    <div className="p-4 md:p-6">
      <Link href="/today" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <MeditationTimer durationSec={duration} ambient={ambient} onComplete={handleComplete} />
    </div>
  );
}

export default function MeditatePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <MeditateContent />
    </Suspense>
  );
}
