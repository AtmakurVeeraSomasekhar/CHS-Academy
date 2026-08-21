import { useEffect, useState } from "react";

const KEY = "chs.streak";

type StreakState = { count: number; lastDay: string };

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.round((db - da) / 86400000);
}

// TODO: swap to Lovable Cloud user_streaks table when backend added.
export function useStreak() {
  const [state, setState] = useState<StreakState>({ count: 1, lastDay: today() });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const now = today();
      if (!raw) {
        const next = { count: 1, lastDay: now };
        localStorage.setItem(KEY, JSON.stringify(next));
        setState(next);
        return;
      }
      const parsed: StreakState = JSON.parse(raw);
      const gap = daysBetween(parsed.lastDay, now);
      let next: StreakState;
      if (gap === 0) next = parsed;
      else if (gap === 1) next = { count: parsed.count + 1, lastDay: now };
      else next = { count: 1, lastDay: now };
      localStorage.setItem(KEY, JSON.stringify(next));
      setState(next);
    } catch {
      /* ignore */
    }
  }, []);

  return state.count;
}
