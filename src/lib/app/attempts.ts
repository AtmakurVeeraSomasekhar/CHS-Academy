import { useCallback, useEffect, useState } from "react";
import { questions, type Question } from "@/data/questions";
import { mockTestById, type MockTest } from "@/data/exams";

/** Per-question response inside a mock-test attempt. */
export interface Response {
  /** Selected option index, or null when skipped. */
  selected: number | null;
  marked?: boolean;
  /** Seconds spent on this question. */
  seconds?: number;
}

export interface Attempt {
  id: string;
  testId: string;
  startedAt: number;
  submittedAt?: number;
  /** Keyed by `Question.questionNo`. */
  responses: Record<number, Response>;
  /** Seconds elapsed at submit time. */
  timeTakenSec?: number;
}

export interface Scored {
  attempt: Attempt;
  test: MockTest;
  items: { q: Question; selected: number | null; correct: boolean }[];
  correct: number;
  wrong: number;
  skipped: number;
  penalty: number;
  score: number;
  maxScore: number;
  accuracy: number;
  /** Subject (topic) → accuracy percentage. */
  bySubject: { subject: string; total: number; correct: number; accuracy: number }[];
}

const KEY = "chs:attempts:v1";

function read(): Attempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attempt[]) : [];
  } catch {
    return [];
  }
}

function write(list: Attempt[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("chs:attempts"));
  } catch {
    /* storage unavailable — attempts stay in memory for this session */
  }
}

/** Questions belonging to a test, resolved from the shared question pool. */
export function testQuestions(test: MockTest): Question[] {
  if (test.questionNos?.length) {
    return test.questionNos
      .map((n) => questions.find((q) => q.questionNo === n))
      .filter((q): q is Question => !!q);
  }
  return questions;
}

export function saveAttempt(a: Attempt) {
  const list = read().filter((x) => x.id !== a.id);
  write([a, ...list]);
}

export function listAttempts(): Attempt[] {
  return read().sort((a, b) => (b.submittedAt ?? b.startedAt) - (a.submittedAt ?? a.startedAt));
}

export function attemptById(id: string) {
  return read().find((a) => a.id === id);
}

export function score(attempt: Attempt): Scored | null {
  const test = mockTestById(attempt.testId);
  if (!test) return null;
  const qs = testQuestions(test);

  const items = qs.map((q) => {
    const selected = attempt.responses[q.questionNo]?.selected ?? null;
    return { q, selected, correct: selected !== null && selected === q.answer };
  });

  const correct = items.filter((i) => i.correct).length;
  const answered = items.filter((i) => i.selected !== null).length;
  const wrong = answered - correct;
  const skipped = items.length - answered;
  const penalty = wrong * test.negativeMarks;
  const score = correct * test.marksPerQuestion - penalty;

  const groups = new Map<string, { total: number; correct: number }>();
  for (const i of items) {
    const g = groups.get(i.q.topic) ?? { total: 0, correct: 0 };
    g.total += 1;
    if (i.correct) g.correct += 1;
    groups.set(i.q.topic, g);
  }

  return {
    attempt,
    test,
    items,
    correct,
    wrong,
    skipped,
    penalty,
    score,
    maxScore: items.length * test.marksPerQuestion,
    accuracy: answered ? Math.round((correct / answered) * 100) : 0,
    bySubject: [...groups.entries()].map(([subject, g]) => ({
      subject,
      total: g.total,
      correct: g.correct,
      accuracy: g.total ? Math.round((g.correct / g.total) * 100) : 0,
    })),
  };
}

/** Reactive list of stored attempts (client-only; empty during SSR). */
export function useAttempts() {
  const [list, setList] = useState<Attempt[]>([]);
  const refresh = useCallback(() => setList(listAttempts()), []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("chs:attempts", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("chs:attempts", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  return { attempts: list, refresh };
}

/** Aggregate student statistics derived from stored attempts. */
export function useStudentStats() {
  const { attempts } = useAttempts();
  const done = attempts.filter((a) => a.submittedAt);
  const scored = done.map(score).filter((s): s is Scored => !!s);
  const avg = scored.length
    ? Math.round(scored.reduce((t, s) => t + (s.maxScore ? (s.score / s.maxScore) * 100 : 0), 0) / scored.length)
    : 0;
  const accuracy = scored.length
    ? Math.round(scored.reduce((t, s) => t + s.accuracy, 0) / scored.length)
    : 0;
  return { testsTaken: done.length, avgScorePct: avg, accuracy, scored };
}
