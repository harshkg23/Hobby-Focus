"use client";

import type { Technique, TechniqueStatus } from "@/lib/types/learning";

const STATUS_LABEL: Record<TechniqueStatus, string> = {
  active: "In progress",
  complete: "Done",
  skipped: "Skipped",
  revisit: "Revisit",
};

export function TechniqueCard({
  technique,
  status,
  onOpen,
  onSetStatus,
}: {
  technique: Technique;
  status: TechniqueStatus;
  onOpen: () => void;
  onSetStatus: (s: TechniqueStatus) => void;
}) {
  return (
    <article className="flex w-full flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-lg backdrop-blur-md transition hover:border-white/15 hover:bg-white/[0.07] sm:p-6">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-snug text-white">{technique.title}</h3>
          <span
            className="shrink-0 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white/75"
            title={STATUS_LABEL[status]}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>
        <p className="text-sm text-[#99f6e4]/90">{technique.cardHint}</p>
        <p className="text-sm leading-relaxed text-white/75">{technique.summary}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#0c0e12] shadow-md transition hover:bg-white/95 min-[420px]:flex-none min-[420px]:px-6"
        >
          Open learning modes
        </button>
        <button
          type="button"
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          onClick={() => onSetStatus("complete")}
        >
          Complete
        </button>
        <button
          type="button"
          className="rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/5 hover:text-white/90"
          onClick={() => onSetStatus("skipped")}
        >
          Skip
        </button>
        <button
          type="button"
          className="rounded-full border border-dashed border-white/25 px-4 py-2.5 text-sm font-medium text-[#c4b5fd] transition hover:border-[#c4b5fd]/60 hover:bg-white/5"
          onClick={() => onSetStatus("revisit")}
        >
          Revisit
        </button>
      </div>
    </article>
  );
}
