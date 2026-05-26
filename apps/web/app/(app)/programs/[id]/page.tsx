"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@anchor/db/client";
import { Card, CardContent, CardHeader, CardTitle, Button, Textarea } from "@anchor/ui";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { Program } from "@anchor/db/types";

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [program, setProgram] = useState<Program | null>(null);
  const [enrollment, setEnrollment] = useState<{ id: string; current_day: number } | null>(null);
  const [dayContent, setDayContent] = useState<{ content: unknown } | null>(null);
  const [responses, setResponses] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadProgram();
  }, [id]);

  async function loadProgram() {
    const { data: prog } = await supabase.from("programs").select("*").eq("id", id).single();
    setProgram(prog);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: enroll } = await supabase
      .from("program_enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("program_id", id)
      .eq("status", "active")
      .maybeSingle();

    if (enroll) {
      setEnrollment(enroll);
      const { data: content } = await supabase
        .from("program_day_content")
        .select("*")
        .eq("program_id", id)
        .eq("day_number", enroll.current_day)
        .maybeSingle();
      setDayContent(content);
    }
  }

  async function submitCheckin() {
    if (!enrollment) return;
    setSubmitting(true);

    await supabase.from("program_checkins").insert({
      enrollment_id: enrollment.id,
      day_number: enrollment.current_day,
      responses: { journal: responses },
    });

    const nextDay = enrollment.current_day + 1;
    const isComplete = program && nextDay > program.duration_days;

    await supabase
      .from("program_enrollments")
      .update({
        current_day: nextDay,
        status: isComplete ? "completed" : "active",
      })
      .eq("id", enrollment.id);

    setSubmitting(false);
    loadProgram();
    setResponses("");
  }

  if (!program) {
    return <div className="p-6 text-center text-muted-foreground">Loading...</div>;
  }

  const content = dayContent?.content as {
    title?: string;
    prompt?: string;
    journal_prompt?: string;
    meditation_min?: number;
  } | undefined;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Link href="/programs" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Programs
      </Link>

      <header className="flex items-center gap-3">
        <span className="text-4xl">{(program.metadata as { icon?: string })?.icon || "🌱"}</span>
        <div>
          <h1 className="text-2xl font-semibold">{program.title}</h1>
          {enrollment && (
            <p className="text-muted-foreground">
              Day {enrollment.current_day} of {program.duration_days}
            </p>
          )}
        </div>
      </header>

      {enrollment && content ? (
        <Card>
          <CardHeader>
            <CardTitle>{content.title || `Day ${enrollment.current_day}`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {content.prompt && (
              <p className="text-sm text-muted-foreground">{content.prompt}</p>
            )}
            {content.journal_prompt && (
              <div>
                <p className="text-sm font-medium mb-2">{content.journal_prompt}</p>
                <Textarea
                  value={responses}
                  onChange={(e) => setResponses(e.target.value)}
                  placeholder="Write your reflection..."
                  rows={4}
                />
              </div>
            )}
            {content.meditation_min && (
              <Link href={`/calm/meditate?duration=${content.meditation_min * 60}`}>
                <Button variant="outline">Start {content.meditation_min}min meditation</Button>
              </Link>
            )}
            <Button onClick={submitCheckin} disabled={submitting} className="w-full">
              {submitting ? "Saving..." : "Complete Day"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Enroll in this program to begin your journey.</p>
            <Link href="/programs">
              <Button className="mt-4">Back to Programs</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
