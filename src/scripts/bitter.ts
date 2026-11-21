// 1-bit Bayer-dithered compute bars for the Bitter Lesson eras in Bitter.astro.

const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60,
  28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47,
  7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

function readInk(): [number, number, number] {
  const m = getComputedStyle(document.documentElement).getPropertyValue("--ink").match(/\d+/g);
  return m ? (m.slice(0, 3).map(Number) as [number, number, number]) : [237, 237, 237];
}

export function mountBitter(root: HTMLElement) {
  const canvases = [...root.querySelectorAll<HTMLCanvasElement>("canvas[data-bar]")];
  if (!canvases.length) return;

  function draw() {
    const [r, g, b] = readInk();
    for (const c of canvases) {
      const w = Number(c.dataset.w) || 120;
      const h = Number(c.dataset.h) || 5;
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;
      const img = ctx.createImageData(w, h);
      const d = img.data;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const t = x / Math.max(1, w - 1);
          const density = 0.16 + 0.72 * Math.pow(t, 1.15);
          if (density > BAYER[(y & 7) * 8 + (x & 7)]) {
            const idx = (y * w + x) * 4;
            d[idx] = r;
            d[idx + 1] = g;
            d[idx + 2] = b;
            d[idx + 3] = 215;
          }
        }
      }
      ctx.putImageData(img, 0, 0);
    }
  }

  draw();
  new MutationObserver(draw).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}
