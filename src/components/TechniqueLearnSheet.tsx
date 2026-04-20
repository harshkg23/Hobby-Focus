"use client";

import { useCallback, useEffect, useId, useState } from "react";
import type {
  LearningPlan,
  Technique,
  TechniqueContentPayload,
  YouTubeVideoItem,
} from "@/lib/types/learning";
import { useSpeech } from "@/hooks/useSpeech";

type TabId = "video" | "read" | "listen";

function buildReadAloudText(content: TechniqueContentPayload | null): string {
  if (!content) return "";
  const r = content.read;
  const parts = [
    r.definition,
    "Steps.",
    ...r.steps.map((s, i) => `Step ${i + 1}. ${s}`),
    "Common mistakes.",
    ...r.mistakes,
    "Tips.",
    ...r.tips,
  ];
  return parts.filter(Boolean).join(" ");
}

export function TechniqueLearnSheet({
  open,
  plan,
  technique,
  onClose,
}: {
  open: boolean;
  plan: LearningPlan;
  technique: Technique | null;
  onClose: () => void;
}) {
  const titleId = useId();
  const [tab, setTab] = useState<TabId>("video");
  const [videos, setVideos] = useState<YouTubeVideoItem[]>([]);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const [readContent, setReadContent] = useState<TechniqueContentPayload | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const [readLoading, setReadLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentListenText, setCurrentListenText] = useState("");
  const [seekPct, setSeekPct] = useState(0);

  const { speak, pause, resume, stop, speaking, paused, playbackActive, progressPct } = useSpeech();

  const loadVideos = useCallback(async () => {
    if (!technique?.youtubeQueryTerms?.length) {
      setVideoError("No search terms for this technique.");
      return;
    }
    setVideoLoading(true);
    setVideoError(null);
    try {
      const q = technique.youtubeQueryTerms[0];
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { videos?: YouTubeVideoItem[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not load videos.");
      const list = data.videos ?? [];
      setVideos(list);
      setActiveVideoId(list[0]?.videoId ?? null);
    } catch (e) {
      setVideoError(e instanceof Error ? e.message : "Video load failed.");
    } finally {
      setVideoLoading(false);
    }
  }, [technique]);

  const loadRead = useCallback(async () => {
    if (!technique) return;
    setReadLoading(true);
    setReadError(null);
    try {
      const res = await fetch("/api/technique-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hobby: plan.hobby,
          level: plan.level,
          techniqueTitle: technique.title,
          techniqueSummary: technique.summary,
        }),
      });
      const data = (await res.json()) as {
        content?: TechniqueContentPayload;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not load reading.");
      if (data.content) setReadContent(data.content);
    } catch (e) {
      setReadError(e instanceof Error ? e.message : "Read load failed.");
    } finally {
      setReadLoading(false);
    }
  }, [plan.hobby, plan.level, technique]);

  useEffect(() => {
    if (!open || !technique) return;
    setTab("video");
    setVideos([]);
    setActiveVideoId(null);
    setVideoError(null);
    setReadContent(null);
    setReadError(null);
    setCurrentListenText("");
    setSeekPct(0);
    stop();
  }, [open, technique, stop]);

  useEffect(() => {
    if (!open || !technique || tab !== "video") return;
    void loadVideos();
  }, [open, technique, tab, loadVideos]);

  useEffect(() => {
    if (!open || !technique) return;
    if (tab !== "read" && tab !== "listen") return;
    if (readContent || readLoading) return;
    void loadRead();
  }, [open, technique, tab, readContent, readLoading, loadRead]);

  useEffect(() => {
    if (!open) stop();
  }, [open, stop]);

  useEffect(() => {
    if (speaking || paused) {
      setSeekPct(progressPct);
    }
  }, [speaking, paused, progressPct]);

  useEffect(() => {
    if (!currentListenText.trim()) return;
    if (!playbackActive || paused) return;
    // Apply speed changes immediately by restarting from current seek point.
    speak(currentListenText, { rate: playbackRate, startPct: seekPct });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackRate]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !technique) return null;

  function estimateRemainingLabel(text: string, pct: number, rate: number): string {
    if (!text.trim()) return "--:-- left";
    const words = text.trim().split(/\s+/).length;
    const wordsPerMinute = 160 * Math.max(0.75, rate);
    const totalSeconds = (words / wordsPerMinute) * 60;
    const remaining = Math.max(0, Math.round(totalSeconds * (1 - pct / 100)));
    const min = Math.floor(remaining / 60);
    const sec = String(remaining % 60).padStart(2, "0");
    return `${min}:${sec} left`;
  }

  function startPlaybackFrom(pct: number) {
    if (!currentListenText.trim()) return;
    speak(currentListenText, { rate: playbackRate, startPct: pct });
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "video", label: "Video" },
    { id: "read", label: "Read" },
    { id: "listen", label: "Listen" },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative flex max-h-[min(92vh,840px)] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#12141a] shadow-2xl sm:rounded-3xl">
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/45">Technique</p>
            <h2 id={titleId} className="font-display text-xl font-semibold text-balance text-white">
              {technique.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
        </header>

        <div className="border-b border-white/10 px-2 pt-2 sm:px-4">
          <div className="flex gap-1 overflow-x-auto pb-2 sm:justify-center">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`min-w-[88px] rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-white text-[#0c0e12]"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {tab === "video" && (
            <div className="space-y-4">
              <p className="text-sm text-white/60">
                Curated clips for this technique. Audio comes from the video—use headphones for focus.
              </p>
              {videoLoading && (
                <p className="text-sm text-white/50" role="status">
                  Finding a few strong videos…
                </p>
              )}
              {videoError && (
                <p className="rounded-xl border border-red-400/35 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {videoError}
                </p>
              )}
              {!videoLoading && videos.length > 0 && (
                <>
                  <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-inner ring-1 ring-white/10">
                    {activeVideoId ? (
                      <iframe
                        title="Technique video"
                        className="h-full w-full"
                        src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?rel=0`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : null}
                  </div>
                  <ul className="space-y-2">
                    {videos.map((v) => (
                      <li key={v.videoId}>
                        <button
                          type="button"
                          onClick={() => setActiveVideoId(v.videoId)}
                          className={`flex w-full gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${
                            activeVideoId === v.videoId
                              ? "border-[#2dd4bf] bg-[#2dd4bf]/10"
                              : "border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={v.thumbnailUrl}
                            alt=""
                            className="h-14 w-24 shrink-0 rounded-lg object-cover"
                          />
                          <span>
                            <span className="line-clamp-2 font-medium text-white">{v.title}</span>
                            <span className="mt-0.5 block text-xs text-white/50">{v.channelTitle}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {tab === "read" && (
            <div className="space-y-4">
              {readLoading && (
                <p className="text-sm text-white/50" role="status">
                  Drafting a tight reading…
                </p>
              )}
              {readError && (
                <p className="rounded-xl border border-red-400/35 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {readError}
                </p>
              )}
              {readContent && (
                <article className="space-y-5 text-sm leading-relaxed">
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">Definition</h3>
                    <p className="mt-2 text-white/80">{readContent.read.definition}</p>
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">Steps</h3>
                    <ol className="mt-2 list-decimal space-y-2 pl-5 text-white/80">
                      {readContent.read.steps.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">Mistakes</h3>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-white/80">
                      {readContent.read.mistakes.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-white">Tips</h3>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-white/80">
                      {readContent.read.tips.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              )}
            </div>
          )}

          {tab === "listen" && (
            <div className="space-y-4">
              <p className="text-sm text-white/60">
                Two listen modes: follow the reading aloud, or hear a short narrated summary. On-demand
                only—nothing plays until you choose.
              </p>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                    Playback controls
                  </p>
                  <span className="text-xs text-white/50">
                    {playbackRate.toFixed(2)}x ·{" "}
                    {estimateRemainingLabel(currentListenText, seekPct, playbackRate)}
                  </span>
                </div>
                <div className="mb-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={seekPct}
                    onChange={(e) => setSeekPct(Number(e.target.value))}
                    onPointerUp={(e) =>
                      startPlaybackFrom(Number((e.currentTarget as HTMLInputElement).value))
                    }
                    className="w-full accent-[#2dd4bf]"
                    aria-label="Playback position"
                    disabled={!currentListenText.trim()}
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px] text-white/45">
                    <span>0%</span>
                    <span>{Math.round(seekPct)}%</span>
                    <span>100%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0.75}
                  max={1.5}
                  step={0.05}
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(Number(e.target.value))}
                  className="w-full accent-[#2dd4bf]"
                  aria-label="Playback speed"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (playbackActive && !paused) pause();
                    }}
                    aria-disabled={!playbackActive || paused}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      playbackActive && !paused
                        ? "border-white/25 text-white/85 hover:bg-white/10"
                        : "border-white/10 text-white/40"
                    }`}
                  >
                    Pause
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (playbackActive && paused) resume();
                    }}
                    aria-disabled={!playbackActive || !paused}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      playbackActive && paused
                        ? "border-white/25 text-white/85 hover:bg-white/10"
                        : "border-white/10 text-white/40"
                    }`}
                  >
                    Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (playbackActive) stop();
                    }}
                    aria-disabled={!playbackActive}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      playbackActive
                        ? "border-white/25 text-white/85 hover:bg-white/10"
                        : "border-white/10 text-white/40"
                    }`}
                  >
                    Stop
                  </button>
                  {playbackActive ? (
                    <span className="inline-flex items-center rounded-full border border-[#2dd4bf]/40 bg-[#2dd4bf]/10 px-2.5 py-1 text-[11px] text-[#99f6e4]">
                      {paused ? "Paused" : "Playing"}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={!readContent || readLoading}
                  onClick={() => {
                    const text = buildReadAloudText(readContent);
                    if (text) {
                      setCurrentListenText(text);
                      setSeekPct(0);
                      speak(text, { rate: playbackRate, startPct: 0 });
                    }
                  }}
                  className="flex-1 rounded-full border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-[#0c0e12] transition hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Speak the reading
                </button>
                <button
                  type="button"
                  disabled={!readContent?.narrationScript || readLoading}
                  onClick={() => {
                    if (readContent?.narrationScript) {
                      setCurrentListenText(readContent.narrationScript);
                      setSeekPct(0);
                      speak(readContent.narrationScript, { rate: playbackRate, startPct: 0 });
                    }
                  }}
                  className="flex-1 rounded-full border border-white/15 bg-transparent px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Speak AI summary
                </button>
              </div>
              {readLoading && (
                <p className="text-xs text-white/45">
                  Loading narration text… switch to Read first if you want to preview.
                </p>
              )}
              {!readLoading && !readContent && (
                <p className="text-sm text-white/55">
                  Open the Read tab once to generate text, then return here to listen.
                </p>
              )}
              <p className="text-xs text-white/45">
                Uses your browser voice. For video audio, use the Video tab player.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
