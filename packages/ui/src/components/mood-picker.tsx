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
  const sizes = { sm: "text-2xl p-2", md: "text-4xl p-3", lg: "text-5xl p-4" };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 sm:gap-3">
        {moodEmojis.map((emoji, i) => {
          const score = i + 1;
          const selected = value === score;
          return (
            <motion.button
              key={score}
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={() => onChange(score)}
              aria-label={moodLabels[i]}
              aria-pressed={selected}
              className={cn(
                sizes[size],
                "rounded-2xl transition-all touch-target",
                selected
                  ? "bg-primary/15 ring-2 ring-primary scale-110 shadow-soft"
                  : "opacity-55 hover:opacity-100 hover:bg-secondary/80"
              )}
            >
              {emoji}
            </motion.button>
          );
        })}
      </div>
      {value ? (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-muted-foreground"
        >
          {moodLabels[value - 1]}
        </motion.p>
      ) : (
        <p className="text-sm text-muted-foreground">How are you feeling?</p>
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
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.score / maxScore) * 100}%` }}
            transition={{ duration: 0.5, delay: i * 0.03 }}
            className="w-full rounded-t-lg bg-gradient-to-t from-primary/40 to-primary/70 min-h-[6px]"
          />
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {new Date(d.date).toLocaleDateString(undefined, { weekday: "narrow" })}
          </span>
        </div>
      ))}
    </div>
  );
}
