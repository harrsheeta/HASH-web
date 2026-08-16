import * as THREE from "three";
import type { Video } from "@/lib/data";
import { LAND, PORT } from "./layout";

const PAPER = "#f7f3e8";
const INK = "#141b3f";
const MUTED = "#59618d";
const TAG = "#b87a2e";

// next/font registers hashed family names — resolve them from the CSS vars
function fam(cssVar: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.body).getPropertyValue(cssVar).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

const serif = () => fam("--font-display", "serif");
const sans = () => fam("--font-body", "sans-serif");
const mono = () => fam("--font-mono", "monospace");

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  const clipped = lines.slice(0, maxLines);
  if (lines.length > maxLines || (lines.length === maxLines && line && !lines.includes(line))) {
    const last = clipped[maxLines - 1];
    clipped[maxLines - 1] = `${last.replace(/[.,\s]*$/, "")}…`;
  }
  return clipped;
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

export function drawPolaroid(canvas: HTMLCanvasElement, video: Video, img: HTMLImageElement | null) {
  const dims = video.orientation === "landscape" ? LAND : PORT;
  canvas.width = dims.cw;
  canvas.height = dims.ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, dims.cw, dims.ch);

  // paper frame
  roundedRect(ctx, 0, 0, dims.cw, dims.ch, 16);
  ctx.fillStyle = PAPER;
  ctx.fill();

  const pad = 26;
  const imgW = dims.cw - pad * 2;
  const imgH = video.orientation === "landscape" ? Math.round((imgW * 9) / 16) : Math.round((imgW * 16) / 9);

  // photo area
  ctx.save();
  roundedRect(ctx, pad, pad, imgW, imgH, 10);
  ctx.clip();
  if (img) {
    drawCoverImage(ctx, img, pad, pad, imgW, imgH);
    // subtle vignette so pale thumbnails still read against the paper
    const vg = ctx.createLinearGradient(0, pad, 0, pad + imgH);
    vg.addColorStop(0, "rgba(19,22,71,0)");
    vg.addColorStop(1, "rgba(19,22,71,0.16)");
    ctx.fillStyle = vg;
    ctx.fillRect(pad, pad, imgW, imgH);
  } else {
    const g = ctx.createLinearGradient(pad, pad, pad + imgW, pad + imgH);
    g.addColorStop(0, "#0c1233");
    g.addColorStop(0.5, "#1d7a58");
    g.addColorStop(1, "#e77e4f");
    ctx.fillStyle = g;
    ctx.fillRect(pad, pad, imgW, imgH);

    // play glyph
    const cxp = pad + imgW / 2;
    const cyp = pad + imgH / 2;
    ctx.fillStyle = "rgba(247,243,232,0.92)";
    ctx.beginPath();
    ctx.arc(cxp, cyp, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0c1233";
    ctx.beginPath();
    ctx.moveTo(cxp - 12, cyp - 20);
    ctx.lineTo(cxp + 22, cyp);
    ctx.lineTo(cxp - 12, cyp + 20);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(247,243,232,0.9)";
    ctx.font = `500 22px ${mono()}`;
    ctx.textAlign = "center";
    ctx.fillText(video.platform === "Instagram" ? "INSTAGRAM REEL" : "YOUTUBE", cxp, cyp + 84);
    ctx.textAlign = "left";
  }
  ctx.restore();

  // tag chip stuck on the photo
  ctx.font = `500 17px ${mono()}`;
  const tagText = video.tag.toUpperCase();
  const chipW = ctx.measureText(tagText).width + 26;
  roundedRect(ctx, pad + 12, pad + 12, chipW, 34, 9);
  ctx.fillStyle = "rgba(247,243,232,0.94)";
  ctx.fill();
  ctx.fillStyle = TAG;
  ctx.fillText(tagText, pad + 25, pad + 35);

  // caption: serif title, then meta + platform on the bottom row
  const capTop = pad + imgH + (video.orientation === "landscape" ? 34 : 40);
  const titleSize = video.orientation === "landscape" ? 28 : 25;

  ctx.fillStyle = INK;
  ctx.font = `500 ${titleSize}px ${serif()}`;
  const lines = wrapLines(ctx, video.title, dims.cw - pad * 2, 2);
  lines.forEach((line, i) => {
    ctx.fillText(line, pad, capTop + i * (titleSize + 8));
  });

  ctx.fillStyle = MUTED;
  ctx.font = `500 19px ${sans()}`;
  ctx.fillText(video.meta, pad, dims.ch - 22, dims.cw - pad * 2 - 80);

  ctx.fillStyle = TAG;
  ctx.font = `400 17px ${mono()}`;
  ctx.textAlign = "right";
  ctx.fillText(video.platform === "Instagram" ? "IG ↗" : "YT ↗", dims.cw - pad, dims.ch - 22);
  ctx.textAlign = "left";
}

export function makeTapeTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 110;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(247,243,232,0.93)";
  ctx.fillRect(0, 6, 640, 98);
  // torn tape edges
  ctx.clearRect(0, 6, 8, 12);
  ctx.clearRect(632, 92, 8, 12);
  ctx.fillStyle = "#1d2650";
  ctx.font = `500 38px ${mono()}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), 320, 58);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

let shadowTex: THREE.CanvasTexture | null = null;

export function getShadowTexture(): THREE.CanvasTexture {
  if (shadowTex) return shadowTex;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 30, 128, 128, 126);
  g.addColorStop(0, "rgba(4,5,24,0.55)");
  g.addColorStop(0.7, "rgba(4,5,24,0.22)");
  g.addColorStop(1, "rgba(4,5,24,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  shadowTex = new THREE.CanvasTexture(canvas);
  return shadowTex;
}
