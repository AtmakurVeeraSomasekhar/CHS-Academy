import type { NcertClassData } from "./types";

/** NCERT Class 8 — chapter shells; author blocks as content is written. */
export const ncertClass: NcertClassData = {
  classLevel: 8,
  subjects: [
    {
      id: "history",
      title: "History",
      chapters: [
        {
          id: "class8-history-chapter1",
          chapterNo: 1,
          title: "How, When and Where",
          summary: "Colonial records, periodisation and sources.",
          relatedExams: ["UPSC", "SSC CGL"],
        },
        {
          id: "class8-history-chapter2",
          chapterNo: 2,
          title: "From Trade to Territory",
          summary: "East India Company's expansion and key battles.",
          relatedExams: ["UPSC", "SSC CGL", "RRB NTPC"],
        },
      ],
    },
    {
      id: "geography",
      title: "Geography",
      chapters: [
        {
          id: "class8-geography-chapter1",
          chapterNo: 1,
          title: "Resources",
          summary: "Types of resources and conservation.",
          relatedExams: ["SSC CGL"],
        },
      ],
    },
    {
      id: "civics",
      title: "Civics",
      chapters: [
        {
          id: "class8-civics-chapter1",
          chapterNo: 1,
          title: "The Indian Constitution",
          summary: "Key features, fundamental rights and secularism.",
          relatedExams: ["UPSC", "SSC CGL", "Banking"],
        },
      ],
    },
  ],
};
