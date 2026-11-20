// A one-button endless runner. A round 1-bit bird hops over stacks of manga.
// Logical resolution is 80px tall, drawn at an integer scale so pixels stay square.

const SPRITES: Record<string, string[]> = {
  run1: [
    ".....######.......",
    "...##......##.....",
    "..#..........#....",
    ".#.......##...#...",
    ".#.......##...####",
    "#..............##.",
    "#...####......#...",
    "#..#....#.....#...",
    "#...####......#...",
    ".#...........#....",
    "..##.......##.....",
    "....#######.......",
    ".....#...#........",
    "....##...##.......",
  ],
  run2: [
    ".....######.......",
    "...##......##.....",
    "..#..........#....",
    ".#.......##...#...",
    ".#.......##...####",
    "#..............##.",
    "#...####......#...",
    "#..#....#.....#...",
    "#...####......#...",
    ".#...........#....",
    "..##.......##.....",
    "....#######.......",
    "......#.#.........",
    ".....##.##........",
  ],
  jump: [
    ".....######.......",
    "...##......##.....",
    "..#..........#....",
    ".#.......##...#...",
    ".#.......##...####",
    "#...##.........##.",
    "#..#..#.......#...",
    "#.#....#......#...",
    "#..####.......#...",
    ".#...........#....",
    "..##.......##.....",
    "....#######.......",
    ".....#..#.........",
    "..................",
  ],
  dead: [
    ".....######.......",
    "...##......##.....",
    "..#..........#....",
    ".#......#.#...#...",
    ".#.......#....####",
    "#.......#.#....##.",
    "#...####......#...",
    "#..#....#.....#...",
    "#...####......#...",
    ".#...........#....",
    "..##.......##.....",
    "....#######.......",
    ".....#...#........",
    "....##...##.......",
  ],
};
const SPR_W = 18;
const SPR_H = 14;

const H = 80;
const GROUND = 68;
const BIRD_X = 16;
const GRAVITY = 560;
const JUMP_V = -190;
const CUT_V = -70;
const START_SPEED = 62;
const MAX_SPEED = 160;
const STEP = 1 / 120;

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

type Book = { x: number; w: number; h: number; y: number };
type Stack = { x: number; books: Book[]; w: number; h: number };

function hash(n: number) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}

