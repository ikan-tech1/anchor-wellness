# Anchor (stoic) — AI Wellness Platform

Talk or type your day → AI turns it into a beautiful journal, mood log, habits, and next actions — then guides you through breathing, meditation, and 30-day programs.

**Public brand:** Anchor · **Internal codename:** stoic

## Stack

- **App:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Framer Motion
- **Monorepo:** Turborepo with `apps/web`, `packages/ui`, `packages/ai`, `packages/db`, `packages/config`
- **Auth:** Clerk (Google + email, free tier)
- **Database:** Neon Postgres (pgvector for AI memory)
- **AI:** Groq (`llama-3.3-70b-versatile`) primary, NVIDIA NIM fallback; Groq Whisper for STT
- **Deploy:** Vercel-ready PWA

## Quick Start

### 1. Clone & install

```bash
cd stoic
npm install
```

### 2. Clerk setup

1. Create a free app at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Enable **Email** and **Google** sign-in under User & Authentication → Social connections
3. Copy **Publishable key** and **Secret key** from API Keys

### 3. Neon setup

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the **connection string** (`DATABASE_URL`)
3. In the Neon SQL editor, run:
   - `neon/migrations/001_initial_schema.sql`
   - `supabase/seed/001_templates_and_programs.sql` (still valid SQL)
   - `supabase/seed/002_full_program_days.sql`

### 4. Environment variables

```bash
cp .env.example apps/web/.env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (server only) |
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `GROQ_API_KEY` | Yes | From [console.groq.com](https://console.groq.com) |
| `NIM_API_KEY` | No | NVIDIA NIM fallback |
| `AI_PRIMARY_PROVIDER` | No | `groq` (default) or `nim` |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` for local dev |
| `VOICE_SERVICE_URL` | No | Self-hosted voice Docker (default `http://localhost:8765`) |

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Build

```bash
npm run build
```

### 7. Optional: self-hosted voice (Phase 4)

```bash
cd services/voice
docker compose up
```

Uses faster-whisper STT + Piper TTS. Point `VOICE_SERVICE_URL` at the service; `/api/voice-local` proxies transcription.

## Project Structure

```
stoic/
├── apps/web/              # Next.js PWA
│   ├── app/
│   │   ├── (app)/         # Protected routes
│   │   └── api/           # chat, transcribe, voice-journal, insights, voice-local
│   └── public/manifest.json
├── packages/
│   ├── ui/                # Design system + theme, passcode, streaks, ambient audio
│   ├── ai/                # Groq/NIM providers, tools, companion, safety
│   └── db/                # Neon serverless driver, types, queries
├── neon/migrations/       # Postgres schema (Clerk user IDs)
├── supabase/seed/         # Templates + full 30-day programs (run on Neon)
├── scripts/               # generate-program-days.mjs
├── services/voice/        # Piper/Whisper Docker
└── docs/
```

## Features

### Phase 1 — AI Core + Journal
- AI companion home (chat + voice) with quick actions
- Desktop split-pane live journal preview
- Tool calling: journal, mood, habits, breathing, meditation, programs, search, insights, memory
- Voice → structured journal + action items (Groq Whisper)
- Journal timeline, search, entry detail, action-item checkboxes
- Mood check-in (1–5)
- Persistent memory (pgvector facts + session context)
- Crisis keyword safety routing
- Mobile bottom nav + desktop sidebar
- Groq + NIM provider swap

### Phase 2 — Rituals + Calm
- Morning/evening ritual flows on Today dashboard
- 18 guided journal templates (gratitude, CBT, therapy prep, dreams, anxiety, etc.)
- Breathing exercises with animated circle (box, 4-7-8, physiological sigh, calm)
- Pattern + cycle picker on breathe page
- Meditation timer with ambient soundscapes (Web Audio)
- Session logging for breathing + meditation
- Habits + streak badges on Today and Journey
- Today dashboard (mood, rituals, habits, recent journal)

### Phase 3 — Programs + Journey
- 30-day program engine with enrollments and progress rings
- **6 seed programs, each with 30 fully populated days:**
  - Mindfulness 30, Gratitude 30, Journaling Habit 30
  - Sleep Reset 30, Digital Detox 30, Wellness Reset 30
- Program check-ins with journal prompts + meditation links
- Journey tab: mood trends, calendar heatmap, on-this-day, streak stats
- AI weekly review generation (`POST /api/insights/weekly`)
- Export journal (Markdown + JSON)

### Phase 4 — Voice OSS + Privacy
- Self-hosted Piper/Whisper Docker (`services/voice/`)
- `/api/voice-local` proxy for OSS transcription
- Locked entries + app passcode gate (session unlock)
- Private entries (excluded from AI retrieval)
- Photo blocks in journal (Supabase Storage `journal-media` bucket)
- Dark mode + system theme toggle
- PWA manifest + reduced-motion support

## Regenerate program seed data

```bash
node scripts/generate-program-days.mjs
```

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel (monorepo: root `apps/web` or auto-detect)
3. Add all env vars from `.env.example`
4. Run Supabase migrations + seeds on your project
5. Deploy

## License

MIT — see [LICENSE](LICENSE)
