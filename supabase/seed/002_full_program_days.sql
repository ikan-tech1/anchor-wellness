-- Auto-generated full 30-day program content for all seed programs
-- Run after 001_templates_and_programs.sql

DELETE FROM program_day_content
WHERE program_id IN (SELECT id FROM programs WHERE slug IN ('mindfulness-30', 'gratitude-30', 'journaling-habit-30', 'sleep-reset-30', 'digital-detox-30', 'wellness-reset-30'));


INSERT INTO program_day_content (program_id, day_number, content)
SELECT p.id, d.day_number, d.content
FROM programs p
CROSS JOIN (VALUES
  (1, '{"title":"Mindfulness · Foundation · Day 1","prompt":"Notice your breath for 5 minutes without changing it.","journal_prompt":"What did I notice about my attention today?","meditation_min":5,"day":1,"week":1,"phase":"Foundation"}'::jsonb),
  (2, '{"title":"Mindfulness · Foundation · Day 2","prompt":"Scan your body from head to toe with gentle attention.","journal_prompt":"Where did my mind wander, and how did I return?","meditation_min":5,"day":2,"week":1,"phase":"Foundation"}'::jsonb),
  (3, '{"title":"Mindfulness · Foundation · Day 3","prompt":"Eat one meal with full sensory awareness.","journal_prompt":"What sensations stood out during body awareness?","meditation_min":5,"day":3,"week":1,"phase":"Foundation"}'::jsonb),
  (4, '{"title":"Mindfulness · Foundation · Day 4","prompt":"Take a 10-minute mindful walk outdoors.","journal_prompt":"What did mindful eating reveal about my habits?","meditation_min":5,"day":4,"week":1,"phase":"Foundation"}'::jsonb),
  (5, '{"title":"Mindfulness · Foundation · Day 5","prompt":"Pause three times today to notice something pleasant. Optional: share one insight with someone you trust.","journal_prompt":"What did I notice while walking mindfully?","meditation_min":5,"day":5,"week":1,"phase":"Foundation"}'::jsonb),
  (6, '{"title":"Mindfulness · Foundation · Day 6","prompt":"Practice loving-kindness toward yourself for 5 minutes.","journal_prompt":"Three small moments of gratitude I paused for:","meditation_min":5,"day":6,"week":1,"phase":"Foundation"}'::jsonb),
  (7, '{"title":"Mindfulness · Foundation · Day 7","prompt":"Observe thoughts as clouds passing through the sky. Take time for a weekly reflection on your progress.","journal_prompt":"How did self-compassion feel in practice?","meditation_min":5,"day":7,"week":1,"phase":"Foundation"}'::jsonb),
  (8, '{"title":"Mindfulness · Building · Day 8","prompt":"Listen to ambient sounds for 5 minutes with eyes closed.","journal_prompt":"What thoughts came and went without hooking me?","meditation_min":5,"day":8,"week":2,"phase":"Building"}'::jsonb),
  (9, '{"title":"Mindfulness · Building · Day 9","prompt":"Practice mindful stretching for 10 minutes.","journal_prompt":"What sounds or silence did I appreciate?","meditation_min":5,"day":9,"week":2,"phase":"Building"}'::jsonb),
  (10, '{"title":"Mindfulness · Building · Day 10","prompt":"Notice the space between stimulus and response today. Optional: share one insight with someone you trust.","journal_prompt":"How does my body feel after mindful movement?","meditation_min":5,"day":10,"week":2,"phase":"Building"}'::jsonb),
  (11, '{"title":"Mindfulness · Building · Day 11","prompt":"Notice your breath for 5 minutes without changing it.","journal_prompt":"What did I notice about my attention today?","meditation_min":10,"day":11,"week":2,"phase":"Building"}'::jsonb),
  (12, '{"title":"Mindfulness · Building · Day 12","prompt":"Scan your body from head to toe with gentle attention.","journal_prompt":"Where did my mind wander, and how did I return?","meditation_min":10,"day":12,"week":2,"phase":"Building"}'::jsonb),
  (13, '{"title":"Mindfulness · Building · Day 13","prompt":"Eat one meal with full sensory awareness.","journal_prompt":"What sensations stood out during body awareness?","meditation_min":10,"day":13,"week":2,"phase":"Building"}'::jsonb),
  (14, '{"title":"Mindfulness · Building · Day 14","prompt":"Take a 10-minute mindful walk outdoors. Take time for a weekly reflection on your progress.","journal_prompt":"What did mindful eating reveal about my habits?","meditation_min":10,"day":14,"week":2,"phase":"Building"}'::jsonb),
  (15, '{"title":"Mindfulness · Deepening · Day 15","prompt":"Pause three times today to notice something pleasant. Optional: share one insight with someone you trust.","journal_prompt":"What did I notice while walking mindfully?","meditation_min":10,"day":15,"week":3,"phase":"Deepening"}'::jsonb),
  (16, '{"title":"Mindfulness · Deepening · Day 16","prompt":"Practice loving-kindness toward yourself for 5 minutes.","journal_prompt":"Three small moments of gratitude I paused for:","meditation_min":10,"day":16,"week":3,"phase":"Deepening"}'::jsonb),
  (17, '{"title":"Mindfulness · Deepening · Day 17","prompt":"Observe thoughts as clouds passing through the sky.","journal_prompt":"How did self-compassion feel in practice?","meditation_min":10,"day":17,"week":3,"phase":"Deepening"}'::jsonb),
  (18, '{"title":"Mindfulness · Deepening · Day 18","prompt":"Listen to ambient sounds for 5 minutes with eyes closed.","journal_prompt":"What thoughts came and went without hooking me?","meditation_min":10,"day":18,"week":3,"phase":"Deepening"}'::jsonb),
  (19, '{"title":"Mindfulness · Deepening · Day 19","prompt":"Practice mindful stretching for 10 minutes.","journal_prompt":"What sounds or silence did I appreciate?","meditation_min":10,"day":19,"week":3,"phase":"Deepening"}'::jsonb),
  (20, '{"title":"Mindfulness · Deepening · Day 20","prompt":"Notice the space between stimulus and response today. Optional: share one insight with someone you trust.","journal_prompt":"How does my body feel after mindful movement?","meditation_min":10,"day":20,"week":3,"phase":"Deepening"}'::jsonb),
  (21, '{"title":"Mindfulness · Deepening · Day 21","prompt":"Notice your breath for 5 minutes without changing it. Take time for a weekly reflection on your progress.","journal_prompt":"What did I notice about my attention today?","meditation_min":15,"day":21,"week":3,"phase":"Deepening"}'::jsonb),
  (22, '{"title":"Mindfulness · Integration · Day 22","prompt":"Scan your body from head to toe with gentle attention.","journal_prompt":"Where did my mind wander, and how did I return?","meditation_min":15,"day":22,"week":4,"phase":"Integration"}'::jsonb),
  (23, '{"title":"Mindfulness · Integration · Day 23","prompt":"Eat one meal with full sensory awareness.","journal_prompt":"What sensations stood out during body awareness?","meditation_min":15,"day":23,"week":4,"phase":"Integration"}'::jsonb),
  (24, '{"title":"Mindfulness · Integration · Day 24","prompt":"Take a 10-minute mindful walk outdoors.","journal_prompt":"What did mindful eating reveal about my habits?","meditation_min":15,"day":24,"week":4,"phase":"Integration"}'::jsonb),
  (25, '{"title":"Mindfulness · Integration · Day 25","prompt":"Pause three times today to notice something pleasant. Optional: share one insight with someone you trust.","journal_prompt":"What did I notice while walking mindfully?","meditation_min":15,"day":25,"week":4,"phase":"Integration"}'::jsonb),
  (26, '{"title":"Mindfulness · Integration · Day 26","prompt":"Practice loving-kindness toward yourself for 5 minutes.","journal_prompt":"Three small moments of gratitude I paused for:","meditation_min":15,"day":26,"week":4,"phase":"Integration"}'::jsonb),
  (27, '{"title":"Mindfulness · Integration · Day 27","prompt":"Observe thoughts as clouds passing through the sky.","journal_prompt":"How did self-compassion feel in practice?","meditation_min":15,"day":27,"week":4,"phase":"Integration"}'::jsonb),
  (28, '{"title":"Mindfulness · Integration · Day 28","prompt":"Listen to ambient sounds for 5 minutes with eyes closed. Take time for a weekly reflection on your progress.","journal_prompt":"What thoughts came and went without hooking me?","meditation_min":15,"day":28,"week":4,"phase":"Integration"}'::jsonb),
  (29, '{"title":"Mindfulness · Integration · Day 29","prompt":"Practice mindful stretching for 10 minutes.","journal_prompt":"What sounds or silence did I appreciate?","meditation_min":15,"day":29,"week":5,"phase":"Integration"}'::jsonb),
  (30, '{"title":"Mindfulness · Integration · Day 30","prompt":"Notice the space between stimulus and response today. Optional: share one insight with someone you trust.","journal_prompt":"How does my body feel after mindful movement?","meditation_min":15,"day":30,"week":5,"phase":"Integration"}'::jsonb)
) AS d(day_number, content)
WHERE p.slug = 'mindfulness-30';


