// How often and how recently each command ran, so the palette can rank what someone reaches for
// first. Use decays by half every week, so a habit fades rather than ranking forever.

const STORAGE_KEY = "toy-box:command-usage";
const HALF_LIFE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 200;

export type CommandUsage = Readonly<Record<string, { score: number; usedAt: number }>>;

/** A command's use as of `now`: each run counts one, halving every half-life since. */
export function scoreUsage(usage: CommandUsage, id: string, now: number): number {
  const entry = usage[id];
  return entry ? entry.score * 0.5 ** (Math.max(0, now - entry.usedAt) / HALF_LIFE_MS) : 0;
}

/** The usage after a command runs, keeping it and the other most used entries. */
export function recordUsage(usage: CommandUsage, id: string, now: number): CommandUsage {
  const entry = { score: scoreUsage(usage, id, now) + 1, usedAt: now };
  const others = Object.keys(usage).filter((key) => key !== id);
  if (others.length < MAX_ENTRIES) return { ...usage, [id]: entry };

  const kept = others
    .sort((left, right) => scoreUsage(usage, right, now) - scoreUsage(usage, left, now))
    .slice(0, MAX_ENTRIES - 1);
  return Object.fromEntries([[id, entry], ...kept.map((key) => [key, usage[key]])]);
}

/** Use mapped to [0, 1): no use is 0, one fresh run is ½, and it approaches 1 with repeated use. */
export function usageWeight(usage: CommandUsage, id: string, now: number): number {
  const score = scoreUsage(usage, id, now);
  return score / (score + 1);
}

export function readCommandUsage(): CommandUsage {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as CommandUsage;
  } catch {
    return {};
  }
}

export function recordCommandUsage(id: string) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(recordUsage(readCommandUsage(), id, Date.now())),
    );
  } catch {
    // Ranking is a nicety; storage that's full or unavailable shouldn't fail the command.
  }
}
