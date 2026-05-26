-- Journal templates (15+ guided templates)
INSERT INTO journal_templates (slug, title, category, description, prompts, is_system) VALUES
('morning-intention', 'Morning Intention', 'ritual', 'Set your intention for the day', '["What would make today meaningful?", "What is one thing I want to focus on?", "How do I want to show up today?"]', true),
('evening-reflection', 'Evening Reflection', 'ritual', 'Reflect on your day before sleep', '["What went well today?", "What challenged me?", "What am I grateful for?", "What would I do differently?"]', true),
('gratitude', 'Gratitude Practice', 'gratitude', 'Three things you are grateful for', '["Three things I am grateful for today:", "Someone who made my day better:", "A small moment of joy:"]', true),
('cbt-thought-record', 'CBT Thought Record', 'cbt', 'Challenge negative thought patterns', '["Situation: What happened?", "Automatic thought:", "Emotion and intensity (1-10):", "Evidence for this thought:", "Evidence against:", "Balanced alternative thought:"]', true),
('therapy-prep', 'Therapy Session Prep', 'therapy', 'Prepare for your therapy appointment', '["Topics I want to discuss:", "Progress since last session:", "Questions for my therapist:", "How I have been feeling overall:"]', true),
('dream-journal', 'Dream Journal', 'dreams', 'Capture and explore your dreams', '["Describe the dream:", "Emotions during the dream:", "Symbols or themes:", "What might this mean to me?"]', true),
('anxiety-release', 'Anxiety Release', 'anxiety', 'Process anxious thoughts and feelings', '["What am I anxious about?", "Where do I feel it in my body?", "What is the worst that could happen?", "What is most likely to happen?", "What can I control right now?"]', true),
('relationship-check', 'Relationship Check-in', 'relationships', 'Reflect on an important relationship', '["Who am I thinking about?", "How has this relationship been lately?", "What do I appreciate about them?", "What do I need from this relationship?"]', true),
('weekly-review', 'Weekly Review', 'reflection', 'Review your week with clarity', '["Biggest win this week:", "Biggest challenge:", "What did I learn?", "What do I want to focus on next week?"]', true),
('values-alignment', 'Values Alignment', 'reflection', 'Check if your actions align with your values', '["My core values are:", "This week I lived my values by:", "Where I fell short:", "One action to align better:"]', true),
('self-compassion', 'Self-Compassion Letter', 'self-care', 'Write a compassionate letter to yourself', '["Dear self, I know you are going through...", "It is okay to feel...", "You are doing your best because...", "I forgive you for...", "You deserve..."]', true),
('future-self', 'Letter to Future Self', 'reflection', 'Write to yourself 1 year from now', '["Dear future me,", "Right now I am...", "I hope you have...", "Remember that...", "I am proud of you for..."]', true),
('stress-inventory', 'Stress Inventory', 'anxiety', 'Map your current stressors', '["What is causing stress right now?", "What is within my control?", "What is outside my control?", "One small step I can take:"]', true),
('win-celebration', 'Celebrate a Win', 'gratitude', 'Acknowledge and savor a recent success', '["What did I accomplish?", "How did it feel?", "Who helped me?", "What did I learn about myself?"]', true),
('mindful-moment', 'Mindful Moment', 'mindfulness', 'Capture a moment of presence', '["Where am I right now?", "What do I see, hear, feel?", "What emotion is present?", "One breath of gratitude:"]', true),
('goal-setting', 'Goal Setting', 'goals', 'Define and plan a meaningful goal', '["My goal is:", "Why this matters to me:", "First small step:", "Potential obstacles:", "How I will measure progress:"]', true),
('forgiveness', 'Forgiveness Practice', 'self-care', 'Work through forgiveness', '["Who or what am I holding resentment toward?", "How has this affected me?", "What would forgiveness look like?", "What am I ready to release?"]', true),
('energy-audit', 'Energy Audit', 'reflection', 'Track what drains and energizes you', '["What gave me energy today?", "What drained my energy?", "People who uplifted me:", "One boundary I need to set:"]', true);

-- Seed programs
INSERT INTO programs (slug, title, description, goal_type, duration_days, metadata) VALUES
('mindfulness-30', 'Mindfulness 30', 'Build a daily mindfulness practice over 30 days', 'mindfulness', 30, '{"icon": "🧘", "color": "sage"}'),
('gratitude-30', 'Gratitude 30', 'Cultivate daily gratitude and appreciation', 'gratitude', 30, '{"icon": "🙏", "color": "anchor"}'),
('journaling-habit-30', 'Journaling Habit 30', 'Establish a consistent daily journaling practice', 'journaling', 30, '{"icon": "📝", "color": "anchor"}'),
('sleep-reset-30', 'Sleep Reset 30', 'Improve sleep quality with evening rituals and habits', 'sleep', 30, '{"icon": "🌙", "color": "sage"}'),
('digital-detox-30', 'Digital Detox 30', 'Reduce screen time and reclaim attention', 'digital_wellness', 30, '{"icon": "📵", "color": "anchor"}'),
('wellness-reset-30', 'Wellness Reset 30', 'Holistic 30-day wellness transformation', 'wellness', 30, '{"icon": "🌱", "color": "sage"}');

-- Sample program day content for Mindfulness 30 (days 1-7 as examples, rest generated similarly)
INSERT INTO program_day_content (program_id, day_number, content)
SELECT p.id, d.day_number, d.content
FROM programs p
CROSS JOIN (VALUES
  (1, '{"title": "Welcome to Mindfulness", "prompt": "What brings you to this practice?", "meditation_min": 5, "journal_prompt": "Why do I want to be more mindful?"}'),
  (2, '{"title": "Breath Awareness", "prompt": "Focus on your breath for 5 minutes", "meditation_min": 5, "journal_prompt": "What did I notice about my breath today?"}'),
  (3, '{"title": "Body Scan", "prompt": "Scan your body from head to toe", "meditation_min": 10, "journal_prompt": "Where did I hold tension today?"}'),
  (4, '{"title": "Mindful Eating", "prompt": "Eat one meal mindfully today", "meditation_min": 5, "journal_prompt": "What did mindful eating reveal?"}'),
  (5, '{"title": "Walking Meditation", "prompt": "Take a 10-minute mindful walk", "meditation_min": 10, "journal_prompt": "What did I notice while walking?"}'),
  (6, '{"title": "Gratitude Pause", "prompt": "Pause 3 times today to notice something good", "meditation_min": 5, "journal_prompt": "Three moments of gratitude today:"}'),
  (7, '{"title": "Week One Reflection", "prompt": "Reflect on your first week", "meditation_min": 10, "journal_prompt": "What has changed in my awareness this week?"}')
) AS d(day_number, content)
WHERE p.slug = 'mindfulness-30';

-- Gratitude 30 days 1-3
INSERT INTO program_day_content (program_id, day_number, content)
SELECT p.id, d.day_number, d.content::jsonb
FROM programs p
CROSS JOIN (VALUES
  (1, '{"title": "Three Good Things", "prompt": "Write three good things from today", "journal_prompt": "Three good things:"}'),
  (2, '{"title": "Gratitude for People", "prompt": "Who are you grateful for?", "journal_prompt": "People I am grateful for:"}'),
  (3, '{"title": "Gratitude for Challenges", "prompt": "Find gratitude in a difficulty", "journal_prompt": "A challenge I am grateful for:"}')
) AS d(day_number, content)
WHERE p.slug = 'gratitude-30';

-- Default habits suggestion (users create their own, but we seed templates concept via metadata)
-- Breathing presets stored as reference in metadata comments
