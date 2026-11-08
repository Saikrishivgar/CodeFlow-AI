import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CodeProject } from "@/types";
import type {
  BackendHealthResponse,
  BackendServiceStatus,
  ExecuteResponsePayload,
  PlaybackSpeed,
} from "@/types/api";
import {
  DEFAULT_WORKSPACE_SAMPLE,
  type SampleProgram,
} from "@/lib/data/samples";
import { ApiClientError, codeflowApi } from "@/lib/api/client";

export type WorkspaceStatus =
  | "idle"
  | "running"
  | "paused"
  | "playing"
  | "completed"
  | "error";

export type BottomDockTab = "output" | "trace" | "errors";

interface WorkspaceState {
  projectName: string;
  linkedProjectId: string | null;
  activeSampleId: string | null;
  sourceCode: string;
  lastExecutedCode: string | null;
  isDirty: boolean;

  editorFontSize: number;
  status: WorkspaceStatus;
  traceResult: ExecuteResponsePayload | null;
  networkError: string | null;
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  activeBottomTab: BottomDockTab;

  backendStatus: BackendServiceStatus;
  backendHealth: BackendHealthResponse | null;

  setSourceCode: (code: string) => void;
  setProjectName: (name: string) => void;
  setEditorFontSize: (size: number) => void;
  setActiveBottomTab: (tab: BottomDockTab) => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;

  loadSampleProgram: (sample: SampleProgram) => void;
  loadSavedProject: (project: CodeProject) => void;
  markSavedAsProject: (projectId: string, name: string) => void;

  checkBackendHealth: () => Promise<void>;
  runExecution: () => Promise<ExecuteResponsePayload | null>;
  stepForward: () => void;
  stepBackward: () => void;
  jumpToStep: (index: number) => void;
  pausePlayback: () => void;
  toggleAutoPlay: () => void;
  resetExecution: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      projectName: DEFAULT_WORKSPACE_SAMPLE.title,
      linkedProjectId: null,
      activeSampleId: DEFAULT_WORKSPACE_SAMPLE.id,
      sourceCode: DEFAULT_WORKSPACE_SAMPLE.code,
      lastExecutedCode: null,
      isDirty: false,

      editorFontSize: 13,
      status: "idle",
      traceResult: null,
      networkError: null,
      currentStepIndex: 0,
      isPlaying: false,
      playbackSpeed: 1,
      activeBottomTab: "output",

      backendStatus: "checking",
      backendHealth: null,

      setSourceCode: (code) =>
        set((state) => ({
          sourceCode: code,
          isDirty: true,
          isPlaying: false,
          status:
            state.status === "playing" ? "paused" : state.status,
        })),

      setProjectName: (name) =>
        set({
          projectName: name,
          isDirty: true,
        }),

      setEditorFontSize: (size) =>
        set({
          editorFontSize: Math.min(18, Math.max(12, size)),
        }),

      setActiveBottomTab: (tab) => set({ activeBottomTab: tab }),

      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

      loadSampleProgram: (sample) =>
        set({
          projectName: sample.title,
          linkedProjectId: null,
          activeSampleId: sample.id,
          sourceCode: sample.code,
          lastExecutedCode: null,
          isDirty: false,
          status: "idle",
          traceResult: null,
          networkError: null,
          currentStepIndex: 0,
          isPlaying: false,
          activeBottomTab: "output",
        }),

      loadSavedProject: (project) =>
        set({
          projectName: project.name,
          linkedProjectId: project.id,
          activeSampleId: null,
          sourceCode: project.codePreview,
          lastExecutedCode: null,
          isDirty: false,
          status: "idle",
          traceResult: null,
          networkError: null,
          currentStepIndex: 0,
          isPlaying: false,
          activeBottomTab: "output",
        }),

      markSavedAsProject: (projectId, name) =>
        set({
          linkedProjectId: projectId,
          projectName: name,
          isDirty: false,
        }),

      checkBackendHealth: async () => {
        try {
          const health = await codeflowApi.checkHealth();
          set({
            backendStatus: "connected",
            backendHealth: health,
          });
        } catch {
          set({
            backendStatus: "offline",
            backendHealth: null,
          });
        }
      },

