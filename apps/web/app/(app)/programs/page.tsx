"use client";

import { useEffect, useState } from "react";
import { createClient } from "@anchor/db/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from "@anchor/ui";
import Link from "next/link";

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
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();

    const programsRes = await supabase.from("programs").select("*").eq("is_active", true);
    setPrograms((programsRes.data as Program[]) || []);

    if (!user) return;

    const enrollmentsRes = await supabase
      .from("program_enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active");

    const enrollmentRows = enrollmentsRes.data || [];
    const programMap = new Map((programsRes.data || []).map((p) => [p.id, p]));

    setEnrollments(
      enrollmentRows.map((e) => ({
        ...e,
        programs: programMap.get(e.program_id) as Program,
      })) as Enrollment[]
    );
  }

  async function enroll(programId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("program_enrollments").insert({
      user_id: user.id,
      program_id: programId,
    });
    loadData();
  }

  const activeIds = new Set(enrollments.map((e) => e.program_id));

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Programs</h1>
        <p className="text-muted-foreground text-sm">30-day guided wellness journeys</p>
      </header>

      {enrollments.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-medium">Active</h2>
          {enrollments.map((e) => (
            <Link key={e.id} href={`/programs/${e.program_id}`}>
              <Card className="hover:bg-accent/50 transition-colors border-primary/30">
                <CardContent className="flex items-center gap-4 p-4">
                  <span className="text-3xl">{e.programs.metadata?.icon || "🌱"}</span>
                  <div className="flex-1">
                    <p className="font-medium">{e.programs.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Day {e.current_day} of {e.programs.duration_days}
                    </p>
                    <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(e.current_day / e.programs.duration_days) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-base font-medium">Explore</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {programs.map((program) => (
            <Card key={program.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{program.metadata?.icon || "🌱"}</span>
                  <CardTitle className="text-base">{program.title}</CardTitle>
                </div>
                <CardDescription>{program.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <p className="text-xs text-muted-foreground mb-3">{program.duration_days} days</p>
                {activeIds.has(program.id) ? (
                  <Link href={`/programs/${program.id}`}>
                    <Button variant="outline" className="w-full">Continue</Button>
                  </Link>
                ) : (
                  <Button className="w-full" onClick={() => enroll(program.id)}>
                    Start Program
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
