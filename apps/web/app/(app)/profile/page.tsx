"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { fetchProfile, saveProfile, addHabit } from "@/app/actions/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  ThemeToggle,
  PageHeader,
  PageShell,
  Label,
} from "@anchor/ui";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [displayName, setDisplayName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [hasPasscode, setHasPasscode] = useState(false);
  const [aiConsent, setAiConsent] = useState("basic");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const profile = await fetchProfile();
      setDisplayName((profile.display_name as string) || "");
      setAiConsent(profile.ai_consent_level as string);
      setHasPasscode(!!profile.app_passcode_hash);
    } catch {
      // profile created on first save
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    const updates: {
      display_name: string;
      ai_consent_level: string;
      app_passcode_hash?: string;
    } = {
      display_name: displayName,
      ai_consent_level: aiConsent,
    };

    if (passcode) {
      const encoder = new TextEncoder();
      const data = encoder.encode(passcode);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      updates.app_passcode_hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    await saveProfile(updates);
    setSaving(false);
    setPasscode("");
    if (passcode) setHasPasscode(true);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
  }

  async function addDefaultHabits() {
    const defaults = [
      { name: "Morning journal", icon: "📝" },
      { name: "Meditation", icon: "🧘" },
      { name: "Exercise", icon: "🏃" },
      { name: "Gratitude", icon: "🙏" },
    ];
    for (const h of defaults) {
      await addHabit(h.name, h.icon);
    }
    alert("Default habits added!");
  }

  const email =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <PageShell className="mx-auto max-w-3xl md:max-w-4xl lg:max-w-5xl">
      <PageHeader
        title="Profile"
        description={email}
        action={<ThemeToggle />}
      />

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-consent">AI memory consent</Label>
            <select
              id="ai-consent"
              value={aiConsent}
              onChange={(e) => setAiConsent(e.target.value)}
              className="flex h-11 min-h-[44px] w-full rounded-xl border border-border bg-card px-4 py-2 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <option value="none">None — no memory</option>
              <option value="basic">Basic — session summaries</option>
              <option value="full">Full — persistent facts & preferences</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passcode">
              App passcode {hasPasscode && "(set)"}
            </Label>
            <Input
              id="passcode"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Set a 4+ digit passcode"
            />
            <p className="text-xs text-muted-foreground">
              Protects locked journal entries on this device.
            </p>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="w-full sm:w-auto">
            {saving ? "Saving..." : "Save settings"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base font-medium">Quick setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full" onClick={addDefaultHabits}>
            Add default habits
          </Button>
          <Link href="/journey">
            <Button variant="outline" className="w-full">
              View journey & export
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="rounded-2xl border border-border bg-card/60 p-5 text-xs text-muted-foreground leading-relaxed">
        <p className="font-medium text-foreground mb-2">Disclaimer</p>
        Anchor is a wellness companion, not a medical device or substitute for professional mental
        health care. If you are in crisis, please contact 988 (US) or your local emergency services.
      </div>

      <Button variant="destructive" onClick={handleSignOut} className="w-full">
        Sign out
      </Button>
    </PageShell>
  );
}
