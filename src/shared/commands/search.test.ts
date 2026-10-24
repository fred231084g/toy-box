import { describe, expect, test } from "bun:test";
import { matchSearchable, searchCommands, type Searchable } from "./search";

const item = (title: string, extra: Partial<Searchable> = {}): Searchable => ({
  id: title,
  title,
  ...extra,
});
const titles = (matches: { item: Searchable }[]) => matches.map(({ item }) => item.title);

describe("matching", () => {
  test("ranks the title's start, then a word in it, its initials, then anywhere in it", () => {
    const start = matchSearchable(item("Session list"), "se")!;
    const word = matchSearchable(item("New session"), "se")!;
    const initials = matchSearchable(item("New session"), "ns")!;
    const substring = matchSearchable(item("Browse files"), "ow")!;

    expect(start.score).toBeGreaterThan(word.score);
    expect(word.score).toBeGreaterThan(initials.score);
    expect(initials.score).toBeGreaterThan(substring.score);
  });

  test("highlights the spans of the title that matched", () => {
    expect(matchSearchable(item("New session"), "ses")!.titleRanges).toEqual([[4, 7]]);
    expect(matchSearchable(item("New session"), "ns")!.titleRanges).toEqual([
      [0, 1],
      [4, 5],
    ]);
    expect(matchSearchable(item("Fix login redirect"), "login fix")!.titleRanges).toEqual([
      [0, 3],
      [4, 9],
    ]);
  });

  test("requires every term, in any order, from the title or detail", () => {
    const session = item("Fix login redirect", { detail: "toy-box" });

    expect(matchSearchable(session, "redirect toy")).toBeDefined();
    expect(matchSearchable(session, "box fix")).toBeDefined();
    expect(matchSearchable(session, "fix the flaky login test")).toBeUndefined();
  });

  test("initials match only consecutive words, so a word can't match a long title's scattered initials", () => {
    expect(matchSearchable(item("Open new session"), "ns")?.titleRanges).toEqual([
      [5, 6],
      [9, 10],
    ]);
    expect(matchSearchable(item("Need you to look at the session"), "ns")).toBeUndefined();
  });

  test("a single character matches only at a word's start", () => {
    expect(matchSearchable(item("Toggle terminal"), "t")).toBeDefined();
    expect(matchSearchable(item("Open inbox"), "x")).toBeUndefined();
  });

  test("prefers the title over the detail", () => {
    const byTitle = matchSearchable(item("Toy box"), "toy")!;
    const byDetail = matchSearchable(item("Fix build", { detail: "toy-box" }), "toy")!;

    expect(byTitle.score).toBeGreaterThan(byDetail.score);
    expect(byDetail.titleRanges).toEqual([]);
  });
});

describe("searching", () => {
  test("while browsing, keeps the given order", () => {
    const items = [item("B"), item("A"), item("C")];

    expect(titles(searchCommands(items, " "))).toEqual(["B", "A", "C"]);
  });

  test("orders groups by their best match, and matches within them by score", () => {
    const items = [
      item("Browse sessions", { group: "Go to" }),
      item("Settings", { group: "Workspace" }),
      item("Fix session restore", { group: "Sessions" }),
      item("Session list polish", { group: "Sessions" }),
    ];

    expect(titles(searchCommands(items, "sess"))).toEqual([
      "Session list polish",
      "Fix session restore",
      "Browse sessions",
    ]);
  });

  test("a boost lifts an item above an equal match", () => {
    const items = [item("Open inbox"), item("Open settings")];

    expect(titles(searchCommands(items, "open"))).toEqual(["Open inbox", "Open settings"]);
    expect(
      titles(searchCommands(items, "open", ({ title }) => (title === "Open settings" ? 10 : 0))),
    ).toEqual(["Open settings", "Open inbox"]);
  });

  test("an exact title outranks a boosted match of the same word", () => {
    const items = [item("Open inbox"), item("Inbox")];
    const boostCommand = ({ title }: Searchable) => (title === "Open inbox" ? 25 : 0);

    expect(titles(searchCommands(items, "inbox", boostCommand))).toEqual(["Inbox", "Open inbox"]);
  });
});
