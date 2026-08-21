import katex from "katex";
import { useMemo } from "react";

interface MathProps {
  value: string;
  display?: boolean;
  className?: string;
}

/** Renders a single LaTeX expression via KaTeX.
 *  Falls back to escaped plain text on parse failure — never crashes. */
export function Math({ value, display = false, className }: MathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(value, {
        displayMode: display,
        throwOnError: false,
        strict: "ignore",
        trust: false,
        output: "html",
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[CHS math] render failed", { snippet: value, error: err });
      return `<span class="chs-math-error">${escape(value)}</span>`;
    }
  }, [value, display]);

  const Tag = display ? "div" : "span";
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
