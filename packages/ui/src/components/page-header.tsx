"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex items-start justify-between gap-4", className)}
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        {description && (
          <p className="text-base text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.header>
  );
}

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  fullBleed?: boolean;
}

export function PageShell({ children, className, fullBleed }: PageShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={cn(
        fullBleed ? "min-h-full" : "space-y-8 p-4 md:p-8",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
