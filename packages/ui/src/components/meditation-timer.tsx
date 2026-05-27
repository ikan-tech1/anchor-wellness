"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { ambientSounds } from "../tokens";
import { playAmbient, stopAmbient } from "../lib/ambient-audio";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "../lib/utils";

interface MeditationTimerProps {
  durationSec?: number;
  ambient?: string;
  onComplete?: (durationSec: number) => void;
}

export function MeditationTimer({
  durationSec = 300,
  ambient = "silence",
  onComplete,
}: MeditationTimerProps) {
  const [remaining, setRemaining] = useState(durationSec);
  const [running, setRunning] = useState(false);
  const [selectedAmbient, setSelectedAmbient] = useState(ambient);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) playAmbient(selectedAmbient);
    else stopAmbient();
    return () => stopAmbient();
  }, [running, selectedAmbient]);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            onComplete?.(durationSec);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, remaining, durationSec, onComplete]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = 1 - remaining / durationSec;
  const circumference = 2 * Math.PI * 45;

  return (
    <div className="flex flex-col items-center gap-10 py-8">
      <div className="relative h-60 w-60">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth="3"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-primary"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-5xl font-light tabular-nums tracking-tight">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap justify-center max-w-sm">
        {ambientSounds.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedAmbient(s.id)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-medium border transition-all touch-target",
              selectedAmbient === s.id
                ? "border-primary bg-primary/10 text-primary shadow-soft"
                : "border-border hover:border-primary/30 hover:bg-accent/50"
            )}
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setRemaining(durationSec);
            setRunning(false);
          }}
          aria-label="Reset timer"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button size="lg" onClick={() => setRunning(!running)} className="min-w-[120px]">
          {running ? (
            <>
              <Pause className="h-5 w-5 mr-2" /> Pause
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              {remaining === 0 ? "Restart" : "Start"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
