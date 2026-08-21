import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Maximize,
  Minus,
  MoveVertical,
  Plus,
  RotateCcw,
} from "lucide-react";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { AnnotationCanvas } from "@/components/annotation/AnnotationCanvas";
import type { AnnoTool } from "@/lib/annotation/types";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

interface Props {
  /** File object or object URL. */
  file: File | string;
  /** Stable id for this document, used to namespace annotation layers. */
  docId: string;
  tool: AnnoTool;
  color: string;
  width: number;
  opacity: number;
  annotate: boolean;
  onFocusLayer?: (id: string) => void;
}

type Fit = "width" | "page" | "custom";

/**
 * Continuous ("Google Docs style") PDF viewer built for 100+ page books.
 * Pages render lazily, and every page mounts its own annotation layer keyed by
 * `pdf:<docId>:<page>` so markup stays pinned to PDF coordinates across
 * scrolling, zooming and re-mounting.
 */
export function PDFViewer({
  file,
  docId,
  tool,
  color,
  width,
  opacity,
  annotate,
  onFocusLayer,
}: Props) {
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [fit, setFit] = useState<Fit>("width");
  const [pageWidth, setPageWidth] = useState(760);
  const [viewportH, setViewportH] = useState(900);
  const [current, setCurrent] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pageEls = useRef(new Map<number, HTMLDivElement>());

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      setPageWidth(Math.max(320, Math.min(1600, el.clientWidth - 48)));
      setViewportH(Math.max(400, el.clientHeight - 90));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  const onLoad = useCallback(({ numPages: n }: { numPages: number }) => setNumPages(n), []);

  // Fit modes translate into a render width; "page" trims to viewport height.
  const renderWidth = useMemo(() => {
    if (fit === "page") return Math.min(pageWidth, viewportH / 1.414);
    return pageWidth * scale;
  }, [fit, pageWidth, viewportH, scale]);

  const jump = (n: number) => {
    const page = Math.min(Math.max(1, n), numPages || 1);
    pageEls.current.get(page)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setCurrent(page);
  };

  const zoom = (d: number) => {
    setFit("custom");
    setScale((s) => Math.min(3, Math.max(0.5, +(s + d).toFixed(2))));
  };

  return (
    <div ref={wrapRef} className="relative flex h-full min-h-0 flex-col bg-slate-100">
      {/* Viewer chrome — icon-first, minimal */}
      <div className="no-capture flex items-center justify-between gap-2 border-b border-slate-200 bg-white/85 px-3 py-1.5 backdrop-blur">
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-1 py-0.5">
          <button
            className="h-7 w-7 rounded hover:bg-slate-200"
            title="Previous page"
            onClick={() => jump(current - 1)}
          >
            <ChevronUp className="mx-auto h-4 w-4 text-navy-deep" />
          </button>
          <input
            value={current}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/\D/g, ""));
              if (n) jump(n);
            }}
            className="w-9 rounded bg-white px-1 py-0.5 text-center font-sans text-[11px] font-bold tabular-nums text-navy-deep outline-none"
            title="Go to page"
          />
          <span className="font-sans text-[11px] font-bold tabular-nums text-navy-deep/60">
            / {numPages || "…"}
          </span>
          <button
            className="h-7 w-7 rounded hover:bg-slate-200"
            title="Next page"
            onClick={() => jump(current + 1)}
          >
            <ChevronDown className="mx-auto h-4 w-4 text-navy-deep" />
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-1 py-0.5">
          <button
            className={`h-7 w-7 rounded hover:bg-slate-200 ${fit === "width" ? "bg-gold/30" : ""}`}
            title="Fit width"
            onClick={() => {
              setFit("width");
              setScale(1);
            }}
          >
            <MoveVertical className="mx-auto h-4 w-4 rotate-90 text-navy-deep" />
          </button>
          <button
            className={`h-7 w-7 rounded hover:bg-slate-200 ${fit === "page" ? "bg-gold/30" : ""}`}
            title="Fit page"
            onClick={() => setFit("page")}
          >
            <Maximize className="mx-auto h-4 w-4 text-navy-deep" />
          </button>
          <div className="mx-0.5 h-5 w-px bg-slate-300" />
          <button className="h-7 w-7 rounded hover:bg-slate-200" title="Zoom out" onClick={() => zoom(-0.15)}>
            <Minus className="mx-auto h-4 w-4 text-navy-deep" />
          </button>
          <span className="w-10 text-center font-sans text-[11px] font-bold tabular-nums text-navy-deep">
            {Math.round((fit === "page" ? renderWidth / pageWidth : scale) * 100)}%
          </span>
          <button className="h-7 w-7 rounded hover:bg-slate-200" title="Zoom in" onClick={() => zoom(0.15)}>
            <Plus className="mx-auto h-4 w-4 text-navy-deep" />
          </button>
          <button
            className="h-7 w-7 rounded hover:bg-slate-200"
            title="Reset zoom"
            onClick={() => {
              setFit("width");
              setScale(1);
            }}
          >
            <RotateCcw className="mx-auto h-3.5 w-3.5 text-navy-deep" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto overscroll-contain px-6 py-4">
        <Document
          file={file}
          onLoadSuccess={onLoad}
          loading={
            <div className="flex items-center justify-center gap-2 py-16 font-sans text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Rendering PDF…
            </div>
          }
          error={
            <div className="py-16 text-center font-sans text-sm text-brand-red">
              Could not open this PDF.
            </div>
          }
          className="mx-auto flex w-fit flex-col items-center gap-5"
        >
          {Array.from({ length: numPages }, (_, i) => (
            <LazyPage
              key={i}
              pageNumber={i + 1}
              renderWidth={renderWidth}
              layerId={`pdf:${docId}:${i + 1}`}
              tool={tool}
              color={color}
              width={width}
              opacity={opacity}
              annotate={annotate}
              onFocusLayer={onFocusLayer}
              root={scrollRef}
              onVisible={setCurrent}
              register={(n, el) => {
                if (el) pageEls.current.set(n, el);
                else pageEls.current.delete(n);
              }}
            />
          ))}
        </Document>
      </div>
    </div>
  );
}

