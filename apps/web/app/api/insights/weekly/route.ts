import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getRecentMoods,
  getJournalEntries,
  getSql,
  upsertWeeklyInsight,
} from "@anchor/db";
import { createChatCompletion } from "@anchor/ai/providers";

export const maxDuration = 60;

export async function POST(_request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const sinceIso = weekStart.toISOString();

    const sql = getSql();
    const [moods, entries, habitLogs, meditations] = await Promise.all([
      getRecentMoods(userId, 7),
      getJournalEntries(userId),
      sql`
        SELECT hl.completed_at, hl.habit_id FROM habit_logs hl
        JOIN habits h ON h.id = hl.habit_id
        WHERE h.user_id = ${userId} AND hl.completed_at >= ${sinceIso}
      `,
      sql`
        SELECT duration_sec, completed_at FROM meditation_sessions
        WHERE user_id = ${userId} AND completed_at >= ${sinceIso}
      `,
    ]);

    const filteredEntries = entries.filter(
      (e) => new Date(e.created_at) >= weekStart
    );
    const moodScores = moods.map((m) => m.score as number);
    const avgMood = moodScores.length
      ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length
      : null;

    const summaryContext = {
      avgMood,
      moodCount: moodScores.length,
      entryCount: filteredEntries.length,
      entryTitles: filteredEntries.map((e) => e.title).slice(0, 5),
      meditationMinutes: Math.round(
        (meditations as Array<{ duration_sec: number }>).reduce(
          (s, m) => s + m.duration_sec,
          0
        ) / 60
      ),
      habitLogs: habitLogs.length,
    };

    let summaryMd =
      "Not enough data for a weekly review yet. Keep journaling and checking in!";
    if (filteredEntries.length > 0 || moodScores.length > 0) {
      try {
        const response = await createChatCompletion([
          {
            role: "system",
            content:
              "You are Anchor, a warm wellness companion. Write a concise weekly review in markdown (3-5 short paragraphs). Highlight mood trends, journaling themes, wins, and one gentle suggestion. No clinical diagnosis.",
          },
          {
            role: "user",
            content: JSON.stringify(summaryContext),
          },
        ]);
        summaryMd = response.choices[0]?.message?.content || summaryMd;
      } catch {
        summaryMd = `This week: ${filteredEntries.length} journal entries, average mood ${avgMood?.toFixed(1) || "N/A"}/5. Keep showing up for yourself.`;
      }
    }

    const weekStartDate = weekStart.toISOString().split("T")[0];
    const patterns = {
      avgMood,
      entryCount: filteredEntries.length,
      topTags: [
        ...new Set(filteredEntries.flatMap((e) => e.tags || [])),
      ].slice(0, 5),
    };

    await upsertWeeklyInsight({
      user_id: userId,
      week_start: weekStartDate,
      summary_md: summaryMd,
      patterns,
    });

    return NextResponse.json({ summary_md: summaryMd, patterns });
  } catch (error) {
    console.error("Weekly insight error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
