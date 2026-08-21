import { parseMath } from "@/lib/math/parser";
import { Math } from "@/lib/math/renderer";
import { Fragment, useMemo } from "react";

interface Props {
  text: string;
  className?: string;
  as?: "div" | "span" | "p";
}

/** Renders a mixed text/LaTeX string. Never crashes; broken math falls back
 *  to escaped literal text with a console.warn for the content team. */
export function MathContent({ text, className, as: Tag = "div" }: Props) {
  const tokens = useMemo(() => parseMath(text), [text]);
  return (
    <Tag className={className}>
      {tokens.map((t, i) => {
        if (t.kind === "text") {
          return <Fragment key={i}>{t.value}</Fragment>;
        }
        return <Math key={i} value={t.value} display={t.display} />;
      })}
    </Tag>
  );
}
