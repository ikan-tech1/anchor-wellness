import { getSql } from "../neon";
import type { JournalEntry, MoodCheckin } from "../types";
import type { Json } from "../types";

export async function getProfile(userId: string) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM profiles WHERE id = ${userId} LIMIT 1`;
  if (!rows[0]) throw new Error("Profile not found");
  return rows[0];
}

export async function getProfilePasscodeHash(userId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT app_passcode_hash FROM profiles WHERE id = ${userId} LIMIT 1
  `;
  return rows[0]?.app_passcode_hash as string | null | undefined;
}

export async function updateProfile(
  userId: string,
  updates: {
    display_name?: string | null;
    timezone?: string;
    onboarding_completed?: boolean;
    ai_consent_level?: string;
    app_passcode_hash?: string | null;
  }
) {
  const sql = getSql();
  const rows = await sql`
    UPDATE profiles SET
      display_name = COALESCE(${updates.display_name ?? null}, display_name),
      timezone = COALESCE(${updates.timezone ?? null}, timezone),
      onboarding_completed = COALESCE(${updates.onboarding_completed ?? null}, onboarding_completed),
      ai_consent_level = COALESCE(${updates.ai_consent_level ?? null}, ai_consent_level),
      app_passcode_hash = COALESCE(${updates.app_passcode_hash ?? null}, app_passcode_hash),
      updated_at = now()
    WHERE id = ${userId}
    RETURNING *
  `;
  return rows[0];
}

export async function getJournalEntries(
  userId: string,
  options?: { limit?: number; search?: string }
) {
  const sql = getSql();
  if (options?.search) {
    const pattern = `%${options.search}%`;
    const rows = await sql`
      SELECT * FROM journal_entries
      WHERE user_id = ${userId}
        AND (title ILIKE ${pattern} OR body_md ILIKE ${pattern})
      ORDER BY created_at DESC
      LIMIT ${options.limit ?? 50}
    `;
    return rows as JournalEntry[];
  }
  const rows = options?.limit
    ? await sql`
        SELECT * FROM journal_entries
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${options.limit}
      `
    : await sql`
        SELECT * FROM journal_entries
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
  return rows as JournalEntry[];
}

export async function getJournalEntry(entryId: string, userId?: string) {
  const sql = getSql();
  const entryRows = userId
    ? await sql`
        SELECT * FROM journal_entries WHERE id = ${entryId} AND user_id = ${userId} LIMIT 1
      `
    : await sql`SELECT * FROM journal_entries WHERE id = ${entryId} LIMIT 1`;
  if (!entryRows[0]) throw new Error("Journal entry not found");
  const entry = entryRows[0] as Record<string, unknown>;
  const blocks = await sql`
    SELECT * FROM journal_blocks WHERE entry_id = ${entryId} ORDER BY sort_order
  `;
  return { ...entry, journal_blocks: blocks } as JournalEntry & {
    journal_blocks: Record<string, unknown>[];
  };
}

export async function createJournalEntry(entry: {
  user_id: string;
  title: string;
  body_md?: string;
  mood_score?: number;
  tags?: string[];
  ritual_type?: string;
  source?: string;
  template_slug?: string;
}) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO journal_entries (
      user_id, title, body_md, mood_score, tags, ritual_type, source, template_slug
    ) VALUES (
      ${entry.user_id},
      ${entry.title},
      ${entry.body_md ?? ""},
      ${entry.mood_score ?? null},
      ${entry.tags ?? []},
      ${entry.ritual_type ?? null},
      ${entry.source ?? "manual"},
      ${entry.template_slug ?? null}
    )
    RETURNING *
  `;
  return rows[0];
}

export async function updateJournalEntry(
  entryId: string,
  updates: {
    title?: string;
    body_md?: string;
    mood_score?: number;
    tags?: string[];
    is_locked?: boolean;
  }
) {
  const sql = getSql();
  const rows = await sql`
    UPDATE journal_entries SET
      title = COALESCE(${updates.title ?? null}, title),
      body_md = COALESCE(${updates.body_md ?? null}, body_md),
      mood_score = COALESCE(${updates.mood_score ?? null}, mood_score),
      tags = COALESCE(${updates.tags ?? null}, tags),
      is_locked = COALESCE(${updates.is_locked ?? null}, is_locked),
      updated_at = now()
    WHERE id = ${entryId}
    RETURNING *
  `;
  return rows[0];
}

