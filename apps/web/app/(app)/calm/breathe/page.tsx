"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BreathingExercise, Button } from "@anchor/ui";
import { breathingPatterns } from "@anchor/ui";
import { createClient } from "@anchor/db/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PatternKey = keyof typeof breathingPatterns;

function BreatheContent() {
  const searchParams = useSearchParams();
  const initialPattern = (searchParams.get("pattern") || "box") as PatternKey;
  const initialCycles = parseInt(searchParams.get("cycles") || "4", 10);
  const [pattern, setPattern] = useState<PatternKey>(initialPattern);
  const [cycles, setCycles] = useState(initialCycles);
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
    <div className="p-4 md:p-6 space-y-6">
      <Link href="/today" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex flex-wrap gap-2 justify-center">
        {(Object.keys(breathingPatterns) as PatternKey[]).map((key) => (
          <Button
            key={key}
            variant={pattern === key ? "default" : "outline"}
            size="sm"
            onClick={() => setPattern(key)}
          >
            {breathingPatterns[key].name}
          </Button>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        {[3, 4, 5, 6].map((c) => (
          <Button
            key={c}
            variant={cycles === c ? "default" : "ghost"}
            size="sm"
            onClick={() => setCycles(c)}
          >
            {c} cycles
          </Button>
        ))}
      </div>

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
