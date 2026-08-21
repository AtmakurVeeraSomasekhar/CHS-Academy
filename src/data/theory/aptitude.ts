import { topic, type TheorySubject } from "./types";

/** Quantitative Aptitude — add chapters/blocks here; the UI renders them. */
export const aptitude: TheorySubject = {
  id: "quant",
  title: "Quantitative Aptitude",
  topics: [
    topic("number-system", "Number System"),
    topic("ratio-proportion", "Ratio & Proportion"),
    topic("percentage", "Percentage", [
      {
        id: "percentage-basics",
        title: "Percentage — Core Concepts",
        exam: "SSC CGL / CHSL",
        blocks: [
          { type: "heading", text: "What a percentage really means" },
          {
            type: "paragraph",
            text: "A percentage is a fraction with denominator 100. Converting every percentage into its fraction form is the single biggest speed gain in the arithmetic section.",
          },
          {
            type: "table",
            caption: "Memorise these fraction equivalents",
            headers: ["Percentage", "Fraction", "Decimal"],
            rows: [
              ["12.5%", "1/8", "0.125"],
              ["16.66%", "1/6", "0.1666"],
              ["33.33%", "1/3", "0.3333"],
              ["66.66%", "2/3", "0.6666"],
            ],
          },
          {
            type: "formula",
            latex: "x\\% \\text{ of } N = \\frac{x}{100}\\times N",
            caption: "Base form",
          },
          {
            type: "formula",
            latex: "\\text{Net change} = a + b + \\frac{ab}{100}",
            caption: "Successive percentage change (use signs)",
          },
          {
            type: "example",
            prompt: "The price of an item rises 20% and then falls 20%. What is the net change?",
            solution: [
              "Apply successive change with $a = +20$, $b = -20$.",
              "$20 - 20 + \\dfrac{20 \\times (-20)}{100} = -4$",
              "Net effect: a 4% decrease.",
            ],
          },
          {
            type: "callout",
            tone: "tip",
            text: "Equal percentage rise and fall always gives a net loss of (x²/100)%.",
          },
          { type: "heading", text: "Exam traps" },
          {
            type: "list",
            items: [
              "Percentage of a percentage is multiplicative, never additive.",
              '"More than" and "less than" swap the base — read carefully.',
              "For population/CI style growth, use the multiplier chain, not averages.",
            ],
          },
        ],
      },
    ]),
    topic("profit-loss", "Profit & Loss"),
    topic("average", "Average"),
    topic("time-work", "Time & Work"),
    topic("tsd", "Time, Speed & Distance"),
    topic("si", "Simple Interest"),
    topic("ci", "Compound Interest"),
    topic("algebra", "Algebra"),
    topic("geometry", "Geometry", [
      {
        id: "triangle-centres",
        title: "Triangle Centres at a Glance",
        exam: "SSC CGL Tier II",
        blocks: [
          {
            type: "paragraph",
            text: "Four centres show up repeatedly. Knowing which lines create them makes most questions single-step.",
          },
          {
            type: "table",
            headers: ["Centre", "Formed by", "Key property"],
            rows: [
              ["Centroid", "Medians", "Divides each median 2 : 1"],
              ["Incentre", "Angle bisectors", "Equidistant from all sides"],
              ["Circumcentre", "Perpendicular bisectors", "Equidistant from all vertices"],
              ["Orthocentre", "Altitudes", "Lies outside for obtuse triangles"],
            ],
          },
          {
            type: "formula",
            latex: "\\text{Area} = \\sqrt{s(s-a)(s-b)(s-c)},\\quad s=\\frac{a+b+c}{2}",
            caption: "Heron's formula",
          },
          {
            type: "callout",
            tone: "note",
            text: "In an equilateral triangle all four centres coincide — worth checking first in symmetric figures.",
          },
        ],
      },
    ]),
    topic("mensuration", "Mensuration"),
    topic("trigonometry", "Trigonometry"),
    topic("di", "Data Interpretation"),
    topic("statistics", "Statistics"),
  ],
};
