"use client";

import { useEffect, useState } from "react";
import { fetchJournalEntries } from "@/app/actions/data";
import { JournalCard, Input, Button } from "@anchor/ui";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

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
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Journal</h1>
          <p className="text-muted-foreground text-sm">Your reflections over time</p>
        </div>
        <Link href="/journal/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
        </Link>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-8">Loading...</p>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-muted-foreground">No journal entries yet.</p>
          <Link href="/journal/new">
            <Button>Write your first entry</Button>
          </Link>
        </div>
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
              onClick={() => { window.location.href = `/journal/${entry.id}`; }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
