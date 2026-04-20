import { describe, expect, it } from "vitest";
import type { ProgressMap } from "@/lib/types/learning";
import { currentStreakDays, weeklyConsistency } from "@/utils/consistency";

function progressFromDates(dates: string[]): ProgressMap {
  const map: ProgressMap = {};
  dates.forEach((d, i) => {
    map[`t${i + 1}`] = { status: "complete", updatedAt: d };
  });
  return map;
}

describe("weeklyConsistency", () => {
  it("counts unique active days in last 7 days", () => {
    const now = new Date("2026-04-20T10:00:00.000Z");
    const progress = progressFromDates([
      "2026-04-20T08:00:00.000Z",
      "2026-04-20T09:00:00.000Z",
      "2026-04-18T12:00:00.000Z",
      "2026-04-14T12:00:00.000Z",
      "2026-04-10T12:00:00.000Z",
    ]);
    expect(weeklyConsistency(progress, now)).toBe(3);
  });
});

describe("currentStreakDays", () => {
  it("returns consecutive streak ending today", () => {
    const now = new Date("2026-04-20T10:00:00.000Z");
    const progress = progressFromDates([
      "2026-04-20T08:00:00.000Z",
      "2026-04-19T12:00:00.000Z",
      "2026-04-18T12:00:00.000Z",
    ]);
    expect(currentStreakDays(progress, now)).toBe(3);
  });

  it("returns 0 when no update today", () => {
    const now = new Date("2026-04-20T10:00:00.000Z");
    const progress = progressFromDates(["2026-04-19T12:00:00.000Z"]);
    expect(currentStreakDays(progress, now)).toBe(0);
  });
});
