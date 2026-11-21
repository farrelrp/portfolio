// "What to build" tunnel, a full-width band under the bitter lesson chart.
// Pixel tiles hang in space on both sides of a corridor, mirrored four ways.
// Scrolling the page flies the camera down the corridor, so tiles grow from
// specks at the vanishing point and slide off the edges. Nothing else moves it.

const T = 16; // tile size, in tile pixels
const Q = T / 2;
const DEPTH = 9; // length of the corridor before it repeats
const NEAR = 0.22; // tiles closer than this are behind the camera
const PER_QUADRANT = 96;

type RGB = [number, number, number];
const PALETTE: RGB[] = [
  [47, 91, 255], // blue
  [92, 172, 255], // sky
  [200, 245, 66], // lime
  [46, 125, 79], // green
  [255, 164, 124], // peach
  [255, 104, 72], // coral
  [217, 168, 255], // lilac
  [255, 226, 77], // yellow
  [14, 14, 14], // black
  [246, 245, 241], // white
];
const lum = ([r, g, b]: RGB) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One tile: a T×T array of palette indexes with four-way symmetry. */
function makeTile(rand: () => number): Uint8Array {
  const pick = (n: number) => Math.floor(rand() * n);
  // Three or four colours. Black or white is usually one of them, for contrast.
  const cols: number[] = [];
  if (rand() < 0.75) cols.push(rand() < 0.6 ? 8 : 9);
  while (cols.length < 4) {
    const c = pick(8);
    if (!cols.includes(c)) cols.push(c);
  }
  for (let i = cols.length - 1; i > 0; i--) {
    const j = pick(i + 1);
    [cols[i], cols[j]] = [cols[j], cols[i]];
  }

  // Bands of colour by distance from the centre.
  const bands: number[] = [];
  let c = 0;
  while (bands.length < 2 * Q) {
    const w = 1 + pick(3);
    for (let k = 0; k < w; k++) bands.push(cols[c % cols.length]);
    c++;
  }
  const shape = pick(4);
  const cross = rand() < 0.4 ? 1 + pick(2) : 0;
  const dots = rand() < 0.45;
  const core = rand() < 0.35;
  const [crossCol, dotCol, coreCol] = [cols[pick(4)], cols[pick(4)], cols[pick(4)]];

  const out = new Uint8Array(T * T);
  for (let y = 0; y < T; y++)
    for (let x = 0; x < T; x++) {
      const u = x < Q ? Q - 1 - x : x - Q;
      const v = y < Q ? Q - 1 - y : y - Q;
      let d: number;
      if (shape === 0) d = Math.max(u, v);
      else if (shape === 1) d = u + v;
      else if (shape === 2) d = Math.round(Math.hypot(u + 0.5, v + 0.5) - 0.5);
      else d = Math.min(u, v) + ((u + v) >> 2);
      let col = bands[Math.min(d, bands.length - 1)];
      if (dots && u % 4 >= 2 && v % 4 >= 2 && u >= 2 && v >= 2) col = dotCol;
      if (cross && (u < cross || v < cross) && Math.max(u, v) < Q - 2) col = crossCol;
      if (core && u < 2 && v < 2) col = coreCol;
      out[y * T + x] = col;
    }
  return out;
}

type Item = {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  kind: "tile" | "block" | "frame";
  colour: string;
  art?: HTMLCanvasElement;
};

