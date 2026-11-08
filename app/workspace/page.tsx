"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WorkspaceToolbar } from "@/components/workspace/workspace-toolbar";
import { ExecutionTimeline } from "@/components/workspace/execution-timeline";
import { CodeEditorPane } from "@/components/workspace/code-editor-pane";
import { ExplanationPanel } from "@/components/workspace/explanation-panel";
import { VariableInspector } from "@/components/workspace/variable-inspector";
import { OutputPanel } from "@/components/workspace/output-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { SAMPLE_PROGRAMS } from "@/lib/data/samples";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { useProjectStore } from "@/store/use-project-store";
import { useToastStore } from "@/store/use-toast-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { useGlobalShortcuts } from "@/hooks/use-keyboard-shortcuts";

function WorkspaceIDEContent() {
  useGlobalShortcuts({ enableSidebarShortcut: false });

  const searchParams = useSearchParams();
  const hydrated = useHydrated();

  const projects = useProjectStore((s) => s.projects);
  const createProject = useProjectStore((s) => s.createProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const toast = useToastStore((s) => s.toast);

  const projectName = useWorkspaceStore((s) => s.projectName);
  const linkedProjectId = useWorkspaceStore((s) => s.linkedProjectId);
  const sourceCode = useWorkspaceStore((s) => s.sourceCode);
  const isPlaying = useWorkspaceStore((s) => s.isPlaying);
  const playbackSpeed = useWorkspaceStore((s) => s.playbackSpeed);

  const loadSampleProgram = useWorkspaceStore((s) => s.loadSampleProgram);
  const loadSavedProject = useWorkspaceStore((s) => s.loadSavedProject);
  const markSavedAsProject = useWorkspaceStore((s) => s.markSavedAsProject);
  const checkBackendHealth = useWorkspaceStore((s) => s.checkBackendHealth);
  const runExecution = useWorkspaceStore((s) => s.runExecution);
  const stepForward = useWorkspaceStore((s) => s.stepForward);
  const stepBackward = useWorkspaceStore((s) => s.stepBackward);
  const resetExecution = useWorkspaceStore((s) => s.resetExecution);

  // Check FastAPI health on mount
  React.useEffect(() => {
    void checkBackendHealth();
  }, [checkBackendHealth]);

  // Load ?project=<id>, ?sample=<slug>, or ?template=<slug> when navigated from Dashboard / Library
  const projectParam = searchParams.get("project");
  const sampleParam = searchParams.get("sample") ?? searchParams.get("template");
  const appliedQueryRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const queryKey = `${projectParam ?? ""}|${sampleParam ?? ""}`;
    if (queryKey === "|" || appliedQueryRef.current === queryKey) return;

    // Static sample lookup does not depend on localStorage hydration
    if (!projectParam && sampleParam) {
      const normalizedSampleId = `sample_${sampleParam.replace(/-/g, "_")}`;
      const matchedSample = SAMPLE_PROGRAMS.find(
        (s) =>
          s.slug === sampleParam ||
          s.id === sampleParam ||
          s.id === normalizedSampleId
      );
      if (matchedSample) {
        loadSampleProgram(matchedSample);
        appliedQueryRef.current = queryKey;
        return;
      }
    }

    if (!hydrated) return;

    if (projectParam) {
      const existingProject = projects.find((p) => p.id === projectParam);
      if (existingProject) {
        loadSavedProject(existingProject);
        appliedQueryRef.current = queryKey;
        return;
      }
    }

    if (sampleParam) {
      const fallbackProject = projects.find((p) => p.topicSlug === sampleParam);
      if (fallbackProject) {
        loadSavedProject(fallbackProject);
        appliedQueryRef.current = queryKey;
      }
    }
  }, [
    hydrated,
    loadSampleProgram,
    loadSavedProject,
    projectParam,
    projects,
    sampleParam,
  ]);

  // Auto Play timer synchronized with playbackSpeed (0.5x, 1x, 1.5x, 2x)
  React.useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(850 / playbackSpeed);
    const timer = window.setInterval(() => {
      stepForward();
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, playbackSpeed, stepForward]);

  // Save current editor buffer to local Project Store
  const handleSaveProject = React.useCallback(() => {
    const cleanName = projectName.trim() || "Untitled Python Visualization";
    const existing = linkedProjectId
      ? projects.find((p) => p.id === linkedProjectId)
      : null;

    if (existing) {
      updateProject(existing.id, {
        name: cleanName,
        codePreview: sourceCode,
        status: "Ready",
      });
      markSavedAsProject(existing.id, cleanName);
      toast({
        title: "Project updated",
        description: `"${cleanName}" saved to your local workspace.`,
        variant: "success",
      });
    } else {
      const created = createProject({
        name: cleanName,
        description: "Interactive Python visualization saved from Workspace IDE.",
        language: "python",
        status: "Ready",
        codePreview: sourceCode,
      });
      markSavedAsProject(created.id, created.name);
      toast({
        title: "Saved to My Projects",
        description: `"${created.name}" is now available on your Dashboard.`,
        variant: "success",
      });
    }
  }, [
    createProject,
    linkedProjectId,
    markSavedAsProject,
    projectName,
    projects,
    sourceCode,
    toast,
    updateProject,
  ]);

  // Global window keyboard shortcuts (when focus is outside Monaco editor)
  React.useEffect(() => {
    function handleWindowKeyDown(event: KeyboardEvent) {
      // Skip if event already originated inside Monaco textarea (Monaco handles its own commands)
      const target = event.target as HTMLElement | null;
      if (target?.closest(".monaco-editor")) return;

      const isMod = event.metaKey || event.ctrlKey;

      if (isMod && event.key === "Enter") {
        event.preventDefault();
        void runExecution();
        return;
      }

      if (event.key === "F10" && event.shiftKey) {
        event.preventDefault();
        stepBackward();
        return;
      }

      if (event.key === "F10" && !event.shiftKey) {
        event.preventDefault();
        stepForward();
        return;
      }

      if (isMod && event.shiftKey && event.key.toLowerCase() === "r") {
        event.preventDefault();
        resetExecution();
        return;
      }

      if (isMod && !event.shiftKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleSaveProject();
      }
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [
    handleSaveProject,
    resetExecution,
    runExecution,
    stepBackward,
    stepForward,
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground lg:h-screen lg:overflow-hidden">
      {/* Area A: Top IDE Toolbar */}
      <WorkspaceToolbar onSaveProject={handleSaveProject} />

      {/* Execution Timeline & Interactive Scrubber */}
      <ExecutionTimeline />

      {/* Main Split Workspace */}
      <main className="grid flex-1 gap-3 p-3 lg:min-h-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.95fr)]">
        {/* Left Column: Area B (Monaco Code Editor) + Area D (Bottom Output/Trace/Errors Dock) */}
        <div className="flex min-w-0 flex-col gap-3 lg:min-h-0">
          <div className="min-h-[340px] flex-1 lg:min-h-0">
            <CodeEditorPane onSaveShortcut={handleSaveProject} />
          </div>
          <OutputPanel />
        </div>

        {/* Right Column: Beginner-Friendly Explanation ("What's Happening?") + Area C (Variable Inspector) */}
        <div className="flex min-w-0 flex-col gap-3 lg:min-h-0">
          <ExplanationPanel />
          <VariableInspector />
        </div>
      </main>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col gap-3 bg-background p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="grid flex-1 gap-3 lg:grid-cols-2">
            <Skeleton className="h-[520px] w-full" />
            <Skeleton className="h-[520px] w-full" />
          </div>
        </div>
      }
    >
      <WorkspaceIDEContent />
    </Suspense>
  );
}
