"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

export interface StreakStats {
  journalStreak: number;
  habitStreak: number;
  meditationCount: number;
  breathingCount: number;
}

interface StreakBadgesProps {
  stats: StreakStats;
  className?: string;
}

const BADGES = [
  { key: "journalStreak" as const, label: "Journal", icon: "📝", threshold: 3 },
  { key: "habitStreak" as const, label: "Habits", icon: "✓", threshold: 3 },
  { key: "meditationCount" as const, label: "Meditate", icon: "🧘", threshold: 5 },
  { key: "breathingCount" as const, label: "Breathe", icon: "🌬️", threshold: 5 },
];

export function StreakBadges({ stats, className }: StreakBadgesProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {BADGES.map(({ key, label, icon, threshold }) => {
        const value = stats[key];
        const earned = value >= threshold;
        return (
          <motion.div
            key={key}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all shadow-soft",
              earned
                ? "border-primary/30 bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground"
            )}
          >
            <span className="text-lg">{icon}</span>
            <div>
              <p className="font-semibold leading-none tabular-nums">{value}</p>
              <p className="text-[10px] opacity-80 mt-0.5">{label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function computeJournalStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const unique = [...new Set(dates.map((d) => d.split("T")[0]))].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < unique.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split("T")[0];
    if (unique[i] === expectedStr) streak++;
    else if (i === 0 && unique[0] !== expectedStr) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (unique[0] === yesterday.toISOString().split("T")[0]) {
        streak = 1;
        continue;
      }
      break;
    } else break;
  }
  return streak;
}
