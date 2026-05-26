"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { breathingPatterns } from "../tokens";
import { Button } from "./button";

type PatternKey = keyof typeof breathingPatterns;

interface BreathingExerciseProps {
  pattern?: PatternKey;
  cycles?: number;
  onComplete?: () => void;
}

type Phase = "inhale" | "hold" | "exhale" | "holdAfter" | "done";

export function BreathingExercise({ pattern = "box", cycles = 4, onComplete }: BreathingExerciseProps) {
  const config = breathingPatterns[pattern];
  const [phase, setPhase] = useState<Phase>("inhale");
  const [cycle, setCycle] = useState(1);
  const [running, setRunning] = useState(false);
  const [countdown, setCountdown] = useState<number>(config.inhale);

  const phaseLabels: Record<Phase, string> = {
    inhale: "Breathe in",
    hold: "Hold",
    exhale: "Breathe out",
    holdAfter: "Hold",
    done: "Complete",
  };

  const phaseDurations: Record<Phase, number> = {
    inhale: config.inhale,
    hold: config.hold,
    exhale: config.exhale,
    holdAfter: config.holdAfter,
    done: 0,
  };

  useEffect(() => {
    if (!running || phase === "done") return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          const nextPhase = getNextPhase(phase);
          if (nextPhase === "done") {
            setRunning(false);
            onComplete?.();
          }
          setPhase(nextPhase);
          return phaseDurations[nextPhase] || 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, phase]);

  function getNextPhase(current: Phase): Phase {
    const order: Phase[] = ["inhale", "hold", "exhale", "holdAfter"];
    const idx = order.indexOf(current);
    let nextIdx = idx + 1;

    while (nextIdx < order.length && phaseDurations[order[nextIdx]!] === 0) {
      nextIdx++;
    }

    if (nextIdx >= order.length) {
      if (cycle >= cycles) return "done";
      setCycle((c) => c + 1);
      return "inhale";
    }
    return order[nextIdx]!;
  }

  const scale = phase === "inhale" ? 1.2 : phase === "exhale" ? 0.8 : 1;

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <h2 className="text-xl font-semibold">{config.name}</h2>
      <p className="text-sm text-muted-foreground">
        Cycle {Math.min(cycle, cycles)} of {cycles}
      </p>

      <div className="relative flex h-64 w-64 items-center justify-center">
        <motion.div
          animate={{ scale }}
          transition={{ duration: phaseDurations[phase] || 1, ease: "easeInOut" }}
          className={cn(
            "absolute h-48 w-48 rounded-full bg-primary/20",
            running && phase === "inhale" && "bg-primary/30",
            running && phase === "exhale" && "bg-primary/10"
          )}
        />
        <motion.div
          animate={{ scale: scale * 0.85 }}
          transition={{ duration: phaseDurations[phase] || 1, ease: "easeInOut" }}
          className="absolute h-36 w-36 rounded-full bg-primary/40 flex items-center justify-center"
        >
          <div className="text-center">
            <p className="text-lg font-medium">{phaseLabels[phase]}</p>
            {running && <p className="text-3xl font-light mt-1">{countdown}</p>}
          </div>
        </motion.div>
      </div>

      {phase === "done" ? (
        <p className="text-primary font-medium">Well done 🌿</p>
      ) : (
        <Button onClick={() => {
          if (!running) {
            setPhase("inhale");
            setCountdown(config.inhale);
            setCycle(1);
          }
          setRunning(!running);
        }} size="lg">
          {running ? "Pause" : "Start"}
        </Button>
      )}
    </div>
  );
}
