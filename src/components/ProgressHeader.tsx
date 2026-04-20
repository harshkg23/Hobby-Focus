"use client";

import type { LearningPlan, ProgressMap } from "@/lib/types/learning";
import { computePlanProgressPercent, countCompleted } from "@/utils/progress";

export function ProgressHeader({
  plan,
  progress,
}: {
  plan: LearningPlan;
  progress: ProgressMap;
}) {
  const pct = computePlanProgressPercent(plan, progress);
  const done = countCompleted(progress);
  const total = plan.techniques.length;

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
    </div>
  );
}
