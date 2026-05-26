# Neon database setup

1. Create a Neon project and copy `DATABASE_URL`.
2. Run `migrations/001_initial_schema.sql` in the Neon SQL editor.
3. Run seed files from `../supabase/seed/` in order (templates, then program days).

Profiles are created automatically on first sign-in via Clerk (`ensureProfile`).
