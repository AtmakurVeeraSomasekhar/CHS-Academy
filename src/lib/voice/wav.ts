// Minimal 16 kHz mono WAV encoder for MediaStream audio.
// We use Web Audio (not MediaRecorder timeslicing) so every segment is a
// complete, decodable WAV file the STT gateway will accept — see
// ai-speech-to-text knowledge for why MediaRecorder timeslice fragments fail.

export interface Recorder {
  stop(): Promise<void>;
}

export interface RecorderOptions {
  /** How often to flush a WAV segment upstream, ms. Default 2500. */
  segmentMs?: number;
  /** Called with each completed WAV blob (a self-contained file). */
  onSegment: (wav: Blob) => void;
  /** Called with a 0..1 RMS level for waveform UI. */
  onLevel?: (level: number) => void;
  /** Called on fatal errors (permission denied, no mic). */
  onError?: (err: Error) => void;
}

const TARGET_SR = 16_000;

export async function startRecorder(opts: RecorderOptions): Promise<Recorder> {
  const segmentMs = opts.segmentMs ?? 2500;
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    const err = e instanceof Error ? e : new Error("mic access denied");
    opts.onError?.(err);
    throw err;
  }

  const AC: typeof AudioContext =
    (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
      .AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC();
  const source = ctx.createMediaStreamSource(stream);
  // ScriptProcessor is deprecated but universally supported; AudioWorklet
  // would be preferred in a follow-up. Buffer size 4096 ≈ 85ms at 48kHz.
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  const srcSr = ctx.sampleRate;

  let buffer: Float32Array[] = [];
  let bufferSamples = 0;
  const targetSamples = Math.floor((segmentMs / 1000) * srcSr);

  const flush = () => {
    if (bufferSamples === 0) return;
    const merged = new Float32Array(bufferSamples);
    let off = 0;
    for (const chunk of buffer) {
      merged.set(chunk, off);
      off += chunk.length;
    }
    buffer = [];
    bufferSamples = 0;

    const down = downsample(merged, srcSr, TARGET_SR);
    // Skip near-silent segments to avoid billing empty audio.
    const rms = rmsOf(down);
    if (rms < 0.005) return;
    const wav = encodeWav(down, TARGET_SR);
    opts.onSegment(wav);
  };

  proc.onaudioprocess = (e) => {
    const inp = e.inputBuffer.getChannelData(0);
    // Copy — the underlying buffer is reused.
    const copy = new Float32Array(inp.length);
    copy.set(inp);
    buffer.push(copy);
    bufferSamples += copy.length;

    if (opts.onLevel) opts.onLevel(rmsOf(copy));
    if (bufferSamples >= targetSamples) flush();
  };

  source.connect(proc);
  proc.connect(ctx.destination);

  return {
    async stop() {
      flush();
      try {
        proc.disconnect();
        source.disconnect();
      } catch {
        /* ignore */
      }
      stream.getTracks().forEach((t) => t.stop());
      await ctx.close().catch(() => undefined);
    },
  };
}

function rmsOf(buf: Float32Array): number {
  let s = 0;
  for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
  return Math.sqrt(s / buf.length);
}

function downsample(buf: Float32Array, from: number, to: number): Float32Array {
  if (to >= from) return buf;
  const ratio = from / to;
  const outLen = Math.floor(buf.length / ratio);
  const out = new Float32Array(outLen);
  let o = 0;
  let i = 0;
  while (o < outLen) {
    const next = Math.floor((o + 1) * ratio);
    let sum = 0;
    let count = 0;
    for (; i < next && i < buf.length; i++) {
      sum += buf[i];
      count++;
    }
    out[o++] = count > 0 ? sum / count : 0;
  }
  return out;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}
