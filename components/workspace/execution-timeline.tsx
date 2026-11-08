"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Layers,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { cn } from "@/lib/utils";

export function ExecutionTimeline() {
  const sourceCode = useWorkspaceStore((s) => s.sourceCode);
  const lastExecutedCode = useWorkspaceStore((s) => s.lastExecutedCode);
  const status = useWorkspaceStore((s) => s.status);
  const traceResult = useWorkspaceStore((s) => s.traceResult);
  const currentStepIndex = useWorkspaceStore((s) => s.currentStepIndex);
  const jumpToStep = useWorkspaceStore((s) => s.jumpToStep);
  const runExecution = useWorkspaceStore((s) => s.runExecution);

  const steps = traceResult?.steps ?? [];
  const totalSteps = steps.length;
  const hasSteps = totalSteps > 0;
  const currentStep = hasSteps ? steps[currentStepIndex] ?? steps[0] : null;

  const progressPercent = hasSteps
    ? totalSteps === 1
      ? 100
      : Math.round(((currentStepIndex + 1) / totalSteps) * 100)
    : 0;

  const isAtEnd = hasSteps && currentStepIndex === totalSteps - 1;
  const isCodeStale =
    lastExecutedCode !== null && lastExecutedCode !== sourceCode;

  // Build clickable visual tick markers (cap at 72 visual segments so 500-step traces stay crisp)
  const markerIndices = React.useMemo(() => {
    if (totalSteps === 0) return [];
    const maxMarkers = 72;
    if (totalSteps <= maxMarkers) {
      return Array.from({ length: totalSteps }, (_, i) => i);
    }
    const stride = (totalSteps - 1) / (maxMarkers - 1);
    return Array.from({ length: maxMarkers }, (_, i) =>
      Math.round(i * stride)
    );
  }, [totalSteps]);

  return (
    <div
      className="border-b border-border bg-surface-1/60 px-3 py-2 sm:px-4"
      data-testid="execution-timeline"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Step counter, active line, function & call depth */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!hasSteps || currentStepIndex <= 0}
              onClick={() => jumpToStep(0)}
              aria-label="Jump to first step"
              data-testid="timeline-first-btn"
              className="h-6 w-6"
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>

            <span
              className="min-w-[6.5rem] text-center font-mono text-xs font-semibold tabular-nums text-foreground"
              data-testid="timeline-step-counter"
            >
              {hasSteps
                ? `Step ${currentStepIndex + 1} / ${totalSteps}`
                : "Step 0 / 0"}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!hasSteps || currentStepIndex >= totalSteps - 1}
              onClick={() => jumpToStep(totalSteps - 1)}
              aria-label="Jump to last step"
              data-testid="timeline-last-btn"
              className="h-6 w-6"
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {currentStep && (
            <>
              <Badge variant="mono" className="px-1.5 py-0 text-[11px]">
                Line {currentStep.line}
              </Badge>

              <Badge
                variant={
                  currentStep.event === "exception"
                    ? "rose"
                    : currentStep.event === "call"
                    ? "default"
                    : currentStep.event === "return"
                    ? "violet"
                    : "emerald"
                }
                className="px-1.5 py-0 font-mono text-[10px] uppercase"
              >
                {currentStep.event}
              </Badge>

              <span className="hidden items-center gap-1 font-mono text-[11px] text-muted-foreground sm:inline-flex">
                <Layers className="h-3 w-3 text-subtle-foreground" />
                {currentStep.function_name}
                {currentStep.call_depth > 0 && ` (depth ${currentStep.call_depth})`}
              </span>
            </>
          )}

          {!hasSteps && status === "idle" && (
            <span className="text-xs text-muted-foreground">
              Click <strong className="font-medium text-foreground">Run</strong>{" "}
              or press <kbd className="rounded border border-border bg-surface-2 px-1 py-0.5 text-[10px]">⌘/Ctrl+Enter</kbd>{" "}
              to generate step-by-step snapshots.
            </span>
          )}
        </div>

        {/* Right: Stale warning, duration, progress %, completion indicator */}
        <div className="flex flex-wrap items-center gap-2">
          {isCodeStale && (
            <button
              type="button"
              onClick={() => void runExecution()}
              className="inline-flex items-center gap-1.5 rounded-md border border-accent-amber/35 bg-accent-amber/12 px-2 py-0.5 text-[11px] font-medium text-accent-amber transition-colors hover:bg-accent-amber/18"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Code edited — Re-run to sync</span>
            </button>
          )}

          {traceResult && (
            <span className="hidden items-center gap-1 font-mono text-[11px] tabular-nums text-muted-foreground md:inline-flex">
              <Clock className="h-3 w-3" />
              {traceResult.duration_ms.toFixed(1)} ms
            </span>
          )}

          {hasSteps && (
            <span className="font-mono text-[11px] font-medium tabular-nums text-muted-foreground">
              {progressPercent}%
            </span>
          )}

          {isAtEnd && traceResult?.status === "completed" && (
            <Badge variant="emerald" className="gap-1 px-2 py-0 text-[11px]">
              <CheckCircle2 className="h-3 w-3" />
              <span>Execution Complete</span>
            </Badge>
          )}

          {traceResult && traceResult.status !== "completed" && (
            <Badge variant="rose" className="gap-1 px-2 py-0 text-[11px]">
              <AlertCircle className="h-3 w-3" />
              <span>
                {traceResult.status === "syntax_error"
                  ? "Syntax Error"
                  : traceResult.status === "timeout"
                  ? "Timed Out"
                  : traceResult.status === "step_limit_exceeded"
                  ? "Step Limit Reached"
                  : "Runtime Exception"}
              </span>
            </Badge>
          )}
        </div>
      </div>

      {/* Interactive Timeline Scrubber */}
      {hasSteps && (
        <div className="mt-2 flex items-center gap-2">
          <div
            className="relative flex h-5 flex-1 items-center gap-[2px] rounded-md border border-border-subtle bg-surface-2/80 px-1.5"
            role="group"
            aria-label="Execution steps timeline"
          >
            {markerIndices.map((stepIdx) => {
              const stepObj = steps[stepIdx];
              const isCurrent = stepIdx === currentStepIndex;
              const isVisited = stepIdx < currentStepIndex;
              const ev = stepObj?.event ?? "line";

              return (
                <button
                  key={stepIdx}
                  type="button"
                  onClick={() => jumpToStep(stepIdx)}
                  data-testid={`timeline-tick-${stepIdx}`}
                  title={`Jump to Step ${stepIdx + 1} · Line ${stepObj?.line ?? "?"} (${ev})`}
                  aria-label={`Jump to Step ${stepIdx + 1}`}
                  className={cn(
                    "h-2.5 flex-1 rounded-[2px] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    isCurrent
                      ? ev === "exception"
                        ? "h-3.5 bg-accent-rose ring-1 ring-accent-rose/50"
                        : "h-3.5 bg-accent-emerald ring-1 ring-accent-emerald/50"
                      : ev === "exception"
                      ? "bg-accent-rose/65 hover:bg-accent-rose"
                      : isVisited
                      ? ev === "call"
                        ? "bg-primary/75 hover:bg-primary"
                        : ev === "return"
                        ? "bg-accent-violet/70 hover:bg-accent-violet"
                        : "bg-accent-emerald/55 hover:bg-accent-emerald/80"
                      : "bg-border-strong/45 hover:bg-muted-foreground/50"
                  )}
                />
              );
            })}
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => jumpToStep(Number(e.target.value))}
            aria-label="Execution timeline slider"
            data-testid="timeline-range-input"
            className="hidden w-28 accent-emerald-500 sm:block"
          />
        </div>
      )}
    </div>
  );
}

