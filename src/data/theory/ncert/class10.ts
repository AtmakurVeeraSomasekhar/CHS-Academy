import type { NcertClassData } from "./types";

/** NCERT Class 10 — chapter shells; author blocks as content is written. */
export const ncertClass: NcertClassData = {
  classLevel: 10,
  subjects: [
    {
      id: "history",
      title: "History",
      chapters: [
        {
          id: "class10-history-chapter1",
          chapterNo: 1,
          title: "The Rise of Nationalism in Europe",
          summary: "Unification movements and nationalist symbols.",
          relatedExams: ["UPSC", "SSC CGL"],
        },
        {
          id: "class10-history-chapter2",
          chapterNo: 2,
          title: "Nationalism in India",
          summary: "Non-cooperation to Quit India — key movements and dates.",
          relatedExams: ["UPSC", "SSC CGL", "RRB NTPC"],
        },
      ],
    },
    {
      id: "geography",
      title: "Geography",
      chapters: [
        {
          id: "class10-geography-chapter1",
          chapterNo: 1,
          title: "Resources and Development",
          summary: "Resource classification, soils and conservation.",
          relatedExams: ["SSC CGL", "RRB NTPC"],
        },
      ],
    },
    {
      id: "polity",
      title: "Political Science",
      chapters: [
        {
          id: "class10-polity-chapter1",
          chapterNo: 1,
          title: "Power Sharing and Federalism",
          summary: "Forms of power sharing and Indian federal practice.",
          relatedExams: ["UPSC", "SSC CGL"],
        },
      ],
    },
    {
      id: "economics",
      title: "Economics",
      chapters: [
        {
          id: "class10-economics-chapter1",
          chapterNo: 1,
          title: "Development",
          summary: "Income and non-income indicators, HDI.",
          relatedExams: ["Banking", "SSC CGL"],
        },
      ],
    },
  ],
};
