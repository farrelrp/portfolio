// The hero visual: a line drawing rendered as chunky 1-bit pixels.
// The outline is solid. Its glow, the body and the pointer light are
// ordered-dithered, so every pixel is either on or off.
// Behind the head sits a yellow panel of pixel blocks, like a book cover.
// It builds in block by block from the top-left, then its tones drift and
// clouds made of white dots cross it. The outline prints dark over the panel.

const TEX = 256;
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60,
  28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47,
  7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

export function hash(x: number, y: number) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/** Smooth value noise, 0..1. */
export function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

// Panel tones, dark to light. Tones 2 and 4 are cross-hatched from two colours.
export const SKY = [
  [240, 172, 8],
  [250, 198, 22],
  [254, 220, 84],
  [255, 240, 176],
];
const WHITE = [255, 252, 240];
export const TONE_AT = [0.3, 0.38, 0.44, 0.51, 0.58]; // noise thresholds between the six tones

/** Dot clouds. Position and size are fractions of the panel. */
const CLOUDS = [
  { x: 0.05, y: 0.2, w: 0.5, h: 0.11, speed: 0.016 },
  { x: 0.7, y: 0.42, w: 0.4, h: 0.085, speed: 0.024 },
  { x: 0.35, y: 0.68, w: 0.6, h: 0.12, speed: 0.012 },
  { x: 0.95, y: 0.93, w: 0.44, h: 0.09, speed: 0.02 },
];
/** Three bumps on a flat base: [centre, height, radius] as fractions of the cloud. */
const BUMPS = [
  [-0.26, 0.55, 0.2],
  [0.04, 1, 0.26],
  [0.32, 0.5, 0.17],
];

async function loadTexture(src: string) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = c.height = TEX;
  const cx = c.getContext("2d", { willReadFrequently: true })!;
  cx.drawImage(img, 0, 0, TEX, TEX);
  return cx.getImageData(0, 0, TEX, TEX).data;
}

