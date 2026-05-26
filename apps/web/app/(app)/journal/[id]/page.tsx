"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@anchor/db/client";
import { JournalEditor, Button, MoodPicker } from "@anchor/ui";
import { ArrowLeft, Lock, Download, Trash2, EyeOff, ImagePlus } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadEntry();
  }, [id]);

  async function loadEntry() {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      router.push("/journal");
      return;
    }

    setTitle(data.title);
    setBody(data.body_md);
    setMoodScore(data.mood_score ?? undefined);
    setIsLocked(data.is_locked);
    setIsPrivate(data.is_private);

    const { data: blocks } = await supabase
      .from("journal_blocks")
      .select("*")
      .eq("entry_id", id)
      .order("sort_order");

    setActionItems(
      (blocks || [])
        .filter((b) => b.type === "action_item")
        .map((b) => ({
          id: b.id,
          text: (b.payload as { text?: string }).text || "",
          completed: (b.payload as { completed?: boolean }).completed || false,
        }))
    );
    loadMediaUrls(blocks || []);
    setLoading(false);
  }

  async function loadMediaUrls(blocks: Array<{ id: string; type: string; payload: unknown }>) {
    const imageBlocks = blocks.filter((b) => b.type === "image");
    const urls: MediaBlock[] = [];
    for (const b of imageBlocks) {
      const payload = b.payload as { url?: string; path?: string };
      if (payload.path) {
        const { data: signed } = await supabase.storage
          .from("journal-media")
          .createSignedUrl(payload.path, 3600);
        urls.push({ id: b.id, url: signed?.signedUrl || payload.url || "" });
      } else if (payload.url) {
        urls.push({ id: b.id, url: payload.url });
      }
    }
    setMediaBlocks(urls.filter((m) => m.url));
  }

  async function handleSave() {
    setSaving(true);
    await supabase
      .from("journal_entries")
      .update({
        title,
        body_md: body,
        mood_score: moodScore,
        is_locked: isLocked,
        is_private: isPrivate,
        ai_retrieval_allowed: !isPrivate,
      })
      .eq("id", id);
    setSaving(false);
  }

  async function toggleAction(itemId: string) {
    const item = actionItems.find((a) => a.id === itemId);
    if (!item) return;
    const updated = { ...item, completed: !item.completed };
    await supabase
      .from("journal_blocks")
      .update({ payload: { text: updated.text, completed: updated.completed } })
      .eq("id", itemId);
    setActionItems((prev) => prev.map((a) => (a.id === itemId ? updated : a)));
  }

  async function handleDelete() {
    if (!confirm("Delete this entry?")) return;
    await supabase.from("journal_entries").delete().eq("id", id);
    router.push("/journal");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const path = `${user.id}/${id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("journal-media").upload(path, file);
    if (uploadError) {
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("journal-media").getPublicUrl(path);
    const url = urlData.publicUrl;

    const { data: block } = await supabase
      .from("journal_blocks")
      .insert({
        entry_id: id,
        type: "image",
        payload: { url, path },
        sort_order: mediaBlocks.length + actionItems.length,
      })
      .select()
      .single();

    if (block) {
      const { data: signed } = await supabase.storage
        .from("journal-media")
        .createSignedUrl(path, 60 * 60 * 24 * 7);
      setMediaBlocks((prev) => [...prev, { id: block.id, url: signed?.signedUrl || url }]);
    }
    setUploading(false);
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
          <label className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl hover:bg-accent transition-colors">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            <ImagePlus className="h-4 w-4" />
          </label>
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
