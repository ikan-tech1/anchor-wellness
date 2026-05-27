"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { Input, Textarea } from "./input";
import { Button } from "./button";
import { Lock, Check, Sparkles } from "lucide-react";

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
  suggestions?: string[];
  onSuggestion?: (text: string) => void;
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
  suggestions,
  onSuggestion,
}: JournalEditorProps) {
  return (
    <div className="editor-surface flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-border/50 pb-4">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Give this moment a title..."
          className="font-serif text-2xl md:text-3xl font-medium border-none shadow-none px-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50"
          disabled={isLocked}
        />
        {isLocked && <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />}
      </div>

      <Textarea
        value={body}
        onChange={(e) => onBodyChange(e.target.value)}
        placeholder="Start writing freely. There's no wrong way to reflect..."
        className="min-h-[320px] md:min-h-[420px] border-none shadow-none px-0 focus-visible:ring-0 text-[16px] md:text-[17px] leading-[1.75] bg-transparent resize-none placeholder:text-muted-foreground/40"
        disabled={isLocked}
      />

      {suggestions && suggestions.length > 0 && !isLocked && (
        <div className="flex flex-wrap gap-2 border-t border-border/50 pt-4">
          <span className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
            <Sparkles className="h-3 w-3" /> Suggestions
          </span>
          {suggestions.map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => onSuggestion?.(s)}
              className="rounded-full border border-border/80 bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground transition-colors"
            >
              {s}
            </motion.button>
          ))}
        </div>
      )}

      {actionItems && actionItems.length > 0 && (
        <div className="space-y-3 border-t border-border/50 pt-4">
          <h4 className="section-label">Action items</h4>
          {actionItems.map((item) => (
            <label key={item.id} className="flex items-center gap-3 cursor-pointer touch-target py-1">
              <button
                type="button"
                onClick={() => onToggleAction?.(item.id)}
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors",
                  item.completed
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                )}
              >
                {item.completed && <Check className="h-3.5 w-3.5" />}
              </button>
              <span
                className={cn(
                  "text-sm leading-relaxed",
                  item.completed && "line-through text-muted-foreground"
                )}
              >
                {item.text}
              </span>
            </label>
          ))}
        </div>
      )}

      {!isLocked && (
        <div className="flex justify-end border-t border-border/50 pt-4">
          <Button onClick={onSave} disabled={isSaving} size="lg">
            {isSaving ? "Saving..." : "Save entry"}
          </Button>
        </div>
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
  isLocked?: boolean;
  isPrivate?: boolean;
  onClick?: () => void;
}

export function JournalCard({
  title,
  preview,
  date,
  moodScore,
  tags,
  isLocked,
  isPrivate,
  onClick,
}: JournalCardProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group w-full text-left rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:border-primary/20 hover:shadow-card touch-target"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium line-clamp-1 flex items-center gap-2 text-[15px]">
          {isLocked && <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
          <span className="group-hover:text-primary transition-colors">{title}</span>
        </h3>
        {moodScore ? (
          <span className="text-xl shrink-0">{["😔", "😕", "😐", "🙂", "😊"][moodScore - 1]}</span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{preview}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {new Date(date).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
        {isPrivate && (
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Private
          </span>
        )}
        {tags?.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-primary/8 px-2.5 py-0.5 text-[10px] font-medium text-primary"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.button>
  );
}