export async function deleteJournalEntry(entryId: string) {
  const sql = getSql();
  await sql`DELETE FROM journal_entries WHERE id = ${entryId}`;
}

export async function createJournalBlocks(
  blocks: Array<{
    entry_id: string;
    type: string;
    payload: Json;
    sort_order?: number;
  }>
) {
  const sql = getSql();
  const results = [];
  for (const block of blocks) {
    const rows = await sql`
      INSERT INTO journal_blocks (entry_id, type, payload, sort_order)
      VALUES (${block.entry_id}, ${block.type}, ${JSON.stringify(block.payload)}::jsonb, ${block.sort_order ?? 0})
      RETURNING *
    `;
    results.push(rows[0]);
  }
  return results;
}

export async function logMood(checkin: {
  user_id: string;
  score: number;
  note?: string;
}) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO mood_checkins (user_id, score, note)
    VALUES (${checkin.user_id}, ${checkin.score}, ${checkin.note ?? null})
    RETURNING *
  `;
  return rows[0] as MoodCheckin;
}

export async function getRecentMoods(userId: string, days = 7) {
  const sql = getSql();
  const since = new Date();
  since.setDate(since.getDate() - days);
  const rows = await sql`
    SELECT * FROM mood_checkins
    WHERE user_id = ${userId} AND logged_at >= ${since.toISOString()}
    ORDER BY logged_at DESC
  `;
  return rows;
}

export async function getHabitsWithLogs(userId: string) {
  const sql = getSql();
  const habits = await sql`
    SELECT * FROM habits WHERE user_id = ${userId} AND is_active = true
  `;
  const result = [];
  for (const habit of habits) {
    const logs = await sql`
      SELECT * FROM habit_logs WHERE habit_id = ${habit.id} ORDER BY completed_at DESC
    `;
    result.push({ ...habit, habit_logs: logs });
  }
  return result;
}

export async function getHabits(userId: string) {
  const sql = getSql();
  return sql`
    SELECT * FROM habits WHERE user_id = ${userId} AND is_active = true
  `;
}

export async function createHabit(habit: {
  user_id: string;
  name: string;
  icon?: string;
  cadence?: string;
}) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO habits (user_id, name, icon, cadence)
    VALUES (${habit.user_id}, ${habit.name}, ${habit.icon ?? "✨"}, ${habit.cadence ?? "daily"})
    RETURNING *
  `;
  return rows[0];
}

export async function logHabit(habitId: string, note?: string) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO habit_logs (habit_id, note) VALUES (${habitId}, ${note ?? null})
    RETURNING *
  `;
  return rows[0];
}

export async function getActivePrograms(userId: string) {
  const sql = getSql();
  const enrollments = await sql`
    SELECT pe.*, row_to_json(p.*) AS programs
    FROM program_enrollments pe
    JOIN programs p ON p.id = pe.program_id
    WHERE pe.user_id = ${userId} AND pe.status = 'active'
  `;
  return enrollments.map((row: Record<string, unknown>) => ({
    ...row,
    programs: row.programs,
  }));
}

export async function getPrograms(activeOnly = true) {
  const sql = getSql();
  return activeOnly
    ? sql`SELECT * FROM programs WHERE is_active = true ORDER BY title`
    : sql`SELECT * FROM programs ORDER BY title`;
}

export async function getProgramById(programId: string) {
  const sql = getSql();
  const rows = await sql`SELECT * FROM programs WHERE id = ${programId} LIMIT 1`;
  return rows[0];
}

export async function enrollInProgram(userId: string, programId: string) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO program_enrollments (user_id, program_id)
    VALUES (${userId}, ${programId})
    ON CONFLICT (user_id, program_id) DO UPDATE SET status = 'active', updated_at = now()
    RETURNING *
  `;
  return rows[0];
}

