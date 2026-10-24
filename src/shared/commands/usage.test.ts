import { describe, expect, test } from "bun:test";
import { recordUsage, scoreUsage, usageWeight, type CommandUsage } from "./usage";

const WEEK = 7 * 24 * 60 * 60 * 1000;

describe("command usage", () => {
  test("each run adds one, which halves every week", () => {
    let usage: CommandUsage = {};
    usage = recordUsage(usage, "open", 0);
    usage = recordUsage(usage, "open", 0);

    expect(scoreUsage(usage, "open", 0)).toBe(2);
    expect(scoreUsage(usage, "open", WEEK)).toBe(1);
    expect(scoreUsage(usage, "missing", 0)).toBe(0);
  });

  test("weighs more use higher, but below 1 however much", () => {
    const once = recordUsage({}, "open", 0);
    const twice = recordUsage(once, "open", 0);

    expect(usageWeight({}, "open", 0)).toBe(0);
    expect(usageWeight(once, "open", 0)).toBeGreaterThan(0);
    expect(usageWeight(twice, "open", 0)).toBeGreaterThan(usageWeight(once, "open", 0));
    expect(usageWeight({ open: { score: 1e6, usedAt: 0 } }, "open", 0)).toBeLessThan(1);
  });

  test("keeps only the most used entries", () => {
    let usage: CommandUsage = {};
    for (let index = 0; index < 200; index++) usage = recordUsage(usage, `command-${index}`, 0);
    usage = recordUsage(usage, "command-199", 0);
    usage = recordUsage(usage, "newest", 0);

    expect(Object.keys(usage)).toHaveLength(200);
    expect(usage["command-199"]).toBeDefined();
    expect(usage.newest).toBeDefined();
  });
});
