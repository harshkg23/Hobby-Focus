import type { LearningPlan, ProgressMap, TechniqueStatus } from "@/lib/types/learning";

const WEIGHT: Record<TechniqueStatus, number> = {
  active: 0,
  revisit: 0.35,
  skipped: 0.5,
  complete: 1,
};

export function computePlanProgressPercent(
  plan: LearningPlan | null,
  progress: ProgressMap
): number {
  if (!plan?.techniques.length) return 0;
  let sum = 0;
  for (const t of plan.techniques) {
    const entry = progress[t.id];
    const status = entry?.status ?? "active";
    sum += WEIGHT[status] ?? 0;
  }
  return Math.round((sum / plan.techniques.length) * 100);
}

export function countCompleted(progress: ProgressMap): number {
  return Object.values(progress).filter((p) => p.status === "complete").length;
}
