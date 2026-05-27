"use client";

import { useEffect, useState } from "react";
import { fetchJourneyPageData, exportAllJournalEntries } from "@/app/actions/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MoodTrend,
  Button,
  StreakBadges,
  computeJournalStreak,
  PageHeader,
  PageShell,
  EmptyState,
  type StreakStats,
} from "@anchor/ui";
import Link from "next/link";
import { Calendar, Sparkles, TrendingUp } from "lucide-react";

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

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await fetchJourneyPageData();
    const allEntries = data.entries as OnThisDayEntry[];
    const today = new Date();
    const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const historical = allEntries.filter((e) => {
      const d = new Date(e.created_at);
      const md = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return md === monthDay && d.getFullYear() < today.getFullYear();
    });

    const dayMap = new Map<string, number>();
    (data.monthEntries as Array<{ created_at: string }>).forEach((e) => {
      const key = e.created_at.split("T")[0]!;
      dayMap.set(key, (dayMap.get(key) || 0) + 1);
    });

    setMoods(
      (data.moods as Array<{ score: number; logged_at: string }>)
        .slice(-14)
        .map((m) => ({ date: m.logged_at, score: m.score }))
    );
    setEntryCount(allEntries.length);
    setInsights(data.insights as typeof insights);
    setOnThisDay(historical);
    setCalendarDays(
      [...dayMap.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date))
    );
    setStats({
      journalStreak: computeJournalStreak(allEntries.map((e) => e.created_at)),
      habitStreak: computeJournalStreak(
        (data.stats.habitLogs as Array<{ completed_at: string }>).map((l) => l.completed_at)
      ),
      meditationCount: (data.stats.meditations as unknown[]).length,
      breathingCount: (data.stats.breathing as unknown[]).length,
    });
  }

  async function exportJournal(format: "json" | "markdown") {
    const entries = await exportAllJournalEntries();

    if (format === "json") {
      const exportData = { exported_at: new Date().toISOString(), entries };
      downloadBlob(JSON.stringify(exportData, null, 2), "application/json", "json");
    } else {
      const md = entries
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
    <PageShell className="mx-auto max-w-3xl md:max-w-4xl lg:max-w-5xl">
      <PageHeader
        title="Journey"
        description="Your wellness patterns over time"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => exportJournal("markdown")}>
              Export MD
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportJournal("json")}>
              Export JSON
            </Button>
          </div>
        }
      />

      <StreakBadges stats={stats} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { value: avgMood, label: "Avg mood (14d)" },
          { value: entryCount, label: "Journal entries" },
          { value: stats.journalStreak, label: "Day streak" },
          { value: stats.meditationCount + stats.breathingCount, label: "Calm sessions" },
        ].map(({ value, label }) => (
          <div key={label} className="stat-card">
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> This month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-muted-foreground mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={`${d}-${i}`}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
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
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs transition-colors ${
                    count > 0
                      ? "bg-primary/20 text-primary font-semibold"
                      : "bg-secondary/50 text-muted-foreground"
                  } ${day === today.getDate() ? "ring-2 ring-primary/40" : ""}`}
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
        <section className="space-y-4">
          <h2 className="section-label">On this day</h2>
          {onThisDay.map((entry) => (
            <Link key={entry.id} href={`/journal/${entry.id}`}>
              <Card className="transition-all hover:border-primary/25 hover:shadow-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{entry.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.created_at).getFullYear()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {entry.body_md}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}

      {moods.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Mood trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MoodTrend data={moods} />
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-label flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" /> Weekly AI review
          </h2>
          <Button variant="outline" size="sm" onClick={generateWeeklyReview} disabled={generating}>
            {generating ? "Generating..." : "Generate"}
          </Button>
        </div>
        {insights.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8 text-primary" />}
            title="No reviews yet"
            description="Generate your first weekly review to see AI-powered patterns and reflections."
            action={
              <Button variant="outline" onClick={generateWeeklyReview} disabled={generating}>
                {generating ? "Generating..." : "Generate review"}
              </Button>
            }
          />
        ) : (
          insights.map((insight) => (
            <Card key={insight.week_start} className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Week of {new Date(insight.week_start).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {insight.summary_md || "No summary yet."}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <Link href="/journal/templates">
        <Button variant="outline" className="w-full">
          Browse journal templates
        </Button>
      </Link>
    </PageShell>
  );
}
