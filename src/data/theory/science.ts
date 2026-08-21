import { topic, type TheorySubject } from "./types";

/** General Science — add chapters/blocks per topic here. */
export const science: TheorySubject = {
  id: "science",
  title: "General Science",
  topics: [topic("physics", "Physics"), topic("chemistry", "Chemistry"), topic("biology", "Biology")],
};
