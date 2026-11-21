// The duck's yellow pixel panel, reused as a marker highlight behind a word.
// Blocks build in from the top-left, flash ink as they land, then their
// tones drift slowly, the same way the panel behind the duck's head does.

import { SKY, TONE_AT, hash, noise } from "./duck";

const CELL = 2; // css px per pixel
const BLOCK = 4; // pixels per block side

export function mountHighlight(canvas: HTMLCanvasElement) {
  const host = canvas.parentElement!;
  const ctx = canvas.getContext("2d")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 1;
  let H = 1;
  let nbx = 1;
  let nby = 1;
  let image = ctx.createImageData(1, 1);
  let ink = [237, 237, 237];
  const start = performance.now();
  let lastDraw = 0;
  let visible = true;
  let raf = 0;

  function readInk() {
    const m = getComputedStyle(document.documentElement).getPropertyValue("--ink").match(/\d+/g);
    if (m) ink = m.slice(0, 3).map(Number);
  }

  function resize() {
    const r = host.getBoundingClientRect();
    nbx = Math.max(1, Math.round(r.width / (CELL * BLOCK)));
    nby = Math.max(1, Math.round(r.height / (CELL * BLOCK)));
    W = nbx * BLOCK;
    H = nby * BLOCK;
    canvas.width = W;
    canvas.height = H;
    image = ctx.createImageData(W, H);
  }

  function frame(now: number) {
    raf = 0;
    const t = (now - start) / 1000;
    // Once the intro sweep finishes, drift at ~15fps to stay easy on battery.
    if (!reduced && t > 1.2 && now - lastDraw < 66) {
      if (visible) raf = requestAnimationFrame(frame);
      return;
    }
    lastDraw = now;
    const data = image.data;
    let i = 0;
    for (let y = 0; y < H; y++) {
      const by = Math.floor(y / BLOCK);
      const rowLag = hash(by, 7) * 0.12;
      for (let x = 0; x < W; x++, i += 4) {
        const bx = Math.floor(x / BLOCK);
        // Sweep from the top-left, like a marker pass with ragged row ends.
        const age = reduced ? 9 : t - (0.15 + (bx / nbx) * 0.55 + (by / nby) * 0.2 + rowLag);
        if (age < 0) {
          data[i + 3] = 0;
          continue;
        }
        let c = ink;
        if (age > 0.08) {
          const u = bx / 6.5 + t * 0.03;
          const v = by / 3.6;
          const n = 0.68 * noise(u, v) + 0.32 * noise(u * 2.3 + 9, v * 2.3 + 4);
          let tone = 0;
          while (tone < 5 && n > TONE_AT[tone]) tone++;
          c = SKY[tone < 2 ? tone : (tone + 1) >> 1];
          if (tone === 2 || tone === 4) {
            const hatch = (x + y) % 3 === 0 || (((x - y) % 3) + 3) % 3 === 0;
            c = SKY[hatch ? tone / 2 + 1 : tone / 2];
          }
        }
        data[i] = c[0];
        data[i + 1] = c[1];
        data[i + 2] = c[2];
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    if (!reduced && visible) raf = requestAnimationFrame(frame);
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  readInk();
  resize();
  kick();

  new ResizeObserver(() => {
    resize();
    kick();
  }).observe(host);

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick();
  }).observe(host);

  new MutationObserver(() => {
    readInk();
    kick();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}
