"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("anchor-theme") as Theme | null;
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (t: Theme) => {
      const next =
        t === "system" ? (media.matches ? "dark" : "light") : t;
      setResolved(next);
      root.classList.toggle("dark", next === "dark");
    };
    apply(theme);
    const onChange = () => theme === "system" && apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    localStorage.setItem("anchor-theme", next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeToggle() {
  const { theme, setTheme, resolved } = useTheme();
  const cycle = () => {
    const order: Theme[] = ["light", "dark", "system"];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]!);
  };
  const icon = resolved === "dark" ? "🌙" : "☀️";
  return (
    <button
      type="button"
      onClick={cycle}
      className="rounded-xl border border-border bg-card px-3 py-2 text-sm hover:bg-accent transition-colors"
      aria-label={`Theme: ${theme}. Click to change.`}
    >
      {icon} <span className="capitalize">{theme}</span>
    </button>
  );
}
