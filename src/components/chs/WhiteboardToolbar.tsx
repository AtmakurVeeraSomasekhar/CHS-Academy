import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Pencil,
  Eraser,
  Square,
  Circle as CircleIcon,
  ArrowRight,
  Minus,
  Type,
  Trash2,
  MousePointer2,
  Triangle,
  Pin,
  PinOff,
  Undo2,
  Redo2,
  PenTool,
} from "lucide-react";
import { useMotionDuration } from "@/hooks/useReducedMotionSafe";

export type WBTool =
  | "selection"
  | "pen"
  | "pencil"
  | "highlighter"
  | "marker"
  | "eraser"
  | "line"
  | "dashed"
  | "arrow"
  | "rectangle"
  | "ellipse"
  | "triangle"
  | "polygon"
  | "text"
  | "textbox";

function ActiveIcon({ tool }: { tool: WBTool }) {
  const cls = "h-5 w-5";
  switch (tool) {
    case "selection":
      return <MousePointer2 className={cls} />;
    case "pencil":
      return <Pencil className={cls} />;
    case "eraser":
      return <Eraser className={cls} />;
    case "line":
      return <Minus className={cls} />;
    case "arrow":
      return <ArrowRight className={cls} />;
    case "rectangle":
      return <Square className={cls} />;
    case "ellipse":
      return <CircleIcon className={cls} />;
    case "triangle":
      return <Triangle className={cls} />;
    case "textbox":
    case "text":
      return <Type className={cls} />;
    default:
      return <PenTool className={cls} />;
  }
}


interface Props {
  activeTool: WBTool;
  onTool: (t: WBTool) => void;
  color: string;
  onColor: (c: string) => void;
  strokeWidth: number;
  onStrokeWidth: (n: number) => void;
  opacity: number;
  onOpacity: (n: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

export function WhiteboardToolbar(p: Props) {
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);
  const dur = useMotionDuration(0.22);

  const open = expanded || pinned;

  const pick = (t: WBTool) => {
    p.onTool(t);
    if (!pinned) setExpanded(false);
  };

  return (
    <div className="pointer-events-auto flex flex-col items-start gap-2">
      {/* Collapsed FAB — shows the currently selected tool */}
      {!open && (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: dur }}
          onClick={() => setExpanded(true)}
          className="h-11 w-11 rounded-full bg-navy-deep/95 backdrop-blur text-gold border border-gold/50 shadow-xl shadow-black/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          title="Show drawing tools"
          aria-label="Show drawing tools"
        >
          <ActiveIcon tool={p.activeTool} />
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -12, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -12, scale: 0.96 }}
            transition={{ duration: dur }}
            className="rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-2xl shadow-black/20 p-2 flex flex-col gap-1.5"
          >
            {/* Row 1: draw + shapes */}
            <div className="flex items-center gap-1">
              <ToolBtn
                title="Select / move (V)"
                active={p.activeTool === "selection"}
                onClick={() => pick("selection")}
              >
                <MousePointer2 className="h-4 w-4 text-navy-deep" />
              </ToolBtn>
              <ToolBtn
                title="Pen (P)"
                active={p.activeTool === "pen"}
                onClick={() => pick("pen")}
              >
                <PenTool className="h-4 w-4 text-navy-deep" />
              </ToolBtn>
              <ToolBtn
                title="Pencil"
                active={p.activeTool === "pencil"}
                onClick={() => pick("pencil")}
              >
                <Pencil className="h-4 w-4 text-slate-500" />
              </ToolBtn>
              <ToolBtn
                title="Eraser (E)"
                active={p.activeTool === "eraser"}
                onClick={() => pick("eraser")}
              >
                <Eraser className="h-4 w-4 text-navy-deep" />
              </ToolBtn>
              <div className="mx-0.5 h-6 w-px bg-slate-200" />
              <ToolBtn
                title="Line (L)"
                active={p.activeTool === "line"}
                onClick={() => pick("line")}
              >
                <Minus className="h-4 w-4 text-navy-deep" />
              </ToolBtn>
              <ToolBtn
                title="Arrow"
                active={p.activeTool === "arrow"}
                onClick={() => pick("arrow")}
              >
                <ArrowRight className="h-4 w-4 text-navy-deep" />
              </ToolBtn>
              <ToolBtn
                title="Rectangle (R)"
                active={p.activeTool === "rectangle"}
                onClick={() => pick("rectangle")}
              >
                <Square className="h-4 w-4 text-navy-deep" />
              </ToolBtn>
              <ToolBtn
                title="Circle (C)"
                active={p.activeTool === "ellipse"}
                onClick={() => pick("ellipse")}
              >
                <CircleIcon className="h-4 w-4 text-navy-deep" />
              </ToolBtn>
              <ToolBtn
                title="Triangle"
                active={p.activeTool === "triangle"}
                onClick={() => pick("triangle")}
              >
                <Triangle className="h-4 w-4 text-navy-deep" />
              </ToolBtn>
            </div>

            {/* Row 2: text + actions */}
            <div className="flex items-center gap-1">
              <ToolBtn
                title="Text box (T)"
                active={p.activeTool === "textbox"}
                onClick={() => pick("textbox")}
              >
                <Type className="h-4 w-4 text-gold" />
              </ToolBtn>
              <input
                type="color"
                value={p.color}
                onChange={(e) => p.onColor(e.target.value)}
                className="h-7 w-8 rounded-md cursor-pointer border border-slate-200 bg-white"
                title="Color picker"
              />
              <div className="mx-0.5 h-6 w-px bg-slate-200" />
              <ToolBtn title="Undo (Ctrl+Z)" onClick={p.onUndo}>
                <Undo2 className="h-4 w-4 text-navy-deep" />
              </ToolBtn>
              <ToolBtn title="Redo (Ctrl+Y)" onClick={p.onRedo}>
                <Redo2 className="h-4 w-4 text-navy-deep" />
              </ToolBtn>
              <ToolBtn title="Clear canvas" onClick={p.onClear}>
                <Trash2 className="h-4 w-4 text-brand-red" />
              </ToolBtn>
              <div className="mx-0.5 h-6 w-px bg-slate-200" />
              <ToolBtn
                title={pinned ? "Unpin toolbar" : "Pin toolbar open"}
                active={pinned}
                onClick={() => setPinned((v) => !v)}
              >
                {pinned ? (
                  <PinOff className="h-4 w-4 text-navy-deep" />
                ) : (
                  <Pin className="h-4 w-4 text-navy-deep" />
                )}
              </ToolBtn>
              {!pinned && (
                <ToolBtn title="Close" onClick={() => setExpanded(false)}>
                  <span className="text-navy-deep text-xs font-black">×</span>
                </ToolBtn>
              )}
            </div>



            {/* Row 5: sliders */}
            <div className="flex items-center gap-3 px-1 pt-1">
              <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-navy-deep/70">
                Size
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={p.strokeWidth}
                  onChange={(e) => p.onStrokeWidth(Number(e.target.value))}
                  className="w-16 accent-[color:var(--gold)]"
                />
                <span className="tabular-nums text-navy-deep w-4">{p.strokeWidth}</span>
              </label>
              <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-navy-deep/70">
                Opacity
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={p.opacity}
                  onChange={(e) => p.onOpacity(Number(e.target.value))}
                  className="w-16 accent-[color:var(--gold)]"
                />
                <span className="tabular-nums text-navy-deep w-6">{p.opacity}%</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolBtn({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-8 w-8 flex items-center justify-center rounded-md transition ${
        active
          ? "bg-gold/25 ring-1 ring-gold"
          : "hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}
