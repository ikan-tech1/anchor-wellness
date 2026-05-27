export const tokens = {
  colors: {
    background: "var(--background)",
    foreground: "var(--foreground)",
    card: "var(--card)",
    cardForeground: "var(--card-foreground)",
    primary: "var(--primary)",
    primaryForeground: "var(--primary-foreground)",
    secondary: "var(--secondary)",
    muted: "var(--muted)",
    mutedForeground: "var(--muted-foreground)",
    accent: "var(--accent)",
    border: "var(--border)",
    sage: "#5a7d5e",
    anchor: "#8f7f68",
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    full: "9999px",
  },
  spacing: {
    1: "0.25rem", // 4px
    2: "0.5rem", // 8px
    3: "0.75rem", // 12px
    4: "1rem", // 16px
    6: "1.5rem", // 24px
    8: "2rem", // 32px
    12: "3rem", // 48px
    navHeight: "4.25rem",
    safeBottom: "env(safe-area-inset-bottom, 0px)",
  },
  typography: {
    display: "text-4xl md:text-5xl font-serif font-medium tracking-tight",
    h1: "text-3xl md:text-4xl font-serif font-medium tracking-tight",
    h2: "text-xl md:text-2xl font-semibold tracking-tight",
    h3: "text-lg font-semibold tracking-tight",
    body: "text-[15px] leading-relaxed",
    caption: "text-sm text-muted-foreground",
    overline: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
  },
  motion: {
    spring: { type: "spring" as const, stiffness: 300, damping: 30 },
    fade: { duration: 0.3 },
    page: { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } },
  },
} as const;

export const moodEmojis = ["😔", "😕", "😐", "🙂", "😊"] as const;
export const moodLabels = ["Very low", "Low", "Neutral", "Good", "Great"] as const;

export const breathingPatterns = {
  box: { name: "Box Breathing", inhale: 4, hold: 4, exhale: 4, holdAfter: 4 },
  "478": { name: "4-7-8 Relaxing", inhale: 4, hold: 7, exhale: 8, holdAfter: 0 },
  physiological_sigh: { name: "Physiological Sigh", inhale: 2, hold: 0, exhale: 6, holdAfter: 0 },
  calm: { name: "Calm Breath", inhale: 4, hold: 2, exhale: 6, holdAfter: 0 },
} as const;

export const ambientSounds = [
  { id: "silence", name: "Silence", icon: "🔇" },
  { id: "rain", name: "Rain", icon: "🌧️" },
  { id: "forest", name: "Forest", icon: "🌲" },
  { id: "ocean", name: "Ocean", icon: "🌊" },
  { id: "white_noise", name: "White Noise", icon: "📻" },
] as const;
