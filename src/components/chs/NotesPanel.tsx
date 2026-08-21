import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Square, Sparkles, Trash2, Loader2, X } from "lucide-react";
import { MathContent } from "./MathContent";
import { lovableGatewayProvider, type SpeechSession } from "@/lib/voice/provider";
import { parseSpokenMath, looksLikeMath } from "@/lib/voice/mathPhrase";
import { mathFallback, structureNotes, summarizeSession } from "@/lib/voice/ai.functions";

export interface NoteLine {
  id: string;
  /** Raw transcript for the line. May contain inline $...$ math after post. */
  text: string;
  ts: number;
}

export interface SessionSummary {
  summary: string;
  formulas: string[];
  tips: string[];
}

interface Props {
  active: boolean;
  onClose: () => void;
  questionKey: string | number;
  topic?: string;
  exam?: string;
  onNotesChange?: (lines: NoteLine[]) => void;
  onSummaryChange?: (s: SessionSummary | null) => void;
}

/**
 * Fixed notes panel. Owns the recording lifecycle so opening/closing the
 * panel starts/stops speech capture cleanly. Renders the live transcript
 * (with inline math converted where confident) and, on Stop, kicks off the
 * post-session summary + formula box.
 */
export function NotesPanel({
  active,
  onClose,
  questionKey,
  topic,
  exam,
  onNotesChange,
  onSummaryChange,
}: Props) {
  const [lines, setLines] = useState<NoteLine[]>([]);
  const [interim, setInterim] = useState<string>("");
  const [level, setLevel] = useState(0);
  const [recording, setRecording] = useState(false);
  const [structured, setStructured] = useState<string>("");
  const [structuring, setStructuring] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<SpeechSession | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const structureTimer = useRef<number | null>(null);

  // Reset when moving to a new question.
  useEffect(() => {
    setLines([]);
    setInterim("");
    setStructured("");
    setSummary(null);
    setError(null);
    onNotesChange?.([]);
    onSummaryChange?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionKey]);

  useEffect(() => {
    onNotesChange?.(lines);
  }, [lines, onNotesChange]);

  useEffect(() => {
    onSummaryChange?.(summary);
  }, [summary, onSummaryChange]);

  const start = useCallback(async () => {
    setError(null);
    try {
      const session = await lovableGatewayProvider.start({
        language: "en",
        onLevel: (l) => setLevel(l),
        onInterim: (p) => setInterim(p),
        onError: (e) => setError(e.message),
        onFinal: (seg) => {
          void appendSegment(seg.text);
        },
      });
      sessionRef.current = session;
      setRecording(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [/* stable via closures below */]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = useCallback(async () => {
    const s = sessionRef.current;
    sessionRef.current = null;
    setRecording(false);
    setInterim("");
    if (s) await s.stop();
  }, []);

  // Auto-start when opened, auto-stop when closed / unmounted.
  useEffect(() => {
    if (active && !sessionRef.current) void start();
    return () => {
      if (sessionRef.current) void sessionRef.current.stop();
      sessionRef.current = null;
      if (structureTimer.current) window.clearTimeout(structureTimer.current);
    };
  }, [active, start]);

  useEffect(() => {
    if (!active && sessionRef.current) void stop();
  }, [active, stop]);

  // Append a finalized STT segment, running spoken-math conversion first.
  const appendSegment = async (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;
    let rendered = text;
    if (looksLikeMath(text)) {
      const rule = parseSpokenMath(text);
      if (rule.latex) {
        rendered = `$${rule.latex}$`;
      } else {
        try {
          const { latex } = await mathFallback({ data: { phrase: text } });
          if (latex) rendered = `$${latex}$`;
        } catch {
          /* keep plain text */
        }
      }
    }
    setLines((prev) => {
      const next = [...prev, { id: crypto.randomUUID(), text: rendered, ts: Date.now() }];
      return next;
    });
    // Auto-scroll to newest line.
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
    // Debounced restructure (every ~4s of silence).
    if (structureTimer.current) window.clearTimeout(structureTimer.current);
    structureTimer.current = window.setTimeout(() => void runStructure(), 4000);
  };

  const runStructure = async () => {
    setStructuring(true);
    try {
      const transcript = lines
        .map((l) => l.text)
        .concat(interim ? [] : [])
        .join(" ");
      if (!transcript.trim()) return;
      const { markdown } = await structureNotes({ data: { transcript, topic } });
      setStructured(markdown);
    } catch {
      /* keep prior structured */
    } finally {
      setStructuring(false);
    }
  };

  const runSummary = async () => {
    setSummarizing(true);
    try {
      const transcript = lines.map((l) => l.text).join(" ");
      // Extract $...$ chunks as candidate formulas (dedup).
      const formulas = Array.from(
        new Set(
          lines.flatMap((l) => Array.from(l.text.matchAll(/\$([^$]+)\$/g), (m) => m[1].trim())),
        ),
      ).slice(0, 20);
      const res = await summarizeSession({
        data: { transcript, formulas, topic, exam },
      });
      setSummary(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSummarizing(false);
    }
  };

  const clear = () => {
    setLines([]);
    setStructured("");
    setSummary(null);
  };

  if (!active) return null;

  return (
    <section
      className="flex flex-col h-full min-h-0 bg-white border-t-2 border-gold/40"
      aria-label="Live voice notes"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-navy-deep text-white no-capture">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${
              recording ? "bg-brand-red animate-pulse" : "bg-slate-500"
            }`}
          >
            {recording ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
          </span>
          <span className="text-[11px] font-black tracking-widest uppercase text-gold">
            Voice Notes
          </span>
          {/* Level meter */}
          <div className="ml-2 h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gold transition-[width] duration-100"
              style={{ width: `${Math.min(100, Math.round(level * 300))}%` }}
            />
          </div>
          {structuring && (
            <span className="ml-2 text-[10px] text-white/60 inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> structuring…
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {recording ? (
            <button
              onClick={() => void stop()}
              className="px-2 py-1 rounded-md bg-brand-red text-white text-[11px] font-bold inline-flex items-center gap-1 hover:brightness-110"
            >
              <Square className="h-3 w-3" /> Stop
            </button>
          ) : (
            <button
              onClick={() => void start()}
              className="px-2 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-bold inline-flex items-center gap-1 hover:brightness-110"
            >
              <Mic className="h-3 w-3" /> Record
            </button>
          )}
          <button
            onClick={() => void runSummary()}
            disabled={lines.length === 0 || summarizing}
            className="px-2 py-1 rounded-md bg-gold text-navy-deep text-[11px] font-bold inline-flex items-center gap-1 disabled:opacity-50"
            title="Generate session summary"
          >
            {summarizing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Summary
          </button>
          <button
            onClick={clear}
            className="h-7 w-7 rounded-md hover:bg-white/10 inline-flex items-center justify-center"
            title="Clear notes"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-md hover:bg-white/10 inline-flex items-center justify-center"
            title="Close notes"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="px-3 py-1 text-[11px] text-brand-red bg-red-50 border-b border-red-200">
          {error}
        </div>
      )}

      {/* Notes body */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-auto px-4 py-3 space-y-3 text-navy-deep font-serif">
        {lines.length === 0 && !interim && (
          <p className="text-slate-400 text-sm italic font-sans">
            Start speaking — your explanation will appear here in real time.
          </p>
        )}
        {structured ? (
          <div className="prose prose-sm max-w-none">
            <MathContent text={structured} />
          </div>
        ) : (
          <ul className="space-y-1.5">
            {lines.map((l) => (
              <li key={l.id} className="leading-relaxed">
                <MathContent as="span" text={l.text} />
              </li>
            ))}
          </ul>
        )}
        {interim && (
          <p className="text-slate-400 italic text-sm font-sans">{interim}</p>
        )}

        {summary && (
          <div className="mt-4 rounded-xl border-2 border-gold/50 bg-gold/5 p-4 space-y-3">
            <h3 className="text-[11px] font-black tracking-widest uppercase text-navy-deep">
              Session Summary
            </h3>
            <MathContent text={summary.summary} className="text-sm leading-relaxed" />
            {summary.formulas.length > 0 && (
              <div>
                <div className="text-[10px] font-black tracking-widest uppercase text-navy-deep/70 mb-1">
                  Key Formulas
                </div>
                <div className="flex flex-wrap gap-2">
                  {summary.formulas.map((f, i) => (
                    <span
                      key={i}
                      className="inline-block rounded-lg bg-white border border-gold/40 px-3 py-1"
                    >
                      <MathContent as="span" text={`$${f}$`} />
                    </span>
                  ))}
                </div>
              </div>
            )}
            {summary.tips.length > 0 && (
              <div>
                <div className="text-[10px] font-black tracking-widest uppercase text-navy-deep/70 mb-1">
                  Exam Tips
                </div>
                <ul className="list-disc pl-5 text-sm space-y-1 font-sans">
                  {summary.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
