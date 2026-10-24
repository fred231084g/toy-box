import type { ComponentProps, MouseEvent } from "react";
import { Button } from "@/shared/ui/button";
import { executeCommand, getAlternateAction, type Command } from "./command";
import { useCommand } from "./CommandProvider";

/** Runs a command, or its alternate when modifier-clicked, as the palette's ⌘↵ does. */
export function runCommandFromClick(command: Command, event: MouseEvent) {
  const alternate = event.metaKey || event.ctrlKey ? getAlternateAction(command) : undefined;
  void executeCommand(alternate ?? command);
}

/**
 * An icon button for a command, by reference or by id. The command supplies its label and
 * availability; `children` replace its icon (e.g. with a live status).
 */
export function CommandButton({
  command: reference,
  children,
  ...props
}: {
  command: Command | string;
} & Omit<ComponentProps<typeof Button>, "onClick" | "disabled" | "title" | "aria-label">) {
  const command = useCommand(reference);
  if (!command) return null;
  const Icon = command.icon;

  return (
    <Button
      type="button"
      {...props}
      aria-label={command.title}
      disabled={command.disabled}
      onClick={(event) => runCommandFromClick(command, event)}
    >
      {children ?? (Icon && <Icon />)}
    </Button>
  );
}
