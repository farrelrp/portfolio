import { mountDuck } from "./duck";

const root = document.documentElement;

// ---- theme -----------------------------------------------------------------
function setTheme(theme: "dark" | "light") {
  root.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {}
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0a0a0a" : "#f6f5f1");
}
function toggleTheme() {
  setTheme(root.dataset.theme === "light" ? "dark" : "light");
}

// ---- site <-> cv -----------------------------------------------------------
function applyView(view: "site" | "cv") {
  root.dataset.view = view;
  document.title = view === "cv" ? "Farrel Reksa Prawira, CV" : "Farrel Reksa Prawira";
  for (const b of document.querySelectorAll<HTMLElement>("[data-action=cv]"))
    b.setAttribute("aria-pressed", String(view === "cv"));
  window.scrollTo(0, 0);
}
function setView(view: "site" | "cv") {
  if (root.dataset.view === view) return;
  history.replaceState(null, "", view === "cv" ? "#cv" : location.pathname);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced && "startViewTransition" in document) {
    (document as any).startViewTransition(() => applyView(view));
  } else applyView(view);
}
function toggleView() {
  setView(root.dataset.view === "cv" ? "site" : "cv");
}

document.addEventListener("click", (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  if (action === "theme") toggleTheme();
  else if (action === "cv") toggleView();
  else if (action === "site") setView("site");
  else if (action === "print") window.print();
  else return;
  e.preventDefault();
});

window.addEventListener("hashchange", () =>
  applyView(location.hash === "#cv" ? "cv" : "site"),
);

document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if ((e.target as HTMLElement).closest("input, textarea, [contenteditable]")) return;
  if (e.key === "t") toggleTheme();
  else if (e.key === "c") toggleView();
});

// ---- small live details ----------------------------------------------------
const clock = document.querySelector<HTMLElement>("[data-clock]");
if (clock) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  });
  const tick = () => (clock.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 15_000);
}

const viewport = document.querySelector<HTMLElement>("[data-viewport]");
if (viewport) {
  const show = () => (viewport.textContent = `${innerWidth}×${innerHeight}`);
  show();
  addEventListener("resize", show, { passive: true });
}

const canvas = document.querySelector<HTMLCanvasElement>("canvas[data-duck]");
if (canvas) mountDuck(canvas);

// ---- console easter egg ----------------------------------------------------
const GLYPHS: Record<string, string[]> = {
  R: ["**** ", "*   *", "**** ", "*  * ", "*   *"],
  E: ["*****", "*    ", "**** ", "*    ", "*****"],
  K: ["*   *", "*  * ", "***  ", "*  * ", "*   *"],
  S: [" ****", "*    ", " *** ", "    *", "**** "],
  A: [" *** ", "*   *", "*****", "*   *", "*   *"],
};
if (document.body.dataset.egg !== undefined) {
  const art = [0, 1, 2, 3, 4]
    .map((row) => [..."REKSA"].map((ch) => GLYPHS[ch][row].replace(/\*/g, "**").replace(/ /g, "  ")).join("    "))
    .join("\n");
  console.log(`\n${art}\n\n  hi. the source is at github.com/farrelrp\n  press [c] for the cv, [t] for the lights.\n`);
}
