// Segments a raw string into text and math tokens.
// Handles $...$, $$...$$, \(...\), \[...\] and bare \begin{env}...\end{env}.

export type Token =
  | { kind: "text"; value: string }
  | { kind: "math"; value: string; display: boolean };

interface Delim {
  open: string;
  close: string;
  display: boolean;
}

const DELIMS: Delim[] = [
  { open: "$$", close: "$$", display: true },
  { open: "\\[", close: "\\]", display: true },
  { open: "\\(", close: "\\)", display: false },
  { open: "$", close: "$", display: false },
];

const ENV_OPEN = /\\begin\{([a-zA-Z*]+)\}/;

export function parseMath(input: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  let buf = "";
  const flushText = () => {
    if (buf) {
      out.push({ kind: "text", value: buf });
      buf = "";
    }
  };

  while (i < input.length) {
    // \begin{env} ... \end{env}
    if (input.startsWith("\\begin{", i)) {
      const rest = input.slice(i);
      const m = rest.match(ENV_OPEN);
      if (m && m.index === 0) {
        const env = m[1];
        const closeTag = `\\end{${env}}`;
        const endIdx = input.indexOf(closeTag, i + m[0].length);
        if (endIdx !== -1) {
          flushText();
          const value = input.slice(i, endIdx + closeTag.length);
          out.push({ kind: "math", value, display: true });
          i = endIdx + closeTag.length;
          continue;
        }
      }
    }

    // Escaped dollar => literal
    if (input[i] === "\\" && input[i + 1] === "$") {
      buf += "$";
      i += 2;
      continue;
    }

    let matched: Delim | null = null;
    for (const d of DELIMS) {
      if (input.startsWith(d.open, i)) {
        matched = d;
        break;
      }
    }
    if (matched) {
      const start = i + matched.open.length;
      const endIdx = input.indexOf(matched.close, start);
      if (endIdx !== -1) {
        flushText();
        out.push({
          kind: "math",
          value: input.slice(start, endIdx),
          display: matched.display,
        });
        i = endIdx + matched.close.length;
        continue;
      }
    }

    buf += input[i];
    i++;
  }
  flushText();
  return out;
}
