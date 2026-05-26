"use client";

import { useEffect, useState } from "react";
import { createClient } from "@anchor/db/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MoodTrend,
  Button,
  StreakBadges,
  computeJournalStreak,
  type StreakStats,
} from "@anchor/ui";
import Link from "next/link";
import { Calendar, Sparkles } from "lucide-react";

interface OnThisDayEntry {
  id: string;
  title: string;
  body_md: string;
  created_at: string;
}

export default function JourneyPage() {
  const [moods, setMoods] = useState<Array<{ date: string; score: number }>>([]);
  const [entryCount, setEntryCount] = useState(0);
  const [insights, setInsights] = useState<Array<{ week_start: string; summary_md: string }>>([]);
  const [onThisDay, setOnThisDay] = useState<OnThisDayEntry[]>([]);
  const [calendarDays, setCalendarDays] = useState<Array<{ date: string; count: number }>>([]);
  const [stats, setStats] = useState<StreakStats>({
    journalStreak: 0,
    habitStreak: 0,
    meditationCount: 0,
    breathingCount: 0,
  });
  const [generating, setGenerating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const monthStart = new Date();
    monthStart.setDate(1);

    const [moodsRes, entriesRes, insightsRes, allEntriesRes, monthEntries, medRes, breathRes, habitLogs] =
      await Promise.all([
        supabase
          .from("mood_checkins")
          .select("score, logged_at")
          .eq("user_id", user.id)
          .gte("logged_at", since.toISOString())
          .order("logged_at"),
        supabase
          .from("journal_entries")
          .select("id", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("weekly_insights")
          .select("*")
          .eq("user_id", user.id)
          .order("week_start", { ascending: false })
          .limit(4),
        supabase
          .from("journal_entries")
          .select("id, title, body_md, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("journal_entries")
          .select("created_at")
          .eq("user_id", user.id)
          .gte("created_at", monthStart.toISOString()),
        supabase
          .from("meditation_sessions")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .gte("completed_at", since.toISOString()),
        supabase
          .from("breathing_sessions")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .gte("completed_at", since.toISOString()),
        supabase.from("habit_logs").select("completed_at").gte("completed_at", since.toISOString()),
      ]);

    // On this day: entries from same month/day in prior years
    const today = new Date();
    const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const allEntries = allEntriesRes.data || [];

    const historical = allEntries.filter((e) => {
      const d = new Date(e.created_at);
      const md = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return md === monthDay && d.getFullYear() < today.getFullYear();
    });

    const dayMap = new Map<string, number>();
    (monthEntries.data || []).forEach((e) => {
      const key = e.created_at.split("T")[0]!;
      dayMap.set(key, (dayMap.get(key) || 0) + 1);
    });

    setMoods(
      (moodsRes.data || []).slice(-14).map((m) => ({
        date: m.logged_at,
        score: m.score,
      }))
    );
    setEntryCount(entriesRes.count || 0);
    setInsights(insightsRes.data || []);
    setOnThisDay(historical);
    setCalendarDays(
      [...dayMap.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date))
    );
    setStats({
      journalStreak: computeJournalStreak(allEntries.map((e) => e.created_at)),
      habitStreak: computeJournalStreak((habitLogs.data || []).map((l) => l.completed_at)),
      meditationCount: medRes.count || 0,
      breathingCount: breathRes.count || 0,
    });
  }

  async function exportJournal(format: "json" | "markdown") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: entries } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");

    if (format === "json") {
      const exportData = { exported_at: new Date().toISOString(), entries: entries || [] };
      downloadBlob(JSON.stringify(exportData, null, 2), "application/json", "json");
    } else {
      const md = (entries || [])
        .map(
          (e) =>
            `# ${e.title}\n\n*${new Date(e.created_at).toLocaleDateString()}* · Mood: ${e.mood_score || "—"}/5\n\n${e.body_md}\n\n---\n`
        )
        .join("\n");
      downloadBlob(md, "text/markdown", "md");
    }
  }

  function downloadBlob(content: string, type: string, ext: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anchor-journal-export-${new Date().toISOString().split("T")[0]}.${ext}`;
    a.click();
  }

  async function generateWeeklyReview() {
    setGenerating(true);
    try {
      const res = await fetch("/api/insights/weekly", { method: "POST" });
      const data = await res.json();
      if (data.summary_md) {
        await loadData();
      }
    } finally {
      setGenerating(false);
    }
  }

  const avgMood = moods.length
    ? (moods.reduce((s, m) => s + m.score, 0) / moods.length).toFixed(1)
    : "—";

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const countByDate = new Map(calendarDays.map((d) => [d.date, d.count]));

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Journey</h1>
          <p className="text-muted-foreground text-sm">Your wellness patterns over time</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => exportJournal("markdown")}>
            Export MD
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportJournal("json")}>
            Export JSON
          </Button>
        </div>
      </header>

      <StreakBadges stats={stats} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold">{avgMood}</p>
            <p className="text-xs text-muted-foreground">Avg mood (14d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold">{entryCount}</p>
            <p className="text-xs text-muted-foreground">Journal entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold">{stats.journalStreak}</p>
            <p className="text-xs text-muted-foreground">Day streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold">{stats.meditationCount + stats.breathingCount}</p>
            <p className="text-xs text-muted-foreground">Calm sessions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" /> This month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const count = countByDate.get(dateStr) || 0;
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                    count > 0 ? "bg-primary/20 text-primary font-medium" : "bg-secondary/50 text-muted-foreground"
                  } ${day === today.getDate() ? "ring-2 ring-primary/50" : ""}`}
                  title={count ? `${count} entries` : undefined}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {onThisDay.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-medium">On this day</h2>
          {onThisDay.map((entry) => (
            <Link key={entry.id} href={`/journal/${entry.id}`}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-sm">{entry.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.created_at).getFullYear()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{entry.body_md}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}

      {moods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mood Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MoodTrend data={moods} />
          </CardContent>
        </Card>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Weekly AI Review
          </h2>
          <Button variant="outline" size="sm" onClick={generateWeeklyReview} disabled={generating}>
            {generating ? "Generating..." : "Generate"}
          </Button>
        </div>
        {insights.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Generate your first weekly review to see AI-powered patterns and reflections.
            </CardContent>
          </Card>
        ) : (
          insights.map((insight) => (
            <Card key={insight.week_start}>
              <CardHeader>
                <CardTitle className="text-sm">
                  Week of {new Date(insight.week_start).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {insight.summary_md || "No summary yet."}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <Link href="/journal/templates">
        <Button variant="outline" className="w-full">
          Browse Journal Templates
        </Button>
      </Link>
    </div>
  );
}
