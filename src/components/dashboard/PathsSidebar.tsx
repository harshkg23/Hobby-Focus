"use client";

import type { SavedLearningPath } from "@/lib/types/learning";
import { computePlanProgressPercent } from "@/utils/progress";

export function PathsSidebar({
  paths,
  activePathId,
  loading = false,
  onSelect,
  onAddPath,
  onRemovePath,
}: {
  paths: SavedLearningPath[];
  activePathId: string | null;
  loading?: boolean;
  onSelect: (pathId: string) => void;
  onAddPath: () => void;
  onRemovePath: (pathId: string) => void;
}) {
  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-28 lg:w-72 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-white">My paths</h2>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-white/50">
          Saved on this device. Switch anytime or add another hobby—each path keeps its own progress.
        </p>

        <button
          type="button"
          onClick={onAddPath}
          className="mb-4 w-full rounded-full border border-white/20 bg-white py-2.5 text-sm font-semibold text-[#0c0e12] transition hover:bg-white/95"
        >
          + Add learning path
        </button>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : paths.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 bg-black/20 px-3 py-6 text-center text-sm text-white/45">
            No paths yet. Create one below to get started.
          </p>
        ) : (
          <ul className="space-y-2">
            {paths.map((p) => {
              const pct = computePlanProgressPercent(p.plan, p.progress);
              const isActive = p.pathId === activePathId;
              return (
                <li key={p.pathId}>
                  <div
                    className={`rounded-xl border transition ${
                      isActive
                        ? "border-[#2dd4bf] bg-[#2dd4bf]/10"
                        : "border-white/10 bg-black/20 hover:border-white/20"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(p.pathId)}
                      className="w-full px-3 py-3 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-white">{p.plan.hobby}</span>
                        <span className="shrink-0 text-xs font-semibold text-[#99f6e4]">{pct}%</span>
                      </div>
                      <p className="mt-0.5 text-xs capitalize text-white/50">{p.plan.level}</p>
                      {isActive && (
                        <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wider text-[#2dd4bf]">
                          Active
                        </span>
                      )}
                      {!isActive && (
                        <span className="mt-2 block text-xs text-white/45">Tap to resume</span>
                      )}
                    </button>
                    <div className="border-t border-white/10 px-2 pb-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            typeof window !== "undefined" &&
                            !window.confirm(`Remove “${p.plan.hobby}” from your list? Progress is lost for this path.`)
                          ) {
                            return;
                          }
                          onRemovePath(p.pathId);
                        }}
                        className="w-full rounded-lg py-1.5 text-xs text-white/40 transition hover:bg-white/5 hover:text-red-300"
                      >
                        Remove path
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
