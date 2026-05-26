"use client";

import { useEffect, useState } from "react";
import { createClient } from "@anchor/db/client";
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
  const supabase = createClient();

  useEffect(() => {
    loadEntries();
  }, [search]);

  async function loadEntries() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,body_md.ilike.%${search}%`);
    }

    const { data } = await query;
    setEntries(data || []);
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries..."
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-muted-foreground">No journal entries yet.</p>
            <Link href="/home">
              <Button variant="outline">Talk to Anchor</Button>
            </Link>
          </div>
        ) : (
          entries.map((entry) => (
            <Link key={entry.id} href={`/journal/${entry.id}`}>
              <JournalCard
                title={entry.title}
                preview={entry.body_md}
                date={entry.created_at}
                moodScore={entry.mood_score}
                tags={entry.tags}
                isLocked={entry.is_locked}
                isPrivate={entry.is_private}
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
