export type SupportedLanguageId = "python" | "javascript" | "java" | "c" | "cpp";

export type LanguageAvailability = "primary" | "planned";

export interface LanguageRoadmapItem {
  id: SupportedLanguageId;
  name: string;
  monogram: string;
  extension: string;
  availability: LanguageAvailability;
  statusLabel: string;
  runtimeNote: string;
  description: string;
  capabilities: string[];
}

export type ProjectStatus = "Draft" | "Template" | "Ready";

export interface CodeProject {
  id: string;
  name: string;
  description: string;
  language: SupportedLanguageId;
  topicSlug: string;
  lastModifiedIso: string;
  createdAtIso: string;
  status: ProjectStatus;
  codePreview: string;
  isDemoSeed?: boolean;
}

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

export type AccentTone = "indigo" | "emerald" | "amber" | "violet" | "rose";

export interface QuickStartTopic {
  slug: string;
  title: string;
  subtitle: string;
  difficulty: DifficultyLevel;
  accent: AccentTone;
  concepts: string[];
  estimatedMinutes: number;
  targetRoute: string;
  sampleCodeTitle: string;
}

export interface AlgorithmCatalogItem {
  id: string;
  slug: string;
  title: string;
  category:
    | "Arrays & Two Pointers"
    | "Sliding Window"
    | "Trees & Graphs"
    | "Recursion & Backtracking"
    | "Sorting & Searching"
    | "Hashing";
  difficulty: DifficultyLevel;
  timeComplexity: string;
  spaceComplexity: string;
  bruteForceComplexity?: string;
  summary: string;
  keyInsight: string;
}

export interface LearningTrack {
  id: string;
  slug: string;
  title: string;
  level: DifficultyLevel;
  description: string;
  modulesCount: number;
  estimatedHours: string;
  concepts: string[];
  accent: AccentTone;
}

export interface ComparisonScenario {
  id: string;
  slug: string;
  title: string;
  category: string;
  bruteForce: {
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
  };
  optimized: {
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
  };
  summary: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestampLabel: string;
  read: boolean;
  tag: "Platform" | "Roadmap" | "Tip";
}

export type SearchCategory =
  | "Navigation"
  | "Quick Start"
  | "Algorithm"
  | "Project"
  | "Quick Action";

export interface SearchableEntry {
  id: string;
  title: string;
  description: string;
  category: SearchCategory;
  href?: string;
  actionId?: string;
  keywords: string[];
}

