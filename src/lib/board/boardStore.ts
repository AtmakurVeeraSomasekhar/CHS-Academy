/**
 * Per-question whiteboard persistence.
 *
 * Every question owns an independent canvas entry (drawings + text boxes +
 * images). Entries are cached in memory and debounced to localStorage so
 * navigating between questions never loses — or leaks — handwritten work.
 */

const KEY = "chs.board.v1";

export interface BoardEntry {
  elements: unknown[];
  boxes: unknown[];
}

type Store = Record<string, BoardEntry>;

let cache: Store | null = null;
let timer: number | undefined;

function all(): Store {
  if (cache) return cache;
  if (typeof window === "undefined") {
    cache = {};
    return cache;
  }
  try {
    cache = (JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store) ?? {};
  } catch {
    cache = {};
  }
  return cache;
}

function schedule() {
  if (typeof window === "undefined") return;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(all()));
    } catch {
      /* quota — keep the in-memory copy */
    }
  }, 700);
}

export function getBoard(key: string | number): BoardEntry {
  return all()[String(key)] ?? { elements: [], boxes: [] };
}

export function saveBoard(key: string | number, patch: Partial<BoardEntry>) {
  const k = String(key);
  const store = all();
  store[k] = { ...getBoard(k), ...patch };
  schedule();
}

/** Explicit teacher action only — never called automatically. */
export function deleteBoard(key: string | number) {
  delete all()[String(key)];
  schedule();
}
