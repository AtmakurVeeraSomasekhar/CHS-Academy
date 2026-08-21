import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export type CapturePreset = "landscape" | "square" | "portrait";

const PRESET_DIMS: Record<CapturePreset, { w: number; h: number }> = {
  landscape: { w: 1600, h: 900 },
  square: { w: 1080, h: 1080 },
  portrait: { w: 1080, h: 1350 },
};

export async function captureRegion(el: HTMLElement, scale = 2): Promise<HTMLCanvasElement> {
  document.body.classList.add("capturing");
  try {
    return await html2canvas(el, {
      backgroundColor: "#FFFFFF",
      scale,
      useCORS: true,
    });
  } finally {
    document.body.classList.remove("capturing");
  }
}

export async function captureRegionPng(el: HTMLElement): Promise<string> {
  const canvas = await captureRegion(el);
  return canvas.toDataURL("image/png");
}

/** Compose the captured question region into a preset-sized canvas, letterboxed on white. */
export async function downloadScreenshot(el: HTMLElement, preset: CapturePreset = "landscape") {
  const src = await captureRegion(el);
  const { w, h } = PRESET_DIMS[preset];
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);
  const ratio = Math.min(w / src.width, h / src.height);
  const dw = src.width * ratio;
  const dh = src.height * ratio;
  ctx.drawImage(src, (w - dw) / 2, (h - dh) / 2, dw, dh);
  const a = document.createElement("a");
  a.href = out.toDataURL("image/png");
  a.download = `chs-question-${preset}-${Date.now()}.png`;
  a.click();
}

export async function exportQuestionPdf(el: HTMLElement) {
  const dataUrl = await captureRegionPng(el);
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1600, 900] });
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, 1600, 900, "F");
  pdf.addImage(dataUrl, "PNG", 20, 20, 1560, 860);
  pdf.save(`chs-question-${Date.now()}.pdf`);
}

export async function buildSessionPdf(opts: {
  snapshots: string[];
  totalSec: number;
  streak: number;
}) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1600, 900] });

  // Cover page
  pdf.setFillColor(11, 26, 51);
  pdf.rect(0, 0, 1600, 900, "F");
  pdf.setTextColor(212, 175, 55);
  pdf.setFontSize(64);
  pdf.text("CHS Academy", 800, 380, { align: "center" });
  pdf.setFontSize(28);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Session Report", 800, 440, { align: "center" });
  pdf.setFontSize(18);
  pdf.text(new Date().toLocaleString(), 800, 490, { align: "center" });
  const totMin = Math.floor(opts.totalSec / 60);
  pdf.text(
    `Total time: ${totMin}m ${opts.totalSec % 60}s   ·   🔥 Streak: ${opts.streak} days`,
    800,
    530,
    { align: "center" },
  );

  for (const snap of opts.snapshots) {
    pdf.addPage([1600, 900], "landscape");
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 1600, 900, "F");
    try {
      pdf.addImage(snap, "PNG", 20, 20, 1560, 860);
    } catch {
      /* skip bad snapshot */
    }
  }

  pdf.save(`chs-session-${Date.now()}.pdf`);
}
