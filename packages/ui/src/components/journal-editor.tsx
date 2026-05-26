"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { Input, Textarea } from "./input";
import { Button } from "./button";
import { Lock, Check } from "lucide-react";

interface JournalEditorProps {
  title: string;
  body: string;
  onTitleChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onSave: () => void;
  isSaving?: boolean;
  isLocked?: boolean;
  actionItems?: Array<{ id: string; text: string; completed: boolean }>;
  onToggleAction?: (id: string) => void;
}

export function JournalEditor({
  title,
  body,
  onTitleChange,
  onBodyChange,
  onSave,
  isSaving,
  isLocked,
  actionItems,
  onToggleAction,
}: JournalEditorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Entry title"
          className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
          disabled={isLocked}
        />
        {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
      </div>
      <Textarea
        value={body}
        onChange={(e) => onBodyChange(e.target.value)}
        placeholder="Start writing..."
        className="min-h-[300px] border-none shadow-none px-0 focus-visible:ring-0 text-base leading-relaxed"
        disabled={isLocked}
      />
      {actionItems && actionItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Action Items</h4>
          {actionItems.map((item) => (
            <label key={item.id} className="flex items-center gap-3 cursor-pointer">
              <button
                onClick={() => onToggleAction?.(item.id)}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-md border",
                  item.completed ? "bg-primary border-primary text-primary-foreground" : "border-border"
                )}
              >
                {item.completed && <Check className="h-3 w-3" />}
              </button>
              <span className={cn("text-sm", item.completed && "line-through text-muted-foreground")}>
                {item.text}
              </span>
            </label>
          ))}
        </div>
      )}
      {!isLocked && (
        <Button onClick={onSave} disabled={isSaving} className="self-end">
          {isSaving ? "Saving..." : "Save Entry"}
        </Button>
      )}
    </div>
  );
}

interface JournalCardProps {
  title: string;
  preview: string;
  date: string;
  moodScore?: number | null;
  tags?: string[];
  onClick?: () => void;
}

export function JournalCard({ title, preview, date, moodScore, tags, onClick }: JournalCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-border bg-card p-4 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium line-clamp-1">{title}</h3>
        {moodScore && (
          <span className="text-lg shrink-0">{["😔", "😕", "😐", "🙂", "😊"][moodScore - 1]}</span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{preview}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
        {tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
    </motion.button>
  );
}
