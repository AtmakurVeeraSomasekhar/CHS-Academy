/**
 * Theory catalogue state. Static content comes from src/data/theory/*, while
 * teacher-added subjects/topics/chapters are persisted locally and merged in.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { theorySubjects, type TheorySubject } from "@/data/theory";

const KEY = "chs.theory.catalog.v1";

type Addition =
  | { kind: "subject"; id: string; title: string }
  | { kind: "topic"; id: string; title: string; subjectId: string }
  | { kind: "chapter"; id: string; title: string; subjectId: string; topicId: string };

function read(): Addition[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as Addition[]) : [];
  } catch {
    return [];
  }
}

function write(list: Addition[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* quota — keep in memory */
  }
}

const slug = (s: string) =>
  `${s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item"}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

function merge(additions: Addition[]): TheorySubject[] {
  const subjects: TheorySubject[] = theorySubjects.map((s) => ({
    ...s,
    topics: s.topics.map((t) => ({ ...t, chapters: t.chapters.slice() })),
  }));

  for (const a of additions) {
    if (a.kind === "subject") {
      if (!subjects.some((s) => s.id === a.id))
        subjects.push({ id: a.id, title: a.title, topics: [] });
      continue;
    }
    const subject = subjects.find((s) => s.id === a.subjectId);
    if (!subject) continue;
    if (a.kind === "topic") {
      if (!subject.topics.some((t) => t.id === a.id))
        subject.topics.push({ id: a.id, title: a.title, chapters: [] });
      continue;
    }
    const topic = subject.topics.find((t) => t.id === a.topicId);
    if (topic && !topic.chapters.some((c) => c.id === a.id))
      topic.chapters.push({ id: a.id, title: a.title });
  }
  return subjects;
}

export function useTheoryCatalog() {
  const [additions, setAdditions] = useState<Addition[]>([]);

  useEffect(() => setAdditions(read()), []);

  const commit = useCallback((next: Addition[]) => {
    setAdditions(next);
    write(next);
  }, []);

  const subjects = useMemo(() => merge(additions), [additions]);

  const addSubject = useCallback(
    (title: string) => {
      const id = slug(title);
      commit([...additions, { kind: "subject", id, title }]);
      return id;
    },
    [additions, commit],
  );

  const addTopic = useCallback(
    (subjectId: string, title: string) => {
      const id = slug(title);
      commit([...additions, { kind: "topic", id, title, subjectId }]);
      return id;
    },
    [additions, commit],
  );

  const addChapter = useCallback(
    (subjectId: string, topicId: string, title: string) => {
      const id = slug(title);
      commit([...additions, { kind: "chapter", id, title, subjectId, topicId }]);
      return id;
    },
    [additions, commit],
  );

  return { subjects, addSubject, addTopic, addChapter };
}
