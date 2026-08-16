"use client";

import { useEffect, useRef } from "react";

// Pre-rendered "shader" backdrop: flowing line-ribbon waves drawn once to an
// offscreen canvas, plus a twinkling star field. Both layers drift upward as
// the page scrolls. No per-frame geometry — just cheap composites.

const RIBBON_H = 1.45; // ribbon canvas height as multiple of viewport height
const STAR_FIELD_H = 1.4;

type Star = { x: number; y: number; r: number; a: number; ph: number; sp: number };

type RibbonSpec = {
  cy: number; // vertical anchor (fraction of field height)
  rot: number;
  amp: number; // center drift amplitude
  driftF: number;
  driftP: number;
  twistF: number; // twist frequency — where lines pinch and cross
  twistP: number;
  width: number; // ribbon width (fraction of field height)
  lines: number;
  colorIdx: number;
};

const RIBBONS: RibbonSpec[] = [
  { cy: 0.24, rot: -0.16, amp: 0.05, driftF: 0.9, driftP: 0.6, twistF: 1.25, twistP: 2.0, width: 0.3, lines: 44, colorIdx: 0 },
  { cy: 0.55, rot: 0.12, amp: 0.06, driftF: 0.7, driftP: 3.4, twistF: 1.0, twistP: 0.7, width: 0.36, lines: 48, colorIdx: 1 },
  { cy: 0.84, rot: -0.08, amp: 0.04, driftF: 1.1, driftP: 5.1, twistF: 1.5, twistP: 4.2, width: 0.24, lines: 36, colorIdx: 2 },
];

const PALETTES = {
  dark: {
    ribbons: [
      ["#2f6bff", "#3fd6e8"],
      ["#2547d8", "#39b8ff"],
      ["#37cfc4", "#2f6bff"],
    ],
    ribbonAlpha: 0.13,
    star: "190, 212, 255",
    starAlpha: 0.85,
  },
  light: {
    ribbons: [
      ["#25397f", "#177a86"],
      ["#1c2f74", "#2f6f9e"],
      ["#177a6a", "#25397f"],
    ],
    ribbonAlpha: 0.09,
    star: "26, 35, 82",
    starAlpha: 0.5,
  },
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function themeOf(): "dark" | "light" {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function buildRibbonField(w: number, fieldH: number, dpr: number): HTMLCanvasElement {
  const palette = PALETTES[themeOf()];
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.round(w * dpr));
  off.height = Math.max(1, Math.round(fieldH * dpr));
  const ctx = off.getContext("2d");
  if (!ctx) return off;
  ctx.scale(dpr, dpr);
  ctx.lineWidth = 1;

  for (const spec of RIBBONS) {
    const [c0, c1] = palette.ribbons[spec.colorIdx];
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.22, c0);
    grad.addColorStop(0.55, c1);
    grad.addColorStop(0.82, c0);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.strokeStyle = grad;

    ctx.save();
    ctx.translate(w / 2, fieldH * spec.cy);
    ctx.rotate(spec.rot);
    ctx.translate(-w / 2, 0);

    for (let k = 0; k < spec.lines; k++) {
      const u = k / (spec.lines - 1);
      // edge lines read brighter, like the reference
      ctx.globalAlpha = palette.ribbonAlpha * (0.45 + 1.35 * Math.abs(u - 0.5));
      ctx.beginPath();
      for (let x = -90; x <= w + 90; x += 8) {
        const t = x / w;
        const center = Math.sin(t * Math.PI * 2 * spec.driftF + spec.driftP) * spec.amp * fieldH;
        const halfW = Math.sin(t * Math.PI * 2 * spec.twistF + spec.twistP) * spec.width * fieldH * 0.5;
        const wobble = Math.sin(t * 12 + k * 0.33) * 2.5;
        const y = center + (u - 0.5) * 2 * halfW + wobble;
        if (x === -90) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.globalAlpha = 1;
  return off;
}

function buildStars(w: number, fieldH: number): Star[] {
  const rand = mulberry32(1337);
  const count = Math.round((w * fieldH) / 16000);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rand() * w,
      y: rand() * fieldH,
      r: 0.5 + rand() * 1.1,
      a: 0.25 + rand() * 0.75,
      ph: rand() * Math.PI * 2,
      sp: 0.4 + rand() * 1.4,
    });
  }
  return stars;
}

export default function AmbientBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let ribbons: HTMLCanvasElement | null = null;
    let stars: Star[] = [];
    let raf = 0;

    const render = (t: number) => {
      const palette = PALETTES[themeOf()];
      ctx.clearRect(0, 0, w, h);

      const total = document.documentElement.scrollHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, window.scrollY / total) : 0;

      // ribbons rise as you scroll down
      if (ribbons) {
        const oy = -p * (RIBBON_H - 1) * h;
        ctx.drawImage(ribbons, 0, oy, w, h * RIBBON_H);
      }

      // star flecks, drifting up a little slower, twinkling
      const starOy = p * (STAR_FIELD_H - 1) * h;
      for (const s of stars) {
        const tw = reduced ? 0.8 : 0.5 + 0.5 * Math.sin(t * 0.001 * s.sp + s.ph);
        ctx.globalAlpha = s.a * tw * palette.starAlpha;
        ctx.fillStyle = `rgb(${palette.star})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y - starOy, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      render(t);
      raf = requestAnimationFrame(loop);
    };

    const rebuild = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ribbons = buildRibbonField(w, h * RIBBON_H, dpr);
      stars = buildStars(w, h * STAR_FIELD_H);
      render(0); // paint immediately — the rAF loop may be throttled in background tabs
    };

    rebuild();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(rebuild, 180);
    };
    window.addEventListener("resize", onResize);

    const mo = new MutationObserver(() => {
      ribbons = buildRibbonField(w, h * RIBBON_H, dpr);
      render(0);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // keep parallax in sync even when rAF is throttled (background/hidden tabs)
    const onScroll = () => render(performance.now());
    window.addEventListener("scroll", onScroll, { passive: true });

    const onVisibility = () => {
      if (reduced) return;
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVisibility);

    if (!reduced) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      mo.disconnect();
    };
  }, []);

  return (
    <div className="backdrop" aria-hidden="true">
      <canvas ref={canvasRef} className="backdrop-canvas" />
    </div>
  );
}
