import { Link, createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { DifficultyBadge, PageHeader, Panel } from "@/components/app/Primitives";
import { exams, mockTests } from "@/data/exams";

export const Route = createFileRoute("/app/mock-tests/")({
  head: () => ({
    meta: [
      { title: "Mock Tests — CHS Academy" },
      {
        name: "description",
        content:
          "Full-length and sectional mock tests for SSC CGL, CHSL, RRB NTPC, IBPS PO and UPSC with negative marking and timed papers.",
      },
      { property: "og:title", content: "Mock Tests — CHS Academy" },
      {
        property: "og:description",
        content: "Timed, exam-accurate mock tests with negative marking and instant analysis.",
      },
    ],
  }),
  component: MockTestsPage,
});

function MockTestsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Mock Tests" subtitle="Exam-accurate papers with negative marking" />
      <div className="space-y-4">
        {exams.map((exam) => {
          const tests = mockTests.filter((t) => t.examId === exam.id);
          if (tests.length === 0) return null;
          return (
            <Panel key={exam.id} title={`${exam.code} · ${exam.name}`}>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {tests.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col rounded-lg border border-white/10 bg-navy-elevated/50 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-sans text-[9px] font-black uppercase tracking-widest text-white/45">
                        {t.paper}
                      </span>
                      <DifficultyBadge value={t.difficulty} />
                    </div>
                    <h3 className="mt-1.5 font-serif text-[15px] text-white">{t.name}</h3>
                    <dl className="mt-2 grid grid-cols-2 gap-1 font-sans text-[10px] text-white/50">
                      <div>Questions: {t.totalQuestions}</div>
                      <div>Duration: {t.durationMin} min</div>
                      <div>Marks: {t.totalQuestions * t.marksPerQuestion}</div>
                      <div>Negative: −{t.negativeMarks}</div>
                      <div>Attempts: {t.attempts}</div>
                    </dl>
                    <Link
                      to="/app/mock-tests/$testId"
                      params={{ testId: t.id }}
                      className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-md bg-gold px-3 py-1.5 font-sans text-[10px] font-black uppercase tracking-widest text-navy-deep transition hover:brightness-110"
                    >
                      <Play className="h-3 w-3" /> Start Test
                    </Link>
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
