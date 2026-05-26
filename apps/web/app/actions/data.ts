"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import type { Json } from "@anchor/db/types";
import {
  ensureProfile,
  getProfile,
  getProfilePasscodeHash,
  updateProfile,
  getJournalEntries,
  getJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  createJournalBlocks,
  logMood,
  getHabits,
  createHabit,
  logHabit,
  getPrograms,
  getActivePrograms,
  getProgramById,
  enrollInProgram,
  getProgramEnrollment,
  getProgramDayContent,
  insertProgramCheckin,
  advanceProgramDay,
  getJournalTemplates,
  logBreathingSession,
  logMeditationSession,
  getTodayPageData,
  getJourneyStats,
} from "@anchor/db";

async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await currentUser();
  await ensureProfile(
    userId,
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? null
  );
  return userId;
}

export async function fetchProfilePasscodeHash() {
  const userId = await requireUserId();
  return getProfilePasscodeHash(userId);
}

export async function fetchProfile() {
  const userId = await requireUserId();
  return getProfile(userId);
}

export async function saveProfile(updates: {
  display_name?: string | null;
  timezone?: string;
  onboarding_completed?: boolean;
  ai_consent_level?: string;
  app_passcode_hash?: string | null;
}) {
  const userId = await requireUserId();
  return updateProfile(userId, updates);
}

export async function fetchJournalEntries(options?: {
  limit?: number;
  search?: string;
}) {
  const userId = await requireUserId();
  return getJournalEntries(userId, options);
}

export async function fetchJournalEntry(entryId: string) {
  const userId = await requireUserId();
  return getJournalEntry(entryId, userId);
}

export async function saveJournalEntry(entry: {
  title: string;
  body_md?: string;
  mood_score?: number;
  tags?: string[];
  ritual_type?: string;
  source?: string;
  template_slug?: string;
}) {
  const userId = await requireUserId();
  const created = await createJournalEntry({ ...entry, user_id: userId });
  if (entry.mood_score) {
    await logMood({ user_id: userId, score: entry.mood_score });
  }
  return created;
}

export async function patchJournalEntry(
  entryId: string,
  updates: { title?: string; body_md?: string; mood_score?: number; tags?: string[] }
) {
  await requireUserId();
  return updateJournalEntry(entryId, updates);
}

export async function removeJournalEntry(entryId: string) {
  await requireUserId();
  await deleteJournalEntry(entryId);
}

export async function addJournalBlocks(
  blocks: Array<{
    entry_id: string;
    type: string;
    payload: Json;
    sort_order?: number;
  }>
) {
  await requireUserId();
  return createJournalBlocks(blocks);
}

export async function recordMood(score: number, note?: string) {
  const userId = await requireUserId();
  return logMood({ user_id: userId, score, note });
}

export async function fetchHabits() {
  const userId = await requireUserId();
  return getHabits(userId);
}

export async function addHabit(name: string, icon?: string) {
  const userId = await requireUserId();
  return createHabit({ user_id: userId, name, icon });
}

export async function completeHabit(habitId: string, note?: string) {
  await requireUserId();
  return logHabit(habitId, note);
}

export async function fetchPrograms() {
  await requireUserId();
  return getPrograms(true);
}

export async function fetchProgramsPageData() {
  const userId = await requireUserId();
  const programs = await getPrograms(true);
  const { getSql } = await import("@anchor/db");
  const sql = getSql();
  const enrollmentRows = await sql`
    SELECT * FROM program_enrollments
    WHERE user_id = ${userId} AND status = 'active'
  `;
  const programMap = new Map(
    programs.map((p) => [p.id as string, p])
  );
  return {
    programs,
    enrollments: enrollmentRows.map((e) => ({
      ...e,
      programs: programMap.get(e.program_id as string),
    })),
  };
}

export async function fetchProgramEnrollments() {
  const userId = await requireUserId();
  const { getActivePrograms } = await import("@anchor/db");
  return getActivePrograms(userId);
}

export async function joinProgram(programId: string) {
  const userId = await requireUserId();
  return enrollInProgram(userId, programId);
}

export async function fetchProgramDetail(programId: string) {
  const userId = await requireUserId();
  const [program, enrollment] = await Promise.all([
    getProgramById(programId),
    getProgramEnrollment(userId, programId),
  ]);
  const dayContent = enrollment
    ? await getProgramDayContent(programId, enrollment.current_day as number)
    : null;
  return { program, enrollment, dayContent };
}

