"use client";

import { useState } from "react";
import { ChatUI, type ChatMessage } from "@anchor/ui";
import { VoiceRecorder } from "@anchor/ui";
import { Button } from "@anchor/ui";
import { Mic, MessageSquare } from "lucide-react";
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

  const chatPanel = (
    <>
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Anchor</h1>
          <p className="text-xs text-muted-foreground">Your wellness companion</p>
        </div>
        <div className="flex gap-1">
          <Button
            variant={mode === "chat" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("chat")}
          >
            <MessageSquare className="h-4 w-4 mr-1" /> Chat
          </Button>
          <Button
            variant={mode === "voice" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("voice")}
          >
            <Mic className="h-4 w-4 mr-1" /> Voice
          </Button>
        </div>
      </header>

      {mode === "voice" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
          <VoiceRecorder
            onTranscript={handleVoiceTranscript}
            isProcessing={isProcessingVoice}
          />
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Speak naturally about your day. Anchor will transcribe and create a structured journal entry with mood and action items.
          </p>
        </div>
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
    </>
  );

  return (
    <div className="flex h-[calc(100dvh-4rem)] md:h-screen flex-col md:flex-row">
      <div className="flex flex-1 flex-col min-h-0 md:border-r md:border-border">
        {chatPanel}
      </div>
      <aside className="hidden md:flex md:w-[380px] lg:w-[420px] flex-col bg-card/50 border-l border-border">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">Live preview</h2>
          <p className="text-xs text-muted-foreground">Journal entries created from chat</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {preview ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">{preview.title}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {preview.body}
              </p>
              {preview.link && (
                <Link href={preview.link}>
                  <Button variant="outline" size="sm" className="w-full">
                    Open entry →
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">
              Start a conversation or use voice journaling. New entries will appear here on desktop.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
