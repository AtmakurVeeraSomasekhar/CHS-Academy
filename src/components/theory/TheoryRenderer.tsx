import { MathContent } from "@/components/chs/MathContent";
import type { TheoryBlock, TheoryChapter } from "@/data/theory";

function Block({ b }: { b: TheoryBlock }) {
  switch (b.type) {
    case "heading":
      return (
        <h3 className="mt-5 mb-1.5 font-display text-lg font-black uppercase tracking-wide text-navy-deep">
          {b.text}
        </h3>
      );
    case "paragraph":
      return (
        <MathContent
          as="p"
          text={b.text}
          className="mb-3 font-serif text-[15px] leading-relaxed text-slate-800"
        />
      );
    case "list":
      return b.ordered ? (
        <ol className="mb-3 list-decimal space-y-1 pl-5 font-serif text-[15px] text-slate-800">
          {b.items.map((it, i) => (
            <li key={i}>
              <MathContent as="span" text={it} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className="mb-3 list-disc space-y-1 pl-5 font-serif text-[15px] text-slate-800">
          {b.items.map((it, i) => (
            <li key={i}>
              <MathContent as="span" text={it} />
            </li>
          ))}
        </ul>
      );
    case "formula":
      return (
        <figure className="mb-3 rounded-xl border border-gold/40 bg-gold/5 px-4 py-3">
          <MathContent text={`$$${b.latex}$$`} className="text-center" />
          {b.caption && (
            <figcaption className="mt-1 text-center text-[11px] font-bold uppercase tracking-widest text-navy-deep/60">
              {b.caption}
            </figcaption>
          )}
        </figure>
      );
    case "example":
      return (
        <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-brand-red">
            Example
          </div>
          <MathContent text={b.prompt} className="mb-2 font-serif text-[15px] text-navy-deep" />
          <ol className="list-decimal space-y-1 pl-5 font-serif text-[14px] text-slate-700">
            {b.solution.map((s, i) => (
              <li key={i}>
                <MathContent as="span" text={s} />
              </li>
            ))}
          </ol>
        </div>
      );
    case "table":
      return (
        <figure className="mb-3 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left font-sans text-[13px]">
            <thead>
              <tr className="bg-navy-deep text-gold">
                {b.headers.map((h, i) => (
                  <th key={i} className="px-3 py-1.5 font-black uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className={i % 2 ? "bg-slate-50" : "bg-white"}>
                  {r.map((c, j) => (
                    <td key={j} className="border-t border-slate-200 px-3 py-1.5 text-slate-800">
                      <MathContent as="span" text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {b.caption && (
            <figcaption className="bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-navy-deep/60">
              {b.caption}
            </figcaption>
          )}
        </figure>
      );
    case "image":
      return (
        <figure className="mb-3">
          <img
            src={b.src}
            alt={b.alt}
            loading="lazy"
            className="mx-auto max-h-[420px] rounded-xl border border-slate-200"
          />
          {b.caption && (
            <figcaption className="mt-1 text-center text-[11px] font-bold uppercase tracking-widest text-navy-deep/60">
              {b.caption}
            </figcaption>
          )}
        </figure>
      );
    case "callout": {
      const tone =
        b.tone === "warn"
          ? "border-brand-red/40 bg-brand-red/5"
          : b.tone === "note"
            ? "border-slate-300 bg-slate-50"
            : "border-gold/50 bg-gold/10";
      return (
        <div className={`mb-3 rounded-xl border px-3 py-2 ${tone}`}>
          <MathContent text={b.text} className="font-serif text-[14px] text-navy-deep" />
        </div>
      );
    }
    default:
      return null;
  }
}

interface RendererProps {
  chapter: TheoryChapter;
  /** Breadcrumb line, e.g. "Quantitative Aptitude · Percentage". */
  trail?: string;
}

export function TheoryRenderer({ chapter, trail }: RendererProps) {
  const blocks = chapter.blocks ?? [];
  return (
    <article className="mx-auto max-w-3xl px-5 py-4">
      <header className="mb-3 border-b border-gold/40 pb-2">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">
          {trail}
          {chapter.exam ? ` · ${chapter.exam}` : ""}
        </div>
        <h2 className="font-display text-2xl font-black tracking-wide text-navy-deep">
          {chapter.title}
        </h2>
        {chapter.description && (
          <p className="mt-1 font-serif text-[14px] text-slate-600">{chapter.description}</p>
        )}
      </header>
      {blocks.length === 0 ? (
        <p className="py-10 text-center font-sans text-sm text-slate-500">
          No content authored for this chapter yet — add blocks in{" "}
          <code>src/data/theory/</code>.
        </p>
      ) : (
        blocks.map((b, i) => <Block key={i} b={b} />)
      )}
    </article>
  );
}

