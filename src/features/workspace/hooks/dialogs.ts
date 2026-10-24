import { createAtom, useSelector } from "@tanstack/react-store";

// The workspace's modal dialogs, which any command can open (from a button, menu, shortcut or the
// palette) without threading state to wherever the dialog renders. One shows at a time.

export type WorkspaceDialog =
  | { kind: "settings" }
  | { kind: "files"; directory?: string }
  | { kind: "screens" }
  | { kind: "automation" }
  | { kind: "channel" }
  | { kind: "rename-session"; sessionId: string; name: string }
  | { kind: "delete-session"; sessionId: string };

const dialogAtom = createAtom<WorkspaceDialog | null>(null);

export const openWorkspaceDialog = (dialog: WorkspaceDialog) => dialogAtom.set(dialog);
export const closeWorkspaceDialog = () => dialogAtom.set(null);
export const useWorkspaceDialog = () => useSelector(dialogAtom);