export function mountRunner(root: HTMLElement) {
  const canvas = root.querySelector("canvas")!;
  const ctx = canvas.getContext("2d")!;
  const scoreEl = root.querySelector<HTMLElement>("[data-score]")!;
  const bestEl = root.querySelector<HTMLElement>("[data-best]")!;
  const msgEl = root.querySelector<HTMLElement>("[data-msg]")!;

  let W = 200;
  let scale = 3;
  let ink = "rgb(237,237,237)";
  let state: "idle" | "run" | "dead" = "idle";
  let y = GROUND - SPR_H;
  let vy = 0;
  let onGround = true;
  let held = false;
  let buffer = 0; // jump pressed slightly before landing still counts
  let coyote = 0; // and slightly after running off the ground
  let speed = START_SPEED;
  let dist = 0;
  let stacks: Stack[] = [];
  let nextGap = 120;
  let best = 0;
  let visible = true;
  let raf = 0;
  let last = 0;
  let acc = 0;
  let deadAt = 0;

  try {
    best = Number(localStorage.getItem("runner-best") || 0);
  } catch {}

  function readInk() {
    const m = getComputedStyle(document.documentElement).getPropertyValue("--ink").match(/\d+/g);
    if (m) ink = `rgb(${m.slice(0, 3).join(",")})`;
  }

  function resize() {
    const r = root.getBoundingClientRect();
    scale = r.width < 520 ? 2 : 3;
    W = Math.floor(r.width / scale);
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = `${W * scale}px`;
    canvas.style.height = `${H * scale}px`;
    render();
  }

  function reset() {
    y = GROUND - SPR_H;
    vy = 0;
    onGround = true;
    speed = START_SPEED;
    dist = 0;
    stacks = [];
    nextGap = W * 0.8;
    buffer = 0;
  }

  function spawn() {
    const n = 1 + Math.floor(Math.random() * Math.min(3, 1 + dist / 900));
    const books: Book[] = [];
    let top = GROUND;
    let maxW = 0;
    for (let i = 0; i < n; i++) {
      const w = 7 + Math.floor(Math.random() * 6);
      const h = 4 + Math.floor(Math.random() * 3);
      top -= h;
      books.push({ x: Math.floor(Math.random() * 3) - 1, w, h, y: top });
      maxW = Math.max(maxW, w + 2);
    }
    // occasionally two stacks side by side
    if (dist > 600 && Math.random() < 0.25) {
      const h = 5 + Math.floor(Math.random() * 3);
      books.push({ x: maxW + 1, w: 8, h, y: GROUND - h });
      maxW += 10;
    }
    stacks.push({ x: W + 4, books, w: maxW, h: GROUND - top });
    const air = (2 * -JUMP_V) / GRAVITY;
    nextGap = speed * air + maxW + 18 + Math.random() * speed * 0.9;
  }

  function press() {
    if (state === "idle") {
      state = "run";
      reset();
      msgEl.textContent = "";
    } else if (state === "dead") {
      if (performance.now() - deadAt < 350) return; // ignore the tap that killed you
      state = "run";
      reset();
      msgEl.textContent = "";
    }
    held = true;
    buffer = 0.12;
    loop();
  }
  function release() {
    held = false;
    if (vy < CUT_V) vy = CUT_V;
  }

  function step(dt: number) {
    speed = Math.min(MAX_SPEED, speed + dt * 1.6);
    dist += speed * dt;

    buffer -= dt;
    coyote = onGround ? 0.08 : coyote - dt;
    if (buffer > 0 && coyote > 0) {
      vy = JUMP_V;
      onGround = false;
      coyote = 0;
      buffer = 0;
      if (!held) vy = CUT_V * 1.6;
    }
    vy += GRAVITY * dt;
    y += vy * dt;
    if (y >= GROUND - SPR_H) {
      y = GROUND - SPR_H;
      vy = 0;
      onGround = true;
    }

    for (const s of stacks) s.x -= speed * dt;
    stacks = stacks.filter((s) => s.x + s.w > -2);
    nextGap -= speed * dt;
    if (nextGap <= 0) spawn();

    // hitbox is a little smaller than the drawing, which feels fairer
    const bx0 = BIRD_X + 3;
    const bx1 = BIRD_X + SPR_W - 5;
    const by0 = y + 3;
    const by1 = y + SPR_H - 1;
    for (const s of stacks)
      for (const b of s.books) {
        const x0 = s.x + b.x;
        if (bx1 > x0 && bx0 < x0 + b.w && by1 > b.y && by0 < b.y + b.h) {
          state = "dead";
          deadAt = performance.now();
          const score = Math.floor(dist / 10);
          if (score > best) {
            best = score;
            try {
              localStorage.setItem("runner-best", String(best));
            } catch {}
          }
          msgEl.textContent = `tripped on a stack of manga · ${score} · tap to retry`;
          return;
        }
      }
  }

  function px(x: number, yy: number, w = 1, h = 1) {
    ctx.fillRect(Math.round(x), Math.round(yy), w, h);
  }

  function sprite(name: string, x: number, yy: number) {
    const rows = SPRITES[name];
    for (let r = 0; r < rows.length; r++)
      for (let c = 0; c < rows[r].length; c++) if (rows[r][c] === "#") px(x + c, yy + r);
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = ink;

    // far hills: dithered, slow parallax
    const off = dist * 0.15;
    for (let x = 0; x < W; x++) {
      const wx = x + off;
      const hill = 10 + 8 * Math.sin(wx * 0.021) + 5 * Math.sin(wx * 0.053 + 1.3);
      const top = GROUND - hill;
      for (let yy = Math.floor(top); yy < GROUND; yy++) {
        const shade = 0.12 + 0.18 * ((yy - top) / hill);
        if (shade > BAYER4[(yy & 3) * 4 + (Math.floor(wx) & 3)]) px(x, yy);
      }
    }

    // ground line and moving specks
    ctx.clearRect(0, GROUND, W, H - GROUND);
    px(0, GROUND, W, 1);
    for (let x = 0; x < W; x++) {
      const wx = Math.floor(x + dist);
      if (hash(wx) > 0.9) px(x, GROUND + 3 + Math.floor(hash(wx + 7) * 7));
    }

    // manga stacks: a solid block with a spine line on each volume
    for (const s of stacks)
      for (const b of s.books) {
        const x0 = Math.round(s.x + b.x);
        ctx.clearRect(x0, b.y, b.w, b.h);
        px(x0, b.y, b.w, 1);
        px(x0, b.y + b.h - 1, b.w, 1);
        px(x0, b.y, 1, b.h);
        px(x0 + b.w - 1, b.y, 1, b.h);
        if (b.h > 4) px(x0 + 2, b.y + 2, b.w - 4, 1);
      }

    // the bird
    const frame =
      state === "dead" ? "dead" : !onGround ? "jump" : Math.floor(dist / 9) % 2 ? "run1" : "run2";
    ctx.clearRect(BIRD_X + 1, Math.round(y) + 1, SPR_W - 4, SPR_H - 3);
    sprite(frame, BIRD_X, Math.round(y));

    scoreEl.textContent = String(Math.floor(dist / 10)).padStart(5, "0");
    bestEl.textContent = best ? `best ${String(best).padStart(5, "0")}` : "";
  }

  function frame(now: number) {
    raf = 0;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (state === "run") {
      acc += dt;
      while (acc >= STEP && state === "run") {
        step(STEP);
        acc -= STEP;
      }
    }
    render();
    if (state === "run" && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function loop() {
    if (raf) return;
    last = performance.now();
    acc = 0;
    raf = requestAnimationFrame(frame);
  }

  root.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    root.focus({ preventScroll: true });
    press();
  });
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);

  const isJumpKey = (e: KeyboardEvent) => e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW";
  window.addEventListener("keydown", (e) => {
    if (!isJumpKey(e) || e.repeat) return;
    // Only take the key when the game has focus or is running, so Space still scrolls the page otherwise.
    if (document.activeElement !== root && state !== "run") return;
    e.preventDefault();
    press();
  });
  window.addEventListener("keyup", (e) => {
    if (isJumpKey(e)) release();
  });

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && state === "run") loop();
  }).observe(root);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && state === "run") loop();
  });
  new MutationObserver(() => {
    readInk();
    render();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  new ResizeObserver(resize).observe(root);

  readInk();
  resize();
  msgEl.textContent = "tap or press space to play";
}
