"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@anchor/db/client";
import { JournalEditor, MoodPicker, Button } from "@anchor/ui";

function NewJournalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ritual = searchParams.get("ritual");
  const template = searchParams.get("template");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [moodScore, setMoodScore] = useState<number>();
  const [saving, setSaving] = useState(false);
  const [templatePrompts, setTemplatePrompts] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (ritual === "morning") {
      setTitle("Morning Intention");
      setBody("## What would make today meaningful?\n\n## How do I want to show up?\n\n");
    } else if (ritual === "evening") {
      setTitle("Evening Reflection");
      setBody("## What went well today?\n\n## What challenged me?\n\n## What am I grateful for?\n\n");
    }
    if (template) loadTemplate(template);
  }, [ritual, template]);

  async function loadTemplate(slug: string) {
    const { data } = await supabase
      .from("journal_templates")
      .select("*")
      .eq("slug", slug)
      .single();
    if (data) {
      setTitle(data.title);
      const prompts = data.prompts as string[];
      setTemplatePrompts(prompts);
      setBody(prompts.map((p) => `## ${p}\n\n`).join("\n"));
    }
  }

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        title: title || "Untitled",
        body_md: body,
        mood_score: moodScore,
        ritual_type: ritual as "morning" | "evening" | null,
        template_slug: template,
        source: template ? "template" : ritual ? "manual" : "manual",
      })
      .select()
      .single();

    if (!error && data) {
      if (moodScore) {
        await supabase.from("mood_checkins").insert({ user_id: user.id, score: moodScore });
      }
      router.push(`/journal/${data.id}`);
    }
    setSaving(false);
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">New Entry</h1>
        {ritual && (
          <p className="text-sm text-muted-foreground capitalize">{ritual} ritual</p>
        )}
      </header>

      <MoodPicker value={moodScore} onChange={setMoodScore} size="sm" />

      <JournalEditor
        title={title}
        body={body}
        onTitleChange={setTitle}
        onBodyChange={setBody}
        onSave={handleSave}
        isSaving={saving}
      />
    </div>
  );
}

export default function NewJournalPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <NewJournalContent />
    </Suspense>
  );
}
