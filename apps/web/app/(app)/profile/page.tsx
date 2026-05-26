"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { fetchProfile, saveProfile, addHabit } from "@/app/actions/data";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, ThemeToggle } from "@anchor/ui";
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
      updates.app_passcode_hash = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
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
    <div className="p-4 md:p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-muted-foreground text-sm">{email}</p>
        </div>
        <ThemeToggle />
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Display name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">AI memory consent</label>
            <select
              value={aiConsent}
              onChange={(e) => setAiConsent(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm"
            >
              <option value="none">None — no memory</option>
              <option value="basic">Basic — session summaries</option>
              <option value="full">Full — persistent facts & preferences</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">
              App passcode {hasPasscode && "(set)"}
            </label>
            <Input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Set a 4+ digit passcode"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Protects locked journal entries on this device.
            </p>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full" onClick={addDefaultHabits}>
            Add default habits
          </Button>
          <Link href="/journey">
            <Button variant="outline" className="w-full">View Journey & Export</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-card/50 p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Disclaimer</p>
        Anchor is a wellness companion, not a medical device or substitute for professional mental health care. If you are in crisis, please contact 988 (US) or your local emergency services.
      </div>

      <Button variant="destructive" onClick={handleSignOut} className="w-full">
        Sign Out
      </Button>
    </div>
  );
}
