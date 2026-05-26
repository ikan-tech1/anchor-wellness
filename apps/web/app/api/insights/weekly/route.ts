import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@anchor/db/server";
import { createChatCompletion } from "@anchor/ai/providers";

export const maxDuration = 60;

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const [moods, entries, habits, meditations] = await Promise.all([
      supabase
        .from("mood_checkins")
        .select("score, note, logged_at")
        .eq("user_id", user.id)
        .gte("logged_at", weekStart.toISOString())
        .order("logged_at"),
      supabase
        .from("journal_entries")
        .select("title, body_md, mood_score, created_at, tags")
        .eq("user_id", user.id)
        .gte("created_at", weekStart.toISOString())
        .order("created_at"),
      supabase.from("habit_logs").select("completed_at, habit_id"),
      supabase
        .from("meditation_sessions")
        .select("duration_sec, completed_at")
        .eq("user_id", user.id)
        .gte("completed_at", weekStart.toISOString()),
    ]);

    const moodScores = moods.data?.map((m) => m.score) || [];
    const avgMood = moodScores.length
      ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length
      : null;

    const summaryContext = {
      avgMood,
      moodCount: moodScores.length,
      entryCount: entries.data?.length || 0,
      entryTitles: entries.data?.map((e) => e.title).slice(0, 5),
      meditationMinutes: Math.round(
        (meditations.data?.reduce((s, m) => s + m.duration_sec, 0) || 0) / 60
      ),
      habitLogs: habits.data?.length || 0,
    };

    let summaryMd = "Not enough data for a weekly review yet. Keep journaling and checking in!";
    if ((entries.data?.length || 0) > 0 || moodScores.length > 0) {
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
        summaryMd = `This week: ${entries.data?.length || 0} journal entries, average mood ${avgMood?.toFixed(1) || "N/A"}/5. Keep showing up for yourself.`;
      }
    }

    const weekStartDate = weekStart.toISOString().split("T")[0];
    const patterns = {
      avgMood,
      entryCount: entries.data?.length || 0,
      topTags: [...new Set(entries.data?.flatMap((e) => e.tags || []) || [])].slice(0, 5),
    };

    await supabase.from("weekly_insights").upsert(
      {
        user_id: user.id,
        week_start: weekStartDate,
        summary_md: summaryMd,
        patterns,
      },
      { onConflict: "user_id,week_start" }
    );

    return NextResponse.json({ summary_md: summaryMd, patterns });
  } catch (error) {
    console.error("Weekly insight error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