INSERT INTO program_day_content (program_id, day_number, content)
SELECT p.id, d.day_number, d.content
FROM programs p
CROSS JOIN (VALUES
  (1, '{"title":"Gratitude · Foundation · Day 1","prompt":"Write three good things from today, big or small.","journal_prompt":"Three good things from today:","meditation_min":5,"day":1,"week":1,"phase":"Foundation"}'::jsonb),
  (2, '{"title":"Gratitude · Foundation · Day 2","prompt":"Who made your life better recently? Thank them mentally.","journal_prompt":"People I am grateful for and why:","meditation_min":5,"day":2,"week":1,"phase":"Foundation"}'::jsonb),
  (3, '{"title":"Gratitude · Foundation · Day 3","prompt":"Find one thing to appreciate in a difficulty.","journal_prompt":"A challenge that taught me something:","meditation_min":5,"day":3,"week":1,"phase":"Foundation"}'::jsonb),
  (4, '{"title":"Gratitude · Foundation · Day 4","prompt":"Notice something beautiful you usually overlook.","journal_prompt":"Beauty I noticed today:","meditation_min":5,"day":4,"week":1,"phase":"Foundation"}'::jsonb),
  (5, '{"title":"Gratitude · Foundation · Day 5","prompt":"Write a gratitude letter (you don''t have to send it). Optional: share one insight with someone you trust.","journal_prompt":"Dear [person], I appreciate you because...","meditation_min":5,"day":5,"week":1,"phase":"Foundation"}'::jsonb),
  (6, '{"title":"Gratitude · Foundation · Day 6","prompt":"Appreciate your body for one thing it does well.","journal_prompt":"My body helps me by...","meditation_min":5,"day":6,"week":1,"phase":"Foundation"}'::jsonb),
  (7, '{"title":"Gratitude · Foundation · Day 7","prompt":"List comforts you often take for granted. Take time for a weekly reflection on your progress.","journal_prompt":"Comforts I often overlook:","meditation_min":5,"day":7,"week":1,"phase":"Foundation"}'::jsonb),
  (8, '{"title":"Gratitude · Building · Day 8","prompt":"Recall a mentor or teacher you''re grateful for.","journal_prompt":"Lessons from someone who shaped me:","meditation_min":5,"day":8,"week":2,"phase":"Building"}'::jsonb),
  (9, '{"title":"Gratitude · Building · Day 9","prompt":"Find gratitude in a mundane routine.","journal_prompt":"Gratitude in my daily routine:","meditation_min":5,"day":9,"week":2,"phase":"Building"}'::jsonb),
  (10, '{"title":"Gratitude · Building · Day 10","prompt":"Celebrate a recent small win. Optional: share one insight with someone you trust.","journal_prompt":"A win worth savoring:","meditation_min":5,"day":10,"week":2,"phase":"Building"}'::jsonb),
  (11, '{"title":"Gratitude · Building · Day 11","prompt":"Write three good things from today, big or small.","journal_prompt":"Three good things from today:","meditation_min":10,"day":11,"week":2,"phase":"Building"}'::jsonb),
  (12, '{"title":"Gratitude · Building · Day 12","prompt":"Who made your life better recently? Thank them mentally.","journal_prompt":"People I am grateful for and why:","meditation_min":10,"day":12,"week":2,"phase":"Building"}'::jsonb),
  (13, '{"title":"Gratitude · Building · Day 13","prompt":"Find one thing to appreciate in a difficulty.","journal_prompt":"A challenge that taught me something:","meditation_min":10,"day":13,"week":2,"phase":"Building"}'::jsonb),
  (14, '{"title":"Gratitude · Building · Day 14","prompt":"Notice something beautiful you usually overlook. Take time for a weekly reflection on your progress.","journal_prompt":"Beauty I noticed today:","meditation_min":10,"day":14,"week":2,"phase":"Building"}'::jsonb),
  (15, '{"title":"Gratitude · Deepening · Day 15","prompt":"Write a gratitude letter (you don''t have to send it). Optional: share one insight with someone you trust.","journal_prompt":"Dear [person], I appreciate you because...","meditation_min":10,"day":15,"week":3,"phase":"Deepening"}'::jsonb),
  (16, '{"title":"Gratitude · Deepening · Day 16","prompt":"Appreciate your body for one thing it does well.","journal_prompt":"My body helps me by...","meditation_min":10,"day":16,"week":3,"phase":"Deepening"}'::jsonb),
  (17, '{"title":"Gratitude · Deepening · Day 17","prompt":"List comforts you often take for granted.","journal_prompt":"Comforts I often overlook:","meditation_min":10,"day":17,"week":3,"phase":"Deepening"}'::jsonb),
  (18, '{"title":"Gratitude · Deepening · Day 18","prompt":"Recall a mentor or teacher you''re grateful for.","journal_prompt":"Lessons from someone who shaped me:","meditation_min":10,"day":18,"week":3,"phase":"Deepening"}'::jsonb),
  (19, '{"title":"Gratitude · Deepening · Day 19","prompt":"Find gratitude in a mundane routine.","journal_prompt":"Gratitude in my daily routine:","meditation_min":10,"day":19,"week":3,"phase":"Deepening"}'::jsonb),
  (20, '{"title":"Gratitude · Deepening · Day 20","prompt":"Celebrate a recent small win. Optional: share one insight with someone you trust.","journal_prompt":"A win worth savoring:","meditation_min":10,"day":20,"week":3,"phase":"Deepening"}'::jsonb),
  (21, '{"title":"Gratitude · Deepening · Day 21","prompt":"Write three good things from today, big or small. Take time for a weekly reflection on your progress.","journal_prompt":"Three good things from today:","meditation_min":15,"day":21,"week":3,"phase":"Deepening"}'::jsonb),
  (22, '{"title":"Gratitude · Integration · Day 22","prompt":"Who made your life better recently? Thank them mentally.","journal_prompt":"People I am grateful for and why:","meditation_min":15,"day":22,"week":4,"phase":"Integration"}'::jsonb),
  (23, '{"title":"Gratitude · Integration · Day 23","prompt":"Find one thing to appreciate in a difficulty.","journal_prompt":"A challenge that taught me something:","meditation_min":15,"day":23,"week":4,"phase":"Integration"}'::jsonb),
  (24, '{"title":"Gratitude · Integration · Day 24","prompt":"Notice something beautiful you usually overlook.","journal_prompt":"Beauty I noticed today:","meditation_min":15,"day":24,"week":4,"phase":"Integration"}'::jsonb),
  (25, '{"title":"Gratitude · Integration · Day 25","prompt":"Write a gratitude letter (you don''t have to send it). Optional: share one insight with someone you trust.","journal_prompt":"Dear [person], I appreciate you because...","meditation_min":15,"day":25,"week":4,"phase":"Integration"}'::jsonb),
  (26, '{"title":"Gratitude · Integration · Day 26","prompt":"Appreciate your body for one thing it does well.","journal_prompt":"My body helps me by...","meditation_min":15,"day":26,"week":4,"phase":"Integration"}'::jsonb),
  (27, '{"title":"Gratitude · Integration · Day 27","prompt":"List comforts you often take for granted.","journal_prompt":"Comforts I often overlook:","meditation_min":15,"day":27,"week":4,"phase":"Integration"}'::jsonb),
  (28, '{"title":"Gratitude · Integration · Day 28","prompt":"Recall a mentor or teacher you''re grateful for. Take time for a weekly reflection on your progress.","journal_prompt":"Lessons from someone who shaped me:","meditation_min":15,"day":28,"week":4,"phase":"Integration"}'::jsonb),
  (29, '{"title":"Gratitude · Integration · Day 29","prompt":"Find gratitude in a mundane routine.","journal_prompt":"Gratitude in my daily routine:","meditation_min":15,"day":29,"week":5,"phase":"Integration"}'::jsonb),
  (30, '{"title":"Gratitude · Integration · Day 30","prompt":"Celebrate a recent small win. Optional: share one insight with someone you trust.","journal_prompt":"A win worth savoring:","meditation_min":15,"day":30,"week":5,"phase":"Integration"}'::jsonb)
) AS d(day_number, content)
WHERE p.slug = 'gratitude-30';


