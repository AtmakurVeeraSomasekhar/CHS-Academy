/**
 * NCERT theory models. All chapter content lives in data files under
 * src/data/theory/ncert/class<N>.ts — never inside React components.
 */

import type { TheoryBlock } from "../types";

export interface NcertKeyTerm {
  term: string;
  meaning: string;
}

export interface NcertTimelineEntry {
  when: string;
  what: string;
}

export interface NcertChapter {
  id: string;
  chapterNo: number;
  title: string;
  /** One-line description shown in the chapter list. */
  summary?: string;
  /** Exam codes this chapter feeds, e.g. ["UPSC", "SSC CGL"]. */
  relatedExams?: string[];
  difficulty?: "Easy" | "Medium" | "Hard";
  /** Optional PDF (public path or remote URL) opened in the theory viewer. */
  pdfUrl?: string;
  /** Main explanation, rendered by TheoryRenderer. */
  blocks?: TheoryBlock[];
  keyTerms?: NcertKeyTerm[];
  timeline?: NcertTimelineEntry[];
  /** Exam-oriented one-liners. */
  examFacts?: string[];
  /** Short revision bullets. */
  revision?: string[];
  /** `Question.questionNo` values from src/data/questions.ts. */
  pyqQuestionNos?: number[];
}

export interface NcertSubject {
  id: string;
  title: string;
  chapters: NcertChapter[];
}

export interface NcertClassData {
  classLevel: number;
  subjects: NcertSubject[];
}
