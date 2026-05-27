"use client";

import { useEffect, useState } from "react";
import { fetchTemplates } from "@/app/actions/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  PageHeader,
  PageShell,
  EmptyState,
} from "@anchor/ui";
import Link from "next/link";
import { FileText } from "lucide-react";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<
    Array<{
      id: string;
      slug: string;
      title: string;
      category: string;
      description: string | null;
    }>
  >([]);

  useEffect(() => {
    fetchTemplates().then((data) => setTemplates(data as typeof templates));
  }, []);

  const grouped = templates.reduce<Record<string, typeof templates>>((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});

  return (
    <PageShell className="mx-auto max-w-3xl md:max-w-4xl lg:max-w-5xl">
      <PageHeader
        title="Templates"
        description="Structured prompts to guide your writing"
      />

      {Object.keys(grouped).length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8 text-primary" />}
          title="No templates yet"
          description="Journal templates will appear here once they're available."
        />
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="space-y-4">
            <h2 className="section-label capitalize">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((t) => (
                <Link key={t.id} href={`/journal/new?template=${t.slug}`}>
                  <Card className="h-full transition-all hover:border-primary/25 hover:shadow-card">
                    <CardHeader>
                      <CardTitle className="text-base font-medium">{t.title}</CardTitle>
                      {t.description && <CardDescription>{t.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs font-medium text-primary">Use template →</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </PageShell>
  );
}
