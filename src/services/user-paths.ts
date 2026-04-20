import type { SavedLearningPath } from "@/lib/types/learning";

export function normalizeIncomingPaths(value: unknown): SavedLearningPath[] {
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is SavedLearningPath => {
    if (!x || typeof x !== "object") return false;
    const p = x as Partial<SavedLearningPath>;
    return (
      typeof p.pathId === "string" &&
      !!p.plan &&
      typeof p.plan === "object" &&
      !!p.progress &&
      typeof p.progress === "object"
    );
  });
}

export function normalizeActivePathId(
  paths: SavedLearningPath[],
  activePathIdRaw: unknown
): string | null {
  const candidate = typeof activePathIdRaw === "string" ? activePathIdRaw : null;
  if (candidate && paths.some((p) => p.pathId === candidate)) return candidate;
  return paths[0]?.pathId ?? null;
}
