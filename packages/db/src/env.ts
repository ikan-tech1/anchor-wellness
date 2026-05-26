export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;

  const placeholders = [
    "your-project.supabase.co",
    "your-anon-key",
    "placeholder.supabase.co",
    "placeholder-anon-key",
  ];

  return !placeholders.some(
    (placeholder) => url.includes(placeholder) || key.includes(placeholder)
  );
}
