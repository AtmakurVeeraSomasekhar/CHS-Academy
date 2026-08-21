import type { GeoShape, PathShape, Pt, Shape, TextShape } from "./types";

/** Stroke smoothing: quadratic midpoint interpolation over sampled points. */
function strokePath(ctx: CanvasRenderingContext2D, pts: Pt[], s: number) {
  if (pts.length < 2) {
    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0].x * s, pts[0].y * s, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle as string;
      ctx.fill();
    }
    return;
  }
  ctx.beginPath();
  ctx.moveTo(pts[0].x * s, pts[0].y * s);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = ((pts[i].x + pts[i + 1].x) / 2) * s;
    const my = ((pts[i].y + pts[i + 1].y) / 2) * s;
    ctx.quadraticCurveTo(pts[i].x * s, pts[i].y * s, mx, my);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last.x * s, last.y * s);
  ctx.stroke();
}

function drawGeo(ctx: CanvasRenderingContext2D, sh: GeoShape, s: number) {
  const x1 = sh.from.x * s;
  const y1 = sh.from.y * s;
  const x2 = sh.to.x * s;
  const y2 = sh.to.y * s;
  ctx.beginPath();
  if (sh.kind === "line" || sh.kind === "arrow") {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    if (sh.kind === "arrow") {
      const ang = Math.atan2(y2 - y1, x2 - x1);
      const head = Math.max(8, ctx.lineWidth * 3.2);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - head * Math.cos(ang - Math.PI / 7), y2 - head * Math.sin(ang - Math.PI / 7));
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - head * Math.cos(ang + Math.PI / 7), y2 - head * Math.sin(ang + Math.PI / 7));
      ctx.stroke();
    }
    return;
  }
  if (sh.kind === "rectangle") {
    ctx.rect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
    ctx.stroke();
    return;
  }
  ctx.ellipse(
    (x1 + x2) / 2,
    (y1 + y2) / 2,
    Math.abs(x2 - x1) / 2,
    Math.abs(y2 - y1) / 2,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
}

function drawText(ctx: CanvasRenderingContext2D, sh: TextShape, s: number) {
  ctx.save();
  ctx.font = `600 ${sh.size * s}px Inter, ui-sans-serif, system-ui`;
  ctx.fillStyle = sh.color;
  ctx.textBaseline = "top";
  sh.text.split("\n").forEach((line, i) => {
    ctx.fillText(line, sh.at.x * s, sh.at.y * s + i * sh.size * s * 1.3);
  });
  ctx.restore();
}

export function drawShape(ctx: CanvasRenderingContext2D, sh: Shape, s: number) {
  ctx.save();
  ctx.globalAlpha = sh.opacity;
  ctx.strokeStyle = sh.color;
  ctx.lineWidth = Math.max(0.6, sh.width);
  ctx.lineCap = sh.tool === "highlighter" ? "butt" : "round";
  ctx.lineJoin = "round";
  if (sh.tool === "highlighter") ctx.globalCompositeOperation = "multiply";
  if (sh.kind === "path") strokePath(ctx, (sh as PathShape).points, s);
  else if (sh.kind === "text") drawText(ctx, sh as TextShape, s);
  else drawGeo(ctx, sh as GeoShape, s);
  ctx.restore();
}

export function drawAll(
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  s: number,
  w: number,
  h: number,
) {
  ctx.clearRect(0, 0, w, h);
  for (const sh of shapes) drawShape(ctx, sh, s);
}

function distToSeg(p: Pt, a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  const cx = a.x + t * dx;
  const cy = a.y + t * dy;
  return Math.hypot(p.x - cx, p.y - cy);
}

/** Hit test in normalized space; `r` is the eraser radius (normalized). */
export function hitShape(sh: Shape, p: Pt, r: number): boolean {
  if (sh.kind === "path") {
    const pts = (sh as PathShape).points;
    for (let i = 0; i < pts.length - 1; i++) {
      if (distToSeg(p, pts[i], pts[i + 1]) <= r) return true;
    }
    return pts.length === 1 && Math.hypot(pts[0].x - p.x, pts[0].y - p.y) <= r;
  }
  if (sh.kind === "text") {
    const t = sh as TextShape;
    const lines = t.text.split("\n");
    const w = Math.max(...lines.map((l) => l.length)) * t.size * 0.55;
    const h = lines.length * t.size * 1.3;
    return p.x >= t.at.x - r && p.x <= t.at.x + w + r && p.y >= t.at.y - r && p.y <= t.at.y + h + r;
  }
  const g = sh as GeoShape;
  if (g.kind === "line" || g.kind === "arrow") return distToSeg(p, g.from, g.to) <= r;
  const x1 = Math.min(g.from.x, g.to.x);
  const x2 = Math.max(g.from.x, g.to.x);
  const y1 = Math.min(g.from.y, g.to.y);
  const y2 = Math.max(g.from.y, g.to.y);
  const near =
    (Math.abs(p.x - x1) <= r || Math.abs(p.x - x2) <= r) && p.y >= y1 - r && p.y <= y2 + r;
  const near2 =
    (Math.abs(p.y - y1) <= r || Math.abs(p.y - y2) <= r) && p.x >= x1 - r && p.x <= x2 + r;
  if (g.kind === "rectangle") return near || near2;
  // ellipse: distance from normalized ellipse boundary
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const rx = Math.max((x2 - x1) / 2, 1e-6);
  const ry = Math.max((y2 - y1) / 2, 1e-6);
  const v = ((p.x - cx) / rx) ** 2 + ((p.y - cy) / ry) ** 2;
  return Math.abs(Math.sqrt(v) - 1) <= Math.max(r / Math.min(rx, ry), 0.08);
}
