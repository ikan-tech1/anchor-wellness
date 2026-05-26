"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { ambientSounds } from "../tokens";
import { Play, Pause, RotateCcw } from "lucide-react";

interface MeditationTimerProps {
  durationSec?: number;
  ambient?: string;
  onComplete?: (durationSec: number) => void;
}

export function MeditationTimer({ durationSec = 300, ambient = "silence", onComplete }: MeditationTimerProps) {
  const [remaining, setRemaining] = useState(durationSec);
  const [running, setRunning] = useState(false);
  const [selectedAmbient, setSelectedAmbient] = useState(ambient);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="relative h-56 w-56">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="4" />
          <motion.circle
            cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progress * 283} 283`}
            className="text-primary"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-light tabular-nums">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {ambientSounds.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedAmbient(s.id)}
            className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${
              selectedAmbient === s.id ? "border-primary bg-primary/10 text-primary" : "border-border"
            }`}
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="icon" onClick={() => { setRemaining(durationSec); setRunning(false); }}>
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button size="lg" onClick={() => setRunning(!running)}>
          {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          {running ? "Pause" : remaining === 0 ? "Restart" : "Start"}
        </Button>
      </div>
    </div>
  );
}
