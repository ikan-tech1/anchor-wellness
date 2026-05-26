import { NextResponse } from "next/server";
import { fetchProfilePasscodeHash } from "@/app/actions/data";

export async function GET() {
  try {
    const hash = await fetchProfilePasscodeHash();
    return NextResponse.json({ hash: hash ?? null });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
