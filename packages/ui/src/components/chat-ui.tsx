"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Mic, Send, Loader2 } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolResults?: Array<{ name: string; deepLink?: string }>;
}

interface ChatUIProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onVoiceStart?: () => void;
  isLoading?: boolean;
  isRecording?: boolean;
  quickActions?: Array<{ label: string; prompt: string }>;
  onQuickAction?: (prompt: string) => void;
}

export function ChatUI({
  messages,
  input,
  onInputChange,
  onSend,
  onVoiceStart,
  isLoading,
  isRecording,
  quickActions,
  onQuickAction,
}: ChatUIProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.toolResults?.map((t, i) => (
                  t.deepLink && (
                    <a
                      key={i}
                      href={t.deepLink}
                      className="mt-2 inline-block text-xs underline opacity-80"
                    >
                      View {t.name.replace(/_/g, " ")} →
                    </a>
                  )
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-card border border-border px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {quickActions && messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => onQuickAction?.(action.prompt)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-border bg-card/80 backdrop-blur p-4 safe-bottom">
        <div className="flex items-end gap-2">
          {onVoiceStart && (
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={onVoiceStart}
              className={cn("shrink-0", isRecording && "animate-pulse")}
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Talk or type..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-32"
          />
          <Button size="icon" onClick={onSend} disabled={!input.trim() || isLoading}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
