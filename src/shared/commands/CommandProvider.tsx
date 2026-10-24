import { createContext, use, type ReactNode } from "react";
import { useHotkeys } from "@tanstack/react-hotkeys";
import { executeCommand, type Command } from "./command";

// A feature defines its commands beside the state they act on, and the component that owns that
// state provides them. Its descendants (buttons, menus, the palette) render and run them by
// reference, or by ID for one defined elsewhere, during render and so in the server's markup too.

const CommandsContext = createContext<readonly Command[]>([]);

/** Provides commands to its descendants, and binds their shortcuts while it's mounted. */
export function CommandProvider({
  commands,
  children,
}: {
  commands: readonly Command[];
  children: ReactNode;
}) {
  useHotkeys(
    commands.flatMap((command) =>
      command.shortcut
        ? [
            {
              hotkey: command.shortcut,
              callback: () => void executeCommand(command),
              options: { enabled: !command.disabled },
            },
          ]
        : [],
    ),
    { requireReset: true },
  );

  return <CommandsContext value={commands}>{children}</CommandsContext>;
}

/** The commands in scope. */
export const useCommands = () => use(CommandsContext);

/** A command by reference or, for one defined elsewhere, by its ID among the commands in scope. */
export function useCommand(reference: Command | string) {
  const commands = use(CommandsContext);
  return typeof reference === "string" ? commands.find(({ id }) => id === reference) : reference;
}
