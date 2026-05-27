"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveJournalEntry, fetchTemplateBySlug } from "@/app/actions/data";
import { JournalEditor, MoodPicker, PageHeader, PageShell, PageSkeleton } from "@anchor/ui";

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
    const data = await fetchTemplateBySlug(slug);
    if (data) {
      setTitle(data.title as string);
      const prompts = data.prompts as string[];
      setTemplatePrompts(prompts);
      setBody(prompts.map((p) => `## ${p}\n\n`).join("\n"));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const data = await saveJournalEntry({
        title: title || "Untitled",
        body_md: body,
        mood_score: moodScore,
        ritual_type: ritual || undefined,
        template_slug: template || undefined,
        source: template ? "template" : "manual",
      });
      router.push(`/journal/${data.id}`);
    } catch {
      // stay on page
    }
    setSaving(false);
  }

  const subtitle = ritual
    ? `${ritual} ritual`
    : template
      ? "Guided template"
      : "Freeform entry";

  return (
    <PageShell className="mx-auto max-w-3xl md:max-w-4xl lg:max-w-5xl">
      <PageHeader title="New entry" description={subtitle} />

      {templatePrompts.length > 0 && (
        <p className="text-sm text-muted-foreground -mt-4">
          Prompts: {templatePrompts.join(" · ")}
        </p>
      )}

      <JournalEditor
        title={title}
        body={body}
        onTitleChange={setTitle}
        onBodyChange={setBody}
        onSave={handleSave}
        isSaving={saving}
        suggestions={[
          "What am I grateful for?",
          "What's weighing on me?",
          "What did I learn today?",
        ]}
        onSuggestion={(s) => setBody((b) => `${b}\n\n## ${s}\n\n`)}
      />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <p className="section-label mb-4">Mood (optional)</p>
        <MoodPicker value={moodScore} onChange={setMoodScore} size="sm" />
      </div>
    </PageShell>
  );
}

export default function NewJournalPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewJournalContent />
    </Suspense>
  );
}
