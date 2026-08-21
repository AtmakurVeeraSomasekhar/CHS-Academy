import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileUp,
  Grid3x3,
  ImagePlus,
  Loader2,
  Maximize2,
  Minimize2,
  
  NotebookPen,
  PanelRightClose,
  PanelRightOpen,
  Settings2,
  StickyNote,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { AnnotationCanvas } from "@/components/annotation/AnnotationCanvas";
import { useAnnotation } from "@/components/annotation/AnnotationProvider";
import { WhiteboardToolbar, type WBTool } from "@/components/chs/WhiteboardToolbar";
import { ImageLayer } from "@/components/theory/ImageLayer";
import { InfiniteNotes } from "@/components/theory/InfiniteNotes";
import { TheoryNav } from "@/components/theory/TheoryNav";
import { TheoryRenderer } from "@/components/theory/TheoryRenderer";
import { firstAuthored, resolveTheory, type TheorySelection } from "@/data/theory";
import { useTheoryCatalog } from "@/lib/theory/catalogStore";
import { toAnnoTool, toWBTool } from "@/lib/annotation/toolMap";
import { useMotionDuration } from "@/hooks/useReducedMotionSafe";

const PDFViewer = lazy(() =>
  import("@/components/pdf/PDFViewer").then((m) => ({ default: m.PDFViewer })),
);

type Source = "theory" | "pdf";
/** Notes board visibility: hidden, minimized strip, split, or full screen. */
type BoardState = "hidden" | "min" | "split" | "max";

const Group = ResizablePanelGroup as unknown as React.FC<{
  orientation: "horizontal" | "vertical";
  className?: string;
  children?: React.ReactNode;
}>;

/**
 * Theory Mode — fully independent of MCQ Mode. Navigation (Subjects → Topics →
 * Chapters) lives in the left ⋮ drawer, content comes from src/data/theory/*,
 * and the right side is an infinite explanation board. Secondary controls
 * (PDF, image, paper style) stay inside the right ⋮ menu.
 */
