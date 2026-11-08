"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Check,
  Database,
  Moon,
  RotateCcw,
  Save,
  Sun,
  User,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/store/use-project-store";
import { useToastStore } from "@/store/use-toast-store";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();

  const preferences = useProjectStore((s) => s.preferences);
  const updatePreferences = useProjectStore((s) => s.updatePreferences);
  const projects = useProjectStore((s) => s.projects);
  const exploredTopics = useProjectStore((s) => s.exploredTopics);
  const resetDemoProjects = useProjectStore((s) => s.resetDemoProjects);
  const resetLearningProgress = useProjectStore((s) => s.resetLearningProgress);
  const toast = useToastStore((s) => s.toast);

  const [nameInput, setNameInput] = React.useState(preferences.displayName);

  React.useEffect(() => {
    if (hydrated) {
      setNameInput(preferences.displayName);
    }
  }, [hydrated, preferences.displayName]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nameInput.trim() || "Developer Guest";
    updatePreferences({ displayName: cleaned });
    toast({
      title: "Workspace profile updated",
      description: `Display name saved as "${cleaned}" in local storage.`,
      variant: "success",
    });
  };

  const activeTheme = hydrated ? resolvedTheme : "dark";

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Settings"
          badge="Local Preferences"
          badgeVariant="secondary"
          description="Customize theme mode, workspace display preferences, and local browser state."
        />

        {/* 1. Appearance / Theme Management */}
        <section className="rounded-xl border border-border bg-surface-1 p-5 shadow-elevation-1 space-y-4">
          <div>
            <h2 className="text-heading-sm text-foreground">Appearance</h2>
            <p className="text-xs text-muted-foreground">
              Dark mode is enabled by default. Your selection persists
              automatically across sessions.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={cn(
                "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                activeTheme === "dark"
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border bg-surface-2/50 hover:border-border-strong"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-[#0D0E12] text-white">
                  <Moon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-body-sm font-medium text-foreground">
                    Dark Theme
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Deep charcoal default
                  </p>
                </div>
              </div>
              {activeTheme === "dark" && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={cn(
                "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                activeTheme === "light"
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border bg-surface-2/50 hover:border-border-strong"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-zinc-900">
                  <Sun className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-body-sm font-medium text-foreground">
                    Light Theme
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Crisp high-contrast daylight
                  </p>
                </div>
              </div>
              {activeTheme === "light" && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          </div>
        </section>

        {/* 2. Local Profile & Interface Preferences */}
        <section className="rounded-xl border border-border bg-surface-1 p-5 shadow-elevation-1 space-y-5">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-heading-sm text-foreground">
              Workspace Profile &amp; Display
            </h2>
          </div>

          <form
            onSubmit={handleSaveProfile}
            className="flex flex-col gap-3 sm:flex-row sm:items-end max-w-md"
          >
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor="settings-display-name"
                className="text-xs font-medium text-foreground"
              >
                Local Display Name
              </label>
              <Input
                id="settings-display-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Developer Guest"
              />
            </div>
            <Button type="submit" variant="secondary">
              <Save className="h-3.5 w-3.5" />
              Save Profile
            </Button>
          </form>

          <div className="divide-y divide-border-subtle border-t border-border-subtle pt-2">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-body-sm font-medium text-foreground">
                  Compact Project Rows
                </p>
                <p className="text-xs text-muted-foreground">
                  Use denser table spacing in Dashboard and My Projects
                </p>
              </div>
              <Switch
                checked={hydrated ? preferences.compactProjectTable : false}
                onCheckedChange={(checked) =>
                  updatePreferences({ compactProjectTable: checked })
                }
                aria-label="Toggle compact project rows"
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-body-sm font-medium text-foreground">
                  Highlight Mutated Variables (Phase 2 Ready)
                </p>
                <p className="text-xs text-muted-foreground">
                  Emphasize variables modified in the active execution step
                </p>
              </div>
              <Switch
                checked={
                  hydrated ? preferences.highlightMutatedVariables : true
                }
                onCheckedChange={(checked) =>
                  updatePreferences({ highlightMutatedVariables: checked })
                }
                aria-label="Toggle mutated variable highlights"
              />
            </div>
          </div>
        </section>

        {/* 3. Local Browser State Management */}
        <section className="rounded-xl border border-border bg-surface-1 p-5 shadow-elevation-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-accent-emerald" />
              <h2 className="text-heading-sm text-foreground">
                Local Browser State
              </h2>
            </div>
            <Badge variant="secondary">
              {hydrated ? projects.length : 0} Projects ·{" "}
              {hydrated ? exploredTopics.length : 0} Topics Explored
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground max-w-2xl">
            Phase 1 stores temporary project drafts and topic exploration flags
            in <code className="rounded bg-surface-2 px-1 py-0.5">localStorage</code>.
            Use the controls below to restore starter templates or clear
            explored topic markers.
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                resetDemoProjects();
                toast({
                  title: "Starter projects restored",
                  description:
                    "Reset local project list to the 4 default Python templates.",
                  variant: "info",
                });
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restore Starter Projects
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                resetLearningProgress();
                toast({
                  title: "Local progress cleared",
                  description:
                    "Cleared explored topics and algorithm markers in this browser.",
                  variant: "info",
                });
              }}
            >
              Clear Exploration Progress
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

