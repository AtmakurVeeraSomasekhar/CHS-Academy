// Rule-based spoken-math → LaTeX. Deterministic, dictionary-driven.
// Anything the rules don't confidently match returns { latex: null } so
// callers can fall back to an LLM pass or leave plain text.
//
// Scope (v1): squares/cubes/powers, square/cube roots, simple fractions
// ("a over b", "a divided by b"), integrals, summations, trig, Greek letters,
// "equals/plus/minus/times". Ambiguous phrases (nested "over", parenthetical
// grouping in speech) are intentionally left to the LLM fallback.

const GREEK: Record<string, string> = {
  alpha: "\\alpha", beta: "\\beta", gamma: "\\gamma", delta: "\\delta",
  epsilon: "\\epsilon", theta: "\\theta", lambda: "\\lambda", mu: "\\mu",
  pi: "\\pi", sigma: "\\sigma", phi: "\\phi", omega: "\\omega",
};

const TRIG = new Set(["sin", "cos", "tan", "cot", "sec", "csc", "log", "ln"]);

// Number words we support inline (kept small on purpose).
const NUM: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5",
  six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
};

const OP: Record<string, string> = {
  plus: "+", minus: "-", "and": "+",
  times: "\\cdot", "multiplied": "\\cdot", "into": "\\cdot",
  equals: "=", "equal": "=", "is": "=",
  "greater": ">", "less": "<",
};

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[,;!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

function atom(tok: string): string | null {
  if (/^-?\d+(\.\d+)?$/.test(tok)) return tok;
  if (NUM[tok]) return NUM[tok];
  if (GREEK[tok]) return GREEK[tok];
  if (/^[a-z]$/.test(tok)) return tok;
  return null;
}

export interface MathParseResult {
  latex: string | null;
  confidence: number; // 0..1
}

/**
 * Try to convert a spoken math phrase to LaTeX using conservative rules.
 * Returns { latex: null } when confidence is too low — DO NOT guess.
 */
export function parseSpokenMath(phrase: string): MathParseResult {
  const toks = tokenize(phrase);
  if (toks.length === 0) return { latex: null, confidence: 0 };

  const out: string[] = [];
  let matched = 0;
  let total = 0;
  let i = 0;

  while (i < toks.length) {
    const t = toks[i];
    total++;

    // "square root of X"
    if (t === "square" && toks[i + 1] === "root" && toks[i + 2] === "of") {
      const a = atom(toks[i + 3] ?? "");
      if (a) {
        out.push(`\\sqrt{${a}}`);
        matched++;
        i += 4;
        continue;
      }
    }
    if (t === "cube" && toks[i + 1] === "root" && toks[i + 2] === "of") {
      const a = atom(toks[i + 3] ?? "");
      if (a) {
        out.push(`\\sqrt[3]{${a}}`);
        matched++;
        i += 4;
        continue;
      }
    }

    // "X squared" / "X cubed" / "X to the power N"
    const prev = out[out.length - 1];
    if (t === "squared" && prev) {
      out[out.length - 1] = `${prev}^{2}`;
      matched++;
      i++;
      continue;
    }
    if (t === "cubed" && prev) {
      out[out.length - 1] = `${prev}^{3}`;
      matched++;
      i++;
      continue;
    }
    if (t === "to" && toks[i + 1] === "the" && (toks[i + 2] === "power" || /^\d+$/.test(toks[i + 2] ?? ""))) {
      const powTok = toks[i + 2] === "power" ? toks[i + 3] : toks[i + 2];
      const p = atom(powTok ?? "");
      if (p && prev) {
        out[out.length - 1] = `${prev}^{${p}}`;
        matched++;
        i += toks[i + 2] === "power" ? 4 : 3;
        continue;
      }
    }

    // "A over B" / "A divided by B" — only atomic operands (unambiguous).
    if ((t === "over" || (t === "divided" && toks[i + 1] === "by")) && prev) {
      const skip = t === "over" ? 1 : 2;
      const b = atom(toks[i + skip] ?? "");
      if (b) {
        out[out.length - 1] = `\\dfrac{${prev}}{${b}}`;
        matched++;
        i += skip + 1;
        continue;
      }
    }

    // "integral of X" / "sum of X"
    if (t === "integral" && toks[i + 1] === "of") {
      out.push("\\int");
      matched++;
      i += 2;
      continue;
    }
    if ((t === "sum" || t === "summation") && toks[i + 1] === "of") {
      out.push("\\sum");
      matched++;
      i += 2;
      continue;
    }

    // Trig: "sine of x", "cos x"
    const trigCanon: Record<string, string> = { sine: "sin", cosine: "cos", tangent: "tan" };
    const canon = trigCanon[t] ?? t;
    if (TRIG.has(canon)) {
      const off = toks[i + 1] === "of" ? 2 : 1;
      const a = atom(toks[i + off] ?? "");
      if (a) {
        out.push(`\\${canon}(${a})`);
        matched++;
        i += off + 1;
        continue;
      }
    }

    if (OP[t]) {
      out.push(OP[t]);
      matched++;
      i++;
      continue;
    }
    const a = atom(t);
    if (a) {
      out.push(a);
      matched++;
      i++;
      continue;
    }

    // unknown token — bail early; caller falls back to LLM
    return { latex: null, confidence: 0 };
  }

  const confidence = matched / Math.max(total, 1);
  // Require at least one operator or power/root — plain "x y z" isn't math.
  const hasStructure = /[=+\-^]|\\d?frac|\\sqrt|\\int|\\sum|\\cdot|\\sin|\\cos|\\tan/.test(
    out.join(" "),
  );
  if (!hasStructure) return { latex: null, confidence: 0 };
  return { latex: out.join(" "), confidence };
}

/**
 * Heuristic: does the sentence look like it contains dictated math?
 * Used to decide whether to run the parser / LLM at all.
 */
export function looksLikeMath(s: string): boolean {
  const l = s.toLowerCase();
  return /\b(squared|cubed|square root|cube root|over|divided by|integral|summation|equals|plus|minus|to the power|sine|cosine|tangent|alpha|beta|gamma|theta|pi)\b/.test(
    l,
  );
}
