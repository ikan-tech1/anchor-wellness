"use client";

import { useEffect, useState } from "react";
import {
  fetchTodayData,
  recordMood,
  completeHabit,
} from "@/app/actions/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MoodPicker,
  JournalCard,
  StreakBadges,
  computeJournalStreak,
  PageHeader,
  PageShell,
} from "@anchor/ui";
import Link from "next/link";
import { Sun, Moon, Wind, Timer, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface HabitWithLogs {
  id: string;
  name: string;
  icon: string;
  habit_logs: Array<{ completed_at: string }>;
}

const ritualCards = [
  {
    href: "/journal/new?ritual=morning",
    icon: Sun,
    iconClass: "text-amber-500",
    title: "Morning Ritual",
    doneLabel: "Done ✓",
    pendingLabel: "Set intention",
    doneKey: "morning" as const,
  },
  {
    href: "/journal/new?ritual=evening",
    icon: Moon,
    iconClass: "text-indigo-400",
    title: "Evening Ritual",
    doneLabel: "Done ✓",
    pendingLabel: "Reflect on day",
    doneKey: "evening" as const,
  },
  {
    href: "/calm/breathe",
    icon: Wind,
    iconClass: "text-primary",
    title: "Breathe",
    doneLabel: "",
    pendingLabel: "Calm exercises",
    doneKey: null,
  },
  {
    href: "/calm/meditate",
    icon: Timer,
    iconClass: "text-primary",
    title: "Meditate",
    doneLabel: "",
    pendingLabel: "Timer & ambient",
    doneKey: null,
  },
];

export default function TodayPage() {
  const [moodScore, setMoodScore] = useState<number>();
  const [habits, setHabits] = useState<HabitWithLogs[]>([]);
  const [recentEntries, setRecentEntries] = useState<
    Array<{
      id: string;
      title: string;
      body_md: string;
      created_at: string;
      mood_score: number | null;
      tags: string[];
    }>
  >([]);
  const [morningDone, setMorningDone] = useState(false);
  const [eveningDone, setEveningDone] = useState(false);
  const [journalStreak, setJournalStreak] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const today = new Date().toISOString().split("T")[0];
    const data = await fetchTodayData(today);
    const allLogs = data.habitLogs as Array<{ habit_id: string; completed_at: string }>;
    setHabits(
      (data.habits as HabitWithLogs[]).map((h) => ({
        ...h,
        habit_logs: allLogs.filter((l) => l.habit_id === h.id),
      }))
    );
    setRecentEntries(data.recentEntries as typeof recentEntries);
    setMorningDone(!!data.morningEntry);
    setEveningDone(!!data.eveningEntry);
    setJournalStreak(
      computeJournalStreak(
        (data.entryDates as Array<{ created_at: string }>).map((e) => e.created_at)
      )
    );
  }

  async function logMood(score: number) {
    setMoodScore(score);
    await recordMood(score);
  }

  async function logHabit(habitId: string) {
    await completeHabit(habitId);
    loadData();
  }

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const ritualDone = { morning: morningDone, evening: eveningDone };

  return (
    <PageShell className="mx-auto max-w-3xl md:max-w-4xl lg:max-w-5xl">
      <PageHeader title="Today" description={todayStr} />

      {journalStreak > 0 && (
        <StreakBadges
          stats={{ journalStreak, habitStreak: 0, meditationCount: 0, breathingCount: 0 }}
        />
      )}

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">How are you feeling?</CardTitle>
        </CardHeader>
        <CardContent>
          <MoodPicker value={moodScore} onChange={logMood} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {ritualCards.map(({ href, icon: Icon, iconClass, title, doneLabel, pendingLabel, doneKey }, i) => {
          const done = doneKey ? ritualDone[doneKey] : false;
          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={href}>
                <Card
                  className={`h-full transition-all hover:border-primary/25 hover:shadow-card ${
                    done ? "border-primary/40 bg-primary/5" : ""
                  }`}
                >
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/80">
                      <Icon className={`h-6 w-6 ${iconClass}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {done ? doneLabel : pendingLabel}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {habits.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Habits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {habits.map((habit) => {
              const doneToday = habit.habit_logs.some((l) =>
                l.completed_at.startsWith(new Date().toISOString().split("T")[0]!)
              );
              return (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => !doneToday && logHabit(habit.id)}
                  className="flex w-full items-center gap-4 rounded-xl p-4 hover:bg-accent/60 transition-colors touch-target"
                >
                  <span className="text-2xl">{habit.icon}</span>
                  <span className="flex-1 text-left text-sm font-medium">{habit.name}</span>
                  {doneToday ? (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-border" />
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {recentEntries.length > 0 && (
        <section className="space-y-4">
          <h2 className="section-label">Recent journal</h2>
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <JournalCard
                key={entry.id}
                title={entry.title}
                preview={entry.body_md}
                date={entry.created_at}
                moodScore={entry.mood_score}
                tags={entry.tags}
                onClick={() => {
                  window.location.href = `/journal/${entry.id}`;
                }}
              />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
