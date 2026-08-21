import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { AnnoTool } from "@/lib/annotation/types";
import * as store from "@/lib/annotation/store";

interface AnnotationCtx {
  tool: AnnoTool;
  setTool: (t: AnnoTool) => void;
  color: string;
  setColor: (c: string) => void;
  width: number;
  setWidth: (n: number) => void;
  opacity: number; // 0..100
  setOpacity: (n: number) => void;
  /** Global annotation mode — when on, the layer above content captures the pen. */
  annotateEverywhere: boolean;
  setAnnotateEverywhere: (v: boolean) => void;
  /** Layer currently receiving strokes (last one touched), used by undo/redo/clear. */
  focusLayer: string | null;
  setFocusLayer: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

const Ctx = createContext<AnnotationCtx | null>(null);

export function AnnotationProvider({ children }: { children: React.ReactNode }) {
  const [tool, setTool] = useState<AnnoTool>("pen");
  const [color, setColor] = useState("#0B1A33");
  const [width, setWidth] = useState(2);
  const [opacity, setOpacity] = useState(100);
  const [annotateEverywhere, setAnnotateEverywhere] = useState(false);
  const [focusLayer, setFocusLayer] = useState<string | null>(null);

  const undo = useCallback(() => focusLayer && store.undo(focusLayer), [focusLayer]);
  const redo = useCallback(() => focusLayer && store.redo(focusLayer), [focusLayer]);
  const clear = useCallback(() => focusLayer && store.clearLayer(focusLayer), [focusLayer]);

  const value = useMemo<AnnotationCtx>(
    () => ({
      tool,
      setTool,
      color,
      setColor,
      width,
      setWidth,
      opacity,
      setOpacity,
      annotateEverywhere,
      setAnnotateEverywhere,
      focusLayer,
      setFocusLayer,
      undo,
      redo,
      clear,
    }),
    [tool, color, width, opacity, annotateEverywhere, focusLayer, undo, redo, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAnnotation() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAnnotation must be used inside <AnnotationProvider>");
  return v;
}
