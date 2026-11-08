"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpDown,
  Grid3X3,
  MinusCircle,
  PlusCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  ArrayCellItem,
  ArrayPointerMarker,
  ArrayVisualizationState,
} from "@/types/visualizer";
import { cn } from "@/lib/utils";

const POINTER_ROLE_STYLES: Record<
  ArrayPointerMarker["role"],
  { pill: string; arrow: string }
> = {
  left: {
    pill: "border-primary/50 bg-primary/15 text-primary",
    arrow: "text-primary",
  },
  right: {
    pill: "border-accent-violet/50 bg-accent-violet/15 text-accent-violet",
    arrow: "text-accent-violet",
  },
  mid: {
    pill: "border-accent-amber/50 bg-accent-amber/15 text-accent-amber",
    arrow: "text-accent-amber",
  },
  iterator: {
    pill: "border-accent-emerald/50 bg-accent-emerald/15 text-accent-emerald",
    arrow: "text-accent-emerald",
  },
  boundary: {
    pill: "border-border bg-surface-3 text-foreground",
    arrow: "text-muted-foreground",
  },
};

function CellStatusBadge({ status }: { status: ArrayCellItem["status"] }) {
  if (status === "default" || status === "active") return null;

  if (status === "inserted") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded bg-accent-emerald/18 px-1 py-0 font-mono text-[9px] font-semibold uppercase text-accent-emerald">
        <PlusCircle className="h-2.5 w-2.5" />
        new
      </span>
    );
  }
  if (status === "updated") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded bg-accent-amber/18 px-1 py-0 font-mono text-[9px] font-semibold uppercase text-accent-amber">
        <RefreshCw className="h-2.5 w-2.5" />
        set
      </span>
    );
  }
  if (status === "swapped") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded bg-accent-amber/20 px-1 py-0 font-mono text-[9px] font-semibold uppercase text-accent-amber">
        <ArrowUpDown className="h-2.5 w-2.5" />
        swap
      </span>
    );
  }
  if (status === "searched") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded bg-primary/20 px-1 py-0 font-mono text-[9px] font-semibold uppercase text-primary">
        <Search className="h-2.5 w-2.5" />
        check
      </span>
    );
  }
  return null;
}

interface ArrayVisualizerProps {
  state: ArrayVisualizationState;
}

