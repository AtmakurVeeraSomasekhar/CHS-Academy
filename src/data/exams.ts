import type { Difficulty } from "./questions";

/**
 * Exam / mock-test / current-affairs catalogue.
 *
 * This file is the single data source for the student and admin dashboards.
 * Add entries here (in VS Code) — no UI change is required.
 */

export interface Exam {
  id: string;
  /** Short code shown on cards, e.g. "SSC CGL". */
  code: string;
  name: string;
  /** Streams this exam belongs to, used for grouping. */
  category: "SSC" | "UPSC" | "Railway" | "Banking" | "State" | "JEE" | "NEET" | "Other";
  active: boolean;
}

export interface MockTest {
  id: string;
  examId: string;
  name: string;
  /** Paper label, e.g. "SSC CGL Tier-I 2024". */
  paper: string;
  /** Total questions in the paper as published. */
  totalQuestions: number;
  durationMin: number;
  marksPerQuestion: number;
  negativeMarks: number;
  difficulty: Difficulty;
  attempts: number;
  /**
   * Question numbers (matching `Question.questionNo`) drawn from
   * `src/data/questions.ts`. Leave empty to use the whole pool.
   */
  questionNos?: number[];
}

export interface CurrentAffair {
  id: string;
  title: string;
  summary: string;
  category:
    | "National"
    | "International"
    | "Economy"
    | "Science & Tech"
    | "Sports"
    | "Awards & Honours"
    | "Environment";
  date: string; // ISO
  featured?: boolean;
  source?: string;
}

export const exams: Exam[] = [
  { id: "ssc-cgl", code: "SSC CGL", name: "SSC Combined Graduate Level", category: "SSC", active: true },
  { id: "ssc-chsl", code: "SSC CHSL", name: "SSC Combined Higher Secondary Level", category: "SSC", active: true },
  { id: "rrb-ntpc", code: "RRB NTPC", name: "Railway Non-Technical Popular Categories", category: "Railway", active: true },
  { id: "ibps-po", code: "IBPS PO", name: "IBPS Probationary Officer", category: "Banking", active: true },
  { id: "upsc-pre", code: "UPSC CSE", name: "UPSC Civil Services Prelims", category: "UPSC", active: false },
];

export const mockTests: MockTest[] = [
  {
    id: "cgl-2024-t1",
    examId: "ssc-cgl",
    name: "Tier-I Full Mock 01",
    paper: "SSC CGL Tier-I 2024",
    totalQuestions: 100,
    durationMin: 60,
    marksPerQuestion: 2,
    negativeMarks: 0.5,
    difficulty: "Medium",
    attempts: 0,
  },
  {
    id: "cgl-2023-quant",
    examId: "ssc-cgl",
    name: "Quantitative Aptitude Sectional",
    paper: "SSC CGL Tier-I 2023",
    totalQuestions: 25,
    durationMin: 20,
    marksPerQuestion: 2,
    negativeMarks: 0.5,
    difficulty: "Hard",
    attempts: 0,
  },
  {
    id: "chsl-2024-t1",
    examId: "ssc-chsl",
    name: "Tier-I Full Mock 01",
    paper: "SSC CHSL Tier-I 2024",
    totalQuestions: 100,
    durationMin: 60,
    marksPerQuestion: 2,
    negativeMarks: 0.5,
    difficulty: "Easy",
    attempts: 0,
  },
  {
    id: "ntpc-2024-cbt1",
    examId: "rrb-ntpc",
    name: "CBT-1 Full Mock 01",
    paper: "RRB NTPC CBT-1 2024",
    totalQuestions: 100,
    durationMin: 90,
    marksPerQuestion: 1,
    negativeMarks: 0.33,
    difficulty: "Medium",
    attempts: 0,
  },
  {
    id: "ibps-po-pre-01",
    examId: "ibps-po",
    name: "Prelims Full Mock 01",
    paper: "IBPS PO Prelims 2024",
    totalQuestions: 100,
    durationMin: 60,
    marksPerQuestion: 1,
    negativeMarks: 0.25,
    difficulty: "Hard",
    attempts: 0,
  },
];

export const currentAffairs: CurrentAffair[] = [];

export function examById(id: string) {
  return exams.find((e) => e.id === id);
}

export function mockTestById(id: string) {
  return mockTests.find((t) => t.id === id);
}
