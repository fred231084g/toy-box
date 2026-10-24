import type { ReactNode } from "react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Separator } from "@/shared/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { isHexColor } from "@/shared/utils";
import { useUpdateWorkspaceSetting, useWorkspaceSelector } from "@workspace/hooks/state";
import { ProviderSettings } from "@providers/components/ProviderSettings";

const AUTO_FOCUS_ARTIFACT_OPTIONS = {
  always: "Always",
  sessions: "Sessions",
  automations: "Automations",
  never: "Never",
} as const;

const SESSION_VIEW_OPTIONS = {
  all: "All messages",
  responses: "Responses",
} as const;

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const settings = useWorkspaceSelector((workspace) => workspace.settings);
  const updateSetting = useUpdateWorkspaceSetting();
  const { accentColor, terminalShell, useWorktree, autoFocusArtifacts, defaultSessionView } =
    settings;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <SettingField label="Default session view" htmlFor="default-session-view">
              <Select
                items={SESSION_VIEW_OPTIONS}
                value={defaultSessionView}
                onValueChange={(value) => updateSetting("defaultSessionView", value)}
              >
                <SelectTrigger id="default-session-view" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SESSION_VIEW_OPTIONS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingField>
            <SettingField label="Auto-focus artifacts" htmlFor="auto-focus-artifacts">
              <Select
                items={AUTO_FOCUS_ARTIFACT_OPTIONS}
                value={autoFocusArtifacts}
                onValueChange={(value) => updateSetting("autoFocusArtifacts", value)}
              >
                <SelectTrigger id="auto-focus-artifacts" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AUTO_FOCUS_ARTIFACT_OPTIONS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingField>
            <SettingField label="Accent color" htmlFor="accent-color">
              <div className="relative flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-3 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                <span
                  aria-hidden="true"
                  className="size-4 shrink-0 rounded-full border border-black/10 bg-accent"
                />
                <code className="text-xs text-muted-foreground uppercase">{accentColor}</code>
                <input
                  id="accent-color"
                  type="color"
                  value={accentColor}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    if (isHexColor(value)) updateSetting("accentColor", value);
                  }}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </div>
            </SettingField>
            <SettingField label="Terminal shell" htmlFor="terminal-shell">
              <Input
                key={terminalShell}
                id="terminal-shell"
                defaultValue={terminalShell}
                onBlur={(event) => {
                  const value = event.currentTarget.value.trim();
                  event.currentTarget.value = value;
                  updateSetting("terminalShell", value);
                }}
                placeholder="/bin/zsh or zsh"
                spellCheck={false}
              />
            </SettingField>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="use-worktree"
              checked={useWorktree}
              onCheckedChange={(checked) => {
                updateSetting("useWorktree", checked);
              }}
            />
            <label htmlFor="use-worktree" className="text-sm font-medium text-foreground">
              Start new sessions in a worktree
            </label>
          </div>
          <Separator />
          <ProviderSettings />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
