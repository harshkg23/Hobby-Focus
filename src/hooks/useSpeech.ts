"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeakOptions {
  rate?: number;
  /** Start playback from this percentage point (0-100). */
  startPct?: number;
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [playbackActive, setPlaybackActive] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const cancelled = useRef(false);
  const progressTimer = useRef<number | null>(null);
  const approxDurationMs = useRef(0);
  const elapsedMs = useRef(0);
  const lastTickAt = useRef<number | null>(null);
  const speakingRef = useRef(false);
  const pausedRef = useRef(false);
  /** Guards against stale utterance callbacks after seek/restart. */
  const utteranceRunId = useRef(0);

  const clearProgressTimer = useCallback(() => {
    if (progressTimer.current !== null && typeof window !== "undefined") {
      window.clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  }, []);

  const startProgressTimer = useCallback(() => {
    if (typeof window === "undefined") return;
    clearProgressTimer();
    lastTickAt.current = Date.now();
    progressTimer.current = window.setInterval(() => {
      if (pausedRef.current || !speakingRef.current) return;
      const now = Date.now();
      const last = lastTickAt.current ?? now;
      const delta = Math.max(0, now - last);
      lastTickAt.current = now;
      elapsedMs.current += delta;
      const total = Math.max(approxDurationMs.current, 1);
      const pct = Math.max(0, Math.min(99, Math.round((elapsedMs.current / total) * 100)));
      setProgressPct(pct);
    }, 120);
  }, [clearProgressTimer]);

  useEffect(() => {
    return () => {
      cancelled.current = true;
      clearProgressTimer();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [clearProgressTimer]);

  const stop = useCallback(() => {
    utteranceRunId.current += 1;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    clearProgressTimer();
    approxDurationMs.current = 0;
    elapsedMs.current = 0;
    lastTickAt.current = null;
    speakingRef.current = false;
    pausedRef.current = false;
    setSpeaking(false);
    setPaused(false);
    setPlaybackActive(false);
    setProgressPct(0);
  }, [clearProgressTimer]);

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const rate = options?.rate ?? 1;
      const startPct = Math.max(0, Math.min(99, options?.startPct ?? 0));
      const totalChars = Math.max(text.length, 1);
      const startIndex = Math.floor((totalChars * startPct) / 100);
      const segment = text.slice(startIndex);
      if (!segment.trim()) return;

      stop();
      const runId = utteranceRunId.current;
      setPlaybackActive(true);
      setSpeaking(true);
      setPaused(false);
      speakingRef.current = true;
      pausedRef.current = false;
      setProgressPct(startPct);
      const totalWords = Math.max(text.trim().split(/\s+/).length, 1);
      const wordsPerMinute = 160 * Math.max(0.75, rate);
      const totalMs = (totalWords / wordsPerMinute) * 60 * 1000;
      approxDurationMs.current = totalMs;
      elapsedMs.current = (startPct / 100) * totalMs;
      startProgressTimer();
      const utter = new SpeechSynthesisUtterance(segment);
      utter.rate = rate;
      utter.onend = () => {
        if (runId !== utteranceRunId.current) return;
        clearProgressTimer();
        speakingRef.current = false;
        pausedRef.current = false;
        setSpeaking(false);
        setPaused(false);
        setPlaybackActive(false);
        setProgressPct(100);
      };
      utter.onerror = () => {
        if (runId !== utteranceRunId.current) return;
        clearProgressTimer();
        speakingRef.current = false;
        pausedRef.current = false;
        setSpeaking(false);
        setPaused(false);
        setPlaybackActive(false);
        setProgressPct(0);
      };
      window.speechSynthesis.speak(utter);
    },
    [stop, startProgressTimer, clearProgressTimer]
  );

  const pause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!playbackActive || pausedRef.current) return;
    window.speechSynthesis.pause();
    clearProgressTimer();
    pausedRef.current = true;
    setPaused(true);
  }, [clearProgressTimer, playbackActive]);

  const resume = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!playbackActive || !pausedRef.current) return;
    window.speechSynthesis.resume();
    pausedRef.current = false;
    startProgressTimer();
    setPaused(false);
  }, [startProgressTimer, playbackActive]);

  return { speaking, paused, playbackActive, progressPct, speak, pause, resume, stop };
}
