"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { Mic, Square, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  onAudioBlob?: (blob: Blob) => void;
  isProcessing?: boolean;
}

export function VoiceRecorder({ onTranscript, onAudioBlob, isProcessing }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onAudioBlob?.(blob);

        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        try {
          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          const data = await res.json();
          if (data.text) onTranscript(data.text);
        } catch {
          onTranscript("");
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      alert("Microphone access denied. Please enable microphone permissions.");
    }
  }, [onTranscript, onAudioBlob]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center">
        {isRecording && (
          <>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute h-32 w-32 rounded-full bg-destructive/20"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.15, 0.3] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }}
              className="absolute h-24 w-24 rounded-full bg-destructive/15"
            />
          </>
        )}
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className={cn(
            "relative flex h-24 w-24 items-center justify-center rounded-full shadow-elevated transition-colors touch-target",
            isRecording ? "bg-destructive text-white" : "bg-primary text-primary-foreground",
            isProcessing && "opacity-50"
          )}
        >
          {isProcessing ? (
            <Loader2 className="h-9 w-9 animate-spin" />
          ) : isRecording ? (
            <Square className="h-8 w-8 fill-current" />
          ) : (
            <Mic className="h-9 w-9" />
          )}
        </motion.button>
      </div>
      <div className="text-center space-y-1">
        <p className="text-base font-medium">
          {isProcessing
            ? "Processing your words..."
            : isRecording
              ? formatDuration(duration)
              : "Tap to speak"}
        </p>
        <p className="text-sm text-muted-foreground max-w-xs">
          {isProcessing
            ? "Creating your journal entry"
            : isRecording
              ? "Speak naturally — tap again to finish"
              : "Share your day out loud. We'll turn it into a journal entry."}
        </p>
      </div>
      {isRecording && (
        <Button variant="outline" onClick={stopRecording} className="touch-target">
          Stop & transcribe
        </Button>
      )}
    </div>
  );
}
