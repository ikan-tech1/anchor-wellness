"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChatUI,
  type ChatMessage,
  VoiceRecorder,
  Button,
  Card,
  CardContent,
  EmptyState,
} from "@anchor/ui";
import { Mic, MessageSquare, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";

const QUICK_ACTIONS = [
  { label: "Journal my day", prompt: "Help me journal about my day. Ask me what happened and how I felt." },
  { label: "How am I trending?", prompt: "Show me my mood and journal trends from the past week." },
  { label: "Start 5-min calm", prompt: "I'd like to do a 5 minute breathing exercise to calm down." },
  { label: "Morning intention", prompt: "Help me set my morning intention for today." },
];

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I'm Anchor — your wellness companion. Talk or type about your day, and I'll help you journal, track mood, and find calm. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"chat" | "voice">("chat");
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ title: string; body: string; link?: string } | null>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          sessionId,
        }),
      });

      const data = await res.json();
      if (data.sessionId) setSessionId(data.sessionId);

      const journalResult = data.toolResults?.find(
        (t: { name: string; deepLink?: string }) => t.name === "create_journal_entry"
      );

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content || "I'm here to help.",
          toolResults: data.toolResults,
        },
      ]);

      if (journalResult?.deepLink) {
        setPreview({
          title: "New journal entry",
          body: data.content,
          link: journalResult.deepLink,
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I had trouble responding. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = async (text: string) => {
    if (!text) return;
    setIsProcessingVoice(true);
    try {
      const res = await fetch("/api/voice-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      const data = await res.json();
      if (data.entry) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `I've created a journal entry: **${data.entry.title}**\n\n${data.follow_up_question || "Would you like to edit it?"}`,
            toolResults: [{ name: "journal_entry", deepLink: `/journal/${data.entry.id}` }],
          },
        ]);
        setPreview({
          title: data.entry.title,
          body: data.entry.body_md,
          link: `/journal/${data.entry.id}`,
        });
        setMode("chat");
      } else {
        await sendMessage(`Here's my voice journal: ${text}`);
      }
    } finally {
      setIsProcessingVoice(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-4.25rem-env(safe-area-inset-bottom,0px))] md:h-screen flex-col md:flex-row">
      <div className="flex flex-1 flex-col min-h-0 md:border-r md:border-border/80">
        <header className="glass flex items-center justify-between border-b px-4 py-4 md:px-6 safe-top">
          <div>
            <h1 className="font-serif text-xl font-medium tracking-tight">Anchor</h1>
            <p className="text-xs text-muted-foreground">Your wellness companion</p>
          </div>
          <div className="flex gap-1 rounded-xl bg-secondary/60 p-1">
            <Button
              variant={mode === "chat" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("chat")}
              className="rounded-lg"
            >
              <MessageSquare className="h-4 w-4 mr-1.5" /> Chat
            </Button>
            <Button
              variant={mode === "voice" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("voice")}
              className="rounded-lg"
            >
              <Mic className="h-4 w-4 mr-1.5" /> Voice
            </Button>
          </div>
        </header>

        {mode === "voice" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 flex-col items-center justify-center gap-8 p-8"
          >
            <VoiceRecorder
              onTranscript={handleVoiceTranscript}
              isProcessing={isProcessingVoice}
            />
          </motion.div>
        ) : (
          <ChatUI
            messages={messages}
            input={input}
            onInputChange={setInput}
            onSend={() => sendMessage(input)}
            isLoading={isLoading}
            quickActions={QUICK_ACTIONS}
            onQuickAction={(prompt) => sendMessage(prompt)}
          />
        )}
      </div>

      <aside className="hidden md:flex md:w-[400px] lg:w-[440px] flex-col glass border-l border-border/80">
        <div className="border-b border-border/60 px-6 py-5">
          <h2 className="font-serif text-lg font-medium">Live preview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Journal entries created from chat
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {preview ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="shadow-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-medium">{preview.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Draft from conversation</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-[12]">
                    {preview.body}
                  </p>
                  {preview.link && (
                    <Link href={preview.link}>
                      <Button variant="outline" className="w-full">
                        Open entry →
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <EmptyState
              icon={<Sparkles className="h-8 w-8 text-primary" />}
              title="Nothing here yet"
              description="Start a conversation or use voice journaling. New entries will appear here on desktop."
              className="border-none bg-transparent shadow-none py-12"
            />
          )}
        </div>
      </aside>
    </div>
  );
}
