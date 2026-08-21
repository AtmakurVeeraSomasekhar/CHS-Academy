// Provider abstraction. The default provider (Lovable AI Gateway) posts WAV
// segments to /api/voice/transcribe and returns the finalized transcript
// for each segment. Swapping to Deepgram/Azure/Google means implementing
// this same interface with a WebSocket connection instead.

import { startRecorder, type Recorder } from "./wav";

export interface SpeechSegment {
  /** Final text for the just-completed audio segment. */
  text: string;
  /** Provider's confidence, 0..1. Currently always 1 for the gateway impl. */
  confidence: number;
}

export interface SpeechSession {
  stop(): Promise<void>;
}

export interface SpeechProvider {
  readonly id: string;
  /**
   * Start capturing mic audio. The provider streams "interim" text as
   * segments are captured (level updates) and "final" text as each segment
   * comes back from the STT service.
   */
  start(handlers: {
    onInterim?: (partial: string) => void; // shown in lighter style
    onFinal: (seg: SpeechSegment) => void; // committed to transcript
    onLevel?: (level: number) => void; // 0..1, for waveform
    onError?: (err: Error) => void;
    language?: string; // ISO-639-1
  }): Promise<SpeechSession>;
}

export const lovableGatewayProvider: SpeechProvider = {
  id: "lovable-gateway",
  async start({ onFinal, onLevel, onError, onInterim, language }) {
    let rec: Recorder | null = null;
    // Serialize segment posts so results append in speech order.
    let queue: Promise<void> = Promise.resolve();

    const post = async (wav: Blob) => {
      onInterim?.("…");
      const fd = new FormData();
      fd.append("audio", wav, "segment.wav");
      if (language) fd.append("language", language);
      try {
        const resp = await fetch("/api/voice/transcribe", { method: "POST", body: fd });
        if (!resp.ok) {
          const msg = await resp.text().catch(() => "");
          throw new Error(`STT ${resp.status}: ${msg || resp.statusText}`);
        }
        const { text } = (await resp.json()) as { text: string };
        const trimmed = text.trim();
        if (trimmed) onFinal({ text: trimmed, confidence: 1 });
      } catch (e) {
        onError?.(e instanceof Error ? e : new Error(String(e)));
      } finally {
        onInterim?.("");
      }
    };

    rec = await startRecorder({
      segmentMs: 2500,
      onLevel,
      onError,
      onSegment: (wav) => {
        queue = queue.then(() => post(wav));
      },
    });

    return {
      async stop() {
        await rec?.stop();
        // Drain any in-flight segment transcription before resolving.
        await queue;
      },
    };
  },
};
