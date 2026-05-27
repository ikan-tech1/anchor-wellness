"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

export function ProgressRing({
  value,
  max = 100,
  size = 72,
  strokeWidth = 4,
  className,
  label,
  sublabel,
  icon,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference * (1 - progress);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-primary"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {icon ? (
          <span className="text-2xl">{icon}</span>
        ) : label ? (
          <>
            <span className="text-sm font-semibold tabular-nums">{label}</span>
            {sublabel && (
              <span className="text-[10px] text-muted-foreground">{sublabel}</span>
            )}
          </>
        ) : (
          <span className="text-xs font-medium tabular-nums">
            {Math.round(progress * 100)}%
          </span>
        )}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 100, className, showLabel }: ProgressBarProps) {
  const progress = Math.min(Math.max(value / max, 0), 1) * 100;
  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="tabular-nums">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-primary"
        />
      </div>
    </div>
  );
}
