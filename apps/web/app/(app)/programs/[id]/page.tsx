"use client";

import { useEffect, useState, use } from "react";
import { fetchProgramDetail, submitProgramCheckin } from "@/app/actions/data";
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

  useEffect(() => {
    loadProgram();
  }, [id]);

  async function loadProgram() {
    const { program: prog, enrollment: enroll, dayContent: content } =
      await fetchProgramDetail(id);
    setProgram(prog as Program | null);
    if (enroll) {
      setEnrollment({
        id: enroll.id as string,
        current_day: enroll.current_day as number,
      });
      setDayContent(content as { content: unknown } | null);
    }
  }

  async function submitCheckin() {
    if (!enrollment || !program) return;
    setSubmitting(true);
    await submitProgramCheckin(
      enrollment.id,
      enrollment.current_day,
      { journal: responses },
      program.duration_days
    );
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
        <>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(enrollment.current_day / program.duration_days) * 100}%` }}
            />
          </div>
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
        </>
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
