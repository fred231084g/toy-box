import type { Hotkey } from "@tanstack/react-hotkeys";
import type { LucideIcon } from "lucide-react";

/** An executable operation, independent of the button, menu, shortcut or palette row that invokes it. */
export interface Command {
  id: string;
  title: string;
  group?: string;
  /** Secondary text that identifies the subject (e.g. a session's repository), also searched. */
  detail?: string;
  icon?: LucideIcon;
  shortcut?: Hotkey;
  /** A toggle's current state. */
  checked?: boolean;
  disabled?: boolean;
  /** Irreversible or data-losing (e.g. delete), which surfaces tint as a warning. */
  destructive?: boolean;
  /**
   * Further operations on the same subject (e.g. pin, rename or delete a session). An action bound
   * to {@link ALTERNATE_SHORTCUT} is the command's alternate: what modifier-clicking it does.
   */
  actions?: readonly Command[];
  run: () => unknown;
}

/** Runs a command's alternate from the palette, as modifier-clicking does from a button. */
export const ALTERNATE_SHORTCUT: Hotkey = "Mod+Enter";

export function getAlternateAction<T extends Pick<Command, "shortcut">>(command: {
  actions?: readonly T[];
}): T | undefined {
  return command.actions?.find((action) => action.shortcut === ALTERNATE_SHORTCUT);
}

/**
 * Runs a command unless it's disabled, and reports whether it succeeded. Every button, menu item,
 * shortcut and palette row shares this boundary, so failures surface one way.
 */
export async function executeCommand(command: Command) {
  if (command.disabled) return false;

  try {
    await command.run();
    return true;
  } catch (error) {
    console.error(`Failed to run command ${command.id}:`, error);
    return false;
  }
}
