"use client";

import { useState } from "react";
import type { SkillLevel } from "@/lib/types/learning";

const LEVELS: { id: SkillLevel; label: string; hint: string }[] = [
  { id: "beginner", label: "Beginner", hint: "Foundations & habits" },
  { id: "intermediate", label: "Intermediate", hint: "Sharpen patterns" },
  { id: "advanced", label: "Advanced", hint: "Refine edge cases" },
];

export function PlanForm({
  onSubmit,
  loading,
  variant = "light",
}: {
  onSubmit: (p: { hobby: string; level: SkillLevel; goal: string | null }) => void;
  loading: boolean;
  /** Match landing / dashboard dark glass UI */
  variant?: "light" | "dark";
}) {
  const [hobby, setHobby] = useState("");
  const [level, setLevel] = useState<SkillLevel>("beginner");
  const [goal, setGoal] = useState("");

  const isDark = variant === "dark";

  const inputClass = isDark
    ? "w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3.5 text-white shadow-inner outline-none ring-2 ring-transparent placeholder:text-white/40 focus:border-white/25 focus:ring-white/15"
    : "w-full rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-ink shadow-sm outline-none ring-accent/30 placeholder:text-ink-muted/70 focus:ring-2 dark:border-white/10 dark:bg-black/40";

  const labelClass = isDark ? "mb-2 block text-sm font-medium text-white/85" : "mb-2 block text-sm font-medium text-ink";

  const levelBase =
    "rounded-xl border px-3 py-3.5 text-left transition";
  const levelActive = isDark
    ? "border-[#2dd4bf] bg-[#2dd4bf]/12 ring-2 ring-[#2dd4bf]/35"
    : "border-accent bg-accent-soft ring-2 ring-accent/30";
  const levelIdle = isDark
    ? "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
    : "border-black/10 bg-white/80 hover:border-black/20 dark:border-white/10 dark:bg-black/30";

  const titleClass = isDark ? "text-sm font-semibold text-white" : "text-sm font-semibold text-ink";
  const hintClass = isDark ? "text-xs text-white/55" : "text-xs text-ink-muted";

  const buttonClass = isDark
    ? "inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-3.5 text-sm font-semibold text-[#0c0e12] shadow-lg shadow-black/25 transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-50"
    : "inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-lift transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          hobby,
          level,
          goal: goal.trim() ? goal.trim() : null,
        });
      }}
    >
      <div>
        <label htmlFor="hobby" className={labelClass}>
          What are you learning?
        </label>
        <input
          id="hobby"
          name="hobby"
          required
          maxLength={80}
          autoComplete="off"
          placeholder="e.g. Chess, acoustic guitar, watercolor"
          className={inputClass}
          value={hobby}
          onChange={(e) => setHobby(e.target.value)}
        />
      </div>

      <div>
        <p className={labelClass}>Your level</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLevel(l.id)}
              className={`${levelBase} ${level === l.id ? levelActive : levelIdle}`}
            >
              <div className={titleClass}>{l.label}</div>
              <div className={hintClass}>{l.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="goal" className={labelClass}>
          Focus goal{" "}
          <span className={`font-normal ${isDark ? "text-white/45" : "text-ink-muted"}`}>(optional)</span>
        </label>
        <textarea
          id="goal"
          name="goal"
          maxLength={240}
          rows={3}
          placeholder="What do you want to improve in the next few weeks?"
          className={inputClass + " resize-none"}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading || !hobby.trim()} className={buttonClass}>
        {loading ? "Building your path…" : "Create my learning path"}
      </button>
    </form>
  );
}
