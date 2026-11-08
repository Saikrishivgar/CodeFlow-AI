import type { Metadata } from "next";
import Link from "next/link";
import { Compass, GitCompare, Layers } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COMPARISON_SCENARIOS } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Code Comparison",
};

export default function ComparisonPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Code Comparison"
          badge="Brute Force vs. Optimized"
          badgeVariant="violet"
          description="Contrast naive implementations against optimal algorithms to see exact asymptotic and step-count tradeoffs."
          actions={
            <Button asChild variant="secondary">
              <Link href="/algorithms">
                <Compass className="h-3.5 w-3.5" />
                Algorithm Library
              </Link>
            </Button>
          }
        />

        <EmptyState
          icon={GitCompare}
          badge="Dual-Runner Engine · Planned Phase 5"
          badgeVariant="violet"
          title="Synchronized Dual-Trace Runner Arrives After Execution Engine"
          description="Live side-by-side execution comparison builds on top of the Phase 2 Python tracer. Below are reference complexity blueprints prepared for the comparison suite."
          actions={
            <>
              <Button asChild>
                <Link href="/algorithms">Browse DSA Patterns</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </>
          }
        />

        {/* Reference Complexity Scenarios */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h2 className="text-heading-sm text-foreground">
                Reference Complexity Blueprints
              </h2>
            </div>
            <Badge variant="secondary">Static Reference Specs</Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {COMPARISON_SCENARIOS.map((scenario) => (
              <div
                key={scenario.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-surface-1 p-5 shadow-elevation-1 space-y-4"
              >
                <div>
                  <Badge variant="secondary">{scenario.category}</Badge>
                  <h3 className="mt-3 text-heading-md text-foreground">
                    {scenario.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {scenario.summary}
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div className="rounded-lg border border-accent-rose/25 bg-accent-rose/[0.06] p-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-accent-rose">
                      <span>Brute Force</span>
                      <span className="font-mono">
                        {scenario.bruteForce.timeComplexity}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {scenario.bruteForce.approach} · Space{" "}
                      <code className="text-foreground">
                        {scenario.bruteForce.spaceComplexity}
                      </code>
                    </p>
                  </div>

                  <div className="rounded-lg border border-accent-emerald/25 bg-accent-emerald/[0.06] p-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-accent-emerald">
                      <span>Optimized</span>
                      <span className="font-mono">
                        {scenario.optimized.timeComplexity}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {scenario.optimized.approach} · Space{" "}
                      <code className="text-foreground">
                        {scenario.optimized.spaceComplexity}
                      </code>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

