import { useCallback, useEffect, useState } from "react";

const KEY = "chs.favorites";

// TODO: swap to Lovable Cloud favorites table when backend added.
export function useFavorites() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (next: number[]) => {
    setIds(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const toggle = useCallback(
    (id: number) => {
      persist(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
    },
    [ids],
  );

  const has = useCallback((id: number) => ids.includes(id), [ids]);

  return { ids, toggle, has };
}
