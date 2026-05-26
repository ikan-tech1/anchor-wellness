import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  ensureProfile,
  createJournalEntry,
  createJournalBlocks,
  logMood,
  getProfile,
  saveMemory,
} from "@anchor/db";
import {
  buildCompanionContext,
  processVoiceToJournal,
  extractMemoriesFromEntry,
} from "@anchor/ai/companion";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    await ensureProfile(
      userId,
      user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? null
    );

    const { transcript } = await request.json();

    if (!transcript?.trim()) {
      return NextResponse.json({ error: "Transcript required" }, { status: 400 });
    }

    const context = await buildCompanionContext(userId);
    const structured = await processVoiceToJournal(transcript, context);

    const entry = await createJournalEntry({
      user_id: userId,
      title: structured.title,
      body_md: structured.body_md,
      mood_score: structured.mood_score,
      tags: structured.tags || ["voice"],
      source: "voice",
    });

    if (structured.action_items?.length) {
      await createJournalBlocks(
        structured.action_items.map((text: string, i: number) => ({
          entry_id: entry.id as string,
          type: "action_item",
          payload: { text, completed: false },
          sort_order: i,
        }))
      );
    }

    if (structured.mood_score) {
      await logMood({
        user_id: userId,
        score: structured.mood_score,
        note: "From voice journal",
      });
    }

    const profile = await getProfile(userId);

    if (profile.ai_consent_level === "full") {
      const memories = await extractMemoriesFromEntry(structured.body_md);
      for (const m of memories) {
        await saveMemory({
          user_id: userId,
          content: m.content,
          type: m.type,
          importance: m.importance || 5,
        });
      }
    }

    return NextResponse.json({
      entry,
      follow_up_question: structured.follow_up_question,
      action_items: structured.action_items,
    });
  } catch (error) {
    console.error("Voice journal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    );
  }
}
