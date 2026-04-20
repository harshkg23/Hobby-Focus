import { describe, expect, it } from "vitest";
import type { LearningPlan, ProgressMap } from "@/lib/types/learning";
import { computePlanProgressPercent, countCompleted } from "@/utils/progress";

function makePlan(n: number): LearningPlan {
  return {
    planId: "p1",
    hobby: "Chess",
    level: "beginner",
    goal: null,
    focusLine: "Focus",
    createdAt: new Date().toISOString(),
    techniques: Array.from({ length: n }, (_, i) => ({
      id: `t${i + 1}`,
      title: `T${i + 1}`,
      summary: "s",
      cardHint: "h",
      youtubeQueryTerms: ["q"],
      order: i + 1,
    })),
  };
}

describe("computePlanProgressPercent", () => {
  it("returns 0 for empty or null plan", () => {
    expect(computePlanProgressPercent(null, {})).toBe(0);
    expect(
      computePlanProgressPercent(
        { ...makePlan(1), techniques: [] },
        {}
      )
    ).toBe(0);
  });

  it("weights statuses toward completion", () => {
    const plan = makePlan(2);
    const progress: ProgressMap = {
      t1: { status: "complete", updatedAt: "" },
      t2: { status: "active", updatedAt: "" },
    };
    expect(computePlanProgressPercent(plan, progress)).toBe(50);
  });

  it("treats skipped as partial credit", () => {
    const plan = makePlan(2);
    const progress: ProgressMap = {
      t1: { status: "skipped", updatedAt: "" },
      t2: { status: "skipped", updatedAt: "" },
    };
    expect(computePlanProgressPercent(plan, progress)).toBe(50);
  });

  it("counts revisit between active and complete", () => {
    const plan = makePlan(1);
    const progress: ProgressMap = {
      t1: { status: "revisit", updatedAt: "" },
    };
    const pct = computePlanProgressPercent(plan, progress);
    expect(pct).toBeGreaterThan(0);
    expect(pct).toBeLessThan(100);
  });
});

describe("countCompleted", () => {
  it("counts only complete entries", () => {
    const progress: ProgressMap = {
      a: { status: "complete", updatedAt: "" },
      b: { status: "skipped", updatedAt: "" },
      c: { status: "complete", updatedAt: "" },
    };
    expect(countCompleted(progress)).toBe(2);
  });
});
