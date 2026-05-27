"use client";

import { useEffect, useState } from "react";
import { fetchJournalEntries } from "@/app/actions/data";
import {
  JournalCard,
  Input,
  Button,
  PageHeader,
  PageShell,
  EmptyState,
  JournalCardSkeleton,
} from "@anchor/ui";
import Link from "next/link";
import { Plus, Search, BookOpen } from "lucide-react";

interface Entry {
  id: string;
  title: string;
  body_md: string;
  created_at: string;
  mood_score: number | null;
  tags: string[];
  ritual_type: string | null;
  is_locked?: boolean;
  is_private?: boolean;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, [search]);

  async function loadEntries() {
    setLoading(true);
    try {
      const data = await fetchJournalEntries({
        search: search.trim() || undefined,
      });
      setEntries(data as Entry[]);
    } catch {
      setEntries([]);
    }
    setLoading(false);
  }

  return (
    <PageShell className="mx-auto max-w-3xl md:max-w-4xl lg:max-w-5xl">
      <PageHeader
        title="Journal"
        description="Your reflections over time"
        action={
          <Link href="/journal/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> New
            </Button>
          </Link>
        }
      />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          <JournalCardSkeleton />
          <JournalCardSkeleton />
          <JournalCardSkeleton />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8 text-primary" />}
          title={search ? "No matches found" : "Your journal awaits"}
          description={
            search
              ? "Try a different search term or browse all entries."
              : "Capture your thoughts, feelings, and moments. Your first entry is just a tap away."
          }
          action={
            !search ? (
              <Link href="/journal/new">
                <Button>Write your first entry</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <JournalCard
              key={entry.id}
              title={entry.title}
              preview={entry.body_md}
              date={entry.created_at}
              moodScore={entry.mood_score}
              tags={entry.tags}
              isLocked={entry.is_locked}
              isPrivate={entry.is_private}
              onClick={() => {
                window.location.href = `/journal/${entry.id}`;
              }}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
