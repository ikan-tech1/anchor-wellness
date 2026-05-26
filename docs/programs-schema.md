# Programs Schema

## Tables

- **programs** — slug, title, goal_type, duration_days, metadata (icon, color)
- **program_enrollments** — user_id, program_id, start_date, status, current_day
- **program_day_content** — program_id, day_number, content (JSON: title, prompt, journal_prompt, meditation_min)
- **program_checkins** — enrollment_id, day_number, responses

## Seed Programs

| Slug | Title | Days |
|------|-------|------|
| mindfulness-30 | Mindfulness 30 | 30 |
| gratitude-30 | Gratitude 30 | 30 |
| journaling-habit-30 | Journaling Habit 30 | 30 |
| sleep-reset-30 | Sleep Reset 30 | 30 |
| digital-detox-30 | Digital Detox 30 | 30 |
| wellness-reset-30 | Wellness Reset 30 | 30 |

Day content is seeded for Mindfulness (days 1-7) and Gratitude (days 1-3). Extend via SQL or admin UI.

## Enrollment Flow

1. User clicks "Start Program" → `program_enrollments` insert
2. Daily: fetch `program_day_content` for `current_day`
3. User completes check-in → `program_checkins` insert, increment `current_day`
4. When `current_day > duration_days` → status = `completed`
