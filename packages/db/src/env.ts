export function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secret = process.env.CLERK_SECRET_KEY;
  if (!key || !secret) return false;
  return !key.includes("your") && !key.includes("placeholder");
}

export { isDatabaseConfigured } from "./neon";
