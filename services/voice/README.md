# Self-Hosted Voice Service (Phase 4)

Optional Docker service for offline-capable TTS (Piper) and STT (faster-whisper) when you have a VPS.

## Quick Start

```bash
cd services/voice
docker compose up -d
```

Service runs at `http://localhost:8765` (set `VOICE_SERVICE_URL` in env).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/transcribe` | Audio file → text (faster-whisper) |
| POST | `/synthesize` | Text → audio (Piper TTS) |
| GET | `/health` | Health check |

## Integration

When `VOICE_SERVICE_URL` is set, the app can route transcription/TTS through this service instead of Groq. Fallback chain: Voice Service → Groq → Web Speech API (TTS only).

## Requirements

- Docker + Docker Compose
- ~2GB RAM for Whisper base model
- Optional GPU for faster inference

See `docker-compose.yml` and `server.py` for configuration.
