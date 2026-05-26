# Architecture

## Overview

Anchor is a Turborepo monorepo with a Next.js 15 PWA frontend and shared packages for UI, AI, and database access. All user data lives in Supabase Postgres with Row Level Security.

## Data Flow

```
User (browser)
  → Next.js App Router (apps/web)
    → API Routes (/api/chat, /api/transcribe, /api/voice-journal)
      → @anchor/ai (Groq/NIM, tools, memory)
      → @anchor/db (Supabase client)
        → Supabase Postgres + pgvector
```

## Auth

- Supabase Auth with email/password and Google OAuth
- Middleware protects `(app)/*` routes
- Profile auto-created via `handle_new_user()` trigger

## AI Layer

- **Companion:** System prompt + context (memories, mood, active program)
- **Tools:** 10 function-calling tools (journal, mood, habits, breathing, programs, search, insights, memory)
- **Voice pipeline:** MediaRecorder → Whisper STT → LLM structuring → journal + action items
- **Memory:** `memories` table with pgvector embeddings; consent levels in profile
- **Safety:** Crisis keyword detection with 988 routing

## Key Tables

See `supabase/migrations/001_initial_schema.sql` for full schema. All tables use RLS with `auth.uid() = user_id`.

## Packages

| Package | Purpose |
|---------|---------|
| `@anchor/ui` | Design system, Framer Motion, mobile-first components |
| `@anchor/ai` | LLM providers, tool schemas, companion logic |
| `@anchor/db` | Supabase types, browser/server clients, queries |
| `@anchor/config` | Shared ESLint, TypeScript, Tailwind configs |
