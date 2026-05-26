"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  fetchJournalEntry,
  updateJournalEntryFull,
  updateJournalBlock,
  removeJournalEntry,
} from "@/app/actions/data";
import { JournalEditor, Button, MoodPicker } from "@anchor/ui";
import { ArrowLeft, Lock, Download, Trash2, EyeOff } from "lucide-react";
import Link from "next/link";

interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

interface MediaBlock {
  id: string;
  url: string;
}

export default function JournalEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [moodScore, setMoodScore] = useState<number>();
  const [isLocked, setIsLocked] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [mediaBlocks, setMediaBlocks] = useState<MediaBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntry();
  }, [id]);

  async function loadEntry() {
    try {
      const data = await fetchJournalEntry(id);
      setTitle(data.title as string);
      setBody(data.body_md as string);
      setMoodScore((data.mood_score as number) ?? undefined);
      setIsLocked(data.is_locked as boolean);
      setIsPrivate(data.is_private as boolean);

      const blocks = (data.journal_blocks || []) as Array<{
        id: string;
        type: string;
        payload: { text?: string; completed?: boolean; url?: string };
      }>;

      setActionItems(
        blocks
          .filter((b) => b.type === "action_item")
          .map((b) => ({
            id: b.id,
            text: b.payload?.text || "",
            completed: b.payload?.completed || false,
          }))
      );
      setMediaBlocks(
        blocks
          .filter((b) => b.type === "image" && b.payload?.url)
          .map((b) => ({ id: b.id, url: b.payload.url as string }))
      );
    } catch {
      router.push("/journal");
      return;
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    await updateJournalEntryFull(id, {
      title,
      body_md: body,
      mood_score: moodScore,
      is_locked: isLocked,
      is_private: isPrivate,
    });
    setSaving(false);
  }

  async function toggleAction(itemId: string) {
    const item = actionItems.find((a) => a.id === itemId);
    if (!item) return;
    const updated = { ...item, completed: !item.completed };
    await updateJournalBlock(itemId, { text: updated.text, completed: updated.completed });
    setActionItems((prev) => prev.map((a) => (a.id === itemId ? updated : a)));
  }

  async function handleDelete() {
    if (!confirm("Delete this entry?")) return;
    await removeJournalEntry(id);
    router.push("/journal");
  }

  function exportMarkdown() {
    const md = `# ${title}\n\n${body}\n\n---\nMood: ${moodScore || "N/A"}\nPrivate: ${isPrivate}\n`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.md`;
    a.click();
  }

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/journal" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPrivate(!isPrivate)}
            title={isPrivate ? "Private (excluded from AI)" : "Make private"}
          >
            <EyeOff className={`h-4 w-4 ${isPrivate ? "text-primary" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={exportMarkdown} title="Export">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsLocked(!isLocked)} title="Lock entry">
            <Lock className={`h-4 w-4 ${isLocked ? "text-primary" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} title="Delete">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {isPrivate && (
        <p className="text-xs text-muted-foreground rounded-lg bg-secondary/50 px-3 py-2">
          Private entry — excluded from AI memory retrieval
        </p>
      )}

      <MoodPicker value={moodScore} onChange={setMoodScore} size="sm" />

      {mediaBlocks.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {mediaBlocks.map((m) => (
            <img key={m.id} src={m.url} alt="" className="rounded-xl object-cover aspect-video w-full" />
          ))}
        </div>
      )}

      <JournalEditor
        title={title}
        body={body}
        onTitleChange={setTitle}
        onBodyChange={setBody}
        onSave={handleSave}
        isSaving={saving}
        isLocked={isLocked}
        actionItems={actionItems}
        onToggleAction={toggleAction}
      />
    </div>
  );
}
