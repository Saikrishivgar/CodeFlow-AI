import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  CodeProject,
  NotificationItem,
  ProjectStatus,
  SupportedLanguageId,
} from "@/types";
import {
  INITIAL_LOCAL_PROJECTS,
  INITIAL_NOTIFICATIONS,
} from "@/lib/data/catalog";
import { createLocalId } from "@/lib/utils";

export interface WorkspacePreferences {
  displayName: string;
  roleLabel: string;
  preferredLanguage: SupportedLanguageId;
  lineNumbers: boolean;
  highlightMutatedVariables: boolean;
  compactProjectTable: boolean;
}

interface ProjectStoreState {
  projects: CodeProject[];
  exploredTopics: string[];
  exploredAlgorithms: string[];
  notifications: NotificationItem[];
  preferences: WorkspacePreferences;

  createProject: (payload: {
    name: string;
    description?: string;
    language?: SupportedLanguageId;
    topicSlug?: string;
    status?: ProjectStatus;
    codePreview?: string;
  }) => CodeProject;
  renameProject: (id: string, newName: string) => void;
  updateProject: (
    id: string,
    patch: Partial<Pick<CodeProject, "name" | "description" | "codePreview" | "status" | "topicSlug">>
  ) => void;
  duplicateProject: (id: string) => CodeProject | null;
  deleteProject: (id: string) => void;
  touchProject: (id: string) => void;
  resetDemoProjects: () => void;

  markTopicExplored: (slug: string) => void;
  markAlgorithmExplored: (slug: string) => void;
  resetLearningProgress: () => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  updatePreferences: (patch: Partial<WorkspacePreferences>) => void;
}

const DEFAULT_PREFERENCES: WorkspacePreferences = {
  displayName: "Developer Guest",
  roleLabel: "Local Workspace",
  preferredLanguage: "python",
  lineNumbers: true,
  highlightMutatedVariables: true,
  compactProjectTable: false,
};

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set, get) => ({
      projects: INITIAL_LOCAL_PROJECTS,
      exploredTopics: ["python-basics", "arrays", "sliding-window"],
      exploredAlgorithms: ["binary-search", "sliding-window-subarray"],
      notifications: INITIAL_NOTIFICATIONS,
      preferences: DEFAULT_PREFERENCES,

      createProject: (payload) => {
        const now = new Date().toISOString();
        const newProject: CodeProject = {
          id: createLocalId("proj"),
          name: payload.name.trim() || "Untitled Visualization",
          description:
            payload.description?.trim() ||
            "Local Python draft prepared for Phase 2 step visualization.",
          language: payload.language ?? "python",
          topicSlug: payload.topicSlug ?? "python-basics",
          lastModifiedIso: now,
          createdAtIso: now,
          status: payload.status ?? "Draft",
          isDemoSeed: false,
          codePreview:
            payload.codePreview ??
            `def solve(items: list[int]) -> int:\n    total = 0\n    for value in items:\n        total += value\n    return total`,
        };

        set((state) => ({
          projects: [newProject, ...state.projects],
        }));

        return newProject;
      },

      renameProject: (id, newName) => {
        const trimmed = newName.trim();
        if (!trimmed) return;
        const now = new Date().toISOString();

        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === id
              ? { ...proj, name: trimmed, lastModifiedIso: now }
              : proj
          ),
        }));
      },

      updateProject: (id, patch) => {
        const now = new Date().toISOString();
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === id
              ? {
                  ...proj,
                  ...patch,
                  name: patch.name?.trim() || proj.name,
                  lastModifiedIso: now,
                }
              : proj
          ),
        }));
      },

      duplicateProject: (id) => {
        const existing = get().projects.find((proj) => proj.id === id);
        if (!existing) return null;

        const now = new Date().toISOString();
        const copy: CodeProject = {
          ...existing,
          id: createLocalId("proj"),
          name: `${existing.name} (Copy)`,
          lastModifiedIso: now,
          createdAtIso: now,
          status: "Draft",
          isDemoSeed: false,
        };

        set((state) => ({
          projects: [copy, ...state.projects],
        }));

        return copy;
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((proj) => proj.id !== id),
        }));
      },

      touchProject: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          projects: state.projects.map((proj) =>
            proj.id === id ? { ...proj, lastModifiedIso: now } : proj
          ),
        }));
      },

      resetDemoProjects: () => {
        set({ projects: INITIAL_LOCAL_PROJECTS });
      },

      markTopicExplored: (slug) => {
        set((state) =>
          state.exploredTopics.includes(slug)
            ? state
            : { exploredTopics: [...state.exploredTopics, slug] }
        );
      },

      markAlgorithmExplored: (slug) => {
        set((state) =>
          state.exploredAlgorithms.includes(slug)
            ? state
            : { exploredAlgorithms: [...state.exploredAlgorithms, slug] }
        );
      },

      resetLearningProgress: () => {
        set({ exploredTopics: [], exploredAlgorithms: [] });
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      updatePreferences: (patch) => {
        set((state) => ({
          preferences: { ...state.preferences, ...patch },
        }));
      },
    }),
    {
      name: "codeflow-local-workspace-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

