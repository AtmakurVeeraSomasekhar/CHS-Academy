import { useEffect, useRef, useState } from "react";

let mermaidPromise: Promise<typeof import("mermaid").default> | null = null;
async function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => {
      m.default.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict" });
      return m.default;
    });
  }
  return mermaidPromise;
}

export function QuestionDiagram({ source }: { source: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`chs-mmd-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = await loadMermaid();
        const { svg } = await mermaid.render(idRef.current, source);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[CHS] mermaid render failed", err);
        if (!cancelled) setError(String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source]);

  if (error) {
    return (
      <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800">
        {source}
      </pre>
    );
  }
  return <div ref={ref} className="mt-4 flex justify-center rounded-lg border border-slate-200 bg-white p-3" />;
}
