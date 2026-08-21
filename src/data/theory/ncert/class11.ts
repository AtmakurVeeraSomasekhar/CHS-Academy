import type { NcertClassData } from "./types";

/** NCERT Class 11 — chapter shells; author blocks as content is written. */
export const ncertClass: NcertClassData = {
  classLevel: 11,
  subjects: [
    {
      id: "geography",
      title: "Geography (Physical)",
      chapters: [
        {
          id: "class11-geography-chapter1",
          chapterNo: 1,
          title: "The Origin and Evolution of the Earth",
          summary: "Big bang, planetesimal theory, interior of the earth.",
          relatedExams: ["UPSC", "SSC CGL"],
        },
        {
          id: "class11-geography-chapter2",
          chapterNo: 2,
          title: "Interior of the Earth",
          summary: "Layers, seismic waves and volcanic activity.",
          relatedExams: ["UPSC", "SSC CGL", "RRB NTPC"],
        },
      ],
    },
    {
      id: "polity",
      title: "Indian Constitution at Work",
      chapters: [
        {
          id: "class11-polity-chapter1",
          chapterNo: 1,
          title: "Constitution — Why and How",
          summary: "Constituent Assembly, philosophy and key provisions.",
          relatedExams: ["UPSC", "SSC CGL", "Banking"],
        },
      ],
    },
    {
      id: "economics",
      title: "Indian Economic Development",
      chapters: [
        {
          id: "class11-economics-chapter1",
          chapterNo: 1,
          title: "Indian Economy on the Eve of Independence",
          summary: "Colonial economy, drain of wealth, demographics.",
          relatedExams: ["UPSC", "Banking"],
        },
      ],
    },
  ],
};
