import { topic, type TheorySubject } from "./types";

/** General Awareness — add chapters/blocks per topic here. */
export const awareness: TheorySubject = {
  id: "ga",
  title: "General Awareness",
  topics: [
    topic("history", "History"),
    topic("geography", "Geography"),
    topic("polity", "Polity"),
    topic("economics", "Economics"),
    topic("static-gk", "Static GK"),
    topic("current-affairs", "Current Affairs"),
    topic("misc", "Miscellaneous"),
  ],
};
