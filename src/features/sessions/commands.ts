import { FolderOpen, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import type { Command } from "@/shared/commands/command";
import { openWorkspaceDialog } from "@workspace/hooks/dialogs";
import type { Session } from "./model";

/**
 * What can be done to a session wherever it's listed (its sidebar menu, or its row in the command
 * palette). Pinning is offered only where the caller can pin it, e.g. not to a child session.
 */
export function createSessionActions(
  session: Session,
  pin?: { isPinned: boolean; toggle: () => void },
): Command[] {
  const isDraft = !session.provider;
  const directory = session.context?.directory;

  return [
    ...(pin
      ? [
          {
            id: "session.pin",
            title: pin.isPinned ? "Unpin session" : "Pin session",
            icon: pin.isPinned ? PinOff : Pin,
            disabled: isDraft,
            run: pin.toggle,
          },
        ]
      : []),
    {
      id: "session.rename",
      title: "Rename session",
      icon: Pencil,
      disabled: isDraft,
      run: () =>
        openWorkspaceDialog({
          kind: "rename-session",
          sessionId: session.id,
          name: session.title ?? "",
        }),
    },
    ...(directory
      ? [
          {
            id: "session.browseFiles",
            title: "Browse files",
            icon: FolderOpen,
            run: () => openWorkspaceDialog({ kind: "files", directory }),
          },
        ]
      : []),
    {
      id: "session.delete",
      title: "Delete session",
      icon: Trash2,
      destructive: true,
      run: () => openWorkspaceDialog({ kind: "delete-session", sessionId: session.id }),
    },
  ];
}
