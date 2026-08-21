import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { Grid3x3, StickyNote, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import {
  WhiteboardToolbar,
  type WBTool,
} from "@/components/chs/WhiteboardToolbar";
import { TextBoxLayer, type TextBox } from "@/components/chs/TextBoxLayer";
import { useCanvasShortcuts } from "@/hooks/useCanvasShortcuts";
import { useMotionDuration } from "@/hooks/useReducedMotionSafe";

type Board = "grid" | "blank";
type Excalidraw = typeof import("@excalidraw/excalidraw").Excalidraw;

interface Props {
  boardMode: Board;
  onBoardModeChange: (m: Board) => void;
  questionKey: string | number;
  onApiReady?: (api: ExcalidrawImperativeAPI | null) => void;
  onToggleSolutionCollapse?: () => void;
  solutionCollapsed?: boolean;
}

// Persisted scenes + text boxes across question navigations.
const boardStore = new Map<string | number, unknown>();
const textBoxStore = new Map<string | number, TextBox[]>();

const EXCALIDRAW_TOOLS: Record<string, string> = {
  selection: "selection",
  pen: "freedraw",
  pencil: "freedraw",
  marker: "freedraw",
  highlighter: "freedraw",
  eraser: "eraser",
  line: "line",
  dashed: "line",
  arrow: "arrow",
  rectangle: "rectangle",
  ellipse: "ellipse",
  triangle: "diamond",
  polygon: "diamond",
  text: "text",
};

export function Whiteboard({
  boardMode,
  onBoardModeChange,
  questionKey,
  onApiReady,
  onToggleSolutionCollapse,
  solutionCollapsed,
}: Props) {
  const [ExcalidrawComp, setExcalidrawComp] = useState<Excalidraw | null>(null);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [color, setColor] = useState<string>("#0B1A33");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(100);
  const [activeTool, setActiveTool] = useState<WBTool>("pen");
  const [textPlacement, setTextPlacement] = useState(false);
  const [boxes, setBoxes] = useState<TextBox[]>(
    () => textBoxStore.get(questionKey) ?? [],
  );
  const dur = useMotionDuration(0.28);

  // Client-only dynamic import — Excalidraw touches `window` on load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("@excalidraw/excalidraw");
      await import("@excalidraw/excalidraw/index.css");
      if (!cancelled) setExcalidrawComp(() => mod.Excalidraw);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Restore scene + textboxes when question changes
  useEffect(() => {
    const api = apiRef.current;
    if (api) {
      const saved = boardStore.get(questionKey);
      api.updateScene({
        elements: (saved as never) ?? [],
        appState: { gridSize: boardMode === "grid" ? 20 : null } as never,
      });
    }
    setBoxes(textBoxStore.get(questionKey) ?? []);
  }, [questionKey, boardMode]);

  // Persist scene + boxes
  useEffect(() => {
    const id = window.setInterval(() => {
      const api = apiRef.current;
      if (api) boardStore.set(questionKey, api.getSceneElements());
      textBoxStore.set(questionKey, boxes);
    }, 1500);
    return () => clearInterval(id);
  }, [questionKey, boxes]);

  const applyToolToExcalidraw = (t: WBTool) => {
    const mapped = EXCALIDRAW_TOOLS[t] as
      | "selection"
      | "freedraw"
      | "eraser"
      | "rectangle"
      | "ellipse"
      | "arrow"
      | "line"
      | "text"
      | "diamond"
      | undefined;
    if (!mapped) return;
    apiRef.current?.setActiveTool({ type: mapped });

    // Configure stroke behavior per tool
    const app: Record<string, unknown> = {
      currentItemStrokeColor: color,
      currentItemStrokeWidth: strokeWidth,
      currentItemOpacity: opacity,
      currentItemStrokeStyle: "solid",
      currentItemRoughness: 0,
    };
    if (t === "highlighter") {
      app.currentItemStrokeWidth = Math.max(6, strokeWidth * 3);
      app.currentItemOpacity = 30;
    }
    if (t === "marker") {
      app.currentItemStrokeWidth = Math.max(4, strokeWidth * 2);
      app.currentItemOpacity = 90;
    }
    if (t === "pencil") {
      app.currentItemRoughness = 1;
    }
    if (t === "dashed") {
      app.currentItemStrokeStyle = "dashed";
    }
    apiRef.current?.updateScene({ appState: app as never });
  };

  const handleTool = (t: WBTool) => {
    setActiveTool(t);
    if (t === "textbox") {
      setTextPlacement(true);
      return;
    }
    setTextPlacement(false);
    applyToolToExcalidraw(t);
  };

  const setStroke = (c: string) => {
    setColor(c);
    apiRef.current?.updateScene({
      appState: { currentItemStrokeColor: c } as never,
    });
  };

  const setSize = (n: number) => {
    setStrokeWidth(n);
    apiRef.current?.updateScene({
      appState: { currentItemStrokeWidth: n } as never,
    });
  };

  const setOpa = (n: number) => {
    setOpacity(n);
    apiRef.current?.updateScene({
      appState: { currentItemOpacity: n } as never,
    });
  };

  const setZoom = (delta: number) => {
    const api = apiRef.current;
    if (!api) return;
    const cur = api.getAppState().zoom.value;
    const next = Math.min(2, Math.max(0.25, cur + delta));
    api.updateScene({ appState: { zoom: { value: next as never } } });
  };

  const clearBoard = () => {
    apiRef.current?.updateScene({ elements: [] });
    boardStore.delete(questionKey);
    setBoxes([]);
    textBoxStore.delete(questionKey);
  };

  const undo = () => {
    document.execCommand?.("undo");
    // Excalidraw exposes history via keyboard; simulate Ctrl+Z on its canvas.
    const canvas = document.querySelector<HTMLCanvasElement>(".excalidraw canvas");
    canvas?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true }),
    );
  };
  const redo = () => {
    const canvas = document.querySelector<HTMLCanvasElement>(".excalidraw canvas");
    canvas?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "y", ctrlKey: true, bubbles: true }),
    );
  };

  // Keyboard shortcuts (guarded by isTypingTarget internally)
  useCanvasShortcuts({
    p: () => handleTool("pen"),
    e: () => handleTool("eraser"),
    t: () => handleTool("textbox"),
    l: () => handleTool("line"),
    r: () => handleTool("rectangle"),
    c: () => handleTool("ellipse"),
    v: () => handleTool("selection"),
    "ctrl+z": (e) => {
      e.preventDefault();
      undo();
    },
    "ctrl+y": (e) => {
      e.preventDefault();
      redo();
    },
    delete: () => {
      apiRef.current?.setActiveTool({ type: "selection" });
    },
  });

  return (
    <motion.section
      layout
      transition={{ duration: dur }}
      className="relative flex-1 min-w-0 bg-white flex flex-col overflow-hidden border-l-2 border-gold/40"
    >
      {/* Top toolbar: Grid/Blank + zoom + expand toggle */}
      <div className="flex items-center justify-between gap-3 px-3 pt-2 no-capture">
        <div className="inline-flex rounded-lg bg-navy-elevated/90 border border-gold/30 p-0.5 font-sans">
          <ModeBtn
            active={boardMode === "grid"}
            onClick={() => onBoardModeChange("grid")}
            icon={<Grid3x3 className="h-3.5 w-3.5" />}
            label="Grid"
          />
          <ModeBtn
            active={boardMode === "blank"}
            onClick={() => onBoardModeChange("blank")}
            icon={<StickyNote className="h-3.5 w-3.5" />}
            label="Blank"
          />
        </div>
        <div className="flex items-center gap-2">
          {onToggleSolutionCollapse && (
            <button
              onClick={onToggleSolutionCollapse}
              className="inline-flex items-center gap-1 rounded-lg bg-navy-deep text-gold border border-gold/40 px-2 py-1 text-[10px] font-black tracking-widest uppercase hover:brightness-110 transition"
              title={
                solutionCollapsed
                  ? "Show question panel"
                  : "Focus solution workspace"
              }
            >
              <Maximize2 className="h-3.5 w-3.5" />
              {solutionCollapsed ? "Show Question" : "Focus Solution"}
            </button>
          )}
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-1 py-0.5">
            <button
              className="h-7 w-7 rounded hover:bg-slate-200"
              onClick={() => setZoom(-0.25)}
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4 mx-auto text-navy-deep" />
            </button>
            <button
              className="h-7 w-7 rounded hover:bg-slate-200"
              onClick={() => setZoom(0.25)}
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4 mx-auto text-navy-deep" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas + overlays */}
      <div className="relative flex-1 mx-2 mb-2 mt-1 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        {ExcalidrawComp ? (
          <ExcalidrawComp
            excalidrawAPI={(api: ExcalidrawImperativeAPI) => {
              apiRef.current = api;
              onApiReady?.(api);
              const saved = boardStore.get(questionKey);
              api.updateScene({
                elements: (saved as never) ?? [],
                appState: {
                  gridSize: boardMode === "grid" ? 20 : null,
                  currentItemStrokeColor: color,
                  viewBackgroundColor: "#FFFFFF",
                } as never,
              });
            }}
            initialData={{
              appState: {
                gridSize: boardMode === "grid" ? 20 : null,
                viewBackgroundColor: "#FFFFFF",
                currentItemStrokeColor: color,
              } as never,
            }}
            UIOptions={{
              canvasActions: {
                changeViewBackgroundColor: false,
                saveToActiveFile: false,
                loadScene: false,
                export: false,
                clearCanvas: false,
                toggleTheme: false,
              },
              welcomeScreen: false,
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm font-sans">
            Loading whiteboard…
          </div>
        )}

        {/* Text-box overlay */}
        <TextBoxLayer
          active={textPlacement}
          onExitPlacement={() => setTextPlacement(false)}
          boxes={boxes}
          onChange={setBoxes}
        />

        {/* Floating toolbar */}
        <div className="absolute top-3 left-3 no-capture z-30">
          <WhiteboardToolbar
            activeTool={activeTool}
            onTool={handleTool}
            color={color}
            onColor={setStroke}
            strokeWidth={strokeWidth}
            onStrokeWidth={setSize}
            opacity={opacity}
            onOpacity={setOpa}
            onUndo={undo}
            onRedo={redo}
            onClear={clearBoard}
          />
        </div>
      </div>
    </motion.section>
  );
}

function ModeBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black tracking-widest uppercase transition ${
        active ? "bg-gold text-navy-deep" : "text-white/80 hover:bg-white/10"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
