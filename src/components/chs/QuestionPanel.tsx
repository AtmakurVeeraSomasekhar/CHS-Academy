import { ChevronLeft, ChevronRight, Pencil, Star, BookOpen, FileText, Check, PanelLeftClose } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Question, Difficulty } from "@/data/questions";
import { MathContent } from "./MathContent";
import { QuestionContentBlocks } from "./QuestionContentBlocks";
import { QuestionPalette, type Attempt } from "./QuestionPalette";
import { useMotionDuration } from "@/hooks/useReducedMotionSafe";

export type PanelMode = "mcq" | "theory";

interface Props {
  q: Question;
  index: number;
  total: number;
  selected: number | null;
  isFavorite: boolean;
  attempts: Record<number, Attempt>;
  favoriteIds: number[];
  questions: Question[];
  mode: PanelMode;
  onModeChange: (m: PanelMode) => void;
  onSelect: (i: number) => void;
  onToggleFavorite: () => void;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
  onEditMeta: (patch: Partial<Question>) => void;
  onHideQuestion?: () => void;
}

const difficultyStyle: Record<Difficulty, { cls: string; dot: string; emoji: string }> = {
  Easy: {
    cls: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40",
    dot: "bg-emerald-500",
    emoji: "🟢",
  },
  Medium: {
    cls: "bg-[color:var(--gold)]/15 text-[color:var(--navy-deep)] border-[color:var(--gold)]/60",
    dot: "bg-yellow-500",
    emoji: "🟡",
  },
  Hard: {
    cls: "bg-red-500/15 text-red-700 border-red-500/40",
    dot: "bg-red-500",
    emoji: "🔴",
  },
};

export const QuestionPanel = forwardRef<HTMLDivElement, Props>(function QuestionPanel(props, ref) {
  const {
    q,
    index,
    total,
    selected,
    isFavorite,
    attempts,
    favoriteIds,
    questions,
    mode,
    onModeChange,
    onSelect,
    onToggleFavorite,
    onPrev,
    onNext,
    onJump,
    onEditMeta,
    onHideQuestion,
  } = props;

  const d = difficultyStyle[q.difficulty];
  const revealed = selected !== null;
  const dur = useMotionDuration(0.24);

  return (
    <section
      ref={ref}
      className="relative flex-1 min-w-0 bg-white text-navy-deep flex flex-col overflow-hidden"
    >
      {/* Top row: breadcrumb + star + mode + exam badge */}
      <div className="relative flex items-center justify-between px-6 pt-4 no-capture gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-navy-deep pl-3 pr-3 py-1 shadow-md font-sans">
            <span className="text-[11px] font-black tracking-widest text-white uppercase">
              Q{q.questionNo}
            </span>
            <span className="text-[10px] tracking-widest text-white/70">·</span>
            <span className="text-[11px] font-bold text-white/85">
              {index + 1} of {total}
            </span>
          </div>
          <button
            onClick={onToggleFavorite}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-slate-100 border border-slate-200 hover:bg-slate-200 transition"
            title={isFavorite ? "Remove favorite" : "Star this question"}
          >
            <Star
              className={`h-4 w-4 ${isFavorite ? "text-[color:var(--gold)]" : "text-slate-400"}`}
              fill={isFavorite ? "currentColor" : "none"}
            />
          </button>
          <ModeToggle mode={mode} onChange={onModeChange} />
        </div>
        <div className="inline-flex items-center gap-2">
          {onHideQuestion && (
            <button
              onClick={onHideQuestion}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 hover:bg-slate-200 px-2 py-1 text-[10px] font-black tracking-widest uppercase text-navy-deep transition"
              title="Hide question panel (Ctrl+H)"
            >
              <PanelLeftClose className="h-3.5 w-3.5" /> Hide
            </button>
          )}
          <div className="inline-flex items-center gap-2 rounded-full bg-navy-deep border border-gold/50 px-3 py-1.5 shadow-md">
            <span className="text-[12px] font-sans font-bold text-white tracking-wide">
              {q.exam}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="relative flex-1 overflow-y-auto px-8 pt-4 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode + q.questionNo}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: dur }}
          >
            <div className="text-[26px] leading-snug font-serif font-normal text-navy-deep">
              <MathContent text={q.question} />
            </div>

            <QuestionContentBlocks q={q} />

            {mode === "mcq" ? (
              <div className="mt-6 grid grid-cols-1 gap-3">
                {q.options.map((opt, i) => {
                  const isPicked = selected === i;
                  const isCorrect = revealed && q.answer === i;
                  const isWrong = revealed && isPicked && q.answer !== i;
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => onSelect(i)}
                      className={`text-left flex items-center gap-4 rounded-lg border px-5 py-3 shadow-sm transition font-sans ${
                        isCorrect
                          ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/40"
                          : isWrong
                            ? "bg-red-50 border-red-500 ring-2 ring-red-500/40"
                            : isPicked
                              ? "bg-[color:var(--gold)]/10 border-[color:var(--gold)] ring-2 ring-[color:var(--gold)]/40"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-deep text-gold font-black text-base">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-[20px] font-medium text-navy-deep">
                        <MathContent as="span" text={opt} />
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-6 text-navy-deep/80 text-[16px] leading-relaxed font-sans">
                <div className="text-[10px] font-black tracking-widest uppercase text-gold mb-2">
                  Theory Mode
                </div>
                Use the whiteboard to derive, prove, or explain this concept. No
                options are graded in theory mode — press{" "}
                <kbd className="font-mono text-xs bg-white border border-slate-300 rounded px-1.5 py-0.5">
                  Next
                </kbd>{" "}
                when finished.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom metadata + nav */}
      <div className="relative px-6 pb-4 pt-2 no-capture">
        <div className="rounded-xl bg-slate-100 border border-slate-200 px-4 py-2.5 flex items-center gap-6 shadow-sm font-sans">
          <Pencil className="h-5 w-5 text-navy-deep shrink-0" />
          <div className={`flex-1 grid ${mode === "theory" ? "grid-cols-2" : "grid-cols-3"} gap-4 text-sm min-w-0`}>
            <EditableMeta
              label="Topic"
              value={q.topic}
              onChange={(v) => onEditMeta({ topic: v })}
            />
            <EditableMeta
              label="Concept"
              value={q.concept}
              onChange={(v) => onEditMeta({ concept: v })}
            />
            {mode === "mcq" && (
              <DifficultySelect
                value={q.difficulty}
                onChange={(v) => onEditMeta({ difficulty: v })}
                style={d}
              />
            )}
          </div>
        </div>

        {mode === "mcq" && (
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={onPrev}
                className="inline-flex items-center gap-1 rounded-md bg-navy-deep px-3 py-2 text-white text-sm font-bold hover:bg-navy-deep/90 transition font-sans"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <QuestionPalette
                questions={questions}
                attempts={attempts}
                favorites={favoriteIds}
                currentIndex={index}
                onJump={onJump}
              />
              <button
                onClick={onNext}
                className="inline-flex items-center gap-1 rounded-md bg-navy-elevated px-3 py-2 text-white text-sm font-bold hover:brightness-110 transition font-sans"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {revealed && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: dur, type: "spring", bounce: 0.4 }}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black tracking-widest uppercase ${
                  q.answer === selected
                    ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/40"
                    : "bg-red-500/15 text-red-700 border border-red-500/40"
                }`}
              >
                {q.answer === selected ? "Correct" : "Wrong"}
              </motion.span>
            )}
          </div>
        )}
      </div>
    </section>
  );
});

