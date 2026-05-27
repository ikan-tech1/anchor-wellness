"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Mic, Send, Loader2, Sparkles } from "lucide-react";

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

function TypingIndicator() {
  return (
    <div className="flex gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15 }}
          className="h-2 w-2 rounded-full bg-muted-foreground/60"
        />
      ))}
    </div>
  );
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
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 space-y-5 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="mr-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3.5 text-[15px] leading-relaxed shadow-soft",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.toolResults?.map((t, i) =>
                  t.deepLink ? (
                    <a
                      key={i}
                      href={t.deepLink}
                      className="mt-3 inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
                    >
                      View {t.name.replace(/_/g, " ")} →
                    </a>
                  ) : null
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="ml-11 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
              <TypingIndicator />
            </div>
          </motion.div>
        )}
      </div>

      {quickActions && messages.length <= 1 && (
        <div className="px-4 pb-3 md:px-6">
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quick actions
          </p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <motion.button
                key={action.label}
                whileTap={{ scale: 0.97 }}
                onClick={() => onQuickAction?.(action.prompt)}
                className="rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground shadow-soft hover:border-primary/30 hover:bg-primary/5 transition-colors touch-target"
              >
                {action.label}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border/80 bg-card/90 backdrop-blur-xl p-4 safe-bottom md:px-6">
        <div className="flex items-end gap-3">
          {onVoiceStart && (
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={onVoiceStart}
              aria-label={isRecording ? "Stop recording" : "Start voice input"}
              className={cn("shrink-0 rounded-full", isRecording && "animate-pulse")}
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
            aria-label="Message input"
            className="flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-32 min-h-[44px] shadow-soft"
          />
          <Button
            size="icon"
            onClick={onSend}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="shrink-0 rounded-full"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
