"use client";

import { useEffect, useState } from "react";
import { createClient } from "@anchor/db/client";
import { Card, CardContent, CardHeader, CardTitle, Button, MoodPicker, JournalCard } from "@anchor/ui";
import Link from "next/link";
import { Sun, Moon, Wind, Timer, CheckCircle2 } from "lucide-react";

interface HabitWithLogs {
  id: string;
  name: string;
  icon: string;
  habit_logs: Array<{ completed_at: string }>;
}

export default function TodayPage() {
  const [moodScore, setMoodScore] = useState<number>();
  const [habits, setHabits] = useState<HabitWithLogs[]>([]);
  const [recentEntries, setRecentEntries] = useState<Array<{ id: string; title: string; body_md: string; created_at: string; mood_score: number | null; tags: string[] }>>([]);
  const [morningDone, setMorningDone] = useState(false);
  const [eveningDone, setEveningDone] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const [habitsRes, entriesRes, morningRes, eveningRes, logsRes] = await Promise.all([
      supabase.from("habits").select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("journal_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("journal_entries").select("id").eq("user_id", user.id).eq("ritual_type", "morning").gte("created_at", `${today}T00:00:00`).limit(1),
      supabase.from("journal_entries").select("id").eq("user_id", user.id).eq("ritual_type", "evening").gte("created_at", `${today}T00:00:00`).limit(1),
      supabase.from("habit_logs").select("*"),
    ]);

    const habitRows = habitsRes.data || [];
    const allLogs = logsRes.data || [];
    setHabits(
      habitRows.map((h) => ({
        ...h,
        habit_logs: allLogs.filter((l) => l.habit_id === h.id),
      }))
    );
    setRecentEntries(entriesRes.data || []);
    setMorningDone((morningRes.data?.length || 0) > 0);
    setEveningDone((eveningRes.data?.length || 0) > 0);
  }

  async function logMood(score: number) {
    setMoodScore(score);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("mood_checkins").insert({ user_id: user.id, score });
  }

  async function logHabit(habitId: string) {
    await supabase.from("habit_logs").insert({ habit_id: habitId });
    loadData();
  }

  const todayStr = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Today</h1>
        <p className="text-muted-foreground">{todayStr}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How are you feeling?</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodPicker value={moodScore} onChange={logMood} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/journal/new?ritual=morning">
          <Card className={`hover:bg-accent/50 transition-colors ${morningDone ? "border-primary/50" : ""}`}>
            <CardContent className="flex items-center gap-3 p-4">
              <Sun className="h-8 w-8 text-amber-500" />
              <div>
                <p className="font-medium text-sm">Morning Ritual</p>
                <p className="text-xs text-muted-foreground">{morningDone ? "Done ✓" : "Set intention"}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/journal/new?ritual=evening">
          <Card className={`hover:bg-accent/50 transition-colors ${eveningDone ? "border-primary/50" : ""}`}>
            <CardContent className="flex items-center gap-3 p-4">
              <Moon className="h-8 w-8 text-indigo-400" />
              <div>
                <p className="font-medium text-sm">Evening Ritual</p>
                <p className="text-xs text-muted-foreground">{eveningDone ? "Done ✓" : "Reflect on day"}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/calm/breathe">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardContent className="flex items-center gap-3 p-4">
              <Wind className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-sm">Breathe</p>
                <p className="text-xs text-muted-foreground">Calm exercises</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/calm/meditate">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardContent className="flex items-center gap-3 p-4">
              <Timer className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-sm">Meditate</p>
                <p className="text-xs text-muted-foreground">Timer & ambient</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Habits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {habits.map((habit) => {
              const doneToday = habit.habit_logs.some(
                (l) => l.completed_at.startsWith(new Date().toISOString().split("T")[0])
              );
              return (
                <button
                  key={habit.id}
                  onClick={() => !doneToday && logHabit(habit.id)}
                  className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-accent/50 transition-colors"
                >
                  <span className="text-xl">{habit.icon}</span>
                  <span className="flex-1 text-left text-sm">{habit.name}</span>
                  {doneToday ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-border" />
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {recentEntries.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-medium">Recent Journal</h2>
          {recentEntries.map((entry) => (
            <JournalCard
              key={entry.id}
              title={entry.title}
              preview={entry.body_md}
              date={entry.created_at}
              moodScore={entry.mood_score}
              tags={entry.tags}
              onClick={() => window.location.href = `/journal/${entry.id}`}
            />
          ))}
        </section>
      )}
    </div>
  );
}
