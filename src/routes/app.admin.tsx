import { createFileRoute } from "@tanstack/react-router";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Plus } from "lucide-react";
import { Empty, PageHeader, Panel, Stat } from "@/components/app/Primitives";
import { exams, mockTests } from "@/data/exams";
import { questions } from "@/data/questions";
import { useAttempts, useStudentStats } from "@/lib/app/attempts";

export const Route = createFileRoute("/app/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — CHS Academy" },
      {
        name: "description",
        content: "Manage exams, mock tests and question banks, and monitor attempt volume and score trends.",
      },
      { property: "og:title", content: "Admin Dashboard — CHS Academy" },
      { property: "og:description", content: "Operational overview of exams, mock tests, questions and attempts." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { attempts } = useAttempts();
  const { scored } = useStudentStats();

  const trend = scored
    .slice()
    .reverse()
    .map((s, i) => ({
      label: `#${i + 1}`,
      score: s.maxScore ? Math.round((s.score / s.maxScore) * 100) : 0,
    }));

  const subjects = new Map<string, { total: number; correct: number }>();
  for (const s of scored) {
    for (const b of s.bySubject) {
      const g = subjects.get(b.subject) ?? { total: 0, correct: 0 };
      g.total += b.total;
      g.correct += b.correct;
      subjects.set(b.subject, g);
    }
  }

  const today = new Date().toDateString();
  const todays = attempts.filter((a) => new Date(a.startedAt).toDateString() === today).length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Catalogue and attempt overview"
        actions={
          <>
            {["Add Exam", "Add Mock Test", "Add Current Affairs"].map((l) => (
              <span
                key={l}
                title="Content is authored in src/data/* — editing here is not wired yet"
                className="inline-flex cursor-default items-center gap-1 rounded-md border border-white/15 px-2.5 py-1.5 font-sans text-[10px] font-black uppercase tracking-widest text-white/45"
              >
                <Plus className="h-3 w-3" /> {l}
              </span>
            ))}
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Active Exams" value={exams.filter((e) => e.active).length} hint={`${exams.length} total`} />
        <Stat label="Mock Tests" value={mockTests.length} />
        <Stat label="Questions" value={questions.length} hint="in src/data/questions.ts" />
        <Stat label="Total Attempts" value={attempts.length} hint={`${todays} today`} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Panel title="Average Score Trend">
          {trend.length === 0 ? (
            <Empty>No submitted attempts yet.</Empty>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--navy-panel)",
                      border: "1px solid rgba(212,175,55,0.4)",
                      fontSize: 11,
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="var(--gold)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="Subject Performance">
          {subjects.size === 0 ? (
            <Empty>No attempt data yet.</Empty>
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

        <Panel title="Recent Mock Tests">
          <ul className="divide-y divide-white/10">
            {mockTests.slice(0, 5).map((t) => (
              <li key={t.id} className="flex justify-between py-2 font-sans text-[11px] text-white/70">
                <span className="truncate">{t.name}</span>
                <span className="text-white/40">{t.paper}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Today's Activity">
          {todays === 0 ? (
            <Empty>No attempts started today.</Empty>
          ) : (
            <div className="font-sans text-[12px] text-white/70">
              {todays} attempt{todays === 1 ? "" : "s"} started today.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
