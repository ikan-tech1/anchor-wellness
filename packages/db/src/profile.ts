import { getSql } from "./neon";

export async function ensureProfile(
  userId: string,
  displayName?: string | null
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO profiles (id, display_name)
    VALUES (${userId}, ${displayName ?? null})
    ON CONFLICT (id) DO NOTHING
  `;
}
