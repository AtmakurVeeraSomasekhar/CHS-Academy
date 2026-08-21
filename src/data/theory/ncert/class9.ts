import type { NcertClassData } from "./types";

/** NCERT Class 9 — chapter shells; author blocks as content is written. */
export const ncertClass: NcertClassData = {
  classLevel: 9,
  subjects: [
    {
      id: "history",
      title: "History",
      chapters: [
        {
          id: "class9-history-chapter1",
          chapterNo: 1,
          title: "The French Revolution",
          summary: "Causes, course and legacy of 1789.",
          relatedExams: ["UPSC", "SSC CGL"],
        },
      ],
    },
    {
      id: "geography",
      title: "Geography",
      chapters: [
        {
          id: "class9-geography-chapter1",
          chapterNo: 1,
          title: "India — Size and Location",
          summary: "Extent, standard meridian and neighbours.",
          relatedExams: ["SSC CGL", "RRB NTPC"],
        },
      ],
    },
    {
      id: "polity",
      title: "Political Science",
      chapters: [
        {
          id: "class9-polity-chapter1",
          chapterNo: 1,
          title: "What is Democracy? Why Democracy?",
          summary: "Features and arguments for democracy.",
          relatedExams: ["UPSC"],
        },
      ],
    },
    {
      id: "economics",
      title: "Economics",
      chapters: [
        {
          id: "class9-economics-chapter1",
          chapterNo: 1,
          title: "The Story of Village Palampur",
          summary: "Factors of production and farm/non-farm activities.",
          relatedExams: ["SSC CGL", "Banking"],
        },
      ],
    },
  ],
};
