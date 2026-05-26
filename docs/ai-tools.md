# AI Tools Reference

The companion uses Groq function calling with these tools:

| Tool | Description |
|------|-------------|
| `create_journal_entry` | Title, markdown, mood, tags, ritual, action items |
| `append_to_entry` | Add content/blocks to existing entry |
| `log_mood` | Score 1-5 + optional note |
| `log_habit` | Mark habit complete by name |
| `start_breathing` | Returns deep link to breathing exercise |
| `start_meditation` | Returns deep link to meditation timer |
| `get_program_checkin` | Fetch/submit program day check-in |
| `search_journal` | Keyword search over entries |
| `get_insights` | Mood trends + entry counts |
| `save_memory` | Persist fact/preference/goal for future sessions |

Tool definitions: `packages/ai/src/tools.ts`
Execution: `apps/web/app/api/chat/route.ts`

## Provider Swap

Set `AI_PRIMARY_PROVIDER=groq` or `nim`. On 429/503, automatically retries with fallback provider.

## Voice Pipeline

1. Browser `MediaRecorder` captures audio
2. `POST /api/transcribe` → Groq Whisper
3. `POST /api/voice-journal` → LLM structures entry
4. Saves journal + action items + mood + optional memories
