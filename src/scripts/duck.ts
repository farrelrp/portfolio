// The hero visual: a line drawing rendered as chunky 1-bit pixels.
// The outline is solid. Its glow, the body and the pointer light are
// ordered-dithered, so every pixel is either on or off.

const TEX = 256;
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60,
  28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47,
  7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

function hash(x: number, y: number) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

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
  let eyeCount = 0;
  for (let y = 0; y < TEX; y++)
    for (let x = 0; x < TEX; x++)
      if (tex[(y * TEX + x) * 4 + 2] > 200) {
        eyeSum += y;
        eyeCount++;
      }
  const eyeY = eyeSum / Math.max(1, eyeCount);

  let W = 0;
  let H = 0;
  let cell = 4;
  let size = 0; // duck square, in cells
  let ox = 0;
  let oy = 0;
  let image: ImageData;
  let ink = [237, 237, 237];

  const pointer = { x: -999, y: -999, tx: -999, ty: -999, on: 0 };
  let blinkUntil = 0;
  let nextBlink = 2500;
  const start = performance.now();
  let visible = true;
  let raf = 0;

  function readInk() {
    const m = getComputedStyle(document.documentElement)
      .getPropertyValue("--ink")
      .match(/\d+/g);
    if (m) ink = m.slice(0, 3).map(Number);
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
    size = Math.round(narrow ? Math.min(W * 1.02, H * 0.6) : Math.min(H * 1.02, W * 0.6));
    ox = W - size + Math.round(size * (narrow ? 0.04 : 0.02));
    oy = H - size;
  }

  function frame(now: number) {
    raf = 0;
    const t = (now - start) / 1000;
    const reveal = reduced ? 1 : Math.min(1, t / 1.6);
    const glowIn = reduced ? 1 : Math.min(1, Math.max(0, (t - 0.5) / 1.8));

    pointer.x += (pointer.tx - pointer.x) * 0.12;
    pointer.y += (pointer.ty - pointer.y) * 0.12;

    if (!reduced && now - start > nextBlink) {
      blinkUntil = now + 150;
      nextBlink = now - start + 2600 + Math.random() * 4200;
    }
    const blinking = now < blinkUntil;

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

        if (!alpha) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const light = pointer.on * Math.exp(-(dx * dx + dy * dy) * inv);
          const drift =
            0.5 + 0.5 * Math.sin(x * 0.045 + t * 0.5) * Math.sin(y * 0.06 - t * 0.35);
          let v = glow * (0.5 + 0.3 * drift);
          if (region === 128) v += 0.05 + light * 0.42;
          else v += light * 0.16;
          if (v * glowIn > BAYER[(y & 7) * 8 + (x & 7)]) alpha = 120;
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
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
