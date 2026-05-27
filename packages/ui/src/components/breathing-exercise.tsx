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

  const scale = phase === "inhale" ? 1.25 : phase === "exhale" ? 0.75 : 1;
  const duration = phaseDurations[phase] || 1;

  return (
    <div className="flex flex-col items-center gap-10 py-8">
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          Cycle {Math.min(cycle, cycles)} of {cycles}
        </p>
      </div>

      <div className="relative flex h-72 w-72 items-center justify-center">
        <motion.div
          animate={{ scale: running ? scale * 1.15 : 1, opacity: running ? 0.5 : 0.3 }}
          transition={{ duration, ease: "easeInOut" }}
          className="absolute h-56 w-56 rounded-full bg-primary/10"
        />
        <motion.div
          animate={{ scale: running ? scale : 1 }}
          transition={{ duration, ease: "easeInOut" }}
          className={cn(
            "absolute h-44 w-44 rounded-full flex items-center justify-center shadow-elevated",
            running && phase === "inhale" && "bg-primary/25",
            running && phase === "exhale" && "bg-primary/15",
            !running && "bg-primary/20"
          )}
        >
          <div className="text-center">
            <p className="text-lg font-medium">{phaseLabels[phase]}</p>
            {running && phase !== "done" && (
              <motion.p
                key={countdown}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-serif text-5xl font-light mt-2 tabular-nums"
              >
                {countdown}
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>

      {phase === "done" ? (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-primary font-medium text-lg"
        >
          Well done 🌿
        </motion.p>
      ) : (
        <Button
          onClick={() => {
            if (!running) {
              setPhase("inhale");
              setCountdown(config.inhale);
              setCycle(1);
            }
            setRunning(!running);
          }}
          size="lg"
          className="min-w-[140px]"
        >
          {running ? "Pause" : "Start"}
        </Button>
      )}
    </div>
  );
}
