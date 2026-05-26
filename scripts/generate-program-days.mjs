#!/usr/bin/env node
/**
 * Generates supabase/seed/002_full_program_days.sql with 30 days × 6 programs.
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROGRAM_THEMES = {
  "mindfulness-30": {
    prefix: "Mindfulness",
    prompts: [
      "Notice your breath for 5 minutes without changing it.",
      "Scan your body from head to toe with gentle attention.",
      "Eat one meal with full sensory awareness.",
      "Take a 10-minute mindful walk outdoors.",
      "Pause three times today to notice something pleasant.",
      "Practice loving-kindness toward yourself for 5 minutes.",
      "Observe thoughts as clouds passing through the sky.",
      "Listen to ambient sounds for 5 minutes with eyes closed.",
      "Practice mindful stretching for 10 minutes.",
      "Notice the space between stimulus and response today.",
    ],
    journal: [
      "What did I notice about my attention today?",
      "Where did my mind wander, and how did I return?",
      "What sensations stood out during body awareness?",
      "What did mindful eating reveal about my habits?",
      "What did I notice while walking mindfully?",
      "Three small moments of gratitude I paused for:",
      "How did self-compassion feel in practice?",
      "What thoughts came and went without hooking me?",
      "What sounds or silence did I appreciate?",
      "How does my body feel after mindful movement?",
    ],
  },
  "gratitude-30": {
    prefix: "Gratitude",
    prompts: [
      "Write three good things from today, big or small.",
      "Who made your life better recently? Thank them mentally.",
      "Find one thing to appreciate in a difficulty.",
      "Notice something beautiful you usually overlook.",
      "Write a gratitude letter (you don't have to send it).",
      "Appreciate your body for one thing it does well.",
      "List comforts you often take for granted.",
      "Recall a mentor or teacher you're grateful for.",
      "Find gratitude in a mundane routine.",
      "Celebrate a recent small win.",
    ],
    journal: [
      "Three good things from today:",
      "People I am grateful for and why:",
      "A challenge that taught me something:",
      "Beauty I noticed today:",
      "Dear [person], I appreciate you because...",
      "My body helps me by...",
      "Comforts I often overlook:",
      "Lessons from someone who shaped me:",
      "Gratitude in my daily routine:",
      "A win worth savoring:",
    ],
  },
  "journaling-habit-30": {
    prefix: "Journal",
    prompts: [
      "Free-write for 10 minutes without stopping.",
      "Describe your day in three sentences.",
      "Write about a decision you made today.",
      "Capture a conversation that stayed with you.",
      "Write about something you're looking forward to.",
      "Describe your energy level throughout the day.",
      "Write a letter to your past self from 5 years ago.",
      "List what you learned today, however small.",
      "Write about a habit you want to build.",
      "Reflect on a value you lived today.",
    ],
    journal: [
      "Stream of consciousness:",
      "Today in three sentences:",
      "A decision I made and why:",
      "A conversation that stayed with me:",
      "Something I'm looking forward to:",
      "My energy today looked like:",
      "Dear past me...",
      "What I learned today:",
      "A habit I'm building:",
      "A value I lived today:",
    ],
  },
  "sleep-reset-30": {
    prefix: "Sleep",
    prompts: [
      "Set a screens-off time 60 minutes before bed.",
      "Do a 5-minute body scan before sleep.",
      "Write tomorrow's top 3 priorities, then close the notebook.",
      "Dim lights 2 hours before bed tonight.",
      "Avoid caffeine after 2pm today.",
      "Practice 4-7-8 breathing in bed.",
      "Keep your bedroom cool and dark tonight.",
      "Write down worries on paper before bed.",
      "Take a warm shower or bath before sleep.",
      "Wake at the same time tomorrow, regardless of sleep quality.",
    ],
    journal: [
      "How did my wind-down routine feel?",
      "What helped my body relax before bed?",
      "Did writing priorities reduce racing thoughts?",
      "How did reduced evening light affect me?",
      "Energy and focus after cutting afternoon caffeine:",
      "Breath practice before sleep:",
      "Sleep environment check (temp, light, noise):",
      "Worries I released on paper:",
      "Evening ritual that supported rest:",
      "Wake time consistency notes:",
    ],
  },
  "digital-detox-30": {
    prefix: "Detox",
    prompts: [
      "Track total screen time today without judgment.",
      "Take a 30-minute phone-free walk.",
      "Remove one distracting app from your home screen.",
      "No phone during meals today.",
      "Replace 15 minutes of scrolling with reading or nature.",
      "Turn off non-essential notifications.",
      "Create a phone-free bedroom zone.",
      "Schedule two 'deep work' blocks without notifications.",
      "Have one fully present conversation without devices.",
      "Reflect on how digital habits affect your mood.",
    ],
    journal: [
      "Screen time awareness (no judgment):",
      "How did a phone-free walk feel?",
      "One digital boundary I set today:",
      "Meals without screens — what I noticed:",
      "What I did instead of scrolling:",
      "Notifications I turned off and why:",
      "Bedroom boundary for devices:",
      "Deep work without interruptions:",
      "A present conversation I had:",
      "Mood vs. digital habits today:",
    ],
  },
  "wellness-reset-30": {
    prefix: "Wellness",
    prompts: [
      "Drink water first thing upon waking.",
      "Move your body for 20 minutes in any way you enjoy.",
      "Eat one whole-food meal with vegetables.",
      "Connect with someone you care about.",
      "Spend 10 minutes outdoors in natural light.",
      "Do one thing that brings you joy.",
      "Practice saying no to one unnecessary obligation.",
      "Stretch for 5 minutes mid-day.",
      "Prepare a nourishing snack or meal ahead.",
      "Review your week and celebrate one progress point.",
    ],
    journal: [
      "Hydration and morning routine:",
      "How movement affected my mood:",
      "Nourishing food choices today:",
      "Connection that uplifted me:",
      "Time outside and how it felt:",
      "Joy I made space for:",
      "A boundary I honored:",
      "Mid-day reset through movement:",
      "How I prepared for tomorrow's wellness:",
      "Progress worth celebrating this week:",
    ],
  },
};

function dayContent(slug, day) {
  const theme = PROGRAM_THEMES[slug];
  const idx = (day - 1) % 10;
  const week = Math.ceil(day / 7);
  const phase =
    day <= 7 ? "Foundation" : day <= 14 ? "Building" : day <= 21 ? "Deepening" : "Integration";
  const title = `${theme.prefix} · ${phase} · Day ${day}`;
  const prompt = theme.prompts[idx];
  const journal_prompt = theme.journal[idx];
  const meditation_min = day <= 10 ? 5 : day <= 20 ? 10 : 15;
  const extra =
    day % 7 === 0
      ? " Take time for a weekly reflection on your progress."
      : day % 5 === 0
        ? " Optional: share one insight with someone you trust."
        : "";
  return {
    title,
    prompt: `${prompt}${extra}`,
    journal_prompt,
    meditation_min,
    day,
    week,
    phase,
  };
}

const slugs = Object.keys(PROGRAM_THEMES);
let sql = `-- Auto-generated full 30-day program content for all seed programs
-- Run after 001_templates_and_programs.sql

DELETE FROM program_day_content
WHERE program_id IN (SELECT id FROM programs WHERE slug IN (${slugs.map((s) => `'${s}'`).join(", ")}));

`;

for (const slug of slugs) {
  const rows = [];
  for (let day = 1; day <= 30; day++) {
    const content = JSON.stringify(dayContent(slug, day)).replace(/'/g, "''");
    rows.push(`  (${day}, '${content}'::jsonb)`);
  }
  sql += `
INSERT INTO program_day_content (program_id, day_number, content)
SELECT p.id, d.day_number, d.content
FROM programs p
CROSS JOIN (VALUES
${rows.join(",\n")}
) AS d(day_number, content)
WHERE p.slug = '${slug}';

`;
}

const outPath = join(__dirname, "../supabase/seed/002_full_program_days.sql");
writeFileSync(outPath, sql);
console.log(`Wrote ${outPath} (${slugs.length} programs × 30 days)`);
