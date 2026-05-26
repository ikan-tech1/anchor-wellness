"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
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
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkEnabled =
    clerkKey?.startsWith("pk_") && (clerkKey?.length ?? 0) > 20;

  if (!clerkEnabled) {
    return <>{children}</>;
  }

  return <PasscodeGateInner>{children}</PasscodeGateInner>;
}

function PasscodeGateInner({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const [required, setRequired] = useState(false);
  const [verified, setVerified] = useState(true);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [storedHash, setStoredHash] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setLoading(false);
        return;
      }
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/profile/passcode");
        if (res.ok) {
          const { hash } = await res.json();
          setStoredHash(hash);
          if (hash) {
            setRequired(true);
            setVerified(false);
          }
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
    check();
  }, [isLoaded, isSignedIn]);

  async function submit() {
    setError("");
    if (!storedHash) return;
    const hash = await hashPasscode(passcode);
    if (hash === storedHash) {
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