      runExecution: async () => {
        const { sourceCode } = get();
        if (!sourceCode.trim()) {
          set({
            status: "idle",
            traceResult: null,
            networkError: null,
            currentStepIndex: 0,
            isPlaying: false,
          });
          return null;
        }

        set({
          status: "running",
          isPlaying: false,
          networkError: null,
        });

        try {
          const response = await codeflowApi.executePython({
            source_code: sourceCode,
            options: { max_steps: 500, timeout_seconds: 3.5 },
          });

          const hasError = response.status !== "completed";
          const totalSteps = response.steps.length;

          // On runtime error with steps, start on the crash step so the user sees the exact failing line immediately,
          // and can click Step Backward to inspect every prior step! On normal run, start at Step 1 (index 0).
          const initialIndex =
            hasError && totalSteps > 0 ? totalSteps - 1 : 0;

          const nextTab: BottomDockTab = hasError
            ? "errors"
            : response.stdout
            ? "output"
            : "trace";

          set({
            traceResult: response,
            lastExecutedCode: sourceCode,
            currentStepIndex: initialIndex,
            isPlaying: false,
            backendStatus: "connected",
            status: hasError
              ? "error"
              : totalSteps <= 1
              ? "completed"
              : "paused",
            activeBottomTab: nextTab,
          });

          return response;
        } catch (err) {
          const message =
            err instanceof ApiClientError
              ? err.message
              : "Unexpected error communicating with Python execution service.";
          set({
            status: "error",
            networkError: message,
            backendStatus: "offline",
            isPlaying: false,
            activeBottomTab: "errors",
          });
          return null;
        }
      },

      stepForward: () => {
        const { traceResult, currentStepIndex } = get();
        if (!traceResult || traceResult.steps.length === 0) return;

        const maxIndex = traceResult.steps.length - 1;
        if (currentStepIndex < maxIndex) {
          const nextIdx = currentStepIndex + 1;
          const reachedEnd = nextIdx === maxIndex;
          set({
            currentStepIndex: nextIdx,
            isPlaying: reachedEnd ? false : get().isPlaying,
            status:
              traceResult.status !== "completed" && reachedEnd
                ? "error"
                : reachedEnd
                ? "completed"
                : get().isPlaying
                ? "playing"
                : "paused",
          });
        } else {
          set({
            isPlaying: false,
            status:
              traceResult.status !== "completed" ? "error" : "completed",
          });
        }
      },

      stepBackward: () => {
        const { traceResult, currentStepIndex } = get();
        if (!traceResult || traceResult.steps.length === 0) return;
        if (currentStepIndex > 0) {
          set({
            currentStepIndex: currentStepIndex - 1,
            isPlaying: false,
            status: "paused",
          });
        }
      },

      jumpToStep: (index) => {
        const { traceResult } = get();
        if (!traceResult || traceResult.steps.length === 0) return;
        const clamped = Math.max(
          0,
          Math.min(traceResult.steps.length - 1, index)
        );
        const atEnd = clamped === traceResult.steps.length - 1;
        set({
          currentStepIndex: clamped,
          isPlaying: false,
          status:
            traceResult.status !== "completed" && atEnd
              ? "error"
              : atEnd
              ? "completed"
              : "paused",
        });
      },

      pausePlayback: () =>
        set((state) => ({
          isPlaying: false,
          status: state.traceResult ? "paused" : "idle",
        })),

      toggleAutoPlay: () => {
        const { traceResult, isPlaying, currentStepIndex } = get();
        if (!traceResult || traceResult.steps.length === 0) return;

        if (isPlaying) {
          set({ isPlaying: false, status: "paused" });
          return;
        }

        const maxIndex = traceResult.steps.length - 1;
        const restartIndex = currentStepIndex >= maxIndex ? 0 : currentStepIndex;
        set({
          currentStepIndex: restartIndex,
          isPlaying: true,
          status: "playing",
        });
      },

      resetExecution: () =>
        set({
          status: "idle",
          traceResult: null,
          networkError: null,
          currentStepIndex: 0,
          isPlaying: false,
          lastExecutedCode: null,
          activeBottomTab: "output",
        }),
    }),
    {
      name: "codeflow-workspace-editor-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        editorFontSize: state.editorFontSize,
        playbackSpeed: state.playbackSpeed,
      }),
    }
  )
);

