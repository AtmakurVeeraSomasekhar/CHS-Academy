import { Link, createFileRoute } from "@tanstack/react-router";
import { Empty, PageHeader, Panel } from "@/components/app/Primitives";
import { score, useAttempts } from "@/lib/app/attempts";

export const Route = createFileRoute("/app/results/")({
  head: () => ({
    meta: [
      { title: "My Results — CHS Academy" },
      {
        name: "description",
        content: "Score, accuracy and time analysis for every mock test you have submitted on CHS Academy.",
      },
      { property: "og:title", content: "My Results — CHS Academy" },
      { property: "og:description", content: "Review scores, accuracy and section performance across attempts." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { attempts } = useAttempts();
  const rows = attempts.filter((a) => a.submittedAt).map(score);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="My Results" subtitle="Every submitted attempt" />
      <Panel>
        {rows.length === 0 ? (
          <Empty>
            No attempts yet.{" "}
            <Link to="/app/mock-tests" className="text-gold underline">
              Start a mock test
            </Link>
            .
          </Empty>
        ) : (
          <ul className="divide-y divide-white/10">
            {rows.map(
              (s) =>
                s && (
                  <li key={s.attempt.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate font-serif text-[14px] text-white">
                        {s.test.name}
                      </div>
                      <div className="font-sans text-[10px] text-white/45">
                        {s.test.paper} ·{" "}
                        {new Date(s.attempt.submittedAt ?? 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 font-sans text-[11px] text-white/60">
                      <span className="text-gold">
                        {s.score}/{s.maxScore}
                      </span>
                      <span>{s.accuracy}% acc</span>
                      <Link
                        to="/app/results/$attemptId"
                        params={{ attemptId: s.attempt.id }}
                        className="rounded-md border border-gold/40 px-2.5 py-1 font-black uppercase tracking-widest text-gold transition hover:bg-gold/10"
                      >
                        View
                      </Link>
                    </div>
                  </li>
                ),
            )}
          </ul>
        )}
      </Panel>
    </div>
  );
}
