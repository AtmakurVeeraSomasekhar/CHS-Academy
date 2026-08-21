import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftOpen } from "lucide-react";
import { usePanelRef, type PanelSize } from "react-resizable-panels";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Header } from "@/components/chs/Header";
import { Footer } from "@/components/chs/Footer";
import { QuestionPanel, type PanelMode } from "@/components/chs/QuestionPanel";
import { ShortcutsDialog } from "@/components/chs/ShortcutsDialog";
import { Whiteboard } from "@/components/chs/Whiteboard";
import { OverflowMenu } from "@/components/chs/OverflowMenu";
import { ObsControl } from "@/components/chs/ObsControl";
import { ModeSwitcher } from "@/components/chs/ModeSwitcher";
import {
  AnnotationProvider,
  useAnnotation,
} from "@/components/annotation/AnnotationProvider";
import { AnnotationCanvas } from "@/components/annotation/AnnotationCanvas";
import { TheoryPanel } from "@/components/theory/TheoryPanel";
import type { StudioMode } from "@/lib/annotation/types.modes";
import { NotesPanel, type NoteLine, type SessionSummary } from "@/components/chs/NotesPanel";
import { questions as seedQuestions, type Question } from "@/data/questions";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { useFavorites } from "@/hooks/useFavorites";
import { useStreak } from "@/hooks/useStreak";
import { useMotionDuration } from "@/hooks/useReducedMotionSafe";
import type { Attempt } from "@/components/chs/QuestionPalette";
import {
  buildSessionPdf,
  captureRegionPng,
  downloadScreenshot,
  exportQuestionPdf,
  type CapturePreset,
} from "@/lib/exports";

export const Route = createFileRoute("/")({
  component: IndexRoute,
});

const GRID_TOPICS = new Set(["Geometry", "Coordinate Geometry", "Graph", "Mensuration"]);
const SPLIT_KEY = "chs.split.v2";
const BOARDMODE_KEY = "chs.boardmode";
const MODE_KEY = "chs.studiomode";
const DEFAULT_SPLIT = 35;

function readSavedSplit(): number {
  if (typeof window === "undefined") return DEFAULT_SPLIT;
  try {
    const v = Number(localStorage.getItem(SPLIT_KEY));
    return v > 10 && v < 90 ? v : DEFAULT_SPLIT;
  } catch {
    return DEFAULT_SPLIT;
  }
}

function IndexRoute() {
  return (
    <AnnotationProvider>
      <Index />
    </AnnotationProvider>
  );
}

