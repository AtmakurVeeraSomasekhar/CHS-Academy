/**
 * Theory content types. All teaching content lives in the sibling data files
 * (aptitude.ts, reasoning.ts, …) — never inside React components.
 */

export type TheoryBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "formula"; latex: string; caption?: string }
  | { type: "example"; prompt: string; solution: string[] }
  | { type: "table"; headers: string[]; rows: string[][]; caption?: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "callout"; tone?: "tip" | "warn" | "note"; text: string };

/** A single teaching session / class inside a topic. */
export interface TheoryChapter {
  id: string;
  title: string;
  exam?: string;
  description?: string;
  /** Optional local/remote PDF for this chapter. */
  pdfUrl?: string;
  blocks?: TheoryBlock[];
}

export interface TheoryTopic {
  id: string;
  title: string;
  chapters: TheoryChapter[];
}

export interface TheorySubject {
  id: string;
  title: string;
  topics: TheoryTopic[];
}

/** Convenience builder for topics that have no authored chapters yet. */
export function topic(id: string, title: string, chapters: TheoryChapter[] = []): TheoryTopic {
  return { id, title, chapters };
}
