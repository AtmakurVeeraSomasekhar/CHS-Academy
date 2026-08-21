import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Empty, PageHeader, Panel, Stat } from "@/components/app/Primitives";
import { attemptById, score, type Scored } from "@/lib/app/attempts";

export const Route = createFileRoute("/app/results/$attemptId")({
  head: () => ({
    meta: [
      { title: "Test Result — CHS Academy" },
      {
        name: "description",
        content: "Detailed mock-test result with score, accuracy, penalty and section-wise performance.",
      },
      { property: "og:title", content: "Test Result — CHS Academy" },
      { property: "og:description", content: "Score breakdown, penalty and subject performance for your attempt." },
    ],
  }),
  component: ResultDetailPage,
});

function ResultDetailPage() {
  const { attemptId } = Route.useParams();
  const [s, setS] = useState<Scored | null>(null);

  // Attempts live in localStorage, so resolve after hydration.
  useEffect(() => {
    const a = attemptById(attemptId);
    setS(a ? score(a) : null);
  }, [attemptId]);

  if (!s) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Test Result" />
        <Empty>Result not found on this device.</Empty>
      </div>
    );
  }

  const mins = Math.round((s.attempt.timeTakenSec ?? 0) / 60);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={s.test.name}
        subtitle={`${s.test.paper} · submitted ${new Date(s.attempt.submittedAt ?? 0).toLocaleString()}`}
        actions={
          <>
            <Link
              to="/app/review"
              search={{ attempt: s.attempt.id }}
              className="rounded-md border border-gold/40 px-3 py-1.5 font-sans text-[10px] font-black uppercase tracking-widest text-gold transition hover:bg-gold/10"
            >
              Review Answers
            </Link>
            <Link
              to="/app/mock-tests/$testId"
              params={{ testId: s.test.id }}
              className="rounded-md bg-gold px-3 py-1.5 font-sans text-[10px] font-black uppercase tracking-widest text-navy-deep transition hover:brightness-110"
            >
              Reattempt
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Overall Score" value={`${s.score}/${s.maxScore}`} />
        <Stat label="Accuracy" value={`${s.accuracy}%`} />
        <Stat label="Time Taken" value={`${mins}m`} />
        <Stat label="Penalty" value={`−${s.penalty}`} hint={`${s.test.negativeMarks} per wrong`} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Correct" value={s.correct} />
        <Stat label="Wrong" value={s.wrong} />
        <Stat label="Skipped" value={s.skipped} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel title="Subject Performance">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.bySubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--navy-panel)",
                    border: "1px solid rgba(212,175,55,0.4)",
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="accuracy" fill="var(--gold)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Section Breakdown">
          <ul className="divide-y divide-white/10">
            {s.bySubject.map((b) => (
              <li
                key={b.subject}
                className="flex items-center justify-between py-2 font-sans text-[12px] text-white/70"
              >
                <span>{b.subject}</span>
                <span>
                  {b.correct}/{b.total}{" "}
                  <span className="ml-2 text-gold">{b.accuracy}%</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
