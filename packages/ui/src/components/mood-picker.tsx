"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { moodEmojis, moodLabels } from "../tokens";

interface MoodPickerProps {
  value?: number;
  onChange: (score: number) => void;
  size?: "sm" | "md" | "lg";
}

export function MoodPicker({ value, onChange, size = "md" }: MoodPickerProps) {
  const sizes = { sm: "text-2xl", md: "text-4xl", lg: "text-5xl" };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-3">
        {moodEmojis.map((emoji, i) => {
          const score = i + 1;
          const selected = value === score;
          return (
            <motion.button
              key={score}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(score)}
              className={cn(
                sizes[size],
                "rounded-2xl p-2 transition-all",
                selected ? "bg-primary/15 ring-2 ring-primary scale-110" : "opacity-60 hover:opacity-100"
              )}
            >
              {emoji}
            </motion.button>
          );
        })}
      </div>
      {value && (
        <p className="text-sm text-muted-foreground">{moodLabels[value - 1]}</p>
      )}
    </div>
  );
}

interface MoodTrendProps {
  data: Array<{ date: string; score: number }>;
}

export function MoodTrend({ data }: MoodTrendProps) {
  if (!data.length) return null;
  const maxScore = 5;

  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.score / maxScore) * 100}%` }}
            className="w-full rounded-t-md bg-primary/60 min-h-[4px]"
          />
          <span className="text-[10px] text-muted-foreground">
            {new Date(d.date).toLocaleDateString(undefined, { weekday: "narrow" })}
          </span>
        </div>
      ))}
    </div>
  );
}