export async function getProgramDayContent(programId: string, dayNumber: number) {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM program_day_content
    WHERE program_id = ${programId} AND day_number = ${dayNumber}
    LIMIT 1
  `;
  return rows[0];
}

export async function insertProgramCheckin(checkin: {
  enrollment_id: string;
  day_number: number;
  responses: Json;
}) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO program_checkins (enrollment_id, day_number, responses)
    VALUES (${checkin.enrollment_id}, ${checkin.day_number}, ${JSON.stringify(checkin.responses)}::jsonb)
    RETURNING *
  `;
  return rows[0];
}

export async function advanceProgramDay(enrollmentId: string, nextDay: number) {
  const sql = getSql();
  await sql`
    UPDATE program_enrollments SET current_day = ${nextDay}, updated_at = now()
    WHERE id = ${enrollmentId}
  `;
}

export async function getProgramEnrollment(userId: string, programId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM program_enrollments
    WHERE user_id = ${userId} AND program_id = ${programId}
    LIMIT 1
  `;
  return rows[0];
}

export async function getActiveEnrollment(userId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM program_enrollments
    WHERE user_id = ${userId} AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return rows[0];
}

export async function getConversationSession(sessionId: string) {
  const sql = getSql();
  const sessions = await sql`
    SELECT * FROM conversation_sessions WHERE id = ${sessionId} LIMIT 1
  `;
  if (!sessions[0]) throw new Error("Session not found");
  const messages = await sql`
    SELECT * FROM messages WHERE session_id = ${sessionId} ORDER BY created_at
  `;
  return { ...sessions[0], messages };
}

export async function getOrCreateSession(userId: string) {
  const sql = getSql();
  const existing = await sql`
    SELECT * FROM conversation_sessions
    WHERE user_id = ${userId}
    ORDER BY last_message_at DESC
    LIMIT 1
  `;
  if (existing[0]) {
    const lastMsg = new Date(existing[0].last_message_at as string);
    const hoursSince = (Date.now() - lastMsg.getTime()) / (1000 * 60 * 60);
    if (hoursSince < 24) return existing[0];
  }
  const rows = await sql`
    INSERT INTO conversation_sessions (user_id, title)
    VALUES (${userId}, 'New conversation')
    RETURNING *
  `;
  return rows[0];
}

export async function createConversationSession(userId: string, title: string) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO conversation_sessions (user_id, title)
    VALUES (${userId}, ${title})
    RETURNING *
  `;
  return rows[0];
}

export async function saveMessage(message: {
  session_id: string;
  role: string;
  content: string;
  tool_calls?: Json | null;
}) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO messages (session_id, role, content, tool_calls)
    VALUES (
      ${message.session_id},
      ${message.role},
      ${message.content},
      ${message.tool_calls ? JSON.stringify(message.tool_calls) : null}::jsonb
    )
    RETURNING *
  `;
  await sql`
    UPDATE conversation_sessions SET last_message_at = now()
    WHERE id = ${message.session_id}
  `;
  return rows[0];
}

export async function getSessionMessages(sessionId: string, limit = 20) {
  const sql = getSql();
  return sql`
    SELECT role, content FROM messages
    WHERE session_id = ${sessionId}
    ORDER BY created_at ASC
    LIMIT ${limit}
  `;
}

export async function getMemories(userId: string, limit = 10) {
  const sql = getSql();
  return sql`
    SELECT * FROM memories
    WHERE user_id = ${userId}
    ORDER BY importance DESC
    LIMIT ${limit}
  `;
}

export async function saveMemory(memory: {
  user_id: string;
  type: string;
  content: string;
  importance?: number;
}) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO memories (user_id, type, content, importance)
    VALUES (${memory.user_id}, ${memory.type}, ${memory.content}, ${memory.importance ?? 5})
    RETURNING *
  `;
  return rows[0];
}

export async function getJournalTemplates() {
  const sql = getSql();
  return sql`SELECT * FROM journal_templates ORDER BY category`;
}

export async function getWeeklyInsights(userId: string) {
  const sql = getSql();
  return sql`
    SELECT * FROM weekly_insights
    WHERE user_id = ${userId}
    ORDER BY week_start DESC
    LIMIT 4
  `;
}

