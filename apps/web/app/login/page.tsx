"use client";

import { useState, Suspense } from "react";
import { createClient } from "@anchor/db/client";
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from "@anchor/ui";
import { useRouter, useSearchParams } from "next/navigation";

function SetupBanner({ setup }: { setup: string | null }) {
  if (setup === "required") {
    return (
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-950 dark:text-amber-100">
        <p className="font-medium">Setup required</p>
        <p className="mt-1 text-muted-foreground">
          Supabase is not configured yet. Add{" "}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel,
          then redeploy.
        </p>
      </div>
    );
  }

  if (setup === "error") {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
        <p className="font-medium">Connection issue</p>
        <p className="mt-1 text-muted-foreground">
          Could not reach Supabase. Check your project URL and anon key, then try again.
        </p>
      </div>
    );
  }

  return null;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const setup = searchParams.get("setup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setMessage(error ? error.message : "Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        router.push("/home");
      }
    }
    setLoading(false);
  }

  async function handleGoogleAuth() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 grain">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Anchor</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your AI wellness companion
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <SetupBanner setup={setup} />
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleAuth}>
            Continue with Google
          </Button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-4">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
