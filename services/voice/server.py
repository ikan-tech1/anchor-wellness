"""
Self-hosted voice service: faster-whisper STT + Piper TTS.
Run: python server.py  (or docker compose up)
"""

import io
import os
import tempfile
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import Response, JSONResponse

whisper_model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global whisper_model
    try:
        import whisper
        model_name = os.getenv("WHISPER_MODEL", "base")
        print(f"Loading Whisper model: {model_name}")
        whisper_model = whisper.load_model(model_name)
        print("Whisper model loaded")
    except Exception as e:
        print(f"Whisper load failed (STT unavailable): {e}")
    yield


app = FastAPI(title="Anchor Voice Service", lifespan=lifespan)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "whisper_loaded": whisper_model is not None,
    }


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    if not whisper_model:
        return JSONResponse(
            {"error": "Whisper model not loaded"},
            status_code=503,
        )

    contents = await audio.read()
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        result = whisper_model.transcribe(tmp_path)
        return {"text": result["text"].strip()}
    finally:
        os.unlink(tmp_path)


@app.post("/synthesize")
async def synthesize(text: str = Form(...)):
    try:
        from piper import PiperVoice

        voice_name = os.getenv("PIPER_VOICE", "en_US-lessac-medium")
        model_path = f"/models/{voice_name}.onnx"
        config_path = f"/models/{voice_name}.onnx.json"

        if not os.path.exists(model_path):
            return JSONResponse(
                {"error": f"Piper model not found: {voice_name}. Mount models volume."},
                status_code=503,
            )

        voice = PiperVoice.load(model_path, config_path=config_path)
        audio_buffer = io.BytesIO()
        voice.synthesize(text, audio_buffer)
        audio_buffer.seek(0)
        return Response(content=audio_buffer.read(), media_type="audio/wav")
    except ImportError:
        return JSONResponse(
            {"error": "Piper TTS not installed"},
            status_code=503,
        )
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8765)
