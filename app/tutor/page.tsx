import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  BrainCircuit,
  MessageSquareCode,
  Sparkles,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "AI Code Tutor",
};

export default function TutorPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="AI Code Tutor"
          badge="Planned · Phase 4"
          badgeVariant="violet"
          description="State-aware AI explanations grounded in your active execution line, call stack, and live variable mutations."
        />

        <EmptyState
          icon={Sparkles}
          badge="Awaiting Execution Context (Phase 4)"
          badgeVariant="violet"
          title="Context-Grounded AI Tutor Connects After Trace Engine"
          description="Unlike generic chat interfaces, CODEFLOW AI's Tutor reads actual runtime snapshots from the execution engine so every explanation references real variable values and stack frames. No simulated AI responses are generated in Phase 1."
          actions={
            <>
              <Button asChild>
                <Link href="/learn">
                  <BookOpen className="h-4 w-4" />
                  Explore Learning Paths
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/algorithms">Browse Algorithm Library</Link>
              </Button>
            </>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface-2/60 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <MessageSquareCode className="h-3.5 w-3.5 text-accent-violet" />
                Line-Level Why
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Explains why a branch executed or why a loop invariant holds at
                step N.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2/60 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                Bug Diagnostics
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Pinpoints the exact step where an off-by-one index or base case
                diverged.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2/60 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Zap className="h-3.5 w-3.5 text-accent-emerald" />
                Complexity Coaching
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Guides you from nested brute-force scans toward optimal data
                structures.
              </p>
            </div>
          </div>
        </EmptyState>
      </div>
    </AppShell>
  );
}

