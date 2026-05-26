-- Row Level Security policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_day_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Memories
CREATE POLICY "Users can manage own memories" ON memories FOR ALL USING (auth.uid() = user_id);

-- Conversation sessions
CREATE POLICY "Users can manage own sessions" ON conversation_sessions FOR ALL USING (auth.uid() = user_id);

-- Messages (via session ownership)
CREATE POLICY "Users can manage own messages" ON messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM conversation_sessions cs
    WHERE cs.id = messages.session_id AND cs.user_id = auth.uid()
  ));

-- Journal entries
CREATE POLICY "Users can manage own journal entries" ON journal_entries FOR ALL USING (auth.uid() = user_id);

-- Journal blocks (via entry ownership)
CREATE POLICY "Users can manage own journal blocks" ON journal_blocks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM journal_entries je
    WHERE je.id = journal_blocks.entry_id AND je.user_id = auth.uid()
  ));

-- Journal templates (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read templates" ON journal_templates FOR SELECT TO authenticated USING (true);

-- Mood check-ins
CREATE POLICY "Users can manage own mood checkins" ON mood_checkins FOR ALL USING (auth.uid() = user_id);

-- Habits
CREATE POLICY "Users can manage own habits" ON habits FOR ALL USING (auth.uid() = user_id);

-- Habit logs (via habit ownership)
CREATE POLICY "Users can manage own habit logs" ON habit_logs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM habits h
    WHERE h.id = habit_logs.habit_id AND h.user_id = auth.uid()
  ));

-- Meditation sessions
CREATE POLICY "Users can manage own meditation sessions" ON meditation_sessions FOR ALL USING (auth.uid() = user_id);

-- Breathing sessions
CREATE POLICY "Users can manage own breathing sessions" ON breathing_sessions FOR ALL USING (auth.uid() = user_id);

-- Programs (read-only for all authenticated)
CREATE POLICY "Authenticated users can read programs" ON programs FOR SELECT TO authenticated USING (is_active = true);

-- Program enrollments
CREATE POLICY "Users can manage own enrollments" ON program_enrollments FOR ALL USING (auth.uid() = user_id);

-- Program day content (read via program)
CREATE POLICY "Authenticated users can read program content" ON program_day_content FOR SELECT TO authenticated USING (true);

-- Program check-ins (via enrollment ownership)
CREATE POLICY "Users can manage own program checkins" ON program_checkins FOR ALL
  USING (EXISTS (
    SELECT 1 FROM program_enrollments pe
    WHERE pe.id = program_checkins.enrollment_id AND pe.user_id = auth.uid()
  ));

-- Weekly insights
CREATE POLICY "Users can manage own insights" ON weekly_insights FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for voice/media (run via Supabase dashboard or CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('journal-media', 'journal-media', false);
