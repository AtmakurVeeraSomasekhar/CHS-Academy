// Server route: POST /api/voice/transcribe
// Accepts a multipart form with an `audio` WAV file + optional `language`
// and returns { text } from the Lovable AI STT gateway.
// Buffered (non-streaming) is fine here — each client segment is short
// (~2.5s) so the perceived-instant UX comes from the client sending
// segments continuously, not from SSE deltas within one segment.

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/voice/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response("LOVABLE_API_KEY missing", { status: 500 });
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return new Response("expected multipart/form-data", { status: 400 });
        }
        const audio = form.get("audio");
        if (!(audio instanceof Blob)) {
          return new Response("missing audio", { status: 400 });
        }
        // Guard: reject empty / near-empty uploads to fail fast.
        if (audio.size < 1024) {
          return Response.json({ text: "" });
        }

        const language = form.get("language");

        const upstream = new FormData();
        // The gateway supports gpt-4o-mini-transcribe (cost-efficient).
        upstream.append("model", "openai/gpt-4o-mini-transcribe");
        upstream.append("file", audio, "segment.wav");
        if (typeof language === "string" && language) {
          upstream.append("language", language);
        }

        const resp = await fetch(
          "https://ai.gateway.lovable.dev/v1/audio/transcriptions",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}` },
            body: upstream,
          },
        );

        if (!resp.ok) {
          const body = await resp.text().catch(() => "");
          return new Response(body || "STT upstream error", { status: resp.status });
        }
        const json = (await resp.json()) as { text?: string };
        return Response.json({ text: json.text ?? "" });
      },
    },
  },
});