function Index() {
  const anno = useAnnotation();
  const [mode, setMode] = useState<StudioMode>("mcq");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY);
      if (saved === "theory" || saved === "mcq") setMode(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const changeMode = useCallback((m: StudioMode) => {
    setMode(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

  const [items, setItems] = useState<Question[]>(seedQuestions);
  const [i, setI] = useState(0);
  const total = items.length;

  const [selected, setSelected] = useState<number | null>(null);
  const [boardMode, setBoardMode] = useState<"grid" | "blank">("blank");
  const [attempts, setAttempts] = useState<Record<number, Attempt>>({});
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [showObs, setShowObs] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [, setVoiceLines] = useState<NoteLine[]>([]);
  const [, setVoiceSummary] = useState<SessionSummary | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("mcq");
  const [solutionCollapsed, setSolutionCollapsed] = useState(false);
  const [questionHidden, setQuestionHidden] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const captureRef = useRef<HTMLDivElement>(null);
  const qPanelRef = usePanelRef();
  const savedSplitRef = useRef<number>(readSavedSplit());
  const timer = useSessionTimer(i, total);
  const favorites = useFavorites();
  const streak = useStreak();
  const fileRef = useRef<HTMLInputElement>(null);
  const dur = useMotionDuration(0.25);

  const q = items[i];

  const editMeta = (patch: Partial<Question>) => {
    setItems((arr) => {
      const next = arr.slice();
      next[i] = { ...next[i], ...patch };
      return next;
    });
  };

  useEffect(() => {
    setSelected(null);
    try {
      const overrides = JSON.parse(localStorage.getItem(BOARDMODE_KEY) ?? "{}") as Record<
        string,
        "grid" | "blank"
      >;
      const key = String(q.questionNo);
      if (overrides[key]) setBoardMode(overrides[key]);
      else setBoardMode(GRID_TOPICS.has(q.topic) ? "grid" : "blank");
    } catch {
      setBoardMode(GRID_TOPICS.has(q.topic) ? "grid" : "blank");
    }
  }, [i, q.topic, q.questionNo]);

  useEffect(() => {
    if (selected === null || q.answer === undefined) return;
    setAttempts((prev) => ({
      ...prev,
      [q.questionNo]: q.answer === selected ? "correct" : "wrong",
    }));
  }, [selected, q.answer, q.questionNo]);

  const persistBoardMode = (m: "grid" | "blank") => {
    setBoardMode(m);
    try {
      const overrides = JSON.parse(localStorage.getItem(BOARDMODE_KEY) ?? "{}") as Record<
        string,
        string
      >;
      overrides[String(q.questionNo)] = m;
      localStorage.setItem(BOARDMODE_KEY, JSON.stringify(overrides));
    } catch {
      /* ignore */
    }
  };

  const next = useCallback(async () => {
    if (captureRef.current) {
      try {
        const shot = await captureRegionPng(captureRef.current);
        setSnapshots((s) => [...s, shot]);
      } catch {
        /* ignore */
      }
    }
    setI((n) => (n + 1) % total);
  }, [total]);

  const prev = useCallback(() => setI((n) => (n - 1 + total) % total), [total]);

  const toggleFs = useCallback(() => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(e.target.tagName))
        return;
      if (e.key.toLowerCase() === "a" && e.shiftKey && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        anno.setAnnotateEverywhere(!anno.annotateEverywhere);
        return;
      }
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();

      else if (e.key === "F11") {
        e.preventDefault();
        toggleFs();
      } else if (e.key === "h" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setQuestionHidden((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, toggleFs, anno]);

  const handleUploadImage = (dataUrl: string) => {
    setItems((arr) => {
      const nextArr = arr.slice();
      nextArr[i] = { ...nextArr[i], type: "image", imageUrl: dataUrl };
      return nextArr;
    });
  };

  const onPickFile = () => fileRef.current?.click();
  const onFileChosen = (f: File | null) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => typeof r.result === "string" && handleUploadImage(r.result);
    r.readAsDataURL(f);
  };

  const handlePng = (preset: CapturePreset) => {
    if (captureRef.current) downloadScreenshot(captureRef.current, preset);
  };
  const handleQuestionPdf = () => {
    if (captureRef.current) exportQuestionPdf(captureRef.current);
  };
  const handleSessionPdf = async () => {
    let finalShots = snapshots;
    if (captureRef.current) {
      try {
        finalShots = [...snapshots, await captureRegionPng(captureRef.current)];
      } catch {
        /* ignore */
      }
    }
    await buildSessionPdf({ snapshots: finalShots, totalSec: timer.sessionSec, streak });
  };
  const handleShare = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard?.writeText(window.location.href);
  };
  const handlePrint = () => window.print();
  const handleYoutube = () => window.open("https://youtube.com", "_blank");

  // Apply layout on mode / hide changes via the panel imperative API.
  useEffect(() => {
    const panel = qPanelRef.current;
    if (!panel) return;
    if (questionHidden) panel.collapse();
    else if (panelMode === "theory") panel.resize("25%");
    else panel.resize(`${savedSplitRef.current}%`);
  }, [panelMode, questionHidden, qPanelRef]);

  const onQuestionResize = useCallback(
    (size: PanelSize) => {
      if (questionHidden || panelMode === "theory") return;
      const s = size.asPercentage;
      if (s < 5 || s > 95) return;
      savedSplitRef.current = s;
      try {
        localStorage.setItem(SPLIT_KEY, String(s));
      } catch {
        /* ignore */
      }
    },
    [questionHidden, panelMode],
  );

  const resetSplit = () => {
    savedSplitRef.current = DEFAULT_SPLIT;
    try {
      localStorage.setItem(SPLIT_KEY, String(DEFAULT_SPLIT));
    } catch {
      /* ignore */
    }
    if (!questionHidden && panelMode !== "theory") {
      qPanelRef.current?.resize(`${DEFAULT_SPLIT}%`);
    }
  };

  const headerRight = useMemo(
    () => (
      <>
        <ModeSwitcher
          mode={mode}
          onMode={changeMode}
          annotate={anno.annotateEverywhere}
          onAnnotate={anno.setAnnotateEverywhere}
        />
        {showObs && <ObsControl />}
        <OverflowMenu
          onPng={handlePng}
          onQuestionPdf={handleQuestionPdf}
          onSessionPdf={handleSessionPdf}
          onUploadImage={onPickFile}
          onShare={handleShare}
          onPrint={handlePrint}
          onFullscreen={toggleFs}
          onFavorites={() => {}}
          onObs={() => setShowObs((v) => !v)}
          onYoutube={handleYoutube}
          onVoiceNotes={() => setVoiceOn((v) => !v)}
          onShortcuts={() => setShortcutsOpen(true)}
          voiceNotesActive={voiceOn}
        />
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showObs, snapshots, voiceOn, mode, changeMode, anno.annotateEverywhere],
  );


  // Cast Group to accept groupRef + onLayoutChanged (shadcn wrapper spreads all props).
  const Group = ResizablePanelGroup as unknown as React.FC<{
    orientation: "horizontal" | "vertical";
    className?: string;
    children?: React.ReactNode;
  }>;

  const initialSplit = savedSplitRef.current;

  return (
    <div className="h-screen w-screen flex flex-col bg-white text-navy-deep overflow-hidden font-sans">
      <Header rightExtra={headerRight} />
      <main className="flex-1 min-h-0">
        {mode === "theory" ? (
          <TheoryPanel />
        ) : (
        <div ref={captureRef} className="h-full">
          <Group orientation="horizontal" className="h-full">

            <ResizablePanel
              id="q"
              panelRef={qPanelRef}
              defaultSize={`${initialSplit}%`}
              minSize={questionHidden ? "0%" : panelMode === "theory" ? "20%" : "320px"}
              maxSize={questionHidden ? "0%" : "60%"}
              collapsible
              collapsedSize="0%"
              onResize={onQuestionResize}
            >
              <AnimatePresence mode="wait">
                {!questionHidden && (
                  <motion.div
                    key="qpanel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: dur }}
                    className="h-full flex relative"
                  >
                    <AnnotationCanvas
                      layerId={`q:${q.questionNo}`}
                      tool={anno.tool}
                      color={anno.color}
                      width={anno.width}
                      opacity={anno.opacity}
                      active={anno.annotateEverywhere}
                      onFocus={anno.setFocusLayer}
                    />
                    <QuestionPanel
                      q={q}
                      index={i}

                      total={total}
                      selected={selected}
                      isFavorite={favorites.has(q.questionNo)}
                      attempts={attempts}
                      favoriteIds={favorites.ids}
                      questions={items}
                      mode={panelMode}
                      onModeChange={setPanelMode}
                      onEditMeta={editMeta}
                      onSelect={setSelected}
                      onToggleFavorite={() => favorites.toggle(q.questionNo)}
                      onPrev={prev}
                      onNext={next}
                      onJump={(idx) => setI(idx)}
                      onHideQuestion={() => setQuestionHidden(true)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </ResizablePanel>
            <ResizableHandle
              withHandle
              onDoubleClick={resetSplit}
              className="bg-gold/40 hover:bg-gold/70 transition no-capture w-1"
            />
            <ResizablePanel id="s" defaultSize={`${100 - initialSplit}%`} minSize="40%">
              {voiceOn ? (
                <Group orientation="vertical" className="h-full">
                  <ResizablePanel id="wb" defaultSize={62} minSize={30}>
                    <div className="h-full flex relative">
                      {questionHidden && (
                        <ShowQuestionBtn onClick={() => setQuestionHidden(false)} />
                      )}
                      <Whiteboard
                        boardMode={boardMode}
                        onBoardModeChange={persistBoardMode}
                        questionKey={q.questionNo}
                        solutionCollapsed={solutionCollapsed}
                        onToggleSolutionCollapse={() => setSolutionCollapsed((v) => !v)}
                      />
                    </div>
                  </ResizablePanel>
                  <ResizableHandle
                    withHandle
                    className="bg-gold/40 hover:bg-gold/70 transition no-capture"
                  />
                  <ResizablePanel id="notes" defaultSize={38} minSize={20}>
                    <NotesPanel
                      active={voiceOn}
                      onClose={() => setVoiceOn(false)}
                      questionKey={q.questionNo}
                      topic={q.topic}
                      exam={q.exam}
                      onNotesChange={setVoiceLines}
                      onSummaryChange={setVoiceSummary}
                    />
                  </ResizablePanel>
                </Group>
              ) : (
                <div className="h-full flex relative">
                  {questionHidden && (
                    <ShowQuestionBtn onClick={() => setQuestionHidden(false)} />
                  )}
                  <Whiteboard
                    boardMode={boardMode}
                    onBoardModeChange={persistBoardMode}
                    questionKey={q.questionNo}
                    solutionCollapsed={solutionCollapsed}
                    onToggleSolutionCollapse={() => setSolutionCollapsed((v) => !v)}
                  />
                </div>
              )}
            </ResizablePanel>
          </Group>
        </div>
        )}
      </main>

      <Footer />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFileChosen(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

function ShowQuestionBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-3 left-3 z-40 inline-flex items-center gap-1.5 rounded-lg bg-navy-deep text-gold border border-gold/60 px-2.5 py-1.5 text-[11px] font-black tracking-widest uppercase shadow-lg hover:brightness-110 transition no-capture"
      title="Show question panel (Ctrl+H)"
    >
      <PanelLeftOpen className="h-4 w-4" />
      Show Question
    </button>
  );
}