INSERT INTO program_day_content (program_id, day_number, content)
SELECT p.id, d.day_number, d.content
FROM programs p
CROSS JOIN (VALUES
  (1, '{"title":"Journal · Foundation · Day 1","prompt":"Free-write for 10 minutes without stopping.","journal_prompt":"Stream of consciousness:","meditation_min":5,"day":1,"week":1,"phase":"Foundation"}'::jsonb),
  (2, '{"title":"Journal · Foundation · Day 2","prompt":"Describe your day in three sentences.","journal_prompt":"Today in three sentences:","meditation_min":5,"day":2,"week":1,"phase":"Foundation"}'::jsonb),
  (3, '{"title":"Journal · Foundation · Day 3","prompt":"Write about a decision you made today.","journal_prompt":"A decision I made and why:","meditation_min":5,"day":3,"week":1,"phase":"Foundation"}'::jsonb),
  (4, '{"title":"Journal · Foundation · Day 4","prompt":"Capture a conversation that stayed with you.","journal_prompt":"A conversation that stayed with me:","meditation_min":5,"day":4,"week":1,"phase":"Foundation"}'::jsonb),
  (5, '{"title":"Journal · Foundation · Day 5","prompt":"Write about something you''re looking forward to. Optional: share one insight with someone you trust.","journal_prompt":"Something I''m looking forward to:","meditation_min":5,"day":5,"week":1,"phase":"Foundation"}'::jsonb),
  (6, '{"title":"Journal · Foundation · Day 6","prompt":"Describe your energy level throughout the day.","journal_prompt":"My energy today looked like:","meditation_min":5,"day":6,"week":1,"phase":"Foundation"}'::jsonb),
  (7, '{"title":"Journal · Foundation · Day 7","prompt":"Write a letter to your past self from 5 years ago. Take time for a weekly reflection on your progress.","journal_prompt":"Dear past me...","meditation_min":5,"day":7,"week":1,"phase":"Foundation"}'::jsonb),
  (8, '{"title":"Journal · Building · Day 8","prompt":"List what you learned today, however small.","journal_prompt":"What I learned today:","meditation_min":5,"day":8,"week":2,"phase":"Building"}'::jsonb),
  (9, '{"title":"Journal · Building · Day 9","prompt":"Write about a habit you want to build.","journal_prompt":"A habit I''m building:","meditation_min":5,"day":9,"week":2,"phase":"Building"}'::jsonb),
  (10, '{"title":"Journal · Building · Day 10","prompt":"Reflect on a value you lived today. Optional: share one insight with someone you trust.","journal_prompt":"A value I lived today:","meditation_min":5,"day":10,"week":2,"phase":"Building"}'::jsonb),
  (11, '{"title":"Journal · Building · Day 11","prompt":"Free-write for 10 minutes without stopping.","journal_prompt":"Stream of consciousness:","meditation_min":10,"day":11,"week":2,"phase":"Building"}'::jsonb),
  (12, '{"title":"Journal · Building · Day 12","prompt":"Describe your day in three sentences.","journal_prompt":"Today in three sentences:","meditation_min":10,"day":12,"week":2,"phase":"Building"}'::jsonb),
  (13, '{"title":"Journal · Building · Day 13","prompt":"Write about a decision you made today.","journal_prompt":"A decision I made and why:","meditation_min":10,"day":13,"week":2,"phase":"Building"}'::jsonb),
  (14, '{"title":"Journal · Building · Day 14","prompt":"Capture a conversation that stayed with you. Take time for a weekly reflection on your progress.","journal_prompt":"A conversation that stayed with me:","meditation_min":10,"day":14,"week":2,"phase":"Building"}'::jsonb),
  (15, '{"title":"Journal · Deepening · Day 15","prompt":"Write about something you''re looking forward to. Optional: share one insight with someone you trust.","journal_prompt":"Something I''m looking forward to:","meditation_min":10,"day":15,"week":3,"phase":"Deepening"}'::jsonb),
  (16, '{"title":"Journal · Deepening · Day 16","prompt":"Describe your energy level throughout the day.","journal_prompt":"My energy today looked like:","meditation_min":10,"day":16,"week":3,"phase":"Deepening"}'::jsonb),
  (17, '{"title":"Journal · Deepening · Day 17","prompt":"Write a letter to your past self from 5 years ago.","journal_prompt":"Dear past me...","meditation_min":10,"day":17,"week":3,"phase":"Deepening"}'::jsonb),
  (18, '{"title":"Journal · Deepening · Day 18","prompt":"List what you learned today, however small.","journal_prompt":"What I learned today:","meditation_min":10,"day":18,"week":3,"phase":"Deepening"}'::jsonb),
  (19, '{"title":"Journal · Deepening · Day 19","prompt":"Write about a habit you want to build.","journal_prompt":"A habit I''m building:","meditation_min":10,"day":19,"week":3,"phase":"Deepening"}'::jsonb),
  (20, '{"title":"Journal · Deepening · Day 20","prompt":"Reflect on a value you lived today. Optional: share one insight with someone you trust.","journal_prompt":"A value I lived today:","meditation_min":10,"day":20,"week":3,"phase":"Deepening"}'::jsonb),
  (21, '{"title":"Journal · Deepening · Day 21","prompt":"Free-write for 10 minutes without stopping. Take time for a weekly reflection on your progress.","journal_prompt":"Stream of consciousness:","meditation_min":15,"day":21,"week":3,"phase":"Deepening"}'::jsonb),
  (22, '{"title":"Journal · Integration · Day 22","prompt":"Describe your day in three sentences.","journal_prompt":"Today in three sentences:","meditation_min":15,"day":22,"week":4,"phase":"Integration"}'::jsonb),
  (23, '{"title":"Journal · Integration · Day 23","prompt":"Write about a decision you made today.","journal_prompt":"A decision I made and why:","meditation_min":15,"day":23,"week":4,"phase":"Integration"}'::jsonb),
  (24, '{"title":"Journal · Integration · Day 24","prompt":"Capture a conversation that stayed with you.","journal_prompt":"A conversation that stayed with me:","meditation_min":15,"day":24,"week":4,"phase":"Integration"}'::jsonb),
  (25, '{"title":"Journal · Integration · Day 25","prompt":"Write about something you''re looking forward to. Optional: share one insight with someone you trust.","journal_prompt":"Something I''m looking forward to:","meditation_min":15,"day":25,"week":4,"phase":"Integration"}'::jsonb),
  (26, '{"title":"Journal · Integration · Day 26","prompt":"Describe your energy level throughout the day.","journal_prompt":"My energy today looked like:","meditation_min":15,"day":26,"week":4,"phase":"Integration"}'::jsonb),
  (27, '{"title":"Journal · Integration · Day 27","prompt":"Write a letter to your past self from 5 years ago.","journal_prompt":"Dear past me...","meditation_min":15,"day":27,"week":4,"phase":"Integration"}'::jsonb),
  (28, '{"title":"Journal · Integration · Day 28","prompt":"List what you learned today, however small. Take time for a weekly reflection on your progress.","journal_prompt":"What I learned today:","meditation_min":15,"day":28,"week":4,"phase":"Integration"}'::jsonb),
  (29, '{"title":"Journal · Integration · Day 29","prompt":"Write about a habit you want to build.","journal_prompt":"A habit I''m building:","meditation_min":15,"day":29,"week":5,"phase":"Integration"}'::jsonb),
  (30, '{"title":"Journal · Integration · Day 30","prompt":"Reflect on a value you lived today. Optional: share one insight with someone you trust.","journal_prompt":"A value I lived today:","meditation_min":15,"day":30,"week":5,"phase":"Integration"}'::jsonb)
) AS d(day_number, content)
WHERE p.slug = 'journaling-habit-30';


