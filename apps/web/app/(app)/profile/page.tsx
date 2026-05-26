"use client";

import { useEffect, useState } from "react";
import { createClient } from "@anchor/db/client";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@anchor/ui";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [hasPasscode, setHasPasscode] = useState(false);
  const [aiConsent, setAiConsent] = useState("basic");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email || "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      setDisplayName(profile.display_name || "");
      setAiConsent(profile.ai_consent_level);
      setHasPasscode(!!profile.app_passcode_hash);
    }
  }

  async function saveProfile() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updates: {
      display_name: string;
      ai_consent_level: "none" | "basic" | "full";
      app_passcode_hash?: string;
    } = {
      display_name: displayName,
      ai_consent_level: aiConsent as "none" | "basic" | "full",
    };

    if (passcode) {
      const encoder = new TextEncoder();
      const data = encoder.encode(passcode);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      updates.app_passcode_hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    await supabase.from("profiles").update(updates).eq("id", user.id);
    setSaving(false);
    setPasscode("");
    if (passcode) setHasPasscode(true);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function addDefaultHabits() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const defaults = [
      { name: "Morning journal", icon: "📝" },
      { name: "Meditation", icon: "🧘" },
      { name: "Exercise", icon: "🏃" },
      { name: "Gratitude", icon: "🙏" },
    ];

    await supabase.from("habits").insert(
      defaults.map((h) => ({ user_id: user.id, ...h }))
    );
    alert("Default habits added!");
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground text-sm">{email}</p>
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

          <Button onClick={saveProfile} disabled={saving}>
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

      <Button variant="destructive" onClick={signOut} className="w-full">
        Sign Out
      </Button>
    </div>
  );
}