export function mountMake(root: HTMLElement) {
  const canvas = root.querySelector("canvas")!;
  const ctx = canvas.getContext("2d")!;
  const stage = canvas.parentElement!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (c: RGB) => `rgb(${c[0]} ${c[1]} ${c[2]})`;

  // One quadrant of the corridor. It gets mirrored left/right and up/down.
  const rand = rng(20261121);
  const items: Item[] = [];
  for (let i = 0; i < PER_QUADRANT; i++) {
    const roll = rand();
    const kind = roll < 0.42 ? "tile" : roll < 0.74 ? "block" : "frame";
    // Positions snap to a grid, so the mirrored copies line up in rows.
    // Nothing sits close to the axis on both counts, which keeps the middle
    // of the band clear for the headline.
    let x = 0;
    let y = 0;
    do {
      x = 0.14 + Math.floor(rand() * 13) * 0.24;
      y = 0.12 + Math.floor(rand() * 8) * 0.22;
    } while (x < 0.8 && y < 0.5);
    const z = (i / PER_QUADRANT) * DEPTH + rand() * 0.15;
    let w = 0.12 + Math.floor(rand() * 3) * 0.07;
    let h = w;
    if (kind === "block" && rand() < 0.6) rand() < 0.5 ? (w *= 2.2) : (h *= 1.6);
    if (kind === "frame") w = h = 0.05 + rand() * 0.04;
    const item: Item = { x, y, z, w, h, kind, colour: css(PALETTE[Math.floor(rand() * 8)]) };
    if (kind === "tile") {
      const art = document.createElement("canvas");
      art.width = art.height = T;
      const actx = art.getContext("2d")!;
      const img = actx.createImageData(T, T);
      makeTile(rand).forEach((c, p) => img.data.set([...PALETTE[c], 255], p * 4));
      actx.putImageData(img, 0, 0);
      item.art = art;
    }
    items.push(item);
  }
  // Dotted guide lines running down the corridor.
  const rails = Array.from({ length: 7 }, () => [0.2 + rand() * 2.2, 0.1 + rand() * 1.3]);

  let W = 0;
  let H = 0;
  let focal = 0;
  let ink = "rgb(237 237 237)";
  let scrollZ = 0;
  let visible = true;
  let raf = 0;

  function readInk() {
    const m = getComputedStyle(document.documentElement).getPropertyValue("--ink").match(/\d+/g);
    if (m) ink = `rgb(${m.slice(0, 3).join(" ")})`;
  }

  function resize() {
    const r = stage.getBoundingClientRect();
    const cell = r.width < 720 ? 2 : 3;
    W = Math.max(1, Math.ceil(r.width / cell));
    H = Math.max(1, Math.ceil(r.height / cell));
    canvas.width = W;
    canvas.height = H;
    // A narrow screen gets a wider view, so the tiles don't crowd the text.
    focal = Math.max(W * 0.42, H * 0.62);
  }

  function readScroll() {
    // 0 as the band enters the bottom of the screen, 1 as it leaves the top.
    const r = stage.getBoundingClientRect();
    const p = (innerHeight - r.top) / (innerHeight + r.height);
    scrollZ = Math.max(-0.2, Math.min(1.2, p)) * 5.5;
  }

  const depthOf = (z: number, cam: number) => ((((z - cam) % DEPTH) + DEPTH) % DEPTH) + NEAR;

  function frame() {
    raf = 0;
    const cam = scrollZ;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = ink;
    for (const [rx, ry] of rails)
      for (let k = 0; k < DEPTH * 5; k++) {
        const d = depthOf(k / 5, cam);
        ctx.globalAlpha = 0.45 * Math.min(1, (DEPTH + NEAR - d) / 2);
        const dx = (rx / d) * focal;
        const dy = (ry / d) * focal;
        for (const sx of [-1, 1]) for (const sy of [-1, 1]) ctx.fillRect(Math.round(cx + sx * dx), Math.round(cy + sy * dy), 1, 1);
      }

    // Far to near, so closer tiles cover the ones behind them.
    const order = items.map((it) => ({ it, d: depthOf(it.z, cam) })).sort((a, b) => b.d - a.d);
    for (const { it, d } of order) {
      const far = Math.min(1, (DEPTH + NEAR - d) / 1.6);
      const near = Math.min(1, (d - NEAR) / 0.18);
      ctx.globalAlpha = Math.max(0, Math.min(far, near));
      const s = focal / d;
      const w = Math.max(1, Math.round(it.w * s));
      const h = Math.max(1, Math.round(it.h * s));
      for (const sx of [-1, 1])
        for (const sy of [-1, 1]) {
          const x = Math.round(cx + sx * it.x * s - w / 2);
          const y = Math.round(cy + sy * it.y * s - h / 2);
          if (x > W || y > H || x + w < 0 || y + h < 0) continue;
          if (it.kind === "tile" && w >= 6) ctx.drawImage(it.art!, x, y, w, h);
          else if (it.kind === "frame" && w >= 5) {
            const t = Math.max(1, Math.round(w * 0.16));
            ctx.fillStyle = it.colour;
            ctx.fillRect(x, y, w, t);
            ctx.fillRect(x, y + h - t, w, t);
            ctx.fillRect(x, y, t, h);
            ctx.fillRect(x + w - t, y, t, h);
          } else {
            ctx.fillStyle = it.colour;
            ctx.fillRect(x, y, w, h);
          }
        }
    }
    ctx.globalAlpha = 1;
  }
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  readInk();
  resize();
  readScroll();
  kick();

  new ResizeObserver(() => {
    resize();
    readScroll();
    kick();
  }).observe(stage);
  new MutationObserver(() => {
    readInk();
    kick();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) {
      readScroll();
      kick();
    }
  }).observe(stage);

  // The scroll position is the only thing that moves the camera.
  if (!reduced)
    addEventListener(
      "scroll",
      () => {
        if (!visible) return;
        readScroll();
        kick();
      },
      { passive: true },
    );
}