INSERT INTO program_day_content (program_id, day_number, content)
SELECT p.id, d.day_number, d.content
FROM programs p
CROSS JOIN (VALUES
  (1, '{"title":"Sleep · Foundation · Day 1","prompt":"Set a screens-off time 60 minutes before bed.","journal_prompt":"How did my wind-down routine feel?","meditation_min":5,"day":1,"week":1,"phase":"Foundation"}'::jsonb),
  (2, '{"title":"Sleep · Foundation · Day 2","prompt":"Do a 5-minute body scan before sleep.","journal_prompt":"What helped my body relax before bed?","meditation_min":5,"day":2,"week":1,"phase":"Foundation"}'::jsonb),
  (3, '{"title":"Sleep · Foundation · Day 3","prompt":"Write tomorrow''s top 3 priorities, then close the notebook.","journal_prompt":"Did writing priorities reduce racing thoughts?","meditation_min":5,"day":3,"week":1,"phase":"Foundation"}'::jsonb),
  (4, '{"title":"Sleep · Foundation · Day 4","prompt":"Dim lights 2 hours before bed tonight.","journal_prompt":"How did reduced evening light affect me?","meditation_min":5,"day":4,"week":1,"phase":"Foundation"}'::jsonb),
  (5, '{"title":"Sleep · Foundation · Day 5","prompt":"Avoid caffeine after 2pm today. Optional: share one insight with someone you trust.","journal_prompt":"Energy and focus after cutting afternoon caffeine:","meditation_min":5,"day":5,"week":1,"phase":"Foundation"}'::jsonb),
  (6, '{"title":"Sleep · Foundation · Day 6","prompt":"Practice 4-7-8 breathing in bed.","journal_prompt":"Breath practice before sleep:","meditation_min":5,"day":6,"week":1,"phase":"Foundation"}'::jsonb),
  (7, '{"title":"Sleep · Foundation · Day 7","prompt":"Keep your bedroom cool and dark tonight. Take time for a weekly reflection on your progress.","journal_prompt":"Sleep environment check (temp, light, noise):","meditation_min":5,"day":7,"week":1,"phase":"Foundation"}'::jsonb),
  (8, '{"title":"Sleep · Building · Day 8","prompt":"Write down worries on paper before bed.","journal_prompt":"Worries I released on paper:","meditation_min":5,"day":8,"week":2,"phase":"Building"}'::jsonb),
  (9, '{"title":"Sleep · Building · Day 9","prompt":"Take a warm shower or bath before sleep.","journal_prompt":"Evening ritual that supported rest:","meditation_min":5,"day":9,"week":2,"phase":"Building"}'::jsonb),
  (10, '{"title":"Sleep · Building · Day 10","prompt":"Wake at the same time tomorrow, regardless of sleep quality. Optional: share one insight with someone you trust.","journal_prompt":"Wake time consistency notes:","meditation_min":5,"day":10,"week":2,"phase":"Building"}'::jsonb),
  (11, '{"title":"Sleep · Building · Day 11","prompt":"Set a screens-off time 60 minutes before bed.","journal_prompt":"How did my wind-down routine feel?","meditation_min":10,"day":11,"week":2,"phase":"Building"}'::jsonb),
  (12, '{"title":"Sleep · Building · Day 12","prompt":"Do a 5-minute body scan before sleep.","journal_prompt":"What helped my body relax before bed?","meditation_min":10,"day":12,"week":2,"phase":"Building"}'::jsonb),
  (13, '{"title":"Sleep · Building · Day 13","prompt":"Write tomorrow''s top 3 priorities, then close the notebook.","journal_prompt":"Did writing priorities reduce racing thoughts?","meditation_min":10,"day":13,"week":2,"phase":"Building"}'::jsonb),
  (14, '{"title":"Sleep · Building · Day 14","prompt":"Dim lights 2 hours before bed tonight. Take time for a weekly reflection on your progress.","journal_prompt":"How did reduced evening light affect me?","meditation_min":10,"day":14,"week":2,"phase":"Building"}'::jsonb),
  (15, '{"title":"Sleep · Deepening · Day 15","prompt":"Avoid caffeine after 2pm today. Optional: share one insight with someone you trust.","journal_prompt":"Energy and focus after cutting afternoon caffeine:","meditation_min":10,"day":15,"week":3,"phase":"Deepening"}'::jsonb),
  (16, '{"title":"Sleep · Deepening · Day 16","prompt":"Practice 4-7-8 breathing in bed.","journal_prompt":"Breath practice before sleep:","meditation_min":10,"day":16,"week":3,"phase":"Deepening"}'::jsonb),
  (17, '{"title":"Sleep · Deepening · Day 17","prompt":"Keep your bedroom cool and dark tonight.","journal_prompt":"Sleep environment check (temp, light, noise):","meditation_min":10,"day":17,"week":3,"phase":"Deepening"}'::jsonb),
  (18, '{"title":"Sleep · Deepening · Day 18","prompt":"Write down worries on paper before bed.","journal_prompt":"Worries I released on paper:","meditation_min":10,"day":18,"week":3,"phase":"Deepening"}'::jsonb),
  (19, '{"title":"Sleep · Deepening · Day 19","prompt":"Take a warm shower or bath before sleep.","journal_prompt":"Evening ritual that supported rest:","meditation_min":10,"day":19,"week":3,"phase":"Deepening"}'::jsonb),
  (20, '{"title":"Sleep · Deepening · Day 20","prompt":"Wake at the same time tomorrow, regardless of sleep quality. Optional: share one insight with someone you trust.","journal_prompt":"Wake time consistency notes:","meditation_min":10,"day":20,"week":3,"phase":"Deepening"}'::jsonb),
  (21, '{"title":"Sleep · Deepening · Day 21","prompt":"Set a screens-off time 60 minutes before bed. Take time for a weekly reflection on your progress.","journal_prompt":"How did my wind-down routine feel?","meditation_min":15,"day":21,"week":3,"phase":"Deepening"}'::jsonb),
  (22, '{"title":"Sleep · Integration · Day 22","prompt":"Do a 5-minute body scan before sleep.","journal_prompt":"What helped my body relax before bed?","meditation_min":15,"day":22,"week":4,"phase":"Integration"}'::jsonb),
  (23, '{"title":"Sleep · Integration · Day 23","prompt":"Write tomorrow''s top 3 priorities, then close the notebook.","journal_prompt":"Did writing priorities reduce racing thoughts?","meditation_min":15,"day":23,"week":4,"phase":"Integration"}'::jsonb),
  (24, '{"title":"Sleep · Integration · Day 24","prompt":"Dim lights 2 hours before bed tonight.","journal_prompt":"How did reduced evening light affect me?","meditation_min":15,"day":24,"week":4,"phase":"Integration"}'::jsonb),
  (25, '{"title":"Sleep · Integration · Day 25","prompt":"Avoid caffeine after 2pm today. Optional: share one insight with someone you trust.","journal_prompt":"Energy and focus after cutting afternoon caffeine:","meditation_min":15,"day":25,"week":4,"phase":"Integration"}'::jsonb),
  (26, '{"title":"Sleep · Integration · Day 26","prompt":"Practice 4-7-8 breathing in bed.","journal_prompt":"Breath practice before sleep:","meditation_min":15,"day":26,"week":4,"phase":"Integration"}'::jsonb),
  (27, '{"title":"Sleep · Integration · Day 27","prompt":"Keep your bedroom cool and dark tonight.","journal_prompt":"Sleep environment check (temp, light, noise):","meditation_min":15,"day":27,"week":4,"phase":"Integration"}'::jsonb),
  (28, '{"title":"Sleep · Integration · Day 28","prompt":"Write down worries on paper before bed. Take time for a weekly reflection on your progress.","journal_prompt":"Worries I released on paper:","meditation_min":15,"day":28,"week":4,"phase":"Integration"}'::jsonb),
  (29, '{"title":"Sleep · Integration · Day 29","prompt":"Take a warm shower or bath before sleep.","journal_prompt":"Evening ritual that supported rest:","meditation_min":15,"day":29,"week":5,"phase":"Integration"}'::jsonb),
  (30, '{"title":"Sleep · Integration · Day 30","prompt":"Wake at the same time tomorrow, regardless of sleep quality. Optional: share one insight with someone you trust.","journal_prompt":"Wake time consistency notes:","meditation_min":15,"day":30,"week":5,"phase":"Integration"}'::jsonb)
) AS d(day_number, content)
WHERE p.slug = 'sleep-reset-30';


