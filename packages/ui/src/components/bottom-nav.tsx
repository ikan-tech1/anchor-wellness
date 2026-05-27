"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, BookOpen, Sun, Sparkles, User, TrendingUp } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/today", label: "Today", icon: Sun },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/programs", label: "Programs", icon: Sparkles },
  { href: "/journey", label: "Journey", icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-card/90 backdrop-blur-xl safe-bottom md:hidden"
    >
      <div className="mx-auto flex h-[4.25rem] max-w-lg items-stretch justify-around px-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-w-[52px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors touch-target",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-x-2 top-1 h-8 rounded-xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn("relative h-5 w-5", active && "stroke-[2.25]")} />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:border-border/80 md:bg-card/60 md:backdrop-blur-sm">
      <div className="border-b border-border/60 px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-lg">
            ⚓
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Anchor</h1>
            <p className="text-xs text-muted-foreground">Your wellness companion</p>
          </div>
        </div>
      </div>
      <nav aria-label="Sidebar navigation" className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all touch-target",
                active
                  ? "bg-primary/12 text-primary shadow-soft"
                  : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn("h-5 w-5", active && "stroke-[2.25]")} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/60 p-4">
        <p className="px-4 text-xs text-muted-foreground">
          Breathe. Reflect. Grow.
        </p>
      </div>
    </aside>
  );
}
