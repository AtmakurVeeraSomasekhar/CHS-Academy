import type { NcertClassData } from "./types";

/** NCERT Class 7 — chapter shells; author blocks as content is written. */
export const ncertClass: NcertClassData = {
  classLevel: 7,
  subjects: [
    {
      id: "history",
      title: "History",
      chapters: [
        {
          id: "class7-history-chapter1",
          chapterNo: 1,
          title: "Tracing Changes Through a Thousand Years",
          summary: "Medieval sources, maps and the idea of periodisation.",
          relatedExams: ["UPSC", "SSC CGL"],
        },
        {
          id: "class7-history-chapter2",
          chapterNo: 2,
          title: "Kings and Kingdoms",
          summary: "Tripartite struggle, Cholas and administration.",
          relatedExams: ["UPSC", "SSC CGL"],
        },
      ],
    },
    {
      id: "geography",
      title: "Geography",
      chapters: [
        {
          id: "class7-geography-chapter1",
          chapterNo: 1,
          title: "Environment",
          summary: "Natural and human environment, ecosystems.",
          relatedExams: ["SSC CGL", "RRB NTPC"],
        },
      ],
    },
    {
      id: "civics",
      title: "Civics",
      chapters: [
        {
          id: "class7-civics-chapter1",
          chapterNo: 1,
          title: "On Equality",
          summary: "Equality in Indian democracy.",
          relatedExams: ["UPSC"],
        },
      ],
    },
  ],
};
