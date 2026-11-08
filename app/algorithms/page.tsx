"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Cpu,
  GitCompare,
  Search,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ALGORITHM_CATALOG } from "@/lib/data/catalog";
import { useProjectStore } from "@/store/use-project-store";
import { useToastStore } from "@/store/use-toast-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Arrays & Two Pointers",
  "Sliding Window",
  "Hashing",
  "Sorting & Searching",
  "Trees & Graphs",
  "Recursion & Backtracking",
] as const;

function AlgorithmsContent() {
  const searchParams = useSearchParams();
  const hydrated = useHydrated();

  const initialCategory = searchParams.get("category") ?? "All";
  const initialQuery = searchParams.get("q") ?? "";

  const [selectedCategory, setSelectedCategory] =
    React.useState<string>(initialCategory);
  const [query, setQuery] = React.useState<string>(initialQuery);

  const exploredAlgorithms = useProjectStore((s) => s.exploredAlgorithms);
  const markAlgorithmExplored = useProjectStore((s) => s.markAlgorithmExplored);
  const toast = useToastStore((s) => s.toast);

  const filtered = React.useMemo(() => {
    return ALGORITHM_CATALOG.filter((alg) => {
      const matchesCat =
        selectedCategory === "All" || alg.category === selectedCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        alg.title.toLowerCase().includes(q) ||
        alg.summary.toLowerCase().includes(q) ||
        alg.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [query, selectedCategory]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Algorithm Library"
        badge={`${ALGORITHM_CATALOG.length} Curated Patterns`}
        badgeVariant="default"
        description="Explore foundational data structures, asymptotic complexity profiles, and key visual invariants. Interactive step execution connects in Phases 2–3."
        actions={
          <Button asChild variant="secondary">
            <Link href="/comparison">
              <GitCompare className="h-3.5 w-3.5" />
              Compare Complexities
            </Link>
          </Button>
        }
      />

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search algorithms..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-primary/40 bg-primary/14 text-primary"
                    : "border-border bg-surface-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Cpu}
          badge="No Filter Matches"
          badgeVariant="secondary"
          title="No algorithms match your current search"
          description="Clear the search filter or choose 'All' categories to view the complete algorithm library."
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setQuery("");
                setSelectedCategory("All");
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((alg) => {
            const isExplored =
              hydrated && exploredAlgorithms.includes(alg.slug);

            return (
              <div
                key={alg.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-surface-1 p-5 shadow-elevation-1 transition-colors hover:border-border-strong"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="secondary">{alg.category}</Badge>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={
                          alg.difficulty === "Beginner"
                            ? "emerald"
                            : alg.difficulty === "Intermediate"
                            ? "default"
                            : "amber"
                        }
                      >
                        {alg.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <h2 className="mt-3 text-heading-md text-foreground">
                    {alg.title}
                  </h2>
                  <p className="mt-1.5 text-body-sm text-muted-foreground leading-relaxed">
                    {alg.summary}
                  </p>

                  <div className="mt-4 rounded-lg border border-border-subtle bg-surface-2/55 p-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      <Sparkles className="h-3 w-3 text-accent-violet" />
                      Visual Invariant:
                    </span>{" "}
                    {alg.keyInsight}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-3.5">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <Badge variant="mono">Time {alg.timeComplexity}</Badge>
                    <Badge variant="mono">Space {alg.spaceComplexity}</Badge>
                  </div>

                  <Button
                    type="button"
                    size="xs"
                    variant={isExplored ? "subtle" : "secondary"}
                    onClick={() => {
                      markAlgorithmExplored(alg.slug);
                      if (!isExplored) {
                        toast({
                          title: "Algorithm marked explored",
                          description: `"${alg.title}" saved in your local workspace progress.`,
                          variant: "success",
                        });
                      }
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isExplored ? "Explored" : "Mark Explored"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AlgorithmsPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <AlgorithmsContent />
      </Suspense>
    </AppShell>
  );
}

