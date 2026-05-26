# Design System

## Brand: Anchor

Soft neutral palette, generous whitespace, card-based modules. Mobile-first with bottom nav; desktop uses sidebar.

## Tokens

Defined in `packages/ui/src/tokens.ts` and `packages/ui/src/globals.css`:

- **Colors:** anchor (warm neutrals), sage (green accent), semantic CSS variables
- **Radius:** sm 0.5rem → xl 1.25rem
- **Motion:** Framer Motion spring (stiffness 300, damping 30)

## Components

| Component | File | Usage |
|-----------|------|-------|
| BottomNav / SidebarNav | bottom-nav.tsx | App navigation |
| ChatUI | chat-ui.tsx | AI companion |
| VoiceRecorder | voice-recorder.tsx | Push-to-talk journal |
| JournalEditor / JournalCard | journal-editor.tsx | CRUD + timeline |
| MoodPicker / MoodTrend | mood-picker.tsx | Check-in + charts |
| BreathingExercise | breathing-exercise.tsx | Animated breathing |
| MeditationTimer | meditation-timer.tsx | Timer + ambient |
| Button, Card, Input | button/card/input.tsx | Primitives |

## Dark Mode

CSS variables switch via `.dark` class on `<html>`. Toggle can be added in profile settings.

## Motion Rules

- Page content: fade-in 0.3s
- Breathing circle: scale animation synced to phase duration
- Nav indicator: layoutId spring transition
- Respect `prefers-reduced-motion` (add media query as needed)
