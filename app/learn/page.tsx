"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LEARNING_TRACKS, QUICK_START_TOPICS } from "@/lib/data/catalog";
import { useProjectStore } from "@/store/use-project-store";
import { useToastStore } from "@/store/use-toast-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

function LearnContent() {
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const activeTopicSlug = searchParams.get("topic");

  const exploredTopics = useProjectStore((s) => s.exploredTopics);
  const markTopicExplored = useProjectStore((s) => s.markTopicExplored);
  const toast = useToastStore((s) => s.toast);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Learning Paths"
        badge="Structured Curriculum"
        badgeVariant="emerald"
        description="Progress systematically from Python execution fundamentals to pointer patterns, recursion stacks, and graph traversals."
        actions={
          <Button asChild variant="secondary">
            <Link href="/workspace">
              Preview Workspace
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      {/* Phase Notice Banner */}
      <div className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <p className="text-body-sm font-medium text-foreground">
              Curriculum Roadmap Ready · Interactive Checkpoints Arrive in Phases 2–4
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Explore module syllabi and track topics locally today. Live code
              challenges will connect once the Python tracer launches.
            </p>
          </div>
        </div>
        <Badge variant="default" className="w-fit shrink-0">
          4 Progressive Tracks
        </Badge>
      </div>

      {/* 4 Core Tracks */}
      <div className="grid gap-4 md:grid-cols-2">
        {LEARNING_TRACKS.map((track) => (
          <div
            key={track.id}
            className="flex flex-col justify-between rounded-xl border border-border bg-surface-1 p-5 shadow-elevation-1"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={
                    track.level === "Beginner"
                      ? "emerald"
                      : track.level === "Intermediate"
                      ? "default"
                      : "amber"
                  }
                >
                  {track.level}
                </Badge>
                <span className="font-mono text-xs text-subtle-foreground">
                  {track.modulesCount} modules · {track.estimatedHours}
                </span>
              </div>

              <h2 className="mt-3 text-heading-md text-foreground">
                {track.title}
              </h2>
              <p className="mt-1.5 text-body-sm text-muted-foreground leading-relaxed">
                {track.description}
              </p>
            </div>

            <div className="mt-5 border-t border-border-subtle pt-3.5">
              <div className="flex flex-wrap gap-1.5">
                {track.concepts.map((concept) => (
                  <span
                    key={concept}
                    className="rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Topic Concept Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="text-heading-sm text-foreground">
              Topic Focus Modules
            </h2>
          </div>
          <Badge variant="secondary">Local Progress Sync</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_START_TOPICS.map((topic) => {
            const isHighlighted = activeTopicSlug === topic.slug;
            const isExplored = hydrated && exploredTopics.includes(topic.slug);

            return (
              <div
                key={topic.slug}
                className={cn(
                  "flex flex-col justify-between rounded-xl border bg-surface-1 p-4 transition-colors",
                  isHighlighted
                    ? "border-primary ring-1 ring-primary/35"
                    : "border-border"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-heading-sm text-foreground">
                      {topic.title}
                    </span>
                    {isHighlighted && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {topic.subtitle}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-subtle-foreground">
                    Blueprint: {topic.sampleCodeTitle}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    ~{topic.estimatedMinutes} min
                  </span>
                  <Button
                    type="button"
                    size="xs"
                    variant={isExplored ? "subtle" : "secondary"}
                    onClick={() => {
                      markTopicExplored(topic.slug);
                      if (!isExplored) {
                        toast({
                          title: "Topic marked explored",
                          description: `"${topic.title}" added to your local learning progress.`,
                          variant: "success",
                        });
                      }
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isExplored ? "Explored" : "Mark Studied"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function LearnPage() {
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
        <LearnContent />
      </Suspense>
    </AppShell>
  );
}

