import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Flag, Search, Timer } from "lucide-react";
import { MathContent } from "@/components/chs/MathContent";
import { Empty } from "@/components/app/Primitives";
import { mockTestById } from "@/data/exams";
import { saveAttempt, testQuestions, type Attempt, type Response } from "@/lib/app/attempts";

export const Route = createFileRoute("/app/mock-test/$testId")({
  head: () => ({
    meta: [
      { title: "Mock Test — CHS Academy" },
      {
        name: "description",
        content: "Timed mock-test interface with question palette, marking for review and negative marking.",
      },
      { property: "og:title", content: "Mock Test — CHS Academy" },
      { property: "og:description", content: "Attempt a timed competitive-exam mock test on CHS Academy." },
    ],
  }),
  component: RunnerPage,
});

function RunnerPage() {
  const { testId } = Route.useParams();
  const navigate = useNavigate();
  const test = mockTestById(testId);
  const qs = useMemo(() => (test ? testQuestions(test) : []), [test]);

  const [idx, setIdx] = useState(0);
  const [responses, setResponses] = useState<Record<number, Response>>({});
  const [elapsed, setElapsed] = useState(0);
  const [query, setQuery] = useState("");
  const startedAt = useRef(Date.now());
  const attemptId = useRef(`att_${Date.now()}`);

  useEffect(() => {
    const t = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  if (!test) {
    return <Empty>Unknown test. Pick one from Mock Tests.</Empty>;
  }
  if (qs.length === 0) {
    return (
      <Empty>
        This paper has no questions yet — add them to <code>src/data/questions.ts</code>.
      </Empty>
    );
  }

  const q = qs[Math.min(idx, qs.length - 1)];
  const totalSec = test.durationMin * 60;
  const remaining = Math.max(0, totalSec - elapsed);

  const setSelected = (n: number) =>
    setResponses((r) => ({ ...r, [q.questionNo]: { ...r[q.questionNo], selected: n } }));
  const toggleMark = () =>
    setResponses((r) => ({
      ...r,
      [q.questionNo]: {
        selected: r[q.questionNo]?.selected ?? null,
        marked: !r[q.questionNo]?.marked,
      },
    }));

  const submit = () => {
    const attempt: Attempt = {
      id: attemptId.current,
      testId: test.id,
      startedAt: startedAt.current,
      submittedAt: Date.now(),
      responses,
      timeTakenSec: elapsed,
    };
    saveAttempt(attempt);
    navigate({ to: "/app/results/$attemptId", params: { attemptId: attempt.id } });
  };

  const shown = qs.filter((x) => !query.trim() || String(x.questionNo).includes(query.trim()));

  return (
    <div className="mx-auto max-w-6xl">
      {/* Exam header — one authoritative timer */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/25 bg-navy-panel/70 px-4 py-2.5">
        <div>
          <div className="font-display text-[15px] font-bold tracking-wide text-gold">
            {test.paper}
          </div>
          <div className="font-sans text-[10px] text-white/50">
            {test.name} · {qs.length} of {test.totalQuestions} loaded ·{" "}
            {test.totalQuestions * test.marksPerQuestion} marks · −{test.negativeMarks} per wrong
            answer
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-sans text-[13px] font-bold tabular-nums ${
              remaining < 60 ? "border-brand-red/60 text-brand-red" : "border-gold/40 text-gold"
            }`}
          >
            <Timer className="h-3.5 w-3.5" /> {fmt(remaining)}
          </span>
          <button
            onClick={submit}
            className="rounded-md bg-brand-red px-3 py-1.5 font-sans text-[10px] font-black uppercase tracking-widest text-white transition hover:brightness-110"
          >
            Submit Test
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <section className="rounded-xl border border-white/10 bg-navy-panel/70 p-5">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
              Question {q.questionNo} · {q.topic}
            </span>
            <button
              onClick={toggleMark}
              className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 font-sans text-[9px] font-black uppercase tracking-widest transition ${
                responses[q.questionNo]?.marked
                  ? "border-gold bg-gold text-navy-deep"
                  : "border-white/20 text-white/60 hover:text-gold"
              }`}
            >
              <Flag className="h-3 w-3" /> Mark for review
            </button>
          </div>

          <MathContent
            text={q.question}
            className="mt-3 font-serif text-[17px] leading-relaxed text-white"
          />

          <ul className="mt-4 space-y-2">
            {q.options.map((opt, i) => {
              const selected = responses[q.questionNo]?.selected === i;
              return (
                <li key={i}>
                  <button
                    onClick={() => setSelected(i)}
                    aria-pressed={selected}
                    className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition ${
                      selected
                        ? "border-gold bg-gold/10"
                        : "border-white/12 hover:border-gold/50 hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-sans text-[10px] font-black ${
                        selected ? "border-gold bg-gold text-navy-deep" : "border-white/30 text-white/60"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <MathContent
                      as="span"
                      text={opt}
                      className="font-serif text-[15px] text-white/90"
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 font-sans text-[10px] font-black uppercase tracking-widest text-white/70 transition hover:text-gold disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <button
              onClick={() => setIdx((i) => Math.min(qs.length - 1, i + 1))}
              disabled={idx >= qs.length - 1}
              className="inline-flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 font-sans text-[10px] font-black uppercase tracking-widest text-navy-deep transition hover:brightness-110 disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        {/* Question palette — numbers only, scrollable for 100+ questions */}
        <aside className="flex max-h-[70vh] flex-col rounded-xl border border-white/10 bg-navy-panel/70 p-3">
          <label className="mb-2 flex items-center gap-1.5 rounded-md border border-white/15 px-2 py-1">
            <Search className="h-3.5 w-3.5 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              inputMode="numeric"
              placeholder="Jump to number"
              aria-label="Search question number"
              className="w-full bg-transparent font-sans text-[11px] text-white outline-none placeholder:text-white/35"
            />
          </label>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-5 gap-1.5">
              {shown.map((x) => {
                const r = responses[x.questionNo];
                const active = x.questionNo === q.questionNo;
                const tone = active
                  ? "border-gold bg-gold text-navy-deep"
                  : r?.marked
                    ? "border-gold/70 text-gold"
                    : r?.selected != null
                      ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
                      : "border-white/15 text-white/55";
                return (
                  <button
                    key={x.questionNo}
                    onClick={() => setIdx(qs.indexOf(x))}
                    aria-label={`Question ${x.questionNo}`}
                    className={`h-8 rounded border font-sans text-[11px] font-bold tabular-nums transition hover:brightness-125 ${tone}`}
                  >
                    {x.questionNo}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-2 space-y-1 border-t border-white/10 pt-2 font-sans text-[9px] uppercase tracking-widest text-white/40">
            <div>Answered · {Object.values(responses).filter((r) => r.selected != null).length}</div>
            <div>Marked · {Object.values(responses).filter((r) => r.marked).length}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:${String(
    s % 60,
  ).padStart(2, "0")}`;
}
