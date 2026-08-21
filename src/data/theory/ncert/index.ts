/**
 * NCERT registry. Class data is code-split: each class is fetched on demand so
 * twelve classes of chapters never load at startup.
 */

import type { NcertChapter, NcertClassData, NcertSubject } from "./types";

export type { NcertChapter, NcertClassData, NcertSubject } from "./types";
export type { NcertKeyTerm, NcertTimelineEntry } from "./types";

export const NCERT_CLASSES = [6, 7, 8, 9, 10, 11, 12] as const;

/** Lightweight index for the browse screen (no chapter content). */
export const NCERT_CLASS_INDEX: { classLevel: number; label: string; blurb: string }[] = [
  { classLevel: 6, label: "Class 6", blurb: "Foundations — ancient India, maps, government" },
  { classLevel: 7, label: "Class 7", blurb: "Medieval India, climate, democracy" },
  { classLevel: 8, label: "Class 8", blurb: "Modern India, resources, constitution" },
  { classLevel: 9, label: "Class 9", blurb: "Revolutions, physical geography, polity" },
  { classLevel: 10, label: "Class 10", blurb: "Nationalism, development, federalism" },
  { classLevel: 11, label: "Class 11", blurb: "Physical geography, Indian constitution, economy" },
  { classLevel: 12, label: "Class 12", blurb: "Post-independence India, human geography" },
];

const LOADERS: Record<number, () => Promise<{ ncertClass: NcertClassData }>> = {
  6: () => import("./class6"),
  7: () => import("./class7"),
  8: () => import("./class8"),
  9: () => import("./class9"),
  10: () => import("./class10"),
  11: () => import("./class11"),
  12: () => import("./class12"),
};

/** Returns null for an unknown or not-yet-authored class instead of throwing. */
export async function loadNcertClass(classLevel: number): Promise<NcertClassData | null> {
  const loader = LOADERS[classLevel];
  if (!loader) return null;
  try {
    const mod = await loader();
    return mod.ncertClass ?? null;
  } catch {
    return null;
  }
}

export function findSubject(data: NcertClassData, subjectId: string): NcertSubject | undefined {
  return data.subjects.find((s) => s.id === subjectId);
}

export function findChapter(subject: NcertSubject, chapterId: string): NcertChapter | undefined {
  return subject.chapters.find((c) => c.id === chapterId);
}