export async function upsertWeeklyInsight(insight: {
  user_id: string;
  week_start: string;
  summary_md: string;
  patterns: Json;
}) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO weekly_insights (user_id, week_start, summary_md, patterns)
    VALUES (
      ${insight.user_id},
      ${insight.week_start},
      ${insight.summary_md},
      ${JSON.stringify(insight.patterns)}::jsonb
    )
    ON CONFLICT (user_id, week_start) DO UPDATE SET
      summary_md = EXCLUDED.summary_md,
      patterns = EXCLUDED.patterns
    RETURNING *
  `;
  return rows[0];
}

export async function logBreathingSession(session: {
  user_id: string;
  pattern: string;
  cycles?: number;
}) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO breathing_sessions (user_id, pattern, cycles)
    VALUES (${session.user_id}, ${session.pattern}, ${session.cycles ?? 4})
    RETURNING *
  `;
  return rows[0];
}

export async function logMeditationSession(session: {
  user_id: string;
  duration_sec: number;
  type?: string;
  ambient?: string;
}) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO meditation_sessions (user_id, duration_sec, type, ambient)
    VALUES (
      ${session.user_id},
      ${session.duration_sec},
      ${session.type ?? "timer"},
      ${session.ambient ?? null}
    )
    RETURNING *
  `;
  return rows[0];
}

export async function findHabitByName(userId: string, namePattern: string) {
  const sql = getSql();
  const pattern = `%${namePattern}%`;
  const rows = await sql`
    SELECT id FROM habits
    WHERE user_id = ${userId} AND name ILIKE ${pattern}
    LIMIT 1
  `;
  return rows[0];
}

export async function getTodayPageData(userId: string, today: string) {
  const sql = getSql();
  const todayStart = `${today}T00:00:00`;
  const [habits, recentEntries, morningEntry, eveningEntry, allLogs, allEntryDates] =
    await Promise.all([
      sql`SELECT * FROM habits WHERE user_id = ${userId} AND is_active = true`,
      sql`
        SELECT * FROM journal_entries
        WHERE user_id = ${userId}
        ORDER BY created_at DESC LIMIT 3
      `,
      sql`
        SELECT id FROM journal_entries
        WHERE user_id = ${userId} AND ritual_type = 'morning' AND created_at >= ${todayStart}
        LIMIT 1
      `,
      sql`
        SELECT id FROM journal_entries
        WHERE user_id = ${userId} AND ritual_type = 'evening' AND created_at >= ${todayStart}
        LIMIT 1
      `,
      sql`
        SELECT hl.* FROM habit_logs hl
        JOIN habits h ON h.id = hl.habit_id
        WHERE h.user_id = ${userId}
      `,
      sql`
        SELECT created_at FROM journal_entries
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `,
    ]);
  return {
    habits,
    recentEntries,
    morningEntry: morningEntry[0],
    eveningEntry: eveningEntry[0],
    habitLogs: allLogs,
    entryDates: allEntryDates,
  };
}

export async function getJourneyStats(userId: string, sinceIso: string) {
  const sql = getSql();
  const [habitLogs, moods, entries, meditations, breathing] = await Promise.all([
    sql`
      SELECT hl.completed_at FROM habit_logs hl
      JOIN habits h ON h.id = hl.habit_id
      WHERE h.user_id = ${userId} AND hl.completed_at >= ${sinceIso}
    `,
    sql`
      SELECT score, logged_at FROM mood_checkins
      WHERE user_id = ${userId} AND logged_at >= ${sinceIso}
      ORDER BY logged_at
    `,
    sql`
      SELECT created_at FROM journal_entries
      WHERE user_id = ${userId} AND created_at >= ${sinceIso}
    `,
    sql`
      SELECT completed_at FROM meditation_sessions
      WHERE user_id = ${userId} AND completed_at >= ${sinceIso}
    `,
    sql`
      SELECT completed_at FROM breathing_sessions
      WHERE user_id = ${userId} AND completed_at >= ${sinceIso}
    `,
  ]);
  return { habitLogs, moods, entries, meditations, breathing };
}
