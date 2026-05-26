"use client";

import { useEffect, useState } from "react";
import { fetchTemplates } from "@/app/actions/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@anchor/ui";
import Link from "next/link";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Array<{
    id: string;
    slug: string;
    title: string;
    category: string;
    description: string | null;
  }>>([]);

  useEffect(() => {
    fetchTemplates().then((data) => setTemplates(data as typeof templates));
  }, []);

  const grouped = templates.reduce<Record<string, typeof templates>>((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Templates</h1>
        <p className="text-muted-foreground text-sm">Structured prompts to guide your writing</p>
      </header>

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="space-y-3">
          <h2 className="text-base font-medium capitalize">{category}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((t) => (
              <Link key={t.id} href={`/journal/new?template=${t.slug}`}>
                <Card className="hover:bg-accent/50 transition-colors h-full">
                  <CardHeader>
                    <CardTitle className="text-base">{t.title}</CardTitle>
                    {t.description && <CardDescription>{t.description}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-primary">Use template →</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
