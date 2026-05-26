"use client";

import { useEffect, useState } from "react";
import { createClient } from "@anchor/db/client";
import { Card, CardContent, Button, Input } from "@anchor/ui";
import Link from "next/link";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Array<{ slug: string; title: string; category: string; description: string | null }>>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("journal_templates").select("*").order("category").then(({ data }) => {
      setTemplates(data || []);
    });
  }, []);

  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Journal Templates</h1>
        <p className="text-muted-foreground text-sm">Guided prompts for deeper reflection</p>
      </header>

      {categories.map((cat) => (
        <section key={cat} className="space-y-3">
          <h2 className="text-base font-medium capitalize">{cat}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {templates
              .filter((t) => t.category === cat)
              .map((template) => (
                <Link key={template.slug} href={`/journal/new?template=${template.slug}`}>
                  <Card className="hover:bg-accent/50 transition-colors h-full">
                    <CardContent className="p-4">
                      <p className="font-medium text-sm">{template.title}</p>
                      {template.description && (
                        <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                      )}
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
