export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          timezone: string;
          onboarding_completed: boolean;
          ai_consent_level: "none" | "basic" | "full";
          app_passcode_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          timezone?: string;
          onboarding_completed?: boolean;
          ai_consent_level?: "none" | "basic" | "full";
          app_passcode_hash?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      memories: {
        Row: {
          id: string;
          user_id: string;
          type: "fact" | "preference" | "goal" | "summary";
          content: string;
          embedding: number[] | null;
          importance: number;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "fact" | "preference" | "goal" | "summary";
          content: string;
          embedding?: number[] | null;
          importance?: number;
          expires_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["memories"]["Insert"]>;
        Relationships: [];
      };
      conversation_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          summary: string | null;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          summary?: string | null;
          last_message_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversation_sessions"]["Insert"]>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          session_id: string;
          role: "user" | "assistant" | "system" | "tool";
          content: string;
          tool_calls: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: "user" | "assistant" | "system" | "tool";
          content: string;
          tool_calls?: Json | null;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
        Relationships: [];
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body_md: string;
          mood_score: number | null;
          tags: string[];
          ritual_type: "morning" | "evening" | "freeform" | null;
          is_private: boolean;
          is_locked: boolean;
          ai_retrieval_allowed: boolean;
          source: "manual" | "voice" | "ai" | "template";
          template_slug: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body_md?: string;
          mood_score?: number | null;
          tags?: string[];
          ritual_type?: "morning" | "evening" | "freeform" | null;
          is_private?: boolean;
          is_locked?: boolean;
          ai_retrieval_allowed?: boolean;
          source?: "manual" | "voice" | "ai" | "template";
          template_slug?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["journal_entries"]["Insert"]>;
        Relationships: [];
      };
      journal_blocks: {
        Row: {
          id: string;
          entry_id: string;
          type: "text" | "audio" | "image" | "video" | "action_item" | "quote";
          payload: Json;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_id: string;
          type: "text" | "audio" | "image" | "video" | "action_item" | "quote";
          payload?: Json;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["journal_blocks"]["Insert"]>;
        Relationships: [];
      };
      journal_templates: {
        Row: {
          id: string;
          slug: string;
          title: string;
          category: string;
          description: string | null;
          prompts: Json;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          category: string;
          description?: string | null;
          prompts?: Json;
          is_system?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["journal_templates"]["Insert"]>;
        Relationships: [];
      };
      mood_checkins: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          note: string | null;
          logged_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score: number;
          note?: string | null;
          logged_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["mood_checkins"]["Insert"]>;
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          cadence: "daily" | "weekly";
          icon: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          cadence?: "daily" | "weekly";
          icon?: string;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["habits"]["Insert"]>;
        Relationships: [];
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          completed_at: string;
          note: string | null;
        };
        Insert: {
          id?: string;
          habit_id: string;
          completed_at?: string;
          note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["habit_logs"]["Insert"]>;
        Relationships: [];
      };
      meditation_sessions: {
        Row: {
          id: string;
          user_id: string;
          type: "timer" | "guided";
          duration_sec: number;
          ambient: string | null;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: "timer" | "guided";
          duration_sec: number;
          ambient?: string | null;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["meditation_sessions"]["Insert"]>;
        Relationships: [];
      };
      breathing_sessions: {
        Row: {
          id: string;
          user_id: string;
          pattern: string;
          cycles: number;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pattern: string;
          cycles?: number;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["breathing_sessions"]["Insert"]>;
        Relationships: [];
      };
      programs: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          goal_type: string;
          duration_days: number;
          metadata: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          goal_type: string;
          duration_days?: number;
          metadata?: Json;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["programs"]["Insert"]>;
        Relationships: [];
      };
      program_enrollments: {
        Row: {
          id: string;
          user_id: string;
          program_id: string;
          start_date: string;
          status: "active" | "completed" | "paused" | "abandoned";
          current_day: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          program_id: string;
          start_date?: string;
          status?: "active" | "completed" | "paused" | "abandoned";
          current_day?: number;
        };
        Update: Partial<Database["public"]["Tables"]["program_enrollments"]["Insert"]>;
        Relationships: [];
      };
      program_day_content: {
        Row: {
          id: string;
          program_id: string;
          day_number: number;
          content: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          day_number: number;
          content?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["program_day_content"]["Insert"]>;
        Relationships: [];
      };
      program_checkins: {
        Row: {
          id: string;
          enrollment_id: string;
          day_number: number;
          responses: Json;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          enrollment_id: string;
          day_number: number;
          responses?: Json;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["program_checkins"]["Insert"]>;
        Relationships: [];
      };
      weekly_insights: {
        Row: {
          id: string;
          user_id: string;
          week_start: string;
          summary_md: string;
          patterns: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start: string;
          summary_md?: string;
          patterns?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["weekly_insights"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_memories: {
        Args: {
          query_embedding: number[];
          match_threshold?: number;
          match_count?: number;
          p_user_id: string;
        };
        Returns: {
          id: string;
          content: string;
          type: string;
          importance: number;
          similarity: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];
export type JournalBlock = Database["public"]["Tables"]["journal_blocks"]["Row"];
export type MoodCheckin = Database["public"]["Tables"]["mood_checkins"]["Row"];
export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type Program = Database["public"]["Tables"]["programs"]["Row"];
export type ProgramEnrollment = Database["public"]["Tables"]["program_enrollments"]["Row"];
export type ConversationSession = Database["public"]["Tables"]["conversation_sessions"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Memory = Database["public"]["Tables"]["memories"]["Row"];
