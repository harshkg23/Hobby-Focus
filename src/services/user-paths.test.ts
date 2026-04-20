import { describe, expect, it } from "vitest";
import type { SavedLearningPath } from "@/lib/types/learning";
import { normalizeActivePathId, normalizeIncomingPaths } from "@/services/user-paths";

const samplePath: SavedLearningPath = {
  pathId: "p1",
  plan: {
    planId: "p1",
    hobby: "Chess",
    level: "beginner",
    goal: null,
    focusLine: "Focus line",
    createdAt: new Date().toISOString(),
    techniques: [
      {
        id: "t1",
        title: "Tactic",
        summary: "Summary",
        cardHint: "Hint",
        youtubeQueryTerms: ["chess tactic"],
        order: 1,
      },
    ],
  },
  progress: {
    t1: { status: "active", updatedAt: new Date().toISOString() },
  },
};

describe("normalizeIncomingPaths", () => {
  it("returns only valid SavedLearningPath objects", () => {
    const result = normalizeIncomingPaths([samplePath, null, { foo: "bar" }]);
    expect(result).toHaveLength(1);
    expect(result[0].pathId).toBe("p1");
  });

  it("returns empty array for non-array input", () => {
    expect(normalizeIncomingPaths({})).toEqual([]);
  });
});

describe("normalizeActivePathId", () => {
  it("keeps valid activePathId", () => {
    expect(normalizeActivePathId([samplePath], "p1")).toBe("p1");
  });

  it("falls back to first path when activePathId invalid", () => {
    expect(normalizeActivePathId([samplePath], "missing")).toBe("p1");
  });

  it("returns null when no paths exist", () => {
    expect(normalizeActivePathId([], "anything")).toBeNull();
  });
});
