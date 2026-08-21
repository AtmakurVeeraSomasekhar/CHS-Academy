import type { NcertClassData } from "./types";

/**
 * NCERT Class 6 — CHS Academy original explanations and exam notes.
 * Add chapters here; the UI renders them with no code change.
 */
export const ncertClass: NcertClassData = {
  classLevel: 6,
  subjects: [
    {
      id: "history",
      title: "History",
      chapters: [
        {
          id: "class6-history-chapter1",
          chapterNo: 1,
          title: "What, Where, How and When?",
          summary: "How historians reconstruct the past: sources, dates and geography.",
          relatedExams: ["UPSC", "SSC CGL", "SSC CHSL", "RRB NTPC"],
          difficulty: "Easy",
          blocks: [
            { type: "heading", text: "Concept" },
            {
              type: "paragraph",
              text: "History is reconstructed from evidence. Two families of evidence matter for exams: archaeological sources (tools, pottery, coins, buildings, bones) and literary sources (manuscripts, inscriptions, travel accounts). Dates before the common era are counted backwards, which is why 1500 BCE is older than 500 BCE.",
            },
            {
              type: "list",
              items: [
                "Manuscripts were written on palm leaf and bhoj patra (birch bark).",
                "Inscriptions were engraved on stone, pillars and metal — durable and rarely edited.",
                "Archaeology studies material remains; a historian studies written remains.",
              ],
            },
            { type: "heading", text: "Where did people live?" },
            {
              type: "paragraph",
              text: "Early settlement clustered along the Narmada valley (hunting and gathering), the northern flanks of the Vindhyas (early farming and rice), and Sulaiman and Kirthar hills in the north-west (wheat and barley, earliest sheep and goat rearing).",
            },
            {
              type: "table",
              caption: "Region and earliest activity — a standard one-mark question",
              headers: ["Region", "Earliest known activity"],
              rows: [
                ["Narmada valley", "Hunting and gathering"],
                ["North of the Vindhyas", "Earliest rice cultivation"],
                ["Sulaiman and Kirthar hills", "Wheat, barley, sheep and goat rearing"],
                ["Garo hills / Indus tributaries", "Early agriculture and herding"],
              ],
            },
            {
              type: "callout",
              tone: "tip",
              text: "Exam trigger words: **Bharata** appears in the Rigveda; **India** comes from the Indus (Sindhu) via Greek *Indos*.",
            },
          ],
          keyTerms: [
            { term: "Manuscript", meaning: "Handwritten record on palm leaf or birch bark." },
            { term: "Inscription", meaning: "Writing engraved on hard surfaces such as stone or metal." },
            { term: "Archaeology", meaning: "Study of the past through material remains." },
            { term: "BCE / CE", meaning: "Before Common Era / Common Era; BCE years count backwards." },
          ],
          timeline: [
            { when: "c. 2 million years ago", what: "Earliest evidence of humans in the subcontinent" },
            { when: "c. 8000 years ago", what: "Beginning of farming and herding" },
            { when: "c. 4700 years ago", what: "First cities of the Indus valley" },
            { when: "c. 2500 years ago", what: "Cities in the Ganga valley; Magadha rises" },
          ],
          examFacts: [
            "The word 'India' derives from the Indus, called Sindhu in Sanskrit.",
            "Rigveda is the oldest known manuscript source, composed in Sanskrit.",
            "Palm leaf and birch bark (bhoj patra) were the main manuscript materials.",
            "The Narmada valley is associated with early hunting-gathering communities.",
          ],
          revision: [
            "Sources = archaeological + literary.",
            "BCE counts backwards; CE counts forwards.",
            "Bharata (Rigveda) and India (Indus) — two names, two origins.",
          ],
          pyqQuestionNos: [],
        },
        {
          id: "class6-history-chapter2",
          chapterNo: 2,
          title: "From Hunting–Gathering to Growing Food",
          summary: "Palaeolithic to Neolithic transition, tools, and early domestication.",
          relatedExams: ["UPSC", "SSC CGL"],
          difficulty: "Easy",
        },
        {
          id: "class6-history-chapter3",
          chapterNo: 3,
          title: "In the Earliest Cities",
          summary: "Harappan civilisation: town planning, crafts, trade and decline.",
          relatedExams: ["UPSC", "SSC CGL", "RRB NTPC"],
          difficulty: "Medium",
        },
      ],
    },
    {
      id: "geography",
      title: "Geography",
      chapters: [
        {
          id: "class6-geography-chapter1",
          chapterNo: 1,
          title: "The Earth in the Solar System",
          summary: "Celestial bodies, planets, satellites and the Earth's uniqueness.",
          relatedExams: ["SSC CGL", "SSC CHSL", "RRB NTPC"],
          difficulty: "Easy",
        },
        {
          id: "class6-geography-chapter2",
          chapterNo: 2,
          title: "Globe: Latitudes and Longitudes",
          summary: "Grid system, important parallels, time zones and the IST meridian.",
          relatedExams: ["SSC CGL", "RRB NTPC"],
          difficulty: "Medium",
        },
      ],
    },
    {
      id: "civics",
      title: "Civics",
      chapters: [
        {
          id: "class6-civics-chapter1",
          chapterNo: 1,
          title: "Understanding Diversity",
          summary: "Diversity, inequality and how they interact in Indian society.",
          relatedExams: ["UPSC"],
          difficulty: "Easy",
        },
      ],
    },
    {
      id: "science",
      title: "General Science",
      chapters: [
        {
          id: "class6-science-chapter1",
          chapterNo: 1,
          title: "Components of Food",
          summary: "Nutrients, balanced diet and deficiency diseases.",
          relatedExams: ["SSC CGL", "SSC CHSL", "RRB Group D"],
          difficulty: "Easy",
        },
      ],
    },
  ],
};
