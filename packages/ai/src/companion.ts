import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@anchor/db/types";
import { buildSystemPrompt, type CompanionContext } from "./prompts";

type Client = SupabaseClient<Database>;

export async function buildCompanionContext(
  client: Client,
  userId: string
): Promise<CompanionContext> {
  const [profile, memories, moods, program, entries] = await Promise.all([
    client.from("profiles").select("*").eq("id", userId).maybeSingle(),
    client
      .from("memories")
      .select("content")
      .eq("user_id", userId)
      .order("importance", { ascending: false })
      .limit(8),
    client
      .from("mood_checkins")
      .select("score")
      .eq("user_id", userId)
      .gte(
        "logged_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      ),
    client
      .from("program_enrollments")
      .select("current_day, program_id")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle(),
    client
      .from("journal_entries")
      .select("title, body_md")
      .eq("user_id", userId)
      .eq("ai_retrieval_allowed", true)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const moodScores = moods.data?.map((m) => m.score) || [];
  const avgMood = moodScores.length
    ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length
    : undefined;

  let activeProgram: CompanionContext["activeProgram"];
  if (program.data) {
    const { data: prog } = await client
      .from("programs")
      .select("title")
      .eq("id", program.data.program_id)
      .maybeSingle();
    if (prog) {
      activeProgram = { title: prog.title, day: program.data.current_day };
    }
  }

  return {
    displayName: profile.data?.display_name || undefined,
    timezone: profile.data?.timezone,
    memories: memories.data?.map((m) => m.content),
    recentMoodAvg: avgMood,
    activeProgram,
    recentEntrySummaries: entries.data?.map(
      (e) => `${e.title}: ${e.body_md.slice(0, 120)}...`
    ),
  };
}

export function getSystemMessage(ctx: CompanionContext) {
  return {
    role: "system" as const,
    content: buildSystemPrompt(ctx),
  };
}

export async function processVoiceToJournal(
  transcript: string,
  context: CompanionContext
): Promise<{
  title: string;
  body_md: string;
  mood_score: number;
  tags: string[];
  action_items: string[];
  follow_up_question: string;
}> {
  const { createChatCompletion } = await import("./providers");
  const { VOICE_JOURNAL_PROMPT } = await import("./prompts");

  const response = await createChatCompletion([
    {
      role: "system",
      content: buildSystemPrompt(context),
    },
    {
      role: "user",
      content: `${VOICE_JOURNAL_PROMPT}\n\n${transcript}`,
    },
  ]);

  const content = response.choices[0]?.message?.content || "{}";
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch?.[0] || content);
  } catch {
    return {
      title: "Voice Journal",
      body_md: transcript,
      mood_score: 3,
      tags: ["voice"],
      action_items: [],
      follow_up_question: "Would you like to add anything else to this entry?",
    };
  }
}

export async function extractMemoriesFromEntry(
  entryBody: string
): Promise<Array<{ content: string; type: string; importance: number }>> {
  const { createChatCompletion } = await import("./providers");
  const { MEMORY_EXTRACTION_PROMPT } = await import("./prompts");

  const response = await createChatCompletion([
    { role: "system", content: MEMORY_EXTRACTION_PROMPT },
    { role: "user", content: entryBody },
  ]);

  const content = response.choices[0]?.message?.content || "[]";
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    return JSON.parse(jsonMatch?.[0] || content);
  } catch {
    return [];
  }
}
