import type { Session } from "./index";

/** How a session is named where it's listed: by its title, or else by what kind of draft it is. */
export function getSessionLabel(session: Session): string {
  if (session.title) return session.title;
  if (session.provider) return "New session";
  if (session.artifactPath) {
    return session.artifactPath.toLowerCase().endsWith(".md") ? "New document" : "New whiteboard";
  }
  return "Draft session";
}