export function ArrayVisualizer({ state }: ArrayVisualizerProps) {
  const outOfBoundsPointers = state.pointers.filter(
    (p) => p.index < 0 || p.index >= state.cells.length
  );

  // Detect active sliding window or two-pointer range [left..right]
  const leftPtr = state.pointers.find((p) => p.role === "left");
  const rightPtr = state.pointers.find((p) => p.role === "right");
  const hasRangeHighlight =
    leftPtr !== undefined &&
    rightPtr !== undefined &&
    leftPtr.index >= 0 &&
    rightPtr.index >= leftPtr.index &&
    rightPtr.index < state.cells.length;

  return (
    <div
      className="flex h-full flex-col justify-between gap-4 p-4"
      data-testid={`visualizer-array-${state.variableName}`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-foreground">
            {state.variableName}
          </span>
          <Badge variant="mono" className="px-1.5 py-0 text-[10px]">
            {state.typeName} · len={state.length}
          </Badge>
          {state.objectId && (
            <Badge variant="secondary" className="px-1.5 py-0 font-mono text-[10px]">
              {state.objectId}
            </Badge>
          )}
          {state.is2DMatrix && (
            <Badge variant="indigo" className="gap-1 px-1.5 py-0 text-[10px]">
              <Grid3X3 className="h-2.5 w-2.5" />
              2D Matrix
            </Badge>
          )}
        </div>

        {/* Active Pointers Summary Strip */}
        {state.pointers.length > 0 && (
          <div
            className="flex flex-wrap items-center gap-1.5"
            data-testid="array-pointers-strip"
          >
            <span className="text-[10.5px] font-medium text-muted-foreground">
              Index Pointers:
            </span>
            {state.pointers.map((ptr) => {
              const style = POINTER_ROLE_STYLES[ptr.role];
              return (
                <span
                  key={ptr.name}
                  data-testid={`array-pointer-pill-${ptr.name}`}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold",
                    style.pill
                  )}
                >
                  <span>
                    {ptr.name} = {ptr.index}
                  </span>
                  {ptr.previousIndex !== null &&
                    ptr.previousIndex !== undefined &&
                    ptr.previousIndex !== ptr.index && (
                      <span className="text-[9.5px] opacity-80">
                        (was {ptr.previousIndex})
                      </span>
                    )}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Operation Banner */}
      {state.operationSummary && (
        <div
          className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1.5 font-mono text-xs text-foreground"
          data-testid="array-operation-banner"
        >
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{state.operationSummary}</span>
        </div>
      )}

      {/* Main Array / 2D Matrix Canvas */}
      {state.cells.length === 0 ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-2/30 p-6 text-center">
          <span className="font-mono text-sm font-semibold text-muted-foreground">
            {state.variableName} = []
          </span>
          <span className="mt-1 text-xs text-subtle-foreground">
            Empty {state.typeName} (0 elements)
          </span>
        </div>
      ) : state.is2DMatrix && state.matrixRows ? (
        <div
          className="overflow-x-auto rounded-xl border border-border bg-surface-2/40 p-4"
          data-testid="array-2d-matrix"
        >
          <div className="inline-flex flex-col gap-2">
            {state.matrixRows.map((row) => (
              <div key={row.rowIndex} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-right font-mono text-[11px] text-subtle-foreground">
                  row [{row.rowIndex}]
                </span>
                <div className="flex items-center gap-1.5">
                  {row.cells.map((cell) => (
                    <div
                      key={cell.colIndex}
                      className={cn(
                        "flex h-11 min-w-[52px] flex-col items-center justify-center rounded-lg border px-2.5 font-mono text-xs transition-all",
                        cell.isActive
                          ? "border-primary bg-primary/15 font-bold text-foreground shadow-sm"
                          : "border-border bg-surface-1 text-foreground"
                      )}
                    >
                      <span className="text-[9px] text-subtle-foreground">
                        [{row.rowIndex}][{cell.colIndex}]
                      </span>
                      <span>{cell.display}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface-2/35 px-4 py-6">
          <div className="inline-flex min-w-full items-end justify-start gap-2.5">
            {state.cells.map((cell) => {
              const inActiveWindow =
                hasRangeHighlight &&
                cell.index >= leftPtr!.index &&
                cell.index <= rightPtr!.index;

              return (
                <motion.div
                  key={cell.index}
                  layout
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  data-testid={`array-cell-${cell.index}`}
                  className="flex flex-col items-center"
                >
                  {/* Top Pointer Markers pointing down into this cell */}
                  <div className="mb-1.5 flex min-h-[38px] flex-col items-center justify-end gap-1">
                    {cell.pointers.map((ptr) => {
                      const style = POINTER_ROLE_STYLES[ptr.role];
                      return (
                        <motion.div
                          key={ptr.name}
                          layoutId={`ptr-${state.variableName}-${ptr.name}`}
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                          data-testid={`array-cell-pointer-${ptr.name}-${cell.index}`}
                          className="flex flex-col items-center"
                        >
                          <span
                            className={cn(
                              " rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold shadow-sm",
                              style.pill
                            )}
                          >
                            {ptr.name}
                          </span>
                          <ArrowDown
                            className={cn("h-3 w-3 -mt-0.5", style.arrow)}
                          />
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Array Box */}
                  <div
                    className={cn(
                      "relative flex min-h-[62px] min-w-[66px] flex-col items-center justify-between rounded-xl border-2 px-3 py-2 font-mono transition-all",
                      cell.status === "inserted" &&
                        "border-accent-emerald bg-accent-emerald/15 text-foreground shadow-sm",
                      (cell.status === "updated" || cell.status === "swapped") &&
                        "border-accent-amber bg-accent-amber/15 text-foreground shadow-sm",
                      cell.status === "searched" &&
                        "border-primary bg-primary/20 text-foreground shadow-sm",
                      cell.status === "active" &&
                        "border-primary/80 bg-primary/12 text-foreground shadow-sm",
                      cell.status === "default" &&
                        (inActiveWindow
                          ? "border-primary/40 bg-primary/[0.06] text-foreground"
                          : "border-border bg-surface-1 text-foreground")
                    )}
                  >
                    <CellStatusBadge status={cell.status} />

                    <span
                      className="my-auto text-sm font-bold tracking-tight"
                      data-testid={`array-cell-value-${cell.index}`}
                    >
                      {cell.display}
                    </span>

                    {cell.previousDisplay !== null &&
                      cell.previousDisplay !== undefined &&
                      cell.previousDisplay !== cell.display && (
                        <span className="text-[9.5px] text-muted-foreground line-through">
                          was {cell.previousDisplay}
                        </span>
                      )}
                  </div>

                  {/* Bottom Index Label */}
                  <span className="mt-1.5 font-mono text-[11px] font-medium text-subtle-foreground">
                    [{cell.index}]
                  </span>
                </motion.div>
              );
            })}
          </div>

          {state.truncated && (
            <p className="mt-3 text-xs italic text-subtle-foreground">
              Showing first {state.cells.length} of {state.length} elements for
              responsive rendering.
            </p>
          )}
        </div>
      )}

      {/* Footer: Removed Items & Boundary Pointers */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {state.removedItems.length > 0 && (
          <div
            className="inline-flex items-center gap-2 rounded-lg border border-accent-rose/30 bg-accent-rose/10 px-3 py-1 font-mono text-xs text-accent-rose"
            data-testid="array-removed-items"
          >
            <MinusCircle className="h-3.5 w-3.5" />
            <span>
              Removed:{" "}
              {state.removedItems
                .map((r) => `${r.display} (from [${r.index}])`)
                .join(", ")}
            </span>
          </div>
        )}

        {outOfBoundsPointers.length > 0 && (
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
            <span>Boundary pointers:</span>
            {outOfBoundsPointers.map((p) => (
              <span key={p.name} className="font-semibold text-foreground">
                {p.name}={p.index}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

