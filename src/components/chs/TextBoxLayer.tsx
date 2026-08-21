import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Copy,
  Trash2,
  RotateCw,
} from "lucide-react";
import { useMotionDuration } from "@/hooks/useReducedMotionSafe";

export interface TextBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  text: string;
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: "left" | "center" | "right";
  color: string;
  bg: string;
  border: string;
  opacity: number;
}

const DEFAULT_BOX: Omit<TextBox, "id" | "x" | "y"> = {
  w: 260,
  h: 100,
  rot: 0,
  text: "Type here…",
  font: "Inter, system-ui, sans-serif",
  size: 18,
  bold: false,
  italic: false,
  underline: false,
  align: "left",
  color: "#0B1A33",
  bg: "rgba(255,255,255,0.95)",
  border: "#D4AF37",
  opacity: 100,
};

const FONTS = [
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "Cinzel", value: "Cinzel, serif" },
  { label: "Merriweather", value: "Merriweather, serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, monospace" },
];

interface Props {
  active: boolean;
  onExitPlacement: () => void;
  boxes: TextBox[];
  onChange: (next: TextBox[]) => void;
}

export function TextBoxLayer({ active, onExitPlacement, boxes, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dur = useMotionDuration(0.18);

  const patch = useCallback(
    (id: string, upd: Partial<TextBox>) => {
      onChange(boxes.map((b) => (b.id === id ? { ...b, ...upd } : b)));
    },
    [boxes, onChange],
  );

  const remove = useCallback(
    (id: string) => {
      onChange(boxes.filter((b) => b.id !== id));
      setSelectedId(null);
    },
    [boxes, onChange],
  );

  const duplicate = useCallback(
    (id: string) => {
      const src = boxes.find((b) => b.id === id);
      if (!src) return;
      const copy = { ...src, id: crypto.randomUUID(), x: src.x + 20, y: src.y + 20 };
      onChange([...boxes, copy]);
      setSelectedId(copy.id);
    },
    [boxes, onChange],
  );

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!active) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = crypto.randomUUID();
    onChange([...boxes, { ...DEFAULT_BOX, id, x: x - 40, y: y - 20 }]);
    setSelectedId(id);
    onExitPlacement();
  };

  // Deselect on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const selected = boxes.find((b) => b.id === selectedId);

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => {
        // click on empty area with placement active places a box
        if (e.target === containerRef.current) {
          if (active) handleContainerClick(e);
          else setSelectedId(null);
        }
      }}
      className={`absolute inset-0 ${
        active
          ? "cursor-crosshair pointer-events-auto"
          : boxes.length === 0
            ? "pointer-events-none"
            : "pointer-events-none"
      }`}
      style={{ zIndex: 20 }}
    >
      {active && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full bg-navy-deep text-gold text-[11px] font-black tracking-widest uppercase px-3 py-1 shadow-lg pointer-events-none">
          Click on canvas to place text box · Esc to cancel
        </div>
      )}

      <AnimatePresence>
        {boxes.map((b) => (
          <motion.div
            key={b.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: b.opacity / 100 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: dur }}
            className="absolute pointer-events-auto"
            style={{
              left: b.x,
              top: b.y,
              width: b.w,
              height: b.h,
              transform: `rotate(${b.rot}deg)`,
            }}
          >
            <DraggableBox
              box={b}
              selected={selectedId === b.id}
              onSelect={() => setSelectedId(b.id)}
              onPatch={(u) => patch(b.id, u)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur }}
          className="absolute pointer-events-auto rounded-xl bg-navy-panel text-white border border-gold/40 shadow-2xl shadow-black/40 px-2 py-1.5 flex flex-wrap items-center gap-1"
          style={{
            left: Math.max(8, selected.x),
            top: Math.max(8, selected.y - 44),
            maxWidth: 520,
          }}
        >
          <select
            value={selected.font}
            onChange={(e) => patch(selected.id, { font: e.target.value })}
            className="bg-navy-deep border border-white/10 text-xs rounded px-1 py-0.5"
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={10}
            max={72}
            value={selected.size}
            onChange={(e) => patch(selected.id, { size: Number(e.target.value) })}
            className="w-12 bg-navy-deep border border-white/10 text-xs rounded px-1 py-0.5"
          />
          <TBtn
            active={selected.bold}
            onClick={() => patch(selected.id, { bold: !selected.bold })}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn
            active={selected.italic}
            onClick={() => patch(selected.id, { italic: !selected.italic })}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn
            active={selected.underline}
            onClick={() => patch(selected.id, { underline: !selected.underline })}
            title="Underline"
          >
            <Underline className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn
            active={selected.align === "left"}
            onClick={() => patch(selected.id, { align: "left" })}
            title="Align left"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn
            active={selected.align === "center"}
            onClick={() => patch(selected.id, { align: "center" })}
            title="Align center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn
            active={selected.align === "right"}
            onClick={() => patch(selected.id, { align: "right" })}
            title="Align right"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </TBtn>
          <label className="flex items-center gap-0.5" title="Text color">
            <span className="text-[9px] uppercase tracking-widest opacity-70">T</span>
            <input
              type="color"
              value={selected.color}
              onChange={(e) => patch(selected.id, { color: e.target.value })}
              className="h-5 w-6 rounded border border-white/10"
            />
          </label>
          <label className="flex items-center gap-0.5" title="Background">
            <span className="text-[9px] uppercase tracking-widest opacity-70">Bg</span>
            <input
              type="color"
              onChange={(e) =>
                patch(selected.id, { bg: hexToRgba(e.target.value, 0.95) })
              }
              className="h-5 w-6 rounded border border-white/10"
            />
          </label>
          <label className="flex items-center gap-0.5" title="Border">
            <span className="text-[9px] uppercase tracking-widest opacity-70">Br</span>
            <input
              type="color"
              value={selected.border}
              onChange={(e) => patch(selected.id, { border: e.target.value })}
              className="h-5 w-6 rounded border border-white/10"
            />
          </label>
          <label className="flex items-center gap-1 text-[10px]" title="Opacity">
            α
            <input
              type="range"
              min={10}
              max={100}
              value={selected.opacity}
              onChange={(e) =>
                patch(selected.id, { opacity: Number(e.target.value) })
              }
              className="w-14 accent-[color:var(--gold)]"
            />
          </label>
          <TBtn
            onClick={() => patch(selected.id, { rot: selected.rot + 15 })}
            title="Rotate 15°"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn onClick={() => duplicate(selected.id)} title="Duplicate">
            <Copy className="h-3.5 w-3.5" />
          </TBtn>
          <TBtn onClick={() => remove(selected.id)} title="Delete">
            <Trash2 className="h-3.5 w-3.5 text-brand-red" />
          </TBtn>
        </motion.div>
      )}
    </div>
  );
}

function hexToRgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function DraggableBox({
  box,
  selected,
  onSelect,
  onPatch,
}: {
  box: TextBox;
  selected: boolean;
  onSelect: () => void;
  onPatch: (u: Partial<TextBox>) => void;
}) {
  const dragRef = useRef<{ x: number; y: number; bx: number; by: number } | null>(null);
  const resizeRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const onDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    dragRef.current = { x: e.clientX, y: e.clientY, bx: box.x, by: box.y };
    const move = (ev: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      onPatch({ x: d.bx + ev.clientX - d.x, y: d.by + ev.clientY - d.y });
    };
    const up = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    resizeRef.current = { x: e.clientX, y: e.clientY, w: box.w, h: box.h };
    const move = (ev: MouseEvent) => {
      const r = resizeRef.current;
      if (!r) return;
      onPatch({
        w: Math.max(80, r.w + ev.clientX - r.x),
        h: Math.max(40, r.h + ev.clientY - r.y),
      });
    };
    const up = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
      onMouseDown={onDragStart}
      className={`h-full w-full rounded-lg shadow-md ${
        selected ? "ring-2 ring-gold" : "ring-1 ring-black/10"
      }`}
      style={{
        backgroundColor: box.bg,
        border: `2px solid ${box.border}`,
      }}
    >
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) =>
          onPatch({ text: (e.target as HTMLDivElement).innerText || "" })
        }
        onMouseDown={(e) => e.stopPropagation()}
        className="h-full w-full outline-none p-2 overflow-hidden"
        style={{
          color: box.color,
          fontFamily: box.font,
          fontSize: box.size,
          fontWeight: box.bold ? 700 : 400,
          fontStyle: box.italic ? "italic" : "normal",
          textDecoration: box.underline ? "underline" : "none",
          textAlign: box.align,
        }}
      >
        {box.text}
      </div>
      {selected && (
        <div
          onMouseDown={onResizeStart}
          className="absolute -right-1.5 -bottom-1.5 h-3 w-3 rounded-sm bg-gold ring-2 ring-white cursor-nwse-resize"
        />
      )}
    </div>
  );
}

function TBtn({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-6 w-6 flex items-center justify-center rounded transition ${
        active ? "bg-gold text-navy-deep" : "hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
