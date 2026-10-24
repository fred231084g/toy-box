import type { Command } from "./command";

/** What search reads from a command, or from anything listed beside commands (e.g. a palette page). */
export type Searchable = Pick<Command, "id" | "title" | "group" | "detail">;

/** A half-open `[start, end)` span of a title. */
export type TextRange = readonly [start: number, end: number];

export type SearchMatch<T extends Searchable = Command> = {
  item: T;
  score: number;
  /** The spans of the title that the query matched, for highlighting. */
  titleRanges: readonly TextRange[];
};

// Search reads only what a row shows. A term scores by the most prominent place it occurs: the
// title's start, then a word in the title, the title's initials ("ns" for "New session"), anywhere
// in the title, then the detail. A single character matches only at a word's start, so it can't
// match nearly every row.
const SCORE = {
  titleStart: 100,
  titleWord: 80,
  titleInitials: 60,
  titleSubstring: 50,
  detailWord: 30,
  detailSubstring: 15,
  exactTitle: 50,
} as const;

/**
 * Scores an item against a query, where every whitespace-separated term must occur in its title
 * or detail. Returns nothing when a term is missing, so a long prompt matches only what it really
 * names.
 */
export function matchSearchable(
  item: Searchable,
  query: string,
): Omit<SearchMatch<Searchable>, "item"> | undefined {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return { score: 0, titleRanges: [] };

  const title = item.title.toLowerCase();
  const detail = item.detail?.toLowerCase();
  const ranges: TextRange[] = [];
  let score = 0;

  for (const term of terms) {
    const titleMatch = matchTitle(title, term);
    if (titleMatch) {
      score += titleMatch.score;
      ranges.push(...titleMatch.ranges);
      continue;
    }

    const detailScore = detail ? scoreDetail(detail, term) : 0;
    if (detailScore <= 0) return undefined;
    score += detailScore;
  }

  if (title === query.trim().toLowerCase()) score += SCORE.exactTitle;
  // Between otherwise equal matches, the shorter title is the closer one.
  score -= Math.min(title.length, 100) / 100;

  return { score, titleRanges: mergeRanges(ranges) };
}

/**
 * The items that match a query, best first: grouped (by `group`, the groups ordered by their best
 * match) so a list reads as sections. While browsing (an empty query), the items keep their order.
 * `boost` adds to a match's score, e.g. for frequent use.
 */
export function searchCommands<T extends Searchable>(
  items: readonly T[],
  query: string,
  boost?: (item: T) => number,
): SearchMatch<T>[] {
  if (!query.trim()) {
    return items.map((item) => ({ item, score: 0, titleRanges: [] }));
  }

  const matches = items.flatMap((item) => {
    const match = matchSearchable(item, query);
    return match ? [{ item, ...match, score: match.score + (boost?.(item) ?? 0) }] : [];
  });

  const groupScores = new Map<string | undefined, number>();
  for (const { item, score } of matches) {
    groupScores.set(item.group, Math.max(groupScores.get(item.group) ?? -Infinity, score));
  }

  return matches.sort(
    (left, right) =>
      groupScores.get(right.item.group)! - groupScores.get(left.item.group)! ||
      (left.item.group ?? "").localeCompare(right.item.group ?? "") ||
      right.score - left.score,
  );
}

function matchTitle(
  title: string,
  term: string,
): { score: number; ranges: TextRange[] } | undefined {
  const wordStart = findWordStart(title, term);
  if (wordStart !== undefined) {
    return {
      score: wordStart === 0 ? SCORE.titleStart : SCORE.titleWord,
      ranges: [[wordStart, wordStart + term.length]],
    };
  }
  if (term.length < 2) return undefined;

  const initials = matchInitials(title, term);
  if (initials) return { score: SCORE.titleInitials, ranges: initials };

  const index = title.indexOf(term);
  return index < 0
    ? undefined
    : { score: SCORE.titleSubstring, ranges: [[index, index + term.length]] };
}

function scoreDetail(detail: string, term: string) {
  if (findWordStart(detail, term) !== undefined) return SCORE.detailWord;
  return term.length > 1 && detail.includes(term) ? SCORE.detailSubstring : 0;
}

function findWordStart(text: string, term: string): number | undefined {
  for (let index = text.indexOf(term); index >= 0; index = text.indexOf(term, index + 1)) {
    if (isWordStart(text, index)) return index;
  }
  return undefined;
}

function isWordStart(text: string, index: number) {
  return index === 0 || !/[\p{L}\p{N}]/u.test(text[index - 1]);
}

/**
 * Matches each character of a term to the start of consecutive words ("ns" for "New session").
 * Requiring them to be adjacent keeps a word from matching the scattered initials of a long title.
 */
function matchInitials(text: string, term: string): TextRange[] | undefined {
  const starts = Array.from(text.matchAll(/[\p{L}\p{N}]+/gu), ({ index }) => index);
  for (let first = 0; first + term.length <= starts.length; first++) {
    const words = starts.slice(first, first + term.length);
    if (words.every((start, offset) => text[start] === term[offset])) {
      return words.map((start) => [start, start + 1]);
    }
  }
  return undefined;
}

function mergeRanges(ranges: readonly TextRange[]): TextRange[] {
  const merged: [number, number][] = [];
  for (const [start, end] of [...ranges].sort((left, right) => left[0] - right[0])) {
    const last = merged.at(-1);
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}
