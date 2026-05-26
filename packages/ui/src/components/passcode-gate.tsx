"use client";

import { useEffect, useState } from "react";
import { createClient } from "@anchor/db/client";
import { Input } from "./input";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Lock } from "lucide-react";

const SESSION_KEY = "anchor-passcode-verified";

async function hashPasscode(passcode: string): Promise<string> {
  const data = new TextEncoder().encode(passcode);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function PasscodeGate({ children }: { children: React.ReactNode }) {
  const [required, setRequired] = useState(false);
  const [verified, setVerified] = useState(true);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function check() {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("app_passcode_hash")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.app_passcode_hash) {
        setRequired(true);
        setVerified(false);
      }
      setLoading(false);
    }
    check();
  }, [supabase]);

  async function submit() {
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("app_passcode_hash")
      .eq("id", user.id)
      .single();
    const hash = await hashPasscode(passcode);
    if (hash === profile?.app_passcode_hash) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setVerified(true);
    } else {
      setError("Incorrect passcode");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (required && !verified) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 grain">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <Lock className="mx-auto h-8 w-8 text-primary mb-2" />
            <CardTitle>Enter passcode</CardTitle>
            <p className="text-sm text-muted-foreground">
              Protect your locked journal entries on this device
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              inputMode="numeric"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Passcode"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={submit}>
              Unlock
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
