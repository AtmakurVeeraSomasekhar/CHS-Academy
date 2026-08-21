import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { MathContent } from "@/components/chs/MathContent";
import { Empty, PageHeader, Panel } from "@/components/app/Primitives";
import { attemptById, listAttempts, score, type Scored } from "@/lib/app/attempts";

export const Route = createFileRoute("/app/review")({
  validateSearch: (search: Record<string, unknown>) => ({
    attempt: typeof search.attempt === "string" ? search.attempt : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Answer Review — CHS Academy" },
      {
        name: "description",
        content: "Question-by-question answer review with correct options and worked solutions.",
      },
      { property: "og:title", content: "Answer Review — CHS Academy" },
      { property: "og:description", content: "Compare your responses against correct answers question by question." },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const { attempt } = Route.useSearch();
  const [s, setS] = useState<Scored | null>(null);

  useEffect(() => {
    const id = attempt ?? listAttempts().find((a) => a.submittedAt)?.id;
    const a = id ? attemptById(id) : undefined;
    setS(a ? score(a) : null);
  }, [attempt]);

  if (!s) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Answer Review" />
        <Empty>
          Nothing to review yet.{" "}
          <Link to="/app/mock-tests" className="text-gold underline">
            Attempt a mock test
          </Link>
          .
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Answer Review" subtitle={`${s.test.paper} · ${s.test.name}`} />
      <div className="space-y-3">
        {s.items.map(({ q, selected, correct }) => (
          <Panel key={q.questionNo}>
            <div className="flex items-center justify-between">
              <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-white/45">
                Q{q.questionNo} · {q.topic} · {q.concept}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-sans text-[9px] font-black uppercase tracking-widest ${
                  selected === null
                    ? "border-white/25 text-white/50"
                    : correct
                      ? "border-emerald-400/50 text-emerald-300"
                      : "border-brand-red/50 text-brand-red"
                }`}
              >
                {selected === null ? "Skipped" : correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {selected === null ? "" : correct ? "Correct" : "Wrong"}
              </span>
            </div>

            <MathContent
              text={q.question}
              className="mt-2 font-serif text-[15px] leading-relaxed text-white"
            />

            <ul className="mt-3 space-y-1.5">
              {q.options.map((opt, i) => {
                const isAnswer = q.answer === i;
                const isPicked = selected === i;
                return (
                  <li
                    key={i}
                    className={`flex items-start gap-2 rounded-md border px-2.5 py-1.5 ${
                      isAnswer
                        ? "border-emerald-400/50 bg-emerald-400/10"
                        : isPicked
                          ? "border-brand-red/50 bg-brand-red/10"
                          : "border-white/10"
                    }`}
                  >
                    <span className="font-sans text-[10px] font-black text-white/50">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <MathContent as="span" text={opt} className="font-serif text-[14px] text-white/85" />
                    {isPicked && (
                      <span className="ml-auto font-sans text-[9px] uppercase tracking-widest text-white/45">
                        your answer
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>
        ))}
      </div>
    </div>
  );
}
