import { NextRequest, NextResponse } from "next/server";

const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || "http://localhost:8765";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio");
    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json({ error: "Audio required" }, { status: 400 });
    }

    const upstream = new FormData();
    upstream.append("audio", audio, "recording.webm");

    const res = await fetch(`${VOICE_SERVICE_URL}/transcribe`, {
      method: "POST",
      body: upstream,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: (err as { error?: string }).error || "Voice service unavailable" },
        { status: res.status }
      );
    }

    const data = (await res.json()) as { text: string };
    return NextResponse.json({ text: data.text });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Voice service unreachable. Start with: cd services/voice && docker compose up",
      },
      { status: 503 }
    );
  }
}
