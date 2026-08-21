import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Empty, PageHeader, Panel } from "@/components/app/Primitives";
import { currentAffairs, type CurrentAffair } from "@/data/exams";

const CATEGORIES = [
  "All",
  "National",
  "International",
  "Economy",
  "Science & Tech",
  "Sports",
  "Awards & Honours",
  "Environment",
] as const;

export const Route = createFileRoute("/app/current-affairs")({
  head: () => ({
    meta: [
      { title: "Current Affairs — CHS Academy" },
      {
        name: "description",
        content:
          "Exam-focused current affairs for SSC, UPSC, Railway and Banking — national, economy, science and awards coverage.",
      },
      { property: "og:title", content: "Current Affairs — CHS Academy" },
      { property: "og:description", content: "Daily exam-relevant current affairs, categorised and searchable." },
    ],
  }),
  component: CurrentAffairsPage,
});

function CurrentAffairsPage() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return currentAffairs.filter(
      (a) =>
        (cat === "All" || a.category === cat) &&
        (!q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)),
    );
  }, [cat, query]);

  const featured = list.find((a) => a.featured);
  const rest = list.filter((a) => a !== featured);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Current Affairs" subtitle="Exam-relevant news, categorised" />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 rounded-md border border-white/15 bg-navy-panel/70 px-2 py-1">
          <Search className="h-3.5 w-3.5 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles"
            aria-label="Search current affairs"
            className="w-48 bg-transparent font-sans text-[11px] text-white outline-none placeholder:text-white/35"
          />
        </label>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest transition ${
              cat === c
                ? "border-gold bg-gold text-navy-deep"
                : "border-white/15 text-white/55 hover:text-gold"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Empty>
          No articles for this filter — add entries to the <code>currentAffairs</code> array in{" "}
          <code>src/data/exams.ts</code>.
        </Empty>
      ) : (
        <div className="space-y-4">
          {featured && (
            <Panel title="Featured">
              <Article a={featured} large />
            </Panel>
          )}
          <Panel title="Recent Articles">
            <div className="grid gap-3 md:grid-cols-2">
              {rest.map((a) => (
                <Article key={a.id} a={a} />
              ))}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

function Article({ a, large }: { a: CurrentAffair; large?: boolean }) {
  return (
    <article className="rounded-lg border border-white/10 bg-navy-elevated/50 p-3">
      <div className="flex items-center gap-2 font-sans text-[9px] font-black uppercase tracking-widest">
        <span className="text-gold">{a.category}</span>
        <span className="text-white/35">{new Date(a.date).toLocaleDateString()}</span>
      </div>
      <h3
        className={`mt-1 font-serif text-white ${large ? "text-[19px]" : "text-[15px]"}`}
      >
        {a.title}
      </h3>
      <p className="mt-1 font-sans text-[12px] leading-relaxed text-white/60">{a.summary}</p>
      {a.source && (
        <div className="mt-1.5 font-sans text-[9px] uppercase tracking-widest text-white/35">
          Source · {a.source}
        </div>
      )}
    </article>
  );
}
