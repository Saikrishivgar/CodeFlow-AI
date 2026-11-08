import type { Metadata } from "next";
import Link from "next/link";
import { Database, FolderCode, History, Terminal } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Execution History",
};

export default function HistoryPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Execution History"
          badge="Empty State · Phase 1"
          badgeVariant="secondary"
          description="Chronological log of step-by-step program runs, variable snapshots, and replayable execution traces."
        />

        <EmptyState
          icon={History}
          badge="No Recorded Runs Yet"
          badgeVariant="secondary"
          title="Your Execution Timeline Is Currently Empty"
          description="Program traces will appear here once the Python execution engine (Phase 2) and PostgreSQL persistence layer (Phase 6) are connected. No synthetic or fake run logs are shown."
          actions={
            <>
              <Button asChild>
                <Link href="/projects">
                  <FolderCode className="h-4 w-4" />
                  View Local Project Drafts
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface-2/60 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                Session Replay (Phase 2)
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Re-open recent execution traces instantaneously without
                re-running deterministic inputs.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2/60 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Database className="h-3.5 w-3.5 text-accent-emerald" />
                Cloud History (Phase 6)
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Persist execution snapshots, step counts, and bookmarks in
                PostgreSQL.
              </p>
            </div>
          </div>
        </EmptyState>
      </div>
    </AppShell>
  );
}
