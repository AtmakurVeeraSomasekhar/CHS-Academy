import { useEffect } from "react";

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  // Excalidraw uses an internal textarea for text; guard via role
  if (target.getAttribute("role") === "textbox") return true;
  return false;
}

export type ShortcutMap = Record<string, (e: KeyboardEvent) => void>;

/**
 * Registers keyboard shortcuts for the canvas. Every single-letter binding is
 * guarded against firing when a text input has focus.
 *
 * Keys: use "p", "e", "t", "l", "r", "c", "space", "delete", "ctrl+z", "ctrl+y".
 */
export function useCanvasShortcuts(map: ShortcutMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const key = e.key.toLowerCase();
      const combo =
        (e.ctrlKey || e.metaKey ? "ctrl+" : "") +
        (e.shiftKey && key.length > 1 ? "shift+" : "") +
        (key === " " ? "space" : key);
      const handler = map[combo] ?? map[key];
      if (handler) {
        handler(e);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [map, enabled]);
}

export const SHORTCUT_LIST: Array<{ keys: string; label: string }> = [
  { keys: "P", label: "Pen" },
  { keys: "E", label: "Eraser" },
  { keys: "T", label: "Text tool" },
  { keys: "L", label: "Line" },
  { keys: "R", label: "Rectangle" },
  { keys: "C", label: "Circle" },
  { keys: "Space", label: "Pan canvas" },
  { keys: "Delete", label: "Remove selected object" },
  { keys: "Ctrl + Z", label: "Undo" },
  { keys: "Ctrl + Y", label: "Redo" },
  { keys: "← / →", label: "Prev / Next question" },
  { keys: "F11", label: "Toggle fullscreen" },
];
