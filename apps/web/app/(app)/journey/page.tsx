"use client";

import { useEffect, useState } from "react";
import { createClient } from "@anchor/db/client";
import { Card, CardContent, CardHeader, CardTitle, MoodTrend, Button } from "@anchor/ui";
import Link from "next/link";

export default function JourneyPage() {
  const [moods, setMoods] = useState<Array<{ date: string; score: number }>>([]);
  const [entryCount, setEntryCount] = useState(0);
  const [insights, setInsights] = useState<Array<{ week_start: string; summary_md: string }>>([]);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const since = new Date();
    since.setDate(since.getDate() - 7);

    const [moodsRes, entriesRes, insightsRes] = await Promise.all([
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
    ]);

    setMoods(
      (moodsRes.data || []).map((m) => ({
        date: m.logged_at,
        score: m.score,
      }))
    );
    setEntryCount(entriesRes.count || 0);
    setInsights(insightsRes.data || []);
  }

  async function exportJournal() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: entries } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");

    const exportData = {
      exported_at: new Date().toISOString(),
      entries: entries || [],
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anchor-journal-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  }

  const avgMood = moods.length
    ? (moods.reduce((s, m) => s + m.score, 0) / moods.length).toFixed(1)
    : "—";

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Journey</h1>
          <p className="text-muted-foreground text-sm">Your wellness patterns over time</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportJournal}>
          Export
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold">{avgMood}</p>
            <p className="text-xs text-muted-foreground">Avg mood (7d)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold">{entryCount}</p>
            <p className="text-xs text-muted-foreground">Journal entries</p>
          </CardContent>
        </Card>
      </div>

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

      {insights.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-medium">Weekly Insights</h2>
          {insights.map((insight) => (
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
          ))}
        </section>
      )}

      <Link href="/journal/templates">
        <Button variant="outline" className="w-full">Browse Journal Templates</Button>
      </Link>
    </div>
  );
}
