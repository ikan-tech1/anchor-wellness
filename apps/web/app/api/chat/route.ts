import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@anchor/db/server";
import {
  buildCompanionContext,
  getSystemMessage,
  checkForCrisis,
  CRISIS_RESPONSE,
} from "@anchor/ai";
import { TOOL_DEFINITIONS, executeTool } from "@anchor/ai/tools";
import { createChatCompletion } from "@anchor/ai/providers";
import type OpenAI from "openai";

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

    const { message, sessionId: existingSessionId } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const crisis = checkForCrisis(message);
    if (crisis.isCrisis) {
      return NextResponse.json({
        content: CRISIS_RESPONSE,
        sessionId: existingSessionId,
        toolResults: [],
      });
    }

    let sessionId = existingSessionId;
    if (!sessionId) {
      const { data: session } = await supabase
        .from("conversation_sessions")
        .insert({ user_id: user.id, title: message.slice(0, 50) })
        .select()
        .single();
      sessionId = session?.id;
    }

    await supabase.from("messages").insert({
      session_id: sessionId,
      role: "user",
      content: message,
    });

    const context = await buildCompanionContext(supabase, user.id);

    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(20);

    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      getSystemMessage(context),
      ...(history || []).map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ];

    let response = await createChatCompletion(chatMessages, {
      tools: TOOL_DEFINITIONS,
    });

    let assistantMessage = response.choices[0]?.message;
    const toolResults: Array<{ name: string; deepLink?: string }> = [];

    while (assistantMessage?.tool_calls?.length) {
      chatMessages.push(assistantMessage);

      for (const toolCall of assistantMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments || "{}");
        const result = await executeTool(toolCall.function.name, args, {
          userId: user.id,
          supabase,
        });

        toolResults.push({
          name: toolCall.function.name,
          deepLink: result.deepLink,
        });

        chatMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      response = await createChatCompletion(chatMessages, {
        tools: TOOL_DEFINITIONS,
      });
      assistantMessage = response.choices[0]?.message;
    }

    const content =
      assistantMessage?.content ||
      "I'm here to help. What would you like to explore?";

    await supabase.from("messages").insert({
      session_id: sessionId,
      role: "assistant",
      content,
      tool_calls: toolResults.length ? toolResults : null,
    });

    await supabase
      .from("conversation_sessions")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", sessionId);

    return NextResponse.json({
      content,
      sessionId,
      toolResults,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        content:
          "I'm having trouble connecting right now. Please check your API keys and try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