export async function mountDuck(canvas: HTMLCanvasElement) {
  const host = canvas.parentElement!;
  const ctx = canvas.getContext("2d")!;
  const tex = await loadTexture(canvas.dataset.src!);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Find the eye's vertical centre so a blink can collapse it to a line.
  let eyeSum = 0;
  let eyeSumX = 0;
  let eyeCount = 0;
  for (let y = 0; y < TEX; y++)
    for (let x = 0; x < TEX; x++)
      if (tex[(y * TEX + x) * 4 + 2] > 200) {
        eyeSum += y;
        eyeSumX += x;
        eyeCount++;
      }
  const eyeY = eyeSum / Math.max(1, eyeCount);
  const eyeX = eyeCount ? eyeSumX / eyeCount : TEX * 0.74;

  let W = 0;
  let H = 0;
  let cell = 4;
  let size = 0; // duck square, in cells
  let ox = 0;
  let oy = 0;
  let image: ImageData;
  let block = 6; // panel block, in cells
  let nbx = 1; // panel size, in blocks
  let nby = 1;
  let px0 = 0; // panel rectangle, in cells
  let py0 = 0;
  let px1 = 0;
  let py1 = 0;
  let dark = [10, 10, 10]; // the darker of ink and page, for lines over the panel
  let tones = new Uint8Array(1);
  let ages = new Float32Array(1); // seconds since each block appeared, < 0 if not yet
  let ink = [237, 237, 237];

  const pointer = { x: -999, y: -999, tx: -999, ty: -999, on: 0 };
  let blinkUntil = 0;
  let nextBlink = 2500;
  const start = performance.now();
  let lastDraw = 0;
  let visible = true;
  let raf = 0;

  function readInk() {
    const m = getComputedStyle(document.documentElement)
      .getPropertyValue("--ink")
      .match(/\d+/g);
    if (m) ink = m.slice(0, 3).map(Number);
    const page = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
    const bg = page ? page.slice(0, 3).map(Number) : [10, 10, 10];
    dark = bg[0] + bg[1] + bg[2] < ink[0] + ink[1] + ink[2] ? bg : ink;
  }

  function resize() {
    const r = host.getBoundingClientRect();
    const narrow = r.width < 720;
    cell = narrow ? 3 : 4;
    W = Math.max(1, Math.ceil(r.width / cell));
    H = Math.max(1, Math.ceil(r.height / cell));
    canvas.width = W;
    canvas.height = H;
    image = ctx.createImageData(W, H);
    // Anchor the drawing to the bottom-right corner, where it bleeds off the edge.
    const tablet = !narrow && r.width < 1040;
    size = Math.round(
      narrow
        ? Math.min(W * 1.02, H * 0.5)
        : tablet
          ? Math.min(H * 0.88, W * 0.5)
          : Math.min(H * 1.02, W * 0.6),
    );
    ox = W - size + Math.round(size * (narrow ? 0.04 : tablet ? 0.08 : 0.02));
    oy = H - size;
    // The panel is a square centred on the eye.
    block = Math.max(4, Math.round(size / 34));
    nbx = nby = Math.round((size * 0.38) / block);
    px0 = ox + Math.round((eyeX / TEX) * size - (nbx * block) / 2);
    py0 = oy + Math.round((eyeY / TEX) * size - (nby * block) / 2);
    px1 = px0 + nbx * block;
    py1 = py0 + nby * block;
    tones = new Uint8Array(nbx * nby);
    ages = new Float32Array(nbx * nby);
  }

  function frame(now: number) {
    raf = 0;
    const t = (now - start) / 1000;
    // Once intro reveal finishes and pointer is idle, pace at ~24fps to save battery.
    if (!reduced && t > 2.6 && !pointer.on && now - lastDraw < 40) {
      if (visible) raf = requestAnimationFrame(frame);
      return;
    }
    lastDraw = now;
    const reveal = reduced ? 1 : Math.min(1, t / 1.6);
    const glowIn = reduced ? 1 : Math.min(1, Math.max(0, (t - 0.5) / 1.8));

    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;

    if (!reduced && now - start > nextBlink) {
      blinkUntil = now + 150;
      nextBlink = now - start + 2600 + Math.random() * 4200;
    }
    const blinking = now < blinkUntil;

    // Panel blocks for this frame. Each has a tone, and a start time that
    // sweeps down from the top-left with ragged row ends.
    for (let by = 0; by < nby; by++) {
      const rowLag = hash(by, 7) * 0.3;
      for (let bx = 0; bx < nbx; bx++) {
        const u = bx / 6.5 + t * 0.03;
        const v = by / 3.6;
        const n = 0.68 * noise(u, v) + 0.32 * noise(u * 2.3 + 9, v * 2.3 + 4);
        let tone = 0;
        while (tone < 5 && n > TONE_AT[tone]) tone++;
        tones[by * nbx + bx] = tone;
        const at = 0.45 + (by / nby) * 0.95 + (bx / nbx) * 0.6 + rowLag;
        ages[by * nbx + bx] = reduced ? 9 : t - at;
      }
    }
    // Clouds move in whole dot steps, so the dots themselves never shimmer.
    const clouds = CLOUDS.map((c) => {
      const span = 1 + c.w * 2;
      const fx = ((((c.x + t * c.speed + c.w) % span) + span) % span) - c.w;
      return {
        cx: px0 + Math.round((fx * (px1 - px0)) / 2) * 2,
        base: py0 + Math.round((c.y * (py1 - py0)) / 2) * 2,
        w: c.w * (px1 - px0),
        h: c.h * (py1 - py0),
      };
    });
    const cloudsIn = reduced ? 1 : Math.min(1, Math.max(0, (t - 1.1) / 1.2));

    const data = image.data;
    const scale = TEX / size;
    const sigma = 34;
    const inv = 1 / (2 * sigma * sigma);
    const [r, g, b] = ink;
    let i = 0;

    for (let y = 0; y < H; y++) {
      const ty = Math.floor((y - oy) * scale);
      const rowIn = ty >= 0 && ty < TEX;
      for (let x = 0; x < W; x++, i += 4) {
        let line = 0;
        let glow = 0;
        let region = 0;
        const tx = Math.floor((x - ox) * scale);
        if (rowIn && tx >= 0 && tx < TEX) {
          const k = (ty * TEX + tx) * 4;
          line = tex[k];
          glow = tex[k + 1] / 255;
          region = tex[k + 2];
        }

        let alpha = 0;
        if (region > 200) {
          // eye
          if (!blinking || Math.abs(ty - eyeY) < 2.2) alpha = 255;
        } else if (line > 110) {
          alpha = 255;
        }
        if (alpha && reveal < 1 && hash(x, y) > reveal) alpha = 0;

        let cr = r;
        let cg = g;
        let cb = b;
        const body = region === 128;
        const mark = alpha > 0; // outline or eye
        let built = false;
        if (x >= px0 && x < px1 && y >= py0 && y < py1) {
          const bi = Math.floor((y - py0) / block) * nbx + Math.floor((x - px0) / block);
          const age = ages[bi];
          if (age >= 0) {
            built = true;
            alpha = 255;
            // A block flashes in the ink colour for a moment as it lands.
            if (age > 0.08) {
              const tone = tones[bi];
              let c = SKY[tone < 2 ? tone : (tone + 1) >> 1];
              if (tone === 2 || tone === 4) {
                const hatch = (x + y) % 3 === 0 || (((x - y) % 3) + 3) % 3 === 0;
                c = SKY[hatch ? tone / 2 + 1 : tone / 2];
              }
              if (mark) c = dark;
              cr = c[0];
              cg = c[1];
              cb = c[2];
            }
          }
        }

        // Dot clouds, over the panel and a little way past its edges.
        if (!mark && !(x & 1) && !(y & 1)) {
          for (const c of clouds) {
            const up = c.base - y;
            if (up < 0 || up > c.h) continue;
            const dx = (x - c.cx) / c.w;
            let hit = up < 3 && Math.abs(dx) < 0.62;
            for (const [bc, bh, br] of BUMPS) {
              const k = up / (bh * c.h);
              if (k < 1 && Math.abs(dx - bc) < br * Math.sqrt(1 - k * k)) hit = true;
            }
            if (hit && hash(x, y + 91) < cloudsIn) {
              alpha = 255;
              if (built) [cr, cg, cb] = WHITE;
              else [cr, cg, cb] = ink;
            }
          }
        }

        const sky = built && !mark;
        if (!alpha || sky) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const light = pointer.on * Math.exp(-(dx * dx + dy * dy) * inv);
          const drift =
            0.5 + 0.5 * Math.sin(x * 0.045 + t * 0.5) * Math.sin(y * 0.06 - t * 0.35);
          let v = glow * (0.5 + 0.3 * drift);
          // The pointer only lights the body and the panel, never the text.
          if (body) v += 0.05 + light * 0.42;
          if (sky) v = light * 0.42;
          if (v * glowIn > BAYER[(y & 7) * 8 + (x & 7)]) {
            // Over the panel, the pointer light shows as white dots.
            if (alpha) [cr, cg, cb] = WHITE;
            else alpha = 120;
          }
        }

        data[i] = cr;
        data[i + 1] = cg;
        data[i + 2] = cb;
        data[i + 3] = alpha;
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

  if (!reduced) {
    window.addEventListener(
      "pointermove",
      (e) => {
        const r = canvas.getBoundingClientRect();
        pointer.tx = (e.clientX - r.left) / cell;
        pointer.ty = (e.clientY - r.top) / cell;
        if (!pointer.on) {
          pointer.x = pointer.tx;
          pointer.y = pointer.ty;
        }
        pointer.on = 1;
      },
      { passive: true },
    );
    document.documentElement.addEventListener("pointerleave", () => (pointer.on = 0));
  }
}
