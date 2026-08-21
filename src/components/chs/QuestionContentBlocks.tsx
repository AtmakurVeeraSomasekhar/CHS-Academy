import type { Question } from "@/data/questions";
import { QuestionTable } from "./QuestionTable";
import { QuestionImageViewer } from "./QuestionImageViewer";
import { QuestionDiagram } from "./QuestionDiagram";
import { QuestionSvg } from "./QuestionSvg";
import { MathContent } from "./MathContent";

export function QuestionContentBlocks({ q }: { q: Question }) {
  // Legacy fields first
  const legacy: React.ReactNode[] = [];
  if (q.type === "table" && q.table) {
    legacy.push(<QuestionTable key="legacy-table" table={q.table} />);
  }
  if (q.type === "image" && q.imageUrl) {
    legacy.push(<QuestionImageViewer key="legacy-image" src={q.imageUrl} />);
  }

  const blocks = (q.content ?? []).map((b, i) => {
    switch (b.kind) {
      case "text":
        return <MathContent key={i} className="mt-3 text-[20px] text-navy-deep" text={b.value} />;
      case "table":
        return <QuestionTable key={i} table={{ headers: b.headers, rows: b.rows }} />;
      case "image":
        return (
          <div key={i} className="relative">
            <QuestionImageViewer src={b.src} />
            {b.fallback && (
              <span className="absolute top-2 left-2 z-10 rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                Source image
              </span>
            )}
          </div>
        );
      case "diagram":
        return <QuestionDiagram key={i} source={b.mermaid} />;
      case "svg":
        return <QuestionSvg key={i} svg={b.svg} />;
    }
  });

  return (
    <>
      {legacy}
      {blocks}
    </>
  );
}