INSERT INTO program_day_content (program_id, day_number, content)
SELECT p.id, d.day_number, d.content
FROM programs p
CROSS JOIN (VALUES
  (1, '{"title":"Detox · Foundation · Day 1","prompt":"Track total screen time today without judgment.","journal_prompt":"Screen time awareness (no judgment):","meditation_min":5,"day":1,"week":1,"phase":"Foundation"}'::jsonb),
  (2, '{"title":"Detox · Foundation · Day 2","prompt":"Take a 30-minute phone-free walk.","journal_prompt":"How did a phone-free walk feel?","meditation_min":5,"day":2,"week":1,"phase":"Foundation"}'::jsonb),
  (3, '{"title":"Detox · Foundation · Day 3","prompt":"Remove one distracting app from your home screen.","journal_prompt":"One digital boundary I set today:","meditation_min":5,"day":3,"week":1,"phase":"Foundation"}'::jsonb),
  (4, '{"title":"Detox · Foundation · Day 4","prompt":"No phone during meals today.","journal_prompt":"Meals without screens — what I noticed:","meditation_min":5,"day":4,"week":1,"phase":"Foundation"}'::jsonb),
  (5, '{"title":"Detox · Foundation · Day 5","prompt":"Replace 15 minutes of scrolling with reading or nature. Optional: share one insight with someone you trust.","journal_prompt":"What I did instead of scrolling:","meditation_min":5,"day":5,"week":1,"phase":"Foundation"}'::jsonb),
  (6, '{"title":"Detox · Foundation · Day 6","prompt":"Turn off non-essential notifications.","journal_prompt":"Notifications I turned off and why:","meditation_min":5,"day":6,"week":1,"phase":"Foundation"}'::jsonb),
  (7, '{"title":"Detox · Foundation · Day 7","prompt":"Create a phone-free bedroom zone. Take time for a weekly reflection on your progress.","journal_prompt":"Bedroom boundary for devices:","meditation_min":5,"day":7,"week":1,"phase":"Foundation"}'::jsonb),
  (8, '{"title":"Detox · Building · Day 8","prompt":"Schedule two ''deep work'' blocks without notifications.","journal_prompt":"Deep work without interruptions:","meditation_min":5,"day":8,"week":2,"phase":"Building"}'::jsonb),
  (9, '{"title":"Detox · Building · Day 9","prompt":"Have one fully present conversation without devices.","journal_prompt":"A present conversation I had:","meditation_min":5,"day":9,"week":2,"phase":"Building"}'::jsonb),
  (10, '{"title":"Detox · Building · Day 10","prompt":"Reflect on how digital habits affect your mood. Optional: share one insight with someone you trust.","journal_prompt":"Mood vs. digital habits today:","meditation_min":5,"day":10,"week":2,"phase":"Building"}'::jsonb),
  (11, '{"title":"Detox · Building · Day 11","prompt":"Track total screen time today without judgment.","journal_prompt":"Screen time awareness (no judgment):","meditation_min":10,"day":11,"week":2,"phase":"Building"}'::jsonb),
  (12, '{"title":"Detox · Building · Day 12","prompt":"Take a 30-minute phone-free walk.","journal_prompt":"How did a phone-free walk feel?","meditation_min":10,"day":12,"week":2,"phase":"Building"}'::jsonb),
  (13, '{"title":"Detox · Building · Day 13","prompt":"Remove one distracting app from your home screen.","journal_prompt":"One digital boundary I set today:","meditation_min":10,"day":13,"week":2,"phase":"Building"}'::jsonb),
  (14, '{"title":"Detox · Building · Day 14","prompt":"No phone during meals today. Take time for a weekly reflection on your progress.","journal_prompt":"Meals without screens — what I noticed:","meditation_min":10,"day":14,"week":2,"phase":"Building"}'::jsonb),
  (15, '{"title":"Detox · Deepening · Day 15","prompt":"Replace 15 minutes of scrolling with reading or nature. Optional: share one insight with someone you trust.","journal_prompt":"What I did instead of scrolling:","meditation_min":10,"day":15,"week":3,"phase":"Deepening"}'::jsonb),
  (16, '{"title":"Detox · Deepening · Day 16","prompt":"Turn off non-essential notifications.","journal_prompt":"Notifications I turned off and why:","meditation_min":10,"day":16,"week":3,"phase":"Deepening"}'::jsonb),
  (17, '{"title":"Detox · Deepening · Day 17","prompt":"Create a phone-free bedroom zone.","journal_prompt":"Bedroom boundary for devices:","meditation_min":10,"day":17,"week":3,"phase":"Deepening"}'::jsonb),
  (18, '{"title":"Detox · Deepening · Day 18","prompt":"Schedule two ''deep work'' blocks without notifications.","journal_prompt":"Deep work without interruptions:","meditation_min":10,"day":18,"week":3,"phase":"Deepening"}'::jsonb),
  (19, '{"title":"Detox · Deepening · Day 19","prompt":"Have one fully present conversation without devices.","journal_prompt":"A present conversation I had:","meditation_min":10,"day":19,"week":3,"phase":"Deepening"}'::jsonb),
  (20, '{"title":"Detox · Deepening · Day 20","prompt":"Reflect on how digital habits affect your mood. Optional: share one insight with someone you trust.","journal_prompt":"Mood vs. digital habits today:","meditation_min":10,"day":20,"week":3,"phase":"Deepening"}'::jsonb),
  (21, '{"title":"Detox · Deepening · Day 21","prompt":"Track total screen time today without judgment. Take time for a weekly reflection on your progress.","journal_prompt":"Screen time awareness (no judgment):","meditation_min":15,"day":21,"week":3,"phase":"Deepening"}'::jsonb),
  (22, '{"title":"Detox · Integration · Day 22","prompt":"Take a 30-minute phone-free walk.","journal_prompt":"How did a phone-free walk feel?","meditation_min":15,"day":22,"week":4,"phase":"Integration"}'::jsonb),
  (23, '{"title":"Detox · Integration · Day 23","prompt":"Remove one distracting app from your home screen.","journal_prompt":"One digital boundary I set today:","meditation_min":15,"day":23,"week":4,"phase":"Integration"}'::jsonb),
  (24, '{"title":"Detox · Integration · Day 24","prompt":"No phone during meals today.","journal_prompt":"Meals without screens — what I noticed:","meditation_min":15,"day":24,"week":4,"phase":"Integration"}'::jsonb),
  (25, '{"title":"Detox · Integration · Day 25","prompt":"Replace 15 minutes of scrolling with reading or nature. Optional: share one insight with someone you trust.","journal_prompt":"What I did instead of scrolling:","meditation_min":15,"day":25,"week":4,"phase":"Integration"}'::jsonb),
  (26, '{"title":"Detox · Integration · Day 26","prompt":"Turn off non-essential notifications.","journal_prompt":"Notifications I turned off and why:","meditation_min":15,"day":26,"week":4,"phase":"Integration"}'::jsonb),
  (27, '{"title":"Detox · Integration · Day 27","prompt":"Create a phone-free bedroom zone.","journal_prompt":"Bedroom boundary for devices:","meditation_min":15,"day":27,"week":4,"phase":"Integration"}'::jsonb),
  (28, '{"title":"Detox · Integration · Day 28","prompt":"Schedule two ''deep work'' blocks without notifications. Take time for a weekly reflection on your progress.","journal_prompt":"Deep work without interruptions:","meditation_min":15,"day":28,"week":4,"phase":"Integration"}'::jsonb),
  (29, '{"title":"Detox · Integration · Day 29","prompt":"Have one fully present conversation without devices.","journal_prompt":"A present conversation I had:","meditation_min":15,"day":29,"week":5,"phase":"Integration"}'::jsonb),
  (30, '{"title":"Detox · Integration · Day 30","prompt":"Reflect on how digital habits affect your mood. Optional: share one insight with someone you trust.","journal_prompt":"Mood vs. digital habits today:","meditation_min":15,"day":30,"week":5,"phase":"Integration"}'::jsonb)
) AS d(day_number, content)
WHERE p.slug = 'digital-detox-30';