export function TheoryPanel() {
  const a = useAnnotation();
  const dur = useMotionDuration(0.25);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const catalog = useTheoryCatalog();
  const [selection, setSelection] = useState<TheorySelection | null>(null);
  const [source, setSource] = useState<Source>("theory");
  const [pdf, setPdf] = useState<{ file: File; id: string } | null>(null);
  const [board, setBoard] = useState<BoardState>("split");
  const [grid, setGrid] = useState(true);
  const [pendingImg, setPendingImg] = useState<{ src: string; token: number } | null>(null);

  // Default to the first chapter that actually has authored content.
  useEffect(() => {
    setSelection((prev) => prev ?? firstAuthored(catalog.subjects));
  }, [catalog.subjects]);

  const resolved = useMemo(
    () => resolveTheory(catalog.subjects, selection),
    [catalog.subjects, selection],
  );
  const trail = [resolved.subject?.title, resolved.topic?.title].filter(Boolean).join(" · ");

  const pickPdf = () => fileRef.current?.click();
  const onFile = (f: File | null) => {
    if (!f) return;
    setPdf({ file: f, id: `${f.name}:${f.size}` });
    setSource("pdf");
  };

  const onImage = (f: File | null) => {
    if (!f) return;
    setPendingImg({ src: URL.createObjectURL(f), token: Date.now() });
  };

  const annoProps = {
    tool: a.tool,
    color: a.color,
    width: a.width,
    opacity: a.opacity,
    annotate: a.annotateEverywhere,
    onFocusLayer: a.setFocusLayer,
  };

  const handleTool = (t: WBTool) => {
    a.setTool(toAnnoTool(t));
    if (toAnnoTool(t) !== "selection") a.setAnnotateEverywhere(true);
  };

  const contentLayer = `theory:${
    source === "pdf" && pdf ? pdf.id : (resolved.chapter?.id ?? "empty")
  }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur }}
      className="flex h-full min-h-0 flex-col"
    >
      {/* Minimal control strip: ⋮ navigator · current chapter · board controls */}
      <div className="no-capture flex items-center gap-2 border-b border-gold/40 bg-navy-deep/95 px-3 py-1.5">
        <TheoryNav
          subjects={catalog.subjects}
          selection={selection}
          onSelect={(s) => {
            setSelection(s);
            setSource("theory");
          }}
          onAddSubject={catalog.addSubject}
          onAddTopic={catalog.addTopic}
          onAddChapter={catalog.addChapter}
        />
        <div className="min-w-0">
          <div className="truncate font-sans text-[11px] font-black uppercase tracking-widest text-gold">
            {source === "pdf" && pdf
              ? pdf.file.name
              : (resolved.chapter?.title ?? "Select a chapter")}
          </div>
          {source !== "pdf" && trail && (
            <div className="truncate font-sans text-[9px] uppercase tracking-[0.2em] text-white/50">
              {trail}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <IconBtn
            active={a.annotateEverywhere}
            title="Write anywhere (Ctrl+Shift+A)"
            onClick={() => a.setAnnotateEverywhere(!a.annotateEverywhere)}
          >
            <NotebookPen className="h-4 w-4" />
          </IconBtn>
          <IconBtn
            title={board === "hidden" ? "Show board" : "Hide board"}
            onClick={() => setBoard(board === "hidden" ? "split" : "hidden")}
          >
            {board === "hidden" ? (
              <PanelRightOpen className="h-4 w-4" />
            ) : (
              <PanelRightClose className="h-4 w-4" />
            )}
          </IconBtn>
          <IconBtn
            title={board === "max" ? "Restore split" : "Maximize board"}
            onClick={() => setBoard(board === "max" ? "split" : "max")}
          >
            {board === "max" ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </IconBtn>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold/40 bg-navy-elevated text-gold transition hover:brightness-125"
                title="Theory settings"
                aria-label="Theory settings"
              >
                <Settings2 className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 border-gold/30 bg-navy-panel text-white"
            >
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gold">
                Source
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={source}
                onValueChange={(v) => {
                  if (v === "pdf" && !pdf) pickPdf();
                  else setSource(v as Source);
                }}
              >
                <DropdownMenuRadioItem value="theory">Chapter content</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="pdf">PDF document</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuItem onClick={pickPdf}>
                <FileUp className="mr-2 h-4 w-4" /> Load PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => imgRef.current?.click()}>
                <ImagePlus className="mr-2 h-4 w-4" /> Insert image
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-gold">
                Board
              </DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={grid} onCheckedChange={(v) => setGrid(!!v)}>
                {grid ? (
                  <Grid3x3 className="mr-2 h-4 w-4" />
                ) : (
                  <StickyNote className="mr-2 h-4 w-4" />
                )}
                Grid paper
              </DropdownMenuCheckboxItem>
              <DropdownMenuRadioGroup
                value={board}
                onValueChange={(v) => setBoard(v as BoardState)}
              >
                <DropdownMenuRadioItem value="hidden">Hidden</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="min">Minimized</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="split">Split</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="max">Maximized</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <Group orientation="horizontal" className="h-full">
          {board !== "max" && (
            <ResizablePanel
              id="theory-main"
              defaultSize={board === "split" ? "62%" : board === "min" ? "94%" : "100%"}
              minSize="25%"
            >
              <div className="relative h-full min-h-0">
                {source === "pdf" && pdf ? (
                  <Suspense
                    fallback={
                      <div className="flex h-full items-center justify-center gap-2 font-sans text-sm text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading PDF engine…
                      </div>
                    }
                  >
                    <PDFViewer
                      file={pdf.file}
                      docId={pdf.id}
                      tool={a.tool}
                      color={a.color}
                      width={a.width}
                      opacity={a.opacity}
                      annotate={a.annotateEverywhere}
                      onFocusLayer={a.setFocusLayer}
                    />
                  </Suspense>
                ) : (
                  <div className="relative h-full min-h-0 overflow-auto bg-white">
                    <div className="relative min-h-full">
                      {resolved.chapter ? (
                        <TheoryRenderer chapter={resolved.chapter} trail={trail} />
                      ) : (
                        <div className="p-8 text-center font-sans text-sm text-slate-500">
                          Open the ⋮ navigator to pick a subject, topic and chapter.
                        </div>
                      )}
                      {/* Layer 2: movable images, Layer 3: annotations */}
                      <ImageLayer
                        layerId={contentLayer}
                        pending={pendingImg}
                        locked={a.annotateEverywhere}
                      />
                      <AnnotationCanvas
                        layerId={contentLayer}
                        {...annoProps}
                        active={a.annotateEverywhere}
                      />
                    </div>
                  </div>
                )}

                {/* Shared floating toolbar (same component as the whiteboard) */}
                <div className="no-capture absolute bottom-3 left-3 z-40">
                  <WhiteboardToolbar
                    activeTool={toWBTool(a.tool)}
                    onTool={handleTool}
                    color={a.color}
                    onColor={a.setColor}
                    strokeWidth={a.width}
                    onStrokeWidth={a.setWidth}
                    opacity={a.opacity}
                    onOpacity={a.setOpacity}
                    onUndo={a.undo}
                    onRedo={a.redo}
                    onClear={a.clear}
                  />
                </div>
              </div>
            </ResizablePanel>
          )}

          <AnimatePresence>
            {board !== "hidden" && (
              <>
                {board !== "max" && (
                  <ResizableHandle
                    withHandle
                    className="no-capture w-1 bg-gold/40 transition hover:bg-gold/70"
                  />
                )}
                <ResizablePanel
                  id="theory-notes"
                  defaultSize={board === "split" ? "38%" : board === "min" ? "6%" : "100%"}
                  minSize="4%"
                >
                  <InfiniteNotes layerId="theory:notes" grid={grid} {...annoProps} />
                </ResizablePanel>
              </>
            )}
          </AnimatePresence>
        </Group>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <input
        ref={imgRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => onImage(e.target.files?.[0] ?? null)}
      />
    </motion.div>
  );
}

function IconBtn({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
        active
          ? "border-gold bg-gold text-navy-deep"
          : "border-gold/40 bg-navy-elevated text-gold hover:brightness-125"
      }`}
    >
      {children}
    </button>
  );
}
