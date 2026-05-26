import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@anchor/db/server";
import {
  buildCompanionContext,
  processVoiceToJournal,
  extractMemoriesFromEntry,
} from "@anchor/ai/companion";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transcript } = await request.json();

    if (!transcript?.trim()) {
      return NextResponse.json({ error: "Transcript required" }, { status: 400 });
    }

    const context = await buildCompanionContext(supabase, user.id);
    const structured = await processVoiceToJournal(transcript, context);

    const { data: entry, error } = await supabase
      .from("journal_entries")
      .insert({
        user_id: user.id,
        title: structured.title,
        body_md: structured.body_md,
        mood_score: structured.mood_score,
        tags: structured.tags || ["voice"],
        source: "voice",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (structured.action_items?.length) {
      await supabase.from("journal_blocks").insert(
        structured.action_items.map((text: string, i: number) => ({
          entry_id: entry.id,
          type: "action_item" as const,
          payload: { text, completed: false },
          sort_order: i,
        }))
      );
    }

    if (structured.mood_score) {
      await supabase.from("mood_checkins").insert({
        user_id: user.id,
        score: structured.mood_score,
        note: "From voice journal",
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_consent_level")
      .eq("id", user.id)
      .single();

    if (profile?.ai_consent_level === "full") {
      const memories = await extractMemoriesFromEntry(structured.body_md);
      if (memories.length) {
        await supabase.from("memories").insert(
          memories.map((m) => ({
            user_id: user.id,
            content: m.content,
            type: m.type as "fact" | "preference" | "goal" | "summary",
            importance: m.importance || 5,
          }))
        );
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
