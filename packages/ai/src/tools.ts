import type OpenAI from "openai";

export const TOOL_DEFINITIONS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "create_journal_entry",
      description:
        "Create a new journal entry with title, markdown body, optional mood score (1-5), tags, ritual type, and action items.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Entry title" },
          body_md: { type: "string", description: "Journal content in markdown" },
          mood_score: { type: "number", minimum: 1, maximum: 5 },
          tags: { type: "array", items: { type: "string" } },
          ritual_type: {
            type: "string",
            enum: ["morning", "evening", "freeform"],
          },
          action_items: {
            type: "array",
            items: { type: "string" },
            description: "Extracted action items from the conversation",
          },
        },
        required: ["title", "body_md"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "append_to_entry",
      description: "Append content or action items to an existing journal entry.",
      parameters: {
        type: "object",
        properties: {
          entry_id: { type: "string" },
          content: { type: "string" },
          action_items: { type: "array", items: { type: "string" } },
        },
        required: ["entry_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_mood",
      description: "Log a mood check-in for the user (1=very low, 5=great).",
      parameters: {
        type: "object",
        properties: {
          score: { type: "number", minimum: 1, maximum: 5 },
          note: { type: "string" },
        },
        required: ["score"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "log_habit",
      description: "Mark a habit as complete for today.",
      parameters: {
        type: "object",
        properties: {
          habit_name: { type: "string", description: "Name of the habit to log" },
          note: { type: "string" },
        },
        required: ["habit_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "start_breathing",
      description: "Suggest a breathing exercise and log intent.",
      parameters: {
        type: "object",
        properties: {
          pattern: {
            type: "string",
            enum: ["box", "478", "physiological_sigh", "calm"],
          },
          cycles: { type: "number", default: 4 },
        },
        required: ["pattern"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "start_meditation",
      description: "Start a meditation timer session.",
      parameters: {
        type: "object",
        properties: {
          duration_sec: { type: "number", default: 300 },
          ambient: {
            type: "string",
            enum: ["rain", "forest", "ocean", "silence", "white_noise"],
          },
        },
        required: ["duration_sec"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_program_checkin",
      description: "Get today's program check-in prompts or submit answers.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["fetch", "submit"] },
          responses: { type: "object" },
        },
        required: ["action"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_journal",
      description: "Search journal entries by keyword.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          limit: { type: "number", default: 5 },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_insights",
      description: "Get weekly mood trends and journal patterns.",
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", default: 7 },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_memory",
      description: "Save a durable fact about the user for future conversations.",
      parameters: {
        type: "object",
        properties: {
          content: { type: "string" },
          type: {
            type: "string",
            enum: ["fact", "preference", "goal", "summary"],
          },
          importance: { type: "number", minimum: 1, maximum: 10, default: 5 },
        },
        required: ["content", "type"],
      },
    },
  },
];

export type ToolName =
  | "create_journal_entry"
  | "append_to_entry"
  | "log_mood"
  | "log_habit"
  | "start_breathing"
  | "start_meditation"
  | "get_program_checkin"
  | "search_journal"
  | "get_insights"
  | "save_memory";

export interface ToolContext {
  userId: string;
  supabase: import("@supabase/supabase-js").SupabaseClient;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  deepLink?: string;
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  const db = ctx.supabase;

  switch (name as ToolName) {
    case "create_journal_entry": {
      const { data: entry, error } = await db
        .from("journal_entries")
        .insert({
          user_id: ctx.userId,
          title: args.title as string,
          body_md: (args.body_md as string) || "",
          mood_score: args.mood_score as number | undefined,
          tags: (args.tags as string[]) || [],
          ritual_type: args.ritual_type as "morning" | "evening" | "freeform" | undefined,
          source: "ai",
        })
        .select()
        .single();
      if (error) return { success: false, error: error.message };

      const actionItems = (args.action_items as string[]) || [];
      if (actionItems.length > 0) {
        await db.from("journal_blocks").insert(
          actionItems.map((text, i) => ({
            entry_id: entry.id,
            type: "action_item" as const,
            payload: { text, completed: false },
            sort_order: i,
          }))
        );
      }
      return {
        success: true,
        data: entry,
        deepLink: `/journal/${entry.id}`,
      };
    }

    case "append_to_entry": {
      const entryId = args.entry_id as string;
      if (args.content) {
        const { data: existing } = await db
          .from("journal_entries")
          .select("body_md")
          .eq("id", entryId)
          .single();
        await db
          .from("journal_entries")
          .update({
            body_md: `${existing?.body_md || ""}\n\n${args.content}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", entryId);
      }
      const actionItems = (args.action_items as string[]) || [];
      if (actionItems.length > 0) {
        await db.from("journal_blocks").insert(
          actionItems.map((text, i) => ({
            entry_id: entryId,
            type: "action_item" as const,
            payload: { text, completed: false },
            sort_order: i,
          }))
        );
      }
      return { success: true, deepLink: `/journal/${entryId}` };
    }

    case "log_mood": {
      const { data, error } = await db
        .from("mood_checkins")
        .insert({
          user_id: ctx.userId,
          score: args.score as number,
          note: args.note as string | undefined,
        })
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    }

    case "log_habit": {
      const habitName = args.habit_name as string;
      const { data: habits } = await db
        .from("habits")
        .select("id")
        .eq("user_id", ctx.userId)
        .ilike("name", `%${habitName}%`)
        .limit(1);
      if (!habits?.length) {
        return { success: false, error: `Habit "${habitName}" not found` };
      }
      const { data, error } = await db
        .from("habit_logs")
        .insert({
          habit_id: habits[0].id,
          note: args.note as string | undefined,
        })
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    }

    case "start_breathing":
      return {
        success: true,
        deepLink: `/calm/breathe?pattern=${args.pattern}&cycles=${args.cycles || 4}`,
        data: { pattern: args.pattern, cycles: args.cycles || 4 },
      };

    case "start_meditation":
      return {
        success: true,
        deepLink: `/calm/meditate?duration=${args.duration_sec || 300}&ambient=${args.ambient || "silence"}`,
        data: args,
      };

    case "get_program_checkin": {
      const { data: enrollment } = await db
        .from("program_enrollments")
        .select("*")
        .eq("user_id", ctx.userId)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      if (!enrollment) {
        return { success: false, error: "No active program enrollment" };
      }
      if (args.action === "fetch") {
        const [{ data: dayContent }, { data: program }] = await Promise.all([
          db
            .from("program_day_content")
            .select("*")
            .eq("program_id", enrollment.program_id)
            .eq("day_number", enrollment.current_day)
            .single(),
          db.from("programs").select("*").eq("id", enrollment.program_id).single(),
        ]);
        return { success: true, data: { enrollment, dayContent, program } };
      }
      await db.from("program_checkins").insert({
        enrollment_id: enrollment.id,
        day_number: enrollment.current_day,
        responses: args.responses || {},
      });
      await db
        .from("program_enrollments")
        .update({ current_day: enrollment.current_day + 1 })
        .eq("id", enrollment.id);
      return { success: true, data: { nextDay: enrollment.current_day + 1 } };
    }

    case "search_journal": {
      const query = args.query as string;
      const { data, error } = await db
        .from("journal_entries")
        .select("id, title, body_md, created_at, mood_score, tags")
        .eq("user_id", ctx.userId)
        .or(`title.ilike.%${query}%,body_md.ilike.%${query}%`)
        .limit((args.limit as number) || 5);
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    }

    case "get_insights": {
      const days = (args.days as number) || 7;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const [moods, entries] = await Promise.all([
        db
          .from("mood_checkins")
          .select("*")
          .eq("user_id", ctx.userId)
          .gte("logged_at", since.toISOString())
          .order("logged_at"),
        db
          .from("journal_entries")
          .select("id, title, mood_score, created_at")
          .eq("user_id", ctx.userId)
          .gte("created_at", since.toISOString())
          .order("created_at"),
      ]);
      const avgMood =
        moods.data?.length
          ? moods.data.reduce((s, m) => s + m.score, 0) / moods.data.length
          : null;
      return {
        success: true,
        data: {
          avgMood,
          moodCount: moods.data?.length || 0,
          entryCount: entries.data?.length || 0,
          recentEntries: entries.data?.slice(-3),
        },
      };
    }

    case "save_memory": {
      const { data, error } = await db
        .from("memories")
        .insert({
          user_id: ctx.userId,
          content: args.content as string,
          type: args.type as "fact" | "preference" | "goal" | "summary",
          importance: (args.importance as number) || 5,
        })
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    }

    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}