/** Renders the heavy <Page> only when near the viewport — keeps 300+ page books smooth. */
function LazyPage({
  pageNumber,
  renderWidth,
  layerId,
  tool,
  color,
  width,
  opacity,
  annotate,
  onFocusLayer,
  root,
  onVisible,
  register,
}: {
  pageNumber: number;
  renderWidth: number;
  layerId: string;
  tool: AnnoTool;
  color: string;
  width: number;
  opacity: number;
  annotate: boolean;
  onFocusLayer?: (id: string) => void;
  root: React.RefObject<HTMLDivElement | null>;
  onVisible: (n: number) => void;
  register: (n: number, el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(pageNumber <= 3);

  useEffect(() => {
    const el = ref.current;
    register(pageNumber, el);
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setVisible(e.isIntersecting)),
      { root: root.current ?? null, rootMargin: "1400px 0px" },
    );
    io.observe(el);
    const active = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) onVisible(pageNumber);
        }),
      { root: root.current ?? null, threshold: 0.5 },
    );
    active.observe(el);
    return () => {
      io.disconnect();
      active.disconnect();
      register(pageNumber, null);
    };
  }, [root, pageNumber, onVisible, register]);

  return (
    <div
      ref={ref}
      className="relative bg-white shadow-lg ring-1 ring-slate-300"
      style={{ width: renderWidth, minHeight: renderWidth * 1.35 }}
    >
      {visible ? (
        <Page
          pageNumber={pageNumber}
          width={renderWidth}
          renderTextLayer
          renderAnnotationLayer={false}
        />
      ) : (
        <div className="flex h-full min-h-[inherit] items-center justify-center font-sans text-xs text-slate-400">
          Page {pageNumber}
        </div>
      )}
      {/* Layer 3: annotations, pinned to this page's coordinate space */}
      <AnnotationCanvas
        layerId={layerId}
        tool={tool}
        color={color}
        width={width}
        opacity={opacity}
        active={annotate}
        onFocus={onFocusLayer}
      />
      <span className="pointer-events-none absolute bottom-1 right-2 font-sans text-[10px] font-bold text-slate-400">
        {pageNumber}
      </span>
    </div>
  );
}