export async function submitProgramCheckin(
  enrollmentId: string,
  dayNumber: number,
  responses: Record<string, unknown>,
  durationDays?: number
) {
  await requireUserId();
  await insertProgramCheckin({
    enrollment_id: enrollmentId,
    day_number: dayNumber,
    responses: responses as Json,
  });
  const nextDay = dayNumber + 1;
  const { getSql } = await import("@anchor/db");
  const sql = getSql();
  const status =
    durationDays && nextDay > durationDays ? "completed" : "active";
  await sql`
    UPDATE program_enrollments SET
      current_day = ${nextDay},
      status = ${status},
      updated_at = now()
    WHERE id = ${enrollmentId}
  `;
}

export async function fetchJourneyPageData() {
  const userId = await requireUserId();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();
  const monthStart = new Date();
  monthStart.setDate(1);

  const { getSql, getWeeklyInsights } = await import("@anchor/db");
  const sql = getSql();

  const [moods, entries, insights, monthEntries, stats] = await Promise.all([
    sql`
      SELECT score, logged_at FROM mood_checkins
      WHERE user_id = ${userId} AND logged_at >= ${sinceIso}
      ORDER BY logged_at
    `,
    sql`
      SELECT id, title, body_md, created_at, mood_score, tags FROM journal_entries
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `,
    getWeeklyInsights(userId),
    sql`
      SELECT created_at FROM journal_entries
      WHERE user_id = ${userId} AND created_at >= ${monthStart.toISOString()}
    `,
    getJourneyStats(userId, sinceIso),
  ]);

  return { moods, entries, insights, monthEntries, stats };
}

export async function exportAllJournalEntries() {
  const userId = await requireUserId();
  return getJournalEntries(userId);
}

export async function fetchTemplates() {
  await requireUserId();
  return getJournalTemplates();
}

export async function recordBreathing(pattern: string, cycles?: number) {
  const userId = await requireUserId();
  return logBreathingSession({ user_id: userId, pattern, cycles });
}

export async function recordMeditation(durationSec: number, ambient?: string) {
  const userId = await requireUserId();
  return logMeditationSession({
    user_id: userId,
    duration_sec: durationSec,
    ambient,
  });
}

export async function fetchTodayData(today: string) {
  const userId = await requireUserId();
  return getTodayPageData(userId, today);
}

export async function fetchJourneyStats(sinceIso: string) {
  const userId = await requireUserId();
  return getJourneyStats(userId, sinceIso);
}

export async function fetchTemplateBySlug(slug: string) {
  await requireUserId();
  const { getSql } = await import("@anchor/db");
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM journal_templates WHERE slug = ${slug} LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function updateJournalEntryFull(
  entryId: string,
  updates: {
    title?: string;
    body_md?: string;
    mood_score?: number;
    is_locked?: boolean;
    is_private?: boolean;
  }
) {
  await requireUserId();
  const { getSql } = await import("@anchor/db");
  const sql = getSql();
  await sql`
    UPDATE journal_entries SET
      title = COALESCE(${updates.title ?? null}, title),
      body_md = COALESCE(${updates.body_md ?? null}, body_md),
      mood_score = COALESCE(${updates.mood_score ?? null}, mood_score),
      is_locked = COALESCE(${updates.is_locked ?? null}, is_locked),
      is_private = COALESCE(${updates.is_private ?? null}, is_private),
      ai_retrieval_allowed = CASE
        WHEN ${updates.is_private ?? null} IS NOT NULL THEN NOT ${updates.is_private}
        ELSE ai_retrieval_allowed
      END,
      updated_at = now()
    WHERE id = ${entryId}
  `;
}

export async function updateJournalBlock(
  blockId: string,
  payload: Record<string, unknown>
) {
  await requireUserId();
  const { getSql } = await import("@anchor/db");
  const sql = getSql();
  await sql`
    UPDATE journal_blocks SET payload = ${JSON.stringify(payload)}::jsonb
    WHERE id = ${blockId}
  `;
}

export async function addJournalImageBlock(
  entryId: string,
  url: string,
  sortOrder: number
) {
  await requireUserId();
  return createJournalBlocks([
    {
      entry_id: entryId,
      type: "image",
      payload: { url },
      sort_order: sortOrder,
    },
  ]);
}
