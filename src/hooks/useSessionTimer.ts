import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Two-stream timer:
 *   sessionSec  - monotonic total session time
 *   perQuestion - array of seconds spent on each question index
 * The "active question" is passed in and reset drives the perQuestion counter.
 */
export function useSessionTimer(activeIndex: number, total: number) {
  const [running, setRunning] = useState(true);
  const [sessionSec, setSessionSec] = useState(0);
  const [perQuestion, setPerQuestion] = useState<number[]>(() =>
    Array.from({ length: total }, () => 0),
  );
  const activeRef = useRef(activeIndex);
  activeRef.current = activeIndex;

  // Auto-pause on tab blur
  useEffect(() => {
    const onVis = () => setRunning(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSessionSec((s) => s + 1);
      setPerQuestion((arr) => {
        const next = arr.slice();
        next[activeRef.current] = (next[activeRef.current] ?? 0) + 1;
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setSessionSec(0);
    setPerQuestion(Array.from({ length: total }, () => 0));
  }, [total]);

  return {
    running,
    sessionSec,
    perQuestion,
    currentSec: perQuestion[activeIndex] ?? 0,
    start,
    pause,
    reset,
  };
}

export function formatTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