INSERT INTO program_day_content (program_id, day_number, content)
SELECT p.id, d.day_number, d.content
FROM programs p
CROSS JOIN (VALUES
  (1, '{"title":"Wellness · Foundation · Day 1","prompt":"Drink water first thing upon waking.","journal_prompt":"Hydration and morning routine:","meditation_min":5,"day":1,"week":1,"phase":"Foundation"}'::jsonb),
  (2, '{"title":"Wellness · Foundation · Day 2","prompt":"Move your body for 20 minutes in any way you enjoy.","journal_prompt":"How movement affected my mood:","meditation_min":5,"day":2,"week":1,"phase":"Foundation"}'::jsonb),
  (3, '{"title":"Wellness · Foundation · Day 3","prompt":"Eat one whole-food meal with vegetables.","journal_prompt":"Nourishing food choices today:","meditation_min":5,"day":3,"week":1,"phase":"Foundation"}'::jsonb),
  (4, '{"title":"Wellness · Foundation · Day 4","prompt":"Connect with someone you care about.","journal_prompt":"Connection that uplifted me:","meditation_min":5,"day":4,"week":1,"phase":"Foundation"}'::jsonb),
  (5, '{"title":"Wellness · Foundation · Day 5","prompt":"Spend 10 minutes outdoors in natural light. Optional: share one insight with someone you trust.","journal_prompt":"Time outside and how it felt:","meditation_min":5,"day":5,"week":1,"phase":"Foundation"}'::jsonb),
  (6, '{"title":"Wellness · Foundation · Day 6","prompt":"Do one thing that brings you joy.","journal_prompt":"Joy I made space for:","meditation_min":5,"day":6,"week":1,"phase":"Foundation"}'::jsonb),
  (7, '{"title":"Wellness · Foundation · Day 7","prompt":"Practice saying no to one unnecessary obligation. Take time for a weekly reflection on your progress.","journal_prompt":"A boundary I honored:","meditation_min":5,"day":7,"week":1,"phase":"Foundation"}'::jsonb),
  (8, '{"title":"Wellness · Building · Day 8","prompt":"Stretch for 5 minutes mid-day.","journal_prompt":"Mid-day reset through movement:","meditation_min":5,"day":8,"week":2,"phase":"Building"}'::jsonb),
  (9, '{"title":"Wellness · Building · Day 9","prompt":"Prepare a nourishing snack or meal ahead.","journal_prompt":"How I prepared for tomorrow''s wellness:","meditation_min":5,"day":9,"week":2,"phase":"Building"}'::jsonb),
  (10, '{"title":"Wellness · Building · Day 10","prompt":"Review your week and celebrate one progress point. Optional: share one insight with someone you trust.","journal_prompt":"Progress worth celebrating this week:","meditation_min":5,"day":10,"week":2,"phase":"Building"}'::jsonb),
  (11, '{"title":"Wellness · Building · Day 11","prompt":"Drink water first thing upon waking.","journal_prompt":"Hydration and morning routine:","meditation_min":10,"day":11,"week":2,"phase":"Building"}'::jsonb),
  (12, '{"title":"Wellness · Building · Day 12","prompt":"Move your body for 20 minutes in any way you enjoy.","journal_prompt":"How movement affected my mood:","meditation_min":10,"day":12,"week":2,"phase":"Building"}'::jsonb),
  (13, '{"title":"Wellness · Building · Day 13","prompt":"Eat one whole-food meal with vegetables.","journal_prompt":"Nourishing food choices today:","meditation_min":10,"day":13,"week":2,"phase":"Building"}'::jsonb),
  (14, '{"title":"Wellness · Building · Day 14","prompt":"Connect with someone you care about. Take time for a weekly reflection on your progress.","journal_prompt":"Connection that uplifted me:","meditation_min":10,"day":14,"week":2,"phase":"Building"}'::jsonb),
  (15, '{"title":"Wellness · Deepening · Day 15","prompt":"Spend 10 minutes outdoors in natural light. Optional: share one insight with someone you trust.","journal_prompt":"Time outside and how it felt:","meditation_min":10,"day":15,"week":3,"phase":"Deepening"}'::jsonb),
  (16, '{"title":"Wellness · Deepening · Day 16","prompt":"Do one thing that brings you joy.","journal_prompt":"Joy I made space for:","meditation_min":10,"day":16,"week":3,"phase":"Deepening"}'::jsonb),
  (17, '{"title":"Wellness · Deepening · Day 17","prompt":"Practice saying no to one unnecessary obligation.","journal_prompt":"A boundary I honored:","meditation_min":10,"day":17,"week":3,"phase":"Deepening"}'::jsonb),
  (18, '{"title":"Wellness · Deepening · Day 18","prompt":"Stretch for 5 minutes mid-day.","journal_prompt":"Mid-day reset through movement:","meditation_min":10,"day":18,"week":3,"phase":"Deepening"}'::jsonb),
  (19, '{"title":"Wellness · Deepening · Day 19","prompt":"Prepare a nourishing snack or meal ahead.","journal_prompt":"How I prepared for tomorrow''s wellness:","meditation_min":10,"day":19,"week":3,"phase":"Deepening"}'::jsonb),
  (20, '{"title":"Wellness · Deepening · Day 20","prompt":"Review your week and celebrate one progress point. Optional: share one insight with someone you trust.","journal_prompt":"Progress worth celebrating this week:","meditation_min":10,"day":20,"week":3,"phase":"Deepening"}'::jsonb),
  (21, '{"title":"Wellness · Deepening · Day 21","prompt":"Drink water first thing upon waking. Take time for a weekly reflection on your progress.","journal_prompt":"Hydration and morning routine:","meditation_min":15,"day":21,"week":3,"phase":"Deepening"}'::jsonb),
  (22, '{"title":"Wellness · Integration · Day 22","prompt":"Move your body for 20 minutes in any way you enjoy.","journal_prompt":"How movement affected my mood:","meditation_min":15,"day":22,"week":4,"phase":"Integration"}'::jsonb),
  (23, '{"title":"Wellness · Integration · Day 23","prompt":"Eat one whole-food meal with vegetables.","journal_prompt":"Nourishing food choices today:","meditation_min":15,"day":23,"week":4,"phase":"Integration"}'::jsonb),
  (24, '{"title":"Wellness · Integration · Day 24","prompt":"Connect with someone you care about.","journal_prompt":"Connection that uplifted me:","meditation_min":15,"day":24,"week":4,"phase":"Integration"}'::jsonb),
  (25, '{"title":"Wellness · Integration · Day 25","prompt":"Spend 10 minutes outdoors in natural light. Optional: share one insight with someone you trust.","journal_prompt":"Time outside and how it felt:","meditation_min":15,"day":25,"week":4,"phase":"Integration"}'::jsonb),
  (26, '{"title":"Wellness · Integration · Day 26","prompt":"Do one thing that brings you joy.","journal_prompt":"Joy I made space for:","meditation_min":15,"day":26,"week":4,"phase":"Integration"}'::jsonb),
  (27, '{"title":"Wellness · Integration · Day 27","prompt":"Practice saying no to one unnecessary obligation.","journal_prompt":"A boundary I honored:","meditation_min":15,"day":27,"week":4,"phase":"Integration"}'::jsonb),
  (28, '{"title":"Wellness · Integration · Day 28","prompt":"Stretch for 5 minutes mid-day. Take time for a weekly reflection on your progress.","journal_prompt":"Mid-day reset through movement:","meditation_min":15,"day":28,"week":4,"phase":"Integration"}'::jsonb),
  (29, '{"title":"Wellness · Integration · Day 29","prompt":"Prepare a nourishing snack or meal ahead.","journal_prompt":"How I prepared for tomorrow''s wellness:","meditation_min":15,"day":29,"week":5,"phase":"Integration"}'::jsonb),
  (30, '{"title":"Wellness · Integration · Day 30","prompt":"Review your week and celebrate one progress point. Optional: share one insight with someone you trust.","journal_prompt":"Progress worth celebrating this week:","meditation_min":15,"day":30,"week":5,"phase":"Integration"}'::jsonb)
) AS d(day_number, content)
WHERE p.slug = 'wellness-reset-30';

