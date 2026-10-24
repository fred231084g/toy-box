import { AutomationDialog } from "@automations/components/AutomationDialog";
import { ChannelDialog } from "@channels/components/ChannelDialog";
import { FileBrowserDialog } from "@files/components/browser/FileBrowserDialog";
import { ScreenBrowserDialog } from "@screens/client/ScreenBrowserDialog";
import { sessionMutations } from "@sessions/mutations";
import { DestructiveConfirmationDialog } from "@/shared/sidebar/DestructiveConfirmationDialog";
import { NameDialog } from "@/shared/sidebar/NameDialog";
import { closeWorkspaceDialog, useWorkspaceDialog } from "../hooks/dialogs";
import { SettingsDialog } from "./sidebar/SettingsDialog";

/** Renders whichever workspace dialog a command opened. */
export function WorkspaceDialogs({
  onOpenFile,
  onOpenScreen,
  onChannelOpen,
  onSessionDelete,
}: {
  onOpenFile: (path: string) => void;
  onOpenScreen: (screenId: string) => Promise<void>;
  onChannelOpen: (channelId: string) => void;
  onSessionDelete: (sessionId: string) => void;
}) {
  const dialog = useWorkspaceDialog();

  return (
    <>
      <SettingsDialog open={dialog?.kind === "settings"} onOpenChange={closeOnDismiss} />
      <FileBrowserDialog
        open={dialog?.kind === "files"}
        onOpenChange={closeOnDismiss}
        initialPath={dialog?.kind === "files" ? dialog.directory : undefined}
        title="Open a file"
        onOpenFile={onOpenFile}
      />
      <ScreenBrowserDialog
        open={dialog?.kind === "screens"}
        onOpenChange={closeOnDismiss}
        onOpenScreen={onOpenScreen}
      />

      {dialog?.kind === "automation" && <AutomationDialog onOpenChange={closeOnDismiss} />}
      {dialog?.kind === "channel" && (
        <ChannelDialog onOpenChange={closeOnDismiss} onCreated={onChannelOpen} />
      )}
      {dialog?.kind === "rename-session" && (
        <NameDialog
          key={dialog.sessionId}
          name={dialog.name}
          title="Rename session"
          description="Change how this session appears in the session list."
          mutation={sessionMutations.renameSession(dialog.sessionId)}
          onOpenChange={closeOnDismiss}
        />
      )}
      {dialog?.kind === "delete-session" && (
        <DestructiveConfirmationDialog
          key={dialog.sessionId}
          title="Delete session?"
          description="This will permanently delete this session, its child sessions, and all their messages. This action cannot be undone."
          mutation={sessionMutations.deleteSession(dialog.sessionId)}
          onSubmit={() => onSessionDelete(dialog.sessionId)}
          onOpenChange={closeOnDismiss}
        />
      )}
    </>
  );
}

function closeOnDismiss(open: boolean) {
  if (!open) closeWorkspaceDialog();
}
