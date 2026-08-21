import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, RotateCw, Trash2 } from "lucide-react";

export interface Img {
  id: string;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
}

/** Module store so images survive panel remounts / mode switches. */
const store = new Map<string, Img[]>();

const uid = () => Math.random().toString(36).slice(2, 10);

interface Props {
  layerId: string;
  /** Set by the parent when the teacher picks "Insert image". */
  pending?: { src: string; token: number } | null;
  /** Interaction is disabled while the pen owns the surface. */
  locked?: boolean;
}

/**
 * Movable / resizable / rotatable image objects layered above content and
 * below the annotation canvas, so the teacher can write directly on diagrams.
 */
export function ImageLayer({ layerId, pending, locked }: Props) {
  const [imgs, setImgs] = useState<Img[]>(() => store.get(layerId) ?? []);
  const [sel, setSel] = useState<string | null>(null);
  const seen = useRef(0);

  const commit = useCallback(
    (next: Img[]) => {
      store.set(layerId, next);
      setImgs(next);
    },
    [layerId],
  );

  useEffect(() => {
    setImgs(store.get(layerId) ?? []);
    setSel(null);
  }, [layerId]);

  useEffect(() => {
    if (!pending || pending.token === seen.current) return;
    seen.current = pending.token;
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 460 / img.width);
      const next: Img = {
        id: uid(),
        src: pending.src,
        x: 60,
        y: 60,
        w: Math.round(img.width * scale) || 320,
        h: Math.round(img.height * scale) || 220,
        rot: 0,
      };
      commit([...(store.get(layerId) ?? []), next]);
      setSel(next.id);
    };
    img.src = pending.src;
  }, [pending, layerId, commit]);

  const drag = (
    e: React.PointerEvent,
    id: string,
    mode: "move" | "resize" | "rotate",
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const start = { x: e.clientX, y: e.clientY };
    const base = (store.get(layerId) ?? []).find((i) => i.id === id);
    if (!base) return;
    setSel(id);
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      const list = (store.get(layerId) ?? []).map((i) => {
        if (i.id !== id) return i;
        if (mode === "move") return { ...i, x: base.x + dx, y: base.y + dy };
        if (mode === "resize") {
          const w = Math.max(60, base.w + dx);
          return { ...i, w, h: Math.max(40, Math.round((base.h / base.w) * w)) };
        }
        return { ...i, rot: base.rot + dx * 0.6 };
      });
      commit(list);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  if (!imgs.length) return null;

  return (
    <div
      className={`absolute inset-0 z-20 ${locked ? "pointer-events-none" : "pointer-events-none"}`}
    >
      {imgs.map((i) => {
        const active = sel === i.id && !locked;
        return (
          <div
            key={i.id}
            className={`absolute ${locked ? "" : "pointer-events-auto"}`}
            style={{
              left: i.x,
              top: i.y,
              width: i.w,
              height: i.h,
              transform: `rotate(${i.rot}deg)`,
            }}
            onPointerDown={(e) => drag(e, i.id, "move")}
          >
            <img
              src={i.src}
              alt="Inserted illustration"
              draggable={false}
              className={`h-full w-full select-none rounded-md object-contain shadow-lg ${
                active ? "ring-2 ring-gold" : "ring-1 ring-slate-300"
              }`}
            />
            {active && (
              <>
                <div className="no-capture absolute -top-9 left-0 flex items-center gap-1 rounded-md border border-gold/40 bg-navy-deep/95 px-1 py-0.5 shadow-lg">
                  <button
                    className="h-6 w-6 rounded text-gold hover:bg-white/10"
                    title="Duplicate"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() =>
                      commit([
                        ...(store.get(layerId) ?? []),
                        { ...i, id: uid(), x: i.x + 28, y: i.y + 28 },
                      ])
                    }
                  >
                    <Copy className="mx-auto h-3.5 w-3.5" />
                  </button>
                  <button
                    className="h-6 w-6 rounded text-gold hover:bg-white/10"
                    title="Rotate (drag)"
                    onPointerDown={(e) => drag(e, i.id, "rotate")}
                  >
                    <RotateCw className="mx-auto h-3.5 w-3.5" />
                  </button>
                  <button
                    className="h-6 w-6 rounded text-brand-red hover:bg-white/10"
                    title="Delete"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => {
                      commit((store.get(layerId) ?? []).filter((x) => x.id !== i.id));
                      setSel(null);
                    }}
                  >
                    <Trash2 className="mx-auto h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-sm border border-navy-deep bg-gold"
                  title="Resize"
                  onPointerDown={(e) => drag(e, i.id, "resize")}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
