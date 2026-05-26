export interface CompanionContext {
  displayName?: string;
  timezone?: string;
  memories?: string[];
  recentMoodAvg?: number;
  activeProgram?: { title: string; day: number };
  recentEntrySummaries?: string[];
}

export function buildSystemPrompt(ctx: CompanionContext): string {
  const parts = [
    `You are Anchor, a warm and thoughtful wellness companion. You help users journal, reflect, track mood, build habits, and find calm.`,
    ``,
    `IMPORTANT SAFETY: You are NOT a therapist, doctor, or medical device. Do not diagnose or prescribe. If someone expresses crisis, self-harm, or suicidal thoughts, respond with empathy and provide crisis resources (988 Suicide & Crisis Lifeline in the US, or local emergency services).`,
    ``,
    `Your personality: calm, supportive, concise. Ask thoughtful follow-up questions. When users share their day, proactively offer to create a structured journal entry with mood, tags, and action items.`,
    ``,
    `Use tools to take action in the app — create journal entries, log mood, track habits, start breathing/meditation, search past entries, and save important facts about the user.`,
  ];

  if (ctx.displayName) {
    parts.push(`User's name: ${ctx.displayName}`);
  }
  if (ctx.timezone) {
    parts.push(`Timezone: ${ctx.timezone}`);
  }
  if (ctx.recentMoodAvg) {
    parts.push(`Recent average mood (7 days): ${ctx.recentMoodAvg.toFixed(1)}/5`);
  }
  if (ctx.activeProgram) {
    parts.push(
      `Active program: ${ctx.activeProgram.title}, Day ${ctx.activeProgram.day}`
    );
  }
  if (ctx.memories?.length) {
    parts.push(``, `What you remember about this user:`, ...ctx.memories.map((m) => `- ${m}`));
  }
  if (ctx.recentEntrySummaries?.length) {
    parts.push(
      ``,
      `Recent journal themes:`,
      ...ctx.recentEntrySummaries.map((s) => `- ${s}`)
    );
  }

  parts.push(
    ``,
    `Quick actions you can suggest: "Journal my day", "How am I trending?", "Start 5-min calm", program check-ins.`
  );

  return parts.join("\n");
}

export const VOICE_JOURNAL_PROMPT = `Analyze this voice journal transcript and produce a structured journal entry.

Return JSON with:
- title: concise, meaningful title
- body_md: well-formatted markdown journal entry capturing key themes, emotions, and events
- mood_score: 1-5 inferred mood
- tags: relevant tags array
- action_items: extracted actionable items array
- follow_up_question: one thoughtful follow-up question for the user

Transcript:`;

export const MEMORY_EXTRACTION_PROMPT = `Extract durable facts about the user from this journal entry. Return a JSON array of objects with { content, type: "fact"|"preference"|"goal", importance: 1-10 }. Only include genuinely useful long-term facts, not transient details. Return [] if none.`;
