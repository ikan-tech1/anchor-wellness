import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, JournalEntry, MoodCheckin } from "./types";

type Client = SupabaseClient<Database>;

export async function getProfile(client: Client, userId: string) {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function getJournalEntries(
  client: Client,
  userId: string,
  options?: { limit?: number; search?: string }
) {
  let query = client
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (options?.search) {
    query = query.or(
      `title.ilike.%${options.search}%,body_md.ilike.%${options.search}%`
    );
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as JournalEntry[];
}

export async function getJournalEntry(client: Client, entryId: string) {
  const { data, error } = await client
    .from("journal_entries")
    .select("*, journal_blocks(*)")
    .eq("id", entryId)
    .single();
  if (error) throw error;
  return data;
}

export async function createJournalEntry(
  client: Client,
  entry: Database["public"]["Tables"]["journal_entries"]["Insert"]
) {
  const { data, error } = await client
    .from("journal_entries")
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateJournalEntry(
  client: Client,
  entryId: string,
  updates: Database["public"]["Tables"]["journal_entries"]["Update"]
) {
  const { data, error } = await client
    .from("journal_entries")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", entryId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteJournalEntry(client: Client, entryId: string) {
  const { error } = await client.from("journal_entries").delete().eq("id", entryId);
  if (error) throw error;
}

export async function createJournalBlocks(
  client: Client,
  blocks: Database["public"]["Tables"]["journal_blocks"]["Insert"][]
) {
  const { data, error } = await client.from("journal_blocks").insert(blocks).select();
  if (error) throw error;
  return data;
}

export async function logMood(
  client: Client,
  checkin: Database["public"]["Tables"]["mood_checkins"]["Insert"]
) {
  const { data, error } = await client
    .from("mood_checkins")
    .insert(checkin)
    .select()
    .single();
  if (error) throw error;
  return data as MoodCheckin;
}

export async function getRecentMoods(client: Client, userId: string, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await client
    .from("mood_checkins")
    .select("*")
    .eq("user_id", userId)
    .gte("logged_at", since.toISOString())
    .order("logged_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getHabitsWithLogs(client: Client, userId: string) {
  const { data, error } = await client
    .from("habits")
    .select("*, habit_logs(*)")
    .eq("user_id", userId)
    .eq("is_active", true);
  if (error) throw error;
  return data;
}

export async function logHabit(
  client: Client,
  habitId: string,
  note?: string
) {
  const { data, error } = await client
    .from("habit_logs")
    .insert({ habit_id: habitId, note })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getActivePrograms(client: Client, userId: string) {
  const { data, error } = await client
    .from("program_enrollments")
    .select("*, programs(*)")
    .eq("user_id", userId)
    .eq("status", "active");
  if (error) throw error;
  return data;
}

export async function getProgramDayContent(
  client: Client,
  programId: string,
  dayNumber: number
) {
  const { data, error } = await client
    .from("program_day_content")
    .select("*")
    .eq("program_id", programId)
    .eq("day_number", dayNumber)
    .single();
  if (error) throw error;
  return data;
}

export async function getConversationSession(
  client: Client,
  sessionId: string
) {
  const { data, error } = await client
    .from("conversation_sessions")
    .select("*, messages(*)")
    .eq("id", sessionId)
    .single();
  if (error) throw error;
  return data;
}

export async function getOrCreateSession(client: Client, userId: string) {
  const { data: existing } = await client
    .from("conversation_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const lastMsg = new Date(existing.last_message_at);
    const hoursSince = (Date.now() - lastMsg.getTime()) / (1000 * 60 * 60);
    if (hoursSince < 24) return existing;
  }

  const { data, error } = await client
    .from("conversation_sessions")
    .insert({ user_id: userId, title: "New conversation" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function saveMessage(
  client: Client,
  message: Database["public"]["Tables"]["messages"]["Insert"]
) {
  const { data, error } = await client
    .from("messages")
    .insert(message)
    .select()
    .single();
  if (error) throw error;

  await client
    .from("conversation_sessions")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", message.session_id);

  return data;
}

export async function getMemories(
  client: Client,
  userId: string,
  limit = 10
) {
  const { data, error } = await client
    .from("memories")
    .select("*")
    .eq("user_id", userId)
    .order("importance", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function saveMemory(
  client: Client,
  memory: Database["public"]["Tables"]["memories"]["Insert"]
) {
  const { data, error } = await client
    .from("memories")
    .insert(memory)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getJournalTemplates(client: Client) {
  const { data, error } = await client
    .from("journal_templates")
    .select("*")
    .order("category");
  if (error) throw error;
  return data;
}

export async function getWeeklyInsights(client: Client, userId: string) {
  const { data, error } = await client
    .from("weekly_insights")
    .select("*")
    .eq("user_id", userId)
    .order("week_start", { ascending: false })
    .limit(4);
  if (error) throw error;
  return data;
}

export async function logBreathingSession(
  client: Client,
  session: Database["public"]["Tables"]["breathing_sessions"]["Insert"]
) {
  const { data, error } = await client
    .from("breathing_sessions")
    .insert(session)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function logMeditationSession(
  client: Client,
  session: Database["public"]["Tables"]["meditation_sessions"]["Insert"]
) {
  const { data, error } = await client
    .from("meditation_sessions")
    .insert(session)
    .select()
    .single();
  if (error) throw error;
  return data;
}
