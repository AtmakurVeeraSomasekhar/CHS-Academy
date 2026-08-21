import { createFileRoute } from "@tanstack/react-router";
import { MATH_FIXTURES } from "@/lib/math/__fixtures__";
import { MathContent } from "@/components/chs/MathContent";

export const Route = createFileRoute("/dev/math")({
  component: MathHarness,
});

function MathHarness() {
  return (
    <div className="min-h-screen bg-white p-8 text-navy-deep font-serif">
      <h1 className="font-display text-3xl mb-6">CHS math renderer — fixtures</h1>
      <p className="text-sm text-slate-600 font-sans mb-6">
        Each row shows the source, then the rendered output. Broken input should degrade gracefully.
      </p>
      <div className="space-y-6">
        {MATH_FIXTURES.map((src, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-4">
            <div className="text-xs font-mono text-slate-500 mb-2 whitespace-pre-wrap">{src}</div>
            <MathContent text={src} className="text-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
