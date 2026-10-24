import type { ReactNode } from "react";
import {
  AppWindow,
  Clock3,
  File,
  FileText,
  Folder,
  FolderGit2,
  Hash,
  MessageSquare,
  Plus,
  Shapes,
} from "lucide-react";
import { ALTERNATE_SHORTCUT, type Command } from "@/shared/commands/command";
import { SidebarStatusMark, type SidebarStatus } from "@/shared/sidebar/SidebarStatus";
import { RelativeTime } from "@/shared/ui/relative-time";
import { APP_ICONS } from "@apps/components/runtime/icons";
import type { AppDefinition, AppInstance } from "@apps/model";
import type { Automation } from "@automations/model";
import { channelHasUnread, type Channel } from "@channels/model";
import { getPathBasename, getPathDirname, toRelativePath } from "@files/model/paths";
import { modelCatalogKey, type ModelConfiguration, type ModelInfo } from "@providers/model";
import { createSessionActions } from "@sessions/commands";
import { resolveSessionLocation } from "@sessions/components/location/locationDisplay";
import { SessionPreviewPane } from "@sessions/components/SessionPreview";
import { RunningTime } from "@sessions/components/sidebar/SessionListItem";
import type { Session } from "@sessions/model";
import { getSessionLabel } from "@sessions/model/label";
import type { RecentDirectory } from "@sessions/model/recentDirectories";
import type { WorkspaceSessionState } from "@workspace/model/state/reducer";
import type { PaletteItem } from "./palette";

// How each kind of thing in the workspace reads as a palette row: what it's called, what
// identifies it, its live status, and what Enter, Mod+Enter and its actions do to it.

/** Where the palette opens what's chosen, as the sidebar would. */
export type PaletteNavigation = {
  openSession: (sessionId: string) => void;
  /** Opens a session beside the workspace's other panes. */
  addSession: (sessionId: string) => void;
  openChannel: (channelId: string) => void;
  openApp: (appId: string) => void;
  /** Opens an app beside the workspace's other panes. */
  addApp: (appId: string) => void;
  openFile: (path: string) => void;
};

/** Only a desktop's grid has room to add a pane beside the others. */
export const addToWorkspace = (canAdd: boolean, add: Command["run"]): PaletteItem[] =>
  canAdd
    ? [
        {
          id: "workspace.add",
          title: "Add to workspace",
          icon: Plus,
          shortcut: ALTERNATE_SHORTCUT,
          run: add,
        },
      ]
    : [];

export function sessionItem(
  session: Session,
  {
    state,
    isOpen,
    pin,
    navigation,
    canAdd,
  }: {
    state?: WorkspaceSessionState;
    isOpen: boolean;
    pin: { isPinned: boolean; toggle: () => void };
    navigation: PaletteNavigation;
    canAdd: boolean;
  },
): PaletteItem {
  const { directory, repository, gitRoot } = session.context ?? {};
  return {
    id: `session:${session.id}`,
    title: getSessionLabel(session),
    group: "Sessions",
    detail: resolveSessionLocation({ repository, gitRoot, cwd: directory })?.label,
    icon: session.artifactPath
      ? session.artifactPath.toLowerCase().endsWith(".md")
        ? FileText
        : Shapes
      : MessageSquare,
    accessory: <SessionAccessory state={state} isOpen={isOpen} updatedAt={session.updatedAt} />,
    preview: () => <SessionPreviewPane sessionId={session.id} />,
    actions: [
      ...addToWorkspace(canAdd, () => navigation.addSession(session.id)),
      ...createSessionActions(session, pin),
    ],
    verb: "Open",
    run: () => navigation.openSession(session.id),
  };
}

/** What a session is doing, or else when it was last active. */
function SessionAccessory({
  state,
  isOpen,
  updatedAt,
}: {
  state?: WorkspaceSessionState;
  isOpen: boolean;
  updatedAt: Date;
}) {
  if (state?.status === "waiting") return <Status kind="waiting">Waiting for you</Status>;
  if (state?.status === "running") {
    return (
      <Status kind="running">
        <RunningTime since={state.since} />
      </Status>
    );
  }
  if (state?.status === "background") return <Status kind="background">Background tasks</Status>;

  const updated = <RelativeTime date={updatedAt} />;
  return state?.status === "unread" && !isOpen ? <Status kind="unread">{updated}</Status> : updated;
}

function Status({ kind, children }: { kind: SidebarStatus["kind"]; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex size-4 items-center justify-center">
        <SidebarStatusMark kind={kind} />
      </span>
      {children}
    </span>
  );
}

export function channelItem(channel: Channel, navigation: PaletteNavigation): PaletteItem {
  return {
    id: `channel:${channel.id}`,
    title: channel.name,
    group: "Channels",
    icon: Hash,
    accessory: channelHasUnread(channel) ? <SidebarStatusMark kind="unread" /> : undefined,
    verb: "Open",
    run: () => navigation.openChannel(channel.id),
  };
}

export function appItem(
  app: AppInstance,
  definition: AppDefinition | undefined,
  { navigation, canAdd }: { navigation: PaletteNavigation; canAdd: boolean },
): PaletteItem {
  return {
    id: `app:${app.id}`,
    title: app.title,
    group: "Apps",
    detail: definition && definition.title !== app.title ? definition.title : undefined,
    icon: (definition?.icon && APP_ICONS[definition.icon]) || AppWindow,
    actions: addToWorkspace(canAdd, () => navigation.addApp(app.id)),
    verb: "Open",
    run: () => navigation.openApp(app.id),
  };
}

export function automationItem(automation: Automation, navigation: PaletteNavigation): PaletteItem {
  return {
    id: `automation:${automation.id}`,
    title: automation.title,
    group: "Automations",
    detail: automation.cwd ? resolveSessionLocation({ cwd: automation.cwd })?.label : undefined,
    icon: Clock3,
    accessory: (
      <span>
        Runs <RelativeTime date={automation.nextRunAt} />
      </span>
    ),
    verb: "Open",
    run: () => navigation.openSession(automation.id),
  };
}

/** A file found beneath `directory`, by its path relative to it. */
export function fileItem(
  directory: string,
  path: string,
  navigation: PaletteNavigation,
): PaletteItem {
  const dirname = getPathDirname(path);
  return {
    id: `file:${path}`,
    title: getPathBasename(path),
    detail: dirname === "." ? undefined : dirname,
    icon: File,
    verb: "Open",
    run: () => navigation.openFile(`${directory.replace(/[\\/]+$/, "")}/${path}`),
  };
}

export function modelItem(
  model: ModelInfo,
  { selected, configuration }: { selected: boolean; configuration: ModelConfiguration },
): PaletteItem {
  return {
    id: `model:${modelCatalogKey(model)}`,
    title: model.name,
    group: model.providerName ?? model.provider,
    checked: selected,
    choose: { model: configuration },
    verb: "Choose",
  };
}

export function directoryItem(directory: RecentDirectory, selected: boolean): PaletteItem {
  const location = resolveSessionLocation(directory);
  return {
    id: `directory:${directory.cwd}`,
    title: location?.label ?? directory.cwd,
    detail: toRelativePath(directory.cwd),
    icon: location?.kind === "repository" ? FolderGit2 : Folder,
    checked: selected,
    choose: { directory: directory.cwd },
    verb: "Choose",
  };
}
