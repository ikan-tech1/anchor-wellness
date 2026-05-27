"use client";

import { useEffect, useState } from "react";
import { fetchProgramsPageData, joinProgram } from "@/app/actions/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  PageHeader,
  PageShell,
  ProgressBar,
  EmptyState,
} from "@anchor/ui";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface Program {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration_days: number;
  metadata: { icon?: string; color?: string };
}

interface Enrollment {
  id: string;
  program_id: string;
  current_day: number;
  status: string;
  programs: Program;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await fetchProgramsPageData();
    setPrograms(data.programs as Program[]);
    setEnrollments(data.enrollments as Enrollment[]);
  }

  async function enroll(programId: string) {
    await joinProgram(programId);
    loadData();
  }

  const activeIds = new Set(enrollments.map((e) => e.program_id));

  return (
    <PageShell className="mx-auto max-w-3xl md:max-w-4xl lg:max-w-5xl">
      <PageHeader
        title="Programs"
        description="30-day guided wellness journeys"
      />

      {enrollments.length > 0 && (
        <section className="space-y-4">
          <h2 className="section-label">Active</h2>
          {enrollments.map((e) => (
            <Link key={e.id} href={`/programs/${e.program_id}`}>
              <Card className="transition-all hover:border-primary/30 hover:shadow-card border-primary/25 bg-primary/5">
                <CardContent className="flex items-center gap-5 p-5">
                  <span className="text-4xl">{e.programs?.metadata?.icon || "🌱"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{e.programs?.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Day {e.current_day} of {e.programs?.duration_days}
                    </p>
                    <ProgressBar
                      className="mt-3"
                      value={e.current_day}
                      max={e.programs?.duration_days || 30}
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="section-label">Explore</h2>
        {programs.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8 text-primary" />}
            title="Programs coming soon"
            description="Guided wellness journeys will be available here."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {programs.map((program) => (
              <Card key={program.id} className="flex flex-col shadow-soft hover:shadow-card transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{program.metadata?.icon || "🌱"}</span>
                    <CardTitle className="text-base font-medium">{program.title}</CardTitle>
                  </div>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <p className="text-xs text-muted-foreground mb-4">{program.duration_days} days</p>
                  {activeIds.has(program.id) ? (
                    <Link href={`/programs/${program.id}`}>
                      <Button variant="outline" className="w-full">
                        Continue
                      </Button>
                    </Link>
                  ) : (
                    <Button className="w-full" onClick={() => enroll(program.id)}>
                      Start program
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
