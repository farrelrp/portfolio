// "The bitter lesson" chart, between the hero and the rest of the page.
// Two curves on a 1-bit canvas: knowledge built in by hand climbs fast and
// levels off; a general method that scales with compute starts lower, passes
// it and keeps going. It draws itself once when it scrolls into view, then
// the slider takes over.

const WW = 220;
const WH = 120;
const AX = { x0: 6, x1: 214, y0: 10, y1: 112 }; // plot area, in canvas pixels

const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60,
  28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47,
  7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map((v) => (v + 0.5) / 64);

const hand = (x: number) => 0.6 * (1 - Math.exp(-6 * x));
const general = (x: number) => 0.02 + 0.93 * Math.pow(x, 1.35);

let CROSS = 0.5;
for (let x = 0.2; x < 1; x += 0.001)
  if (general(x) >= hand(x)) {
    CROSS = x;
    break;
  }

/** Caption shown while the slider is below each threshold. */
const CAPTIONS: [number, string][] = [
  [0.25, "With little compute, the hand-built system wins easily."],
  [0.5, "Each new rule adds less than the one before it."],
  [CROSS, "With more compute, the general method catches up."],
  [0.85, "It overtakes and keeps climbing."],
  [Infinity, "The hand-built system has hit its ceiling."],
];

export function mountBitter(root: HTMLElement) {
  const canvas = root.querySelector("canvas")!;
  const ctx = canvas.getContext("2d")!;
  canvas.width = WW;
  canvas.height = WH;
  const image = ctx.createImageData(WW, WH);
  const slider = root.querySelector<HTMLInputElement>("input[type=range]")!;
  const caption = root.querySelector<HTMLElement>("[data-caption]")!;
  const labelHand = root.querySelector<HTMLElement>("[data-label=hand]")!;
  const labelGeneral = root.querySelector<HTMLElement>("[data-label=general]")!;
  const labelCross = root.querySelector<HTMLElement>("[data-label=cross]")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let s = reduced ? 1 : 0; // how far along the compute axis is drawn, 0..1
  let sweeping = false;
  let ink = [237, 237, 237];

  function readInk() {
    const m = getComputedStyle(document.documentElement).getPropertyValue("--ink").match(/\d+/g);
    if (m) ink = m.slice(0, 3).map(Number);
  }

  const px = (x: number) => AX.x0 + x * (AX.x1 - AX.x0);
  const py = (v: number) => AX.y1 - v * (AX.y1 - AX.y0);

  function render() {
    const data = image.data;
    const [r, g, b] = ink;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 0;
    }
    const set = (x: number, y: number, a: number) => {
      x = Math.round(x);
      y = Math.round(y);
      if (x < 0 || y < 0 || x >= WW || y >= WH) return;
      const i = (y * WW + x) * 4 + 3;
      data[i] = Math.max(data[i], a);
    };

    // baseline
    for (let x = AX.x0; x <= AX.x1; x += 2) set(x, AX.y1 + 1, 110);

    // Light dither under the general curve. Once it has passed the
    // hand-built one, the gap between them gets a denser fill.
    const xEnd = px(s);
    for (let x = AX.x0; x <= xEnd; x++) {
      const t = (x - AX.x0) / (AX.x1 - AX.x0);
      const yg = py(general(t));
      const yh = py(hand(t));
      for (let y = Math.ceil(yg); y <= AX.y1; y++) {
        const th = BAYER[(y & 7) * 8 + (x & 7)];
        const inGap = t > CROSS && y < yh;
        if (inGap ? 0.42 > th : 0.1 > th) set(x, y, inGap ? 150 : 90);
      }
    }

    // Curves, two pixels thick. The hand-built one is drawn dimmer.
    for (let i = 0; i <= 2400; i++) {
      const t = (i / 2400) * s;
      const x = px(t);
      const yh = py(hand(t));
      const yg = py(general(t));
      set(x, yh, 150);
      set(x, yh + 1, 150);
      set(x, yg, 255);
      set(x, yg - 1, 255);
    }

    if (s >= CROSS) {
      const cx = px(CROSS);
      for (let y = py(general(CROSS)) + 4; y <= AX.y1; y += 2) set(cx, y, 200);
    }
    ctx.putImageData(image, 0, 0);

    // HTML labels ride on the ends of the curves.
    const place = (el: HTMLElement, x: number, y: number) => {
      el.style.left = `${(x / WW) * 100}%`;
      el.style.top = `${(y / WH) * 100}%`;
    };
    place(labelHand, px(s), py(hand(s)));
    place(labelGeneral, px(s), py(general(s)));
    const show = s > 0.06 ? "1" : "0";
    labelHand.style.opacity = show;
    labelGeneral.style.opacity = show;
    // Whichever curve is on top gets its label above the line.
    const generalAhead = general(s) > hand(s);
    labelGeneral.dataset.side = generalAhead ? "above" : "below";
    labelHand.dataset.side = generalAhead ? "below" : "above";
    place(labelCross, px(CROSS), AX.y1);
    labelCross.style.opacity = s >= CROSS ? "1" : "0";

    caption.textContent = CAPTIONS.find(([until]) => s < until)![1];
  }

  let raf = 0;
  const kick = () => {
    if (!raf)
      raf = requestAnimationFrame(() => {
        raf = 0;
        render();
      });
  };

  slider.addEventListener("input", () => {
    sweeping = false;
    s = Number(slider.value) / 1000;
    kick();
  });

  function sweep() {
    sweeping = true;
    const start = performance.now();
    const step = (now: number) => {
      if (!sweeping) return;
      const k = Math.min(1, (now - start) / 5600);
      s = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
      slider.value = String(Math.round(s * 1000));
      render();
      if (k < 1) requestAnimationFrame(step);
      else sweeping = false;
    };
    requestAnimationFrame(step);
  }

  readInk();
  slider.value = String(s * 1000);
  render();
  new MutationObserver(() => {
    readInk();
    kick();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  if (!reduced) {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        setTimeout(sweep, 250);
      },
      { threshold: 0.6 },
    );
    io.observe(canvas);
  }
}
