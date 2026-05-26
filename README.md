# Anchor (stoic) — AI Wellness Platform

Talk or type your day → AI turns it into a beautiful journal, mood log, habits, and next actions — then guides you through breathing, meditation, and 30-day programs.

**Public brand:** Anchor · **Internal codename:** stoic

## Stack

- **App:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Framer Motion
- **Monorepo:** Turborepo with `apps/web`, `packages/ui`, `packages/ai`, `packages/db`, `packages/config`
- **Backend:** Supabase (Auth, Postgres, pgvector, Storage, RLS)
- **AI:** Groq (`llama-3.3-70b-versatile`) primary, NVIDIA NIM fallback; Groq Whisper for STT
- **Deploy:** Vercel-ready PWA

## Quick Start

### 1. Clone & install

```bash
cd stoic
npm install
```

### 2. Supabase setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Enable **pgvector** extension: Database → Extensions → search "vector" → enable
3. Run migrations:
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```
   Or paste SQL from `supabase/migrations/` into the SQL Editor, then run `supabase/seed/001_templates_and_programs.sql`
4. Enable Google OAuth (optional): Authentication → Providers → Google
5. Copy project URL, anon key, and service role key

### 3. Environment variables

```bash
cp .env.example apps/web/.env.local
```

Fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server only) |
| `GROQ_API_KEY` | Yes | From [console.groq.com](https://console.groq.com) |
| `NIM_API_KEY` | No | NVIDIA NIM fallback |
| `AI_PRIMARY_PROVIDER` | No | `groq` (default) or `nim` |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` for local dev |

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build

```bash
npm run build
```

## Project Structure

```
stoic/
├── apps/web/              # Next.js PWA
│   ├── app/
│   │   ├── (app)/         # Protected routes (home, journal, today, programs, calm, journey, profile)
│   │   ├── api/           # chat, transcribe, voice-journal
│   │   └── login/
│   └── public/manifest.json
├── packages/
│   ├── ui/                # Design system (chat, journal, mood, breathing, voice)
│   ├── ai/                # Groq/NIM providers, tools, companion, safety
│   ├── db/                # Supabase client, types, queries
│   └── config/            # Shared ESLint, TS, Tailwind
├── supabase/
│   ├── migrations/        # Schema + RLS + pgvector
│   └── seed/              # Templates + programs
├── services/voice/        # Phase 4: Piper/Whisper Docker
└── docs/
```

## Features

### Phase 1 — AI Core + Journal
- AI companion home (chat + voice)
- Voice/text → structured journal + action items
- Journal timeline, search, entry detail
- Mood check-in (1–5)
- Persistent memory (pgvector + summaries)
- Mobile bottom nav + desktop sidebar

### Phase 2 — Rituals + Calm
- Morning/evening rituals
- 18 guided journal templates
- Breathing exercises (box, 4-7-8, physiological sigh)
- Meditation timer + ambient presets
- Habits + streaks
- Today dashboard

### Phase 3 — Programs + Journey
- 30-day program engine
- 6 seed programs (Mindfulness, Gratitude, Journaling, Sleep, Digital Detox, Wellness Reset)
- Journey tab with mood trends + export (JSON/Markdown)

### Phase 4 — Voice OSS + Privacy
- Self-hosted Piper/Whisper Docker (`services/voice/`)
- Locked entries + app passcode
- Multimedia journal blocks (schema ready)

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel, set root to `apps/web` or use monorepo detection
3. Add all env vars from `.env.example`
4. Deploy

## License

MIT — see [LICENSE](LICENSE)