function ModeToggle({
  mode,
  onChange,
}: {
  mode: PanelMode;
  onChange: (m: PanelMode) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 p-0.5">
      <button
        onClick={() => onChange("mcq")}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase transition ${
          mode === "mcq"
            ? "bg-navy-deep text-gold"
            : "text-navy-deep/70 hover:bg-slate-200"
        }`}
        title="MCQ mode"
      >
        <BookOpen className="h-3 w-3" /> MCQ
      </button>
      <button
        onClick={() => onChange("theory")}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase transition ${
          mode === "theory"
            ? "bg-navy-deep text-gold"
            : "text-navy-deep/70 hover:bg-slate-200"
        }`}
        title="Theory mode"
      >
        <FileText className="h-3 w-3" /> Theory
      </button>
    </div>
  );
}

function EditableMeta({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onChange(trimmed);
    else setDraft(value);
  };

  return (
    <div className="min-w-0">
      <span className="font-black tracking-widest text-navy-deep/70 uppercase text-[10px]">
        {label}
      </span>
      {editing ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(value);
                setEditing(false);
              }
            }}
            className="flex-1 min-w-0 bg-white border border-gold/60 rounded px-2 py-0.5 text-sm text-navy-deep outline-none focus:ring-2 focus:ring-gold/40"
          />
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              commit();
            }}
            className="h-6 w-6 flex items-center justify-center rounded bg-gold/20 hover:bg-gold/40 transition"
          >
            <Check className="h-3.5 w-3.5 text-navy-deep" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="block w-full text-left font-semibold text-navy-deep truncate hover:underline decoration-gold decoration-2 underline-offset-2"
          title="Click to edit"
        >
          {value}
        </button>
      )}
    </div>
  );
}

function DifficultySelect({
  value,
  onChange,
  style,
}: {
  value: Difficulty;
  onChange: (v: Difficulty) => void;
  style: { cls: string; dot: string; emoji: string };
}) {
  return (
    <div>
      <span className="font-black tracking-widest text-navy-deep/70 uppercase text-[10px]">
        Difficulty
      </span>
      <div>
        <div className="relative inline-block">
          <span
            className={`inline-flex items-center gap-1.5 mt-0.5 px-2 py-0.5 rounded-md border text-xs font-bold ${style.cls}`}
          >
            <span className={`h-2 w-2 rounded-full ${style.dot}`} />
            {style.emoji} {value}
          </span>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value as Difficulty)}
            className="absolute inset-0 opacity-0 cursor-pointer"
            title="Change difficulty"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>
    </div>
  );
}
