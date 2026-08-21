// Server functions for the smart layers on top of raw transcription:
//   - mathFallback: LLM pass for spoken-math phrases the rule parser missed.
//   - structureNotes: debounced restructure into steps / paragraphs.
//   - summarize: post-session summary + formula box + exam tips (grounded).
//
// All calls go through Lovable AI Gateway. Model choice: a small chat model
// (google/gemini-3-flash-preview) is enough for these tasks and keeps latency
// / cost manageable per teacher-minute.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "google/gemini-3-flash-preview";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function chat(system: string, user: string): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const resp = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`gateway ${resp.status}: ${body || resp.statusText}`);
  }
  const j = (await resp.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return j.choices?.[0]?.message?.content ?? "";
}

function stripFences(s: string): string {
  return s
    .replace(/^```(?:json|latex)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

/** LLM fallback for spoken-math → LaTeX. Returns null when unconfident. */
export const mathFallback = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => z.object({ phrase: z.string().min(1).max(400) }).parse(i))
  .handler(async ({ data }) => {
    const sys =
      "You convert a spoken math phrase into LaTeX. Rules:\n" +
      "- Reply ONLY with valid JSON: {\"latex\": string|null, \"confidence\": number}.\n" +
      "- If the phrase is ambiguous or does not look like math, return {\"latex\": null, \"confidence\": 0}.\n" +
      "- Do NOT wrap the LaTeX in $ or \\[. Just the raw expression.\n" +
      "- Use \\dfrac for fractions and \\sqrt / \\sqrt[n] for roots.";
    const raw = stripFences(await chat(sys, data.phrase));
    try {
      const parsed = JSON.parse(raw) as { latex: string | null; confidence: number };
      if (typeof parsed.latex === "string" && parsed.confidence >= 0.6) {
        return { latex: parsed.latex, confidence: parsed.confidence };
      }
      return { latex: null, confidence: 0 };
    } catch {
      return { latex: null, confidence: 0 };
    }
  });

/** Restructure raw transcript into steps / paragraphs. Returns markdown. */
export const structureNotes = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z.object({ transcript: z.string().min(1).max(20_000), topic: z.string().optional() }).parse(i),
  )
  .handler(async ({ data }) => {
    const sys =
      "You reformat a teacher's spoken explanation into clean study notes.\n" +
      "- Preserve every math expression exactly (do not re-derive or 'correct' math).\n" +
      "- Where the content is sequential ('first', 'then', 'next', numbered actions), format as a numbered list.\n" +
      "- Where the content is genuinely free-form explanation, keep it as short paragraphs — do NOT force everything into steps.\n" +
      "- Output GitHub-flavored markdown only. No preamble, no code fences.\n" +
      "- Never invent facts the teacher did not say.";
    const user =
      (data.topic ? `Topic: ${data.topic}\n\n` : "") + `Transcript:\n${data.transcript}`;
    const md = stripFences(await chat(sys, user));
    return { markdown: md };
  });

/** Post-session summary + key formulas + exam tips. */
export const summarizeSession = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z
      .object({
        transcript: z.string().min(1).max(20_000),
        formulas: z.array(z.string()).max(50),
        topic: z.string().optional(),
        exam: z.string().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const grounded = Boolean(data.topic || data.exam);
    const sys =
      "You produce a concise post-session note for a competitive-exam student. Return ONLY JSON matching:\n" +
      '{"summary": string, "formulas": string[], "tips": string[]}\n' +
      "Rules:\n" +
      "- summary: 3-6 sentences on the concept(s) actually covered in the transcript.\n" +
      '- formulas: pass through the provided formulas array unchanged (LaTeX). Do NOT invent formulas the teacher did not state.\n' +
      (grounded
        ? "- tips: 2-4 short pointers relevant to the given topic/exam. Only include grounded observations; if unsure, return an empty array.\n"
        : "- tips: return an empty array (no exam/topic grounding provided — do not fabricate exam-frequency claims).\n") +
      "- No preamble, no code fences.";
    const user = JSON.stringify({
      topic: data.topic ?? null,
      exam: data.exam ?? null,
      formulas: data.formulas,
      transcript: data.transcript,
    });
    const raw = stripFences(await chat(sys, user));
    try {
      const parsed = JSON.parse(raw) as {
        summary?: string;
        formulas?: string[];
        tips?: string[];
      };
      return {
        summary: parsed.summary ?? "",
        formulas: Array.isArray(parsed.formulas) ? parsed.formulas : data.formulas,
        tips: Array.isArray(parsed.tips) ? parsed.tips : [],
      };
    } catch {
      return { summary: "", formulas: data.formulas, tips: [] };
    }
  });
