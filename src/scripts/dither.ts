// Draws an image as 1-bit pixels in the theme's ink colour (Atkinson dithering).
// Dark theme lights up the bright parts, light theme inks the dark parts,
// so the picture reads the right way round in both.

// Aim for roughly this many dither pixels across, at 2–4 css px each.
const TARGET_CELLS = 80;

type Item = { canvas: HTMLCanvasElement; img: HTMLImageElement; gamma: number };
const items: Item[] = [];

function ink(): [number, number, number] {
  const m = getComputedStyle(document.documentElement).getPropertyValue("--ink").match(/\d+/g);
  return m ? (m.slice(0, 3).map(Number) as [number, number, number]) : [237, 237, 237];
}

function draw({ canvas, img, gamma }: Item) {
  if (!img.naturalWidth) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width) return;
  const cell = Math.min(4, Math.max(2, Math.round(rect.width / TARGET_CELLS)));
  const w = Math.max(8, Math.round(rect.width / cell));
  const h = Math.max(8, Math.round(rect.height / cell));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  // object-fit: cover, done by hand
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  const src = ctx.getImageData(0, 0, w, h);
  const d = src.data;

  const dark = document.documentElement.dataset.theme !== "light";
  const n = w * h;
  const raw = new Float32Array(n);
  const hist = new Uint32Array(256);
  let opaque = 0;
  for (let i = 0; i < n; i++) {
    if (d[i * 4 + 3] < 128) {
      raw[i] = -1;
      continue;
    }
    const l = 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2];
    raw[i] = l;
    hist[Math.min(255, Math.round(l))]++;
    opaque++;
  }
  // Auto-levels: stretch the 3rd–97th percentile to full range, so dark
  // covers and the photo don't dither into a few lonely dots.
  const pct = (p: number) => {
    let sum = 0;
    for (let v = 0; v < 256; v++) if ((sum += hist[v]) >= opaque * p) return v;
    return 255;
  };
  const lo = pct(0.03);
  const hi = Math.max(lo + 32, pct(0.97));
  const lum = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (raw[i] < 0) {
      lum[i] = -1; // transparent: stays empty and takes no error
      continue;
    }
    let l = Math.min(1, Math.max(0, (raw[i] - lo) / (hi - lo)));
    l = Math.pow(l, gamma);
    lum[i] = dark ? l : 1 - l;
  }

  const [r, g, b] = ink();
  const out = ctx.createImageData(w, h);
  const o = out.data;
  const spread = (x: number, y: number, e: number) => {
    if (x < 0 || x >= w || y >= h) return;
    const k = y * w + x;
    if (lum[k] >= 0) lum[k] += e;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = y * w + x;
      const v = lum[k];
      if (v < 0) continue;
      const on = v > 0.5;
      const e = (v - (on ? 1 : 0)) / 8;
      spread(x + 1, y, e);
      spread(x + 2, y, e);
      spread(x - 1, y + 1, e);
      spread(x, y + 1, e);
      spread(x + 1, y + 1, e);
      spread(x, y + 2, e);
      if (on) {
        o[k * 4] = r;
        o[k * 4 + 1] = g;
        o[k * 4 + 2] = b;
        o[k * 4 + 3] = 255;
      }
    }
  }
  ctx.putImageData(out, 0, 0);
}

export function mountDither(root: ParentNode = document) {
  for (const canvas of root.querySelectorAll<HTMLCanvasElement>("canvas[data-dither]")) {
    const img = new Image();
    img.decoding = "async";
    img.src = canvas.dataset.dither!;
    const item = { canvas, img, gamma: Number(canvas.dataset.gamma || 1) };
    items.push(item);
    img.addEventListener("load", () => draw(item), { once: true });
    new ResizeObserver(() => draw(item)).observe(canvas);
  }

  new MutationObserver(() => items.forEach(draw)).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // Touch has no hover, so a tap toggles the colour version.
  document.addEventListener("click", (e) => {
    const fig = (e.target as HTMLElement).closest<HTMLElement>("[data-reveal]");
    if (!fig || (e.target as HTMLElement).closest("a")) return;
    fig.classList.toggle("on");
  });
}
