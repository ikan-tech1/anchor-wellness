import type OpenAI from "openai";
import type { Json } from "@anchor/db/types";
import {
  createJournalEntry,
  createJournalBlocks,
  updateJournalEntry,
  getJournalEntry,
  logMood,
  findHabitByName,
  logHabit,
  getActiveEnrollment,
  getProgramDayContent,
  getProgramById,
  insertProgramCheckin,
  advanceProgramDay,
  getJournalEntries,
  getRecentMoods,
  saveMemory,
} from "@anchor/db";

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
  switch (name as ToolName) {
    case "create_journal_entry": {
      const entry = await createJournalEntry({
        user_id: ctx.userId,
        title: args.title as string,
        body_md: (args.body_md as string) || "",
        mood_score: args.mood_score as number | undefined,
        tags: (args.tags as string[]) || [],
        ritual_type: args.ritual_type as "morning" | "evening" | "freeform" | undefined,
        source: "ai",
      });

      const actionItems = (args.action_items as string[]) || [];
      if (actionItems.length > 0) {
        await createJournalBlocks(
          actionItems.map((text, i) => ({
            entry_id: entry.id as string,
            type: "action_item",
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
        const existing = await getJournalEntry(entryId);
        await updateJournalEntry(entryId, {
          body_md: `${(existing.body_md as string) || ""}\n\n${args.content}`,
        });
      }
      const actionItems = (args.action_items as string[]) || [];
      if (actionItems.length > 0) {
        await createJournalBlocks(
          actionItems.map((text, i) => ({
            entry_id: entryId,
            type: "action_item",
            payload: { text, completed: false },
            sort_order: i,
          }))
        );
      }
      return { success: true, deepLink: `/journal/${entryId}` };
    }

    case "log_mood": {
      const data = await logMood({
        user_id: ctx.userId,
        score: args.score as number,
        note: args.note as string | undefined,
      });
      return { success: true, data };
    }

    case "log_habit": {
      const habitName = args.habit_name as string;
      const habit = await findHabitByName(ctx.userId, habitName);
      if (!habit) {
        return { success: false, error: `Habit "${habitName}" not found` };
      }
      const data = await logHabit(habit.id as string, args.note as string | undefined);
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
      const enrollment = await getActiveEnrollment(ctx.userId);
      if (!enrollment) {
        return { success: false, error: "No active program enrollment" };
      }
      if (args.action === "fetch") {
        const [dayContent, program] = await Promise.all([
          getProgramDayContent(
            enrollment.program_id as string,
            enrollment.current_day as number
          ),
          getProgramById(enrollment.program_id as string),
        ]);
        return { success: true, data: { enrollment, dayContent, program } };
      }
      await insertProgramCheckin({
        enrollment_id: enrollment.id as string,
        day_number: enrollment.current_day as number,
        responses: (args.responses as Json) || {},
      });
      await advanceProgramDay(
        enrollment.id as string,
        (enrollment.current_day as number) + 1
      );
      return {
        success: true,
        data: { nextDay: (enrollment.current_day as number) + 1 },
      };
    }

    case "search_journal": {
      const data = await getJournalEntries(ctx.userId, {
        search: args.query as string,
        limit: (args.limit as number) || 5,
      });
      return { success: true, data };
    }

    case "get_insights": {
      const days = (args.days as number) || 7;
      const since = new Date();
      since.setDate(since.getDate() - days);
      const [moods, entries] = await Promise.all([
        getRecentMoods(ctx.userId, days),
        getJournalEntries(ctx.userId, { limit: 50 }),
      ]);
      const filteredEntries = entries.filter(
        (e) => new Date(e.created_at) >= since
      );
      const avgMood = moods.length
        ? moods.reduce((s, m) => s + (m.score as number), 0) / moods.length
        : null;
      return {
        success: true,
        data: {
          avgMood,
          moodCount: moods.length,
          entryCount: filteredEntries.length,
          recentEntries: filteredEntries.slice(-3),
        },
      };
    }

    case "save_memory": {
      const data = await saveMemory({
        user_id: ctx.userId,
        content: args.content as string,
        type: args.type as string,
        importance: (args.importance as number) || 5,
      });
      return { success: true, data };
    }

    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}
