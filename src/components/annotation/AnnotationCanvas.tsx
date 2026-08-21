import { useCallback, useEffect, useRef, useState } from "react";
import { drawAll, hitShape } from "@/lib/annotation/draw";
import * as store from "@/lib/annotation/store";
import type { AnnoTool, Pt, Shape } from "@/lib/annotation/types";

interface Props {
  /** Stable layer id — annotations persist in the module store under this key. */
  layerId: string;
  tool: AnnoTool;
  color: string;
  width: number;
  opacity: number; // 0..100
  /** When false the layer is purely visual and clicks pass through to content. */
  active: boolean;
  onFocus?: (layerId: string) => void;
  className?: string;
}

const uid = () => Math.random().toString(36).slice(2, 10);

/**
 * Layer 3 in the stack: a transparent vector annotation canvas that floats over
 * any content (question, solution, theory text, PDF page) without mutating it.
 * Coordinates are normalized by layer width so markup stays aligned on resize
 * and PDF zoom.
 */
export function AnnotationCanvas({
  layerId,
  tool,
  color,
  width,
  opacity,
  active,
  onFocus,
  className,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const draftRef = useRef<Shape | null>(null);
  const drawingRef = useRef(false);
  const erasedRef = useRef<Set<string>>(new Set());
  const [textAt, setTextAt] = useState<{ x: number; y: number } | null>(null);
  const [textVal, setTextVal] = useState("");

  const paint = useCallback(() => {
    const cvs = canvasRef.current;
    const ctx = cvs?.getContext("2d");
    if (!cvs || !ctx) return;
    const { w, h } = sizeRef.current;
    if (!w || !h) return;
    const shapes = store.getLayer(layerId).shapes.slice();
    const draft = draftRef.current;
    if (draft) shapes.push(draft);
    const erased = erasedRef.current;
    drawAll(
      ctx,
      erased.size ? shapes.filter((s) => !erased.has(s.id)) : shapes,
      w,
      w,
      h,
    );
  }, [layerId]);

  // Size the backing store to the container in device pixels.
  useEffect(() => {
    const el = wrapRef.current;
    const cvs = canvasRef.current;
    if (!el || !cvs) return;
    const resize = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w: r.width, h: r.height };
      cvs.width = Math.max(1, Math.round(r.width * dpr));
      cvs.height = Math.max(1, Math.round(r.height * dpr));
      cvs.style.width = `${r.width}px`;
      cvs.style.height = `${r.height}px`;
      const ctx = cvs.getContext("2d");
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [paint]);

  useEffect(() => {
    const unsub = store.subscribe(layerId, paint);
    return () => {
      unsub();
    };
  }, [layerId, paint]);
  useEffect(() => paint(), [layerId, paint]);

  const toNorm = (e: React.PointerEvent): Pt => {
    const r = wrapRef.current!.getBoundingClientRect();
    const s = r.width || 1;
    return {
      x: (e.clientX - r.left) / s,
      y: (e.clientY - r.top) / s,
      p: e.pressure > 0 ? e.pressure : 0.5,
    };
  };

  const strokeStyleFor = (t: AnnoTool) => {
    const base = { color, width: width, opacity: opacity / 100 };
    if (t === "highlighter") return { ...base, width: Math.max(10, width * 5), opacity: 0.3 };
    if (t === "pencil") return { ...base, width: Math.max(1, width * 0.8), opacity: (opacity / 100) * 0.85 };
    return base;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!active || tool === "selection") return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    onFocus?.(layerId);
    const p = toNorm(e);

    if (tool === "text") {
      const r = wrapRef.current!.getBoundingClientRect();
      setTextAt({ x: e.clientX - r.left, y: e.clientY - r.top });
      setTextVal("");
      return;
    }

    drawingRef.current = true;

    if (tool === "eraser") {
      erasedRef.current = new Set();
      hitErase(p);
      return;
    }

    const st = strokeStyleFor(tool);
    if (tool === "pen" || tool === "pencil" || tool === "highlighter") {
      draftRef.current = { id: uid(), kind: "path", tool, points: [p], ...st };
    } else {
      const kind = tool as "line" | "arrow" | "rectangle" | "ellipse";
      draftRef.current = { id: uid(), kind, tool, from: p, to: p, ...st };
    }
    paint();
  };

  const hitErase = (p: Pt) => {
    const r = Math.max(0.008, (width * 2.5) / (sizeRef.current.w || 1));
    const shapes = store.getLayer(layerId).shapes;
    let changed = false;
    for (const s of shapes) {
      if (!erasedRef.current.has(s.id) && hitShape(s, p, r)) {
        erasedRef.current.add(s.id);
        changed = true;
      }
    }
    if (changed) paint();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!active || !drawingRef.current) return;
    const p = toNorm(e);
    if (tool === "eraser") {
      hitErase(p);
      return;
    }
    const d = draftRef.current;
    if (!d) return;
    if (d.kind === "path") {
      const pts = d.points;
      const last = pts[pts.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) > 0.0015) pts.push(p);
    } else if (d.kind !== "text") {
      d.to = e.shiftKey ? squared(d.from, p) : p;
    }
    paint();
  };

  const endStroke = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (tool === "eraser") {
      store.eraseShapes(layerId, erasedRef.current);
      erasedRef.current = new Set();
      paint();
      return;
    }
    const d = draftRef.current;
    draftRef.current = null;
    if (d) {
      const tiny =
        d.kind !== "path" && d.kind !== "text"
          ? Math.hypot(d.to.x - d.from.x, d.to.y - d.from.y) < 0.004
          : d.kind === "path" && d.points.length === 0;
      if (!tiny) store.addShape(layerId, d);
    }
    paint();
  };

  const commitText = () => {
    const at = textAt;
    if (at && textVal.trim()) {
      const s = sizeRef.current.w || 1;
      store.addShape(layerId, {
        id: uid(),
        kind: "text",
        tool: "text",
        at: { x: at.x / s, y: at.y / s },
        text: textVal,
        size: Math.max(14, width * 8) / s,
        color,
        width,
        opacity: opacity / 100,
      });
    }
    setTextAt(null);
    setTextVal("");
  };

  const cursor =
    tool === "eraser"
      ? "cell"
      : tool === "text"
        ? "text"
        : tool === "selection"
          ? "default"
          : "crosshair";

  return (
    <div
      ref={wrapRef}
      className={`absolute inset-0 ${active ? "" : "pointer-events-none"} ${className ?? ""}`}
      style={{ touchAction: active ? "none" : undefined, cursor: active ? cursor : undefined }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endStroke}
      onPointerLeave={endStroke}
      onPointerCancel={endStroke}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block" />
      {textAt && (
        <textarea
          autoFocus
          value={textVal}
          onChange={(e) => setTextVal(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setTextAt(null);
              setTextVal("");
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commitText();
            }
          }}
          style={{
            left: textAt.x,
            top: textAt.y,
            color,
            fontSize: Math.max(14, width * 8),
          }}
          placeholder="Type…"
          className="absolute z-20 min-w-[8rem] resize rounded-md border border-gold/70 bg-white/95 px-1.5 py-1 font-sans font-semibold shadow-lg outline-none"
        />
      )}
    </div>
  );
}

function squared(from: Pt, p: Pt): Pt {
  const dx = p.x - from.x;
  const dy = p.y - from.y;
  const m = Math.max(Math.abs(dx), Math.abs(dy));
  return { x: from.x + Math.sign(dx) * m, y: from.y + Math.sign(dy) * m };
}
