import { aptitude } from "./aptitude";
import { awareness } from "./awareness";
import { english } from "./english";
import { reasoning } from "./reasoning";
import { science } from "./science";
import type { TheoryChapter, TheorySubject, TheoryTopic } from "./types";

export type { TheoryBlock, TheoryChapter, TheorySubject, TheoryTopic } from "./types";

/** Navigation catalogue rendered by the theory drawer. */
export const theorySubjects: TheorySubject[] = [
  aptitude,
  reasoning,
  english,
  awareness,
  science,
];

export interface TheorySelection {
  subjectId: string;
  topicId: string;
  chapterId: string;
}

export interface ResolvedTheory {
  subject?: TheorySubject;
  topic?: TheoryTopic;
  chapter?: TheoryChapter;
}

export function resolveTheory(
  subjects: TheorySubject[],
  sel: TheorySelection | null,
): ResolvedTheory {
  if (!sel) return {};
  const subject = subjects.find((s) => s.id === sel.subjectId);
  const topic = subject?.topics.find((t) => t.id === sel.topicId);
  const chapter = topic?.chapters.find((c) => c.id === sel.chapterId);
  return { subject, topic, chapter };
}

/** First chapter that actually has authored content — used as the initial view. */
export function firstAuthored(subjects: TheorySubject[]): TheorySelection | null {
  for (const s of subjects)
    for (const t of s.topics)
      for (const c of t.chapters)
        if (c.blocks?.length) return { subjectId: s.id, topicId: t.id, chapterId: c.id };
  return null;
}
