"use client";

import type { LearningPlan, ProgressMap } from "@/lib/types/learning";
import { computePlanProgressPercent, countCompleted } from "@/utils/progress";
import { currentStreakDays, weeklyConsistency } from "@/utils/consistency";

type SaveState = "idle" | "saving" | "saved" | "error";

export function ProgressHeader({
  plan,
  progress,
  saveState = "idle",
  onRetrySave,
}: {
  plan: LearningPlan;
  progress: ProgressMap;
  saveState?: SaveState;
  onRetrySave?: () => void;
}) {
  const pct = computePlanProgressPercent(plan, progress);
  const done = countCompleted(progress);
  const total = plan.techniques.length;
  const consistency = weeklyConsistency(progress);
  const streak = currentStreakDays(progress);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-5 shadow-xl backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-xl font-semibold tracking-tight text-white">{plan.hobby}</p>
          <p className="mt-1 text-sm text-white/60">
            <span className="capitalize">{plan.level}</span>
            {plan.goal ? (
              <>
                {" "}
                · <span className="text-balance">{plan.goal}</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="relative grid h-16 w-16 place-items-center rounded-full text-sm font-semibold text-[#99f6e4]"
            style={{
              background: `conic-gradient(#2dd4bf ${pct * 3.6}deg, rgba(255,255,255,0.12) 0deg)`,
            }}
            aria-label={`Overall progress ${pct} percent`}
          >
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#12141a] text-xs font-semibold text-white shadow-inner ring-1 ring-white/10">
              {pct}%
            </span>
          </div>
          <div className="text-right text-sm">
            <div className="font-medium text-white">
              {done}/{total} done
            </div>
            <div className="text-white/50">Steady beats scattered.</div>
          </div>
        </div>
      </div>
      <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-relaxed text-white/65">
        {plan.focusLine}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/75">
            Consistency: {consistency}/7 days
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/75">
            Streak: {streak} day{streak === 1 ? "" : "s"}
          </span>
        </div>
        <div className="text-xs text-white/65" aria-live="polite">
          {saveState === "saving" ? "Saving progress..." : null}
          {saveState === "saved" ? "Saved" : null}
          {saveState === "idle" ? null : null}
          {saveState === "error" ? (
            <span className="inline-flex items-center gap-2">
              Save failed
              {onRetrySave ? (
                <button
                  type="button"
                  onClick={onRetrySave}
                  className="rounded-full border border-white/25 px-2 py-0.5 text-white/80 hover:bg-white/10"
                >
                  Retry
                </button>
              ) : null}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
