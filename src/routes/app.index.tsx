import { Link, createFileRoute } from "@tanstack/react-router";
import { Clock, FileQuestion, Play } from "lucide-react";
import { DifficultyBadge, Empty, Panel, PageHeader, Stat } from "@/components/app/Primitives";
import { currentAffairs, examById, mockTests } from "@/data/exams";
import { useStudentStats } from "@/lib/app/attempts";
import { useStreak } from "@/hooks/useStreak";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — CHS Academy" },
      {
        name: "description",
        content:
          "Track mock-test performance, accuracy and study streak across SSC, Railway, Banking and UPSC preparation on CHS Academy.",
      },
      { property: "og:title", content: "Student Dashboard — CHS Academy" },
      {
        property: "og:description",
        content: "Mock tests, accuracy analytics and study streak for competitive-exam preparation.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { testsTaken, avgScorePct, accuracy, scored } = useStudentStats();
  const streak = useStreak();

  const subjects = new Map<string, { total: number; correct: number }>();
  for (const s of scored) {
    for (const b of s.bySubject) {
      const g = subjects.get(b.subject) ?? { total: 0, correct: 0 };
      g.total += b.total;
      g.correct += b.correct;
      subjects.set(b.subject, g);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Dashboard" subtitle="Target exam · SSC CGL Tier-I" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Tests Taken" value={testsTaken} />
        <Stat label="Average Score" value={`${avgScorePct}%`} />
        <Stat label="Accuracy" value={`${accuracy}%`} />
        <Stat label="Study Streak" value={`${streak}d`} hint="Consecutive days" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Panel title="Available Mock Tests" className="lg:col-span-2">
          <ul className="space-y-2">
            {mockTests.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-navy-elevated/50 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-gold/15 px-1.5 py-0.5 font-sans text-[9px] font-black uppercase tracking-widest text-gold">
                      {examById(t.examId)?.code}
                    </span>
                    <DifficultyBadge value={t.difficulty} />
                  </div>
                  <div className="mt-1 truncate font-serif text-[14px] text-white">{t.name}</div>
                  <div className="font-sans text-[10px] text-white/45">
                    {t.paper} · {t.totalQuestions} Q · {t.durationMin} min ·{" "}
                    {t.totalQuestions * t.marksPerQuestion} marks · −{t.negativeMarks}/wrong ·{" "}
                    {t.attempts} attempts
                  </div>
                </div>
                <Link
                  to="/app/mock-tests/$testId"
                  params={{ testId: t.id }}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gold px-3 py-1.5 font-sans text-[10px] font-black uppercase tracking-widest text-navy-deep transition hover:brightness-110"
                >
                  <Play className="h-3 w-3" /> Start Test
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title="Subject Accuracy">
            {subjects.size === 0 ? (
              <Empty>Attempt a mock test to see subject-wise accuracy.</Empty>
            ) : (
              <ul className="space-y-2.5">
                {[...subjects.entries()].map(([subject, g]) => {
                  const pct = g.total ? Math.round((g.correct / g.total) * 100) : 0;
                  return (
                    <li key={subject}>
                      <div className="flex justify-between font-sans text-[11px] text-white/70">
                        <span>{subject}</span>
                        <span className="text-gold">{pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded bg-white/10">
                        <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Latest Current Affairs">
            {currentAffairs.length === 0 ? (
              <Empty>
                No articles yet — add entries to <code>src/data/exams.ts</code>.
              </Empty>
            ) : (
              <ul className="space-y-2">
                {currentAffairs.slice(0, 4).map((a) => (
                  <li key={a.id} className="font-serif text-[13px] text-white/80">
                    {a.title}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent Activity">
            {scored.length === 0 ? (
              <Empty>Your submitted tests will appear here.</Empty>
            ) : (
              <ul className="space-y-2">
                {scored.slice(0, 4).map((s) => (
                  <li
                    key={s.attempt.id}
                    className="flex items-center justify-between font-sans text-[11px] text-white/70"
                  >
                    <span className="truncate">{s.test.name}</span>
                    <span className="flex items-center gap-1 text-gold">
                      <FileQuestion className="h-3 w-3" /> {s.score}/{s.maxScore}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Upcoming Live Classes">
            <Empty>
              <Clock className="mx-auto mb-1 h-4 w-4" />
              No sessions scheduled.
            </Empty>
          </Panel>
        </div>
      </div>
    </div>
  );
}
