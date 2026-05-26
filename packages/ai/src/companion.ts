import {
  getProfile,
  getMemories,
  getRecentMoods,
  getActiveEnrollment,
  getProgramById,
  getJournalEntries,
} from "@anchor/db";
import { buildSystemPrompt, type CompanionContext } from "./prompts";

export async function buildCompanionContext(
  userId: string
): Promise<CompanionContext> {
  const [profile, memories, moods, enrollment, entries] = await Promise.all([
    getProfile(userId).catch(() => null),
    getMemories(userId, 8),
    getRecentMoods(userId, 7),
    getActiveEnrollment(userId).catch(() => null),
    getJournalEntries(userId, { limit: 5 }),
  ]);

  const moodScores = (moods as Array<{ score: number }>).map((m) => m.score);
  const avgMood = moodScores.length
    ? moodScores.reduce((a: number, b: number) => a + b, 0) / moodScores.length
    : undefined;

  let activeProgram: CompanionContext["activeProgram"];
  if (enrollment) {
    const prog = await getProgramById(enrollment.program_id as string);
    if (prog) {
      activeProgram = {
        title: prog.title as string,
        day: enrollment.current_day as number,
      };
    }
  }

  return {
    displayName: (profile?.display_name as string) || undefined,
    timezone: profile?.timezone as string | undefined,
    memories: (memories as Array<{ content: string }>).map((m) => m.content),
    recentMoodAvg: avgMood,
    activeProgram,
    recentEntrySummaries: (entries as Array<{ title: string; body_md: string; ai_retrieval_allowed?: boolean }>)
      .filter((e) => e.ai_retrieval_allowed !== false)
      .map((e) => `${e.title}: ${(e.body_md || "").slice(0, 120)}...`),
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
