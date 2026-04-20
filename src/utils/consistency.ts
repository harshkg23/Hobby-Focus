import type { ProgressMap } from "@/lib/types/learning";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dateKey(d: Date): string {
  return startOfDay(d).toISOString().slice(0, 10);
}

/**
 * Returns how many of the last 7 days had at least one progress update.
 */
export function weeklyConsistency(progress: ProgressMap, now: Date = new Date()): number {
  const keys = new Set<string>();
  const nowDay = startOfDay(now).getTime();
  const windowStart = nowDay - 6 * 24 * 60 * 60 * 1000;

  for (const p of Object.values(progress)) {
    const t = new Date(p.updatedAt).getTime();
    if (Number.isNaN(t)) continue;
    if (t >= windowStart && t <= nowDay + 24 * 60 * 60 * 1000 - 1) {
      keys.add(dateKey(new Date(t)));
    }
  }
  return keys.size;
}

/**
 * Current-day streak counting backward from "today" for any recorded activity.
 */
export function currentStreakDays(progress: ProgressMap, now: Date = new Date()): number {
  const activeDays = new Set<string>();
  for (const p of Object.values(progress)) {
    const d = new Date(p.updatedAt);
    if (Number.isNaN(d.getTime())) continue;
    activeDays.add(dateKey(d));
  }

  let streak = 0;
  const cursor = startOfDay(now);
  while (activeDays.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
