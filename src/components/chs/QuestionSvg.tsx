import DOMPurify from "dompurify";
import { useMemo } from "react";

export function QuestionSvg({ svg }: { svg: string }) {
  const clean = useMemo(
    () =>
      typeof window === "undefined"
        ? ""
        : DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } }),
    [svg],
  );
  return (
    <div
      className="mt-4 flex justify-center rounded-lg border border-slate-200 bg-white p-3 [&_svg]:max-h-[320px]"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
