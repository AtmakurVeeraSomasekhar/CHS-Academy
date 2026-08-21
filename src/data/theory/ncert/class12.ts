import type { NcertClassData } from "./types";

/** NCERT Class 12 — chapter shells; author blocks as content is written. */
export const ncertClass: NcertClassData = {
  classLevel: 12,
  subjects: [
    {
      id: "history",
      title: "History",
      chapters: [
        {
          id: "class12-history-chapter1",
          chapterNo: 1,
          title: "Bricks, Beads and Bones — The Harappan Civilisation",
          summary: "Sites, subsistence, seals and archaeological debate.",
          relatedExams: ["UPSC", "SSC CGL"],
        },
      ],
    },
    {
      id: "polity",
      title: "Politics in India Since Independence",
      chapters: [
        {
          id: "class12-polity-chapter1",
          chapterNo: 1,
          title: "Challenges of Nation Building",
          summary: "Partition, integration of princely states, reorganisation.",
          relatedExams: ["UPSC", "SSC CGL"],
        },
      ],
    },
    {
      id: "geography",
      title: "Geography (Human)",
      chapters: [
        {
          id: "class12-geography-chapter1",
          chapterNo: 1,
          title: "Human Geography — Nature and Scope",
          summary: "Approaches, determinism and possibilism.",
          relatedExams: ["UPSC"],
        },
      ],
    },
  ],
};
