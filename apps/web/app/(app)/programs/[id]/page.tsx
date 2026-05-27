"use client";

import { useEffect, useState, use } from "react";
import { fetchProgramDetail, submitProgramCheckin } from "@/app/actions/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Textarea,
  PageShell,
  PageSkeleton,
  ProgressBar,
  EmptyState,
} from "@anchor/ui";
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
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
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

  if (loading) {
    return <PageSkeleton />;
  }

  if (!program) {
    return (
      <PageShell className="mx-auto max-w-3xl">
        <EmptyState title="Program not found" description="This program may have been removed." />
      </PageShell>
    );
  }

  const content = dayContent?.content as {
    title?: string;
    prompt?: string;
    journal_prompt?: string;
    meditation_min?: number;
  } | undefined;

  return (
    <PageShell className="mx-auto max-w-3xl md:max-w-4xl lg:max-w-5xl space-y-6">
      <Link
        href="/programs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors touch-target"
      >
        <ArrowLeft className="h-4 w-4" /> Programs
      </Link>

      <header className="flex items-center gap-4">
        <span className="text-5xl">{(program.metadata as { icon?: string })?.icon || "🌱"}</span>
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight">{program.title}</h1>
          {enrollment && (
            <p className="text-muted-foreground mt-1">
              Day {enrollment.current_day} of {program.duration_days}
            </p>
          )}
        </div>
      </header>

      {enrollment && content ? (
        <>
          <ProgressBar
            value={enrollment.current_day}
            max={program.duration_days}
            showLabel
          />
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-serif text-xl">
                {content.title || `Day ${enrollment.current_day}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {content.prompt && (
                <p className="text-sm text-muted-foreground leading-relaxed">{content.prompt}</p>
              )}
              {content.journal_prompt && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">{content.journal_prompt}</p>
                  <Textarea
                    value={responses}
                    onChange={(e) => setResponses(e.target.value)}
                    placeholder="Write your reflection..."
                    rows={5}
                    className="min-h-[140px]"
                  />
                </div>
              )}
              {content.meditation_min && (
                <Link href={`/calm/meditate?duration=${content.meditation_min * 60}`}>
                  <Button variant="outline">
                    Start {content.meditation_min}min meditation
                  </Button>
                </Link>
              )}
              <Button onClick={submitCheckin} disabled={submitting} className="w-full" size="lg">
                {submitting ? "Saving..." : "Complete day"}
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={<span className="text-3xl">🌱</span>}
          title="Not enrolled yet"
          description="Enroll in this program from the programs page to begin your journey."
          action={
            <Link href="/programs">
              <Button>Back to programs</Button>
            </Link>
          }
        />
      )}
    </PageShell>
  );
}
