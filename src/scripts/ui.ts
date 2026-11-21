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
const hasCv = !!document.querySelector(".cv");
const baseTitle = document.title;
let savedScrollY = 0;

if (!hasCv && root.dataset.view === "cv") {
  root.dataset.view = "site";
}

function applyView(view: "site" | "cv") {
  if (!hasCv) return;
  const leavingSite = root.dataset.view !== "cv" && view === "cv";
  if (leavingSite) savedScrollY = window.scrollY;
  root.dataset.view = view;
  document.title = view === "cv" ? "Farrel Reksa Prawira · CV" : baseTitle;
  for (const b of document.querySelectorAll<HTMLElement>("[data-action=cv]"))
    b.setAttribute("aria-pressed", String(view === "cv"));
  if (view === "cv") window.scrollTo(0, 0);
  else window.scrollTo(0, savedScrollY);
}
function setView(view: "site" | "cv", push = true) {
  if (!hasCv || root.dataset.view === view) return;
  const url = view === "cv" ? "#cv" : location.pathname + location.search;
  if (push) history.pushState({ view }, "", url);
  else history.replaceState({ view }, "", url);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced && "startViewTransition" in document) {
    (document as any).startViewTransition(() => applyView(view));
  } else applyView(view);
}
function toggleView() {
  if (!hasCv) return;
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

if (hasCv) {
  if (root.dataset.view === "cv") {
    document.title = "Farrel Reksa Prawira · CV";
    for (const b of document.querySelectorAll<HTMLElement>("[data-action=cv]"))
      b.setAttribute("aria-pressed", "true");
  }
  const syncFromHash = () => {
    const view = location.hash === "#cv" ? "cv" : "site";
    if (root.dataset.view !== view) applyView(view);
  };
  window.addEventListener("hashchange", syncFromHash);
  window.addEventListener("popstate", syncFromHash);
}

// ---- logo -> row ------------------------------------------------------------
function jumpTo(id: string) {
  const row = document.getElementById(id);
  if (!row) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  row.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  row.classList.remove("flash");
  void row.offsetWidth; // restart the animation if it is already running
  row.classList.add("flash");
  row.addEventListener("animationend", () => row.classList.remove("flash"), { once: true });
}
document.addEventListener("click", (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>("[data-jump]");
  if (el?.dataset.jump) jumpTo(el.dataset.jump);
});

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

// ---- active section highlight in top bar -----------------------------------
const sectionLinks = [...document.querySelectorAll<HTMLAnchorElement>(".bar-sections a[href^='#']")];
if (sectionLinks.length) {
  const targets = sectionLinks
    .map((a) => ({ link: a, el: document.getElementById(a.getAttribute("href")!.slice(1)) }))
    .filter((x): x is { link: HTMLAnchorElement; el: HTMLElement } => !!x.el);

  const updateActive = () => {
    const line = window.innerHeight * 0.35;
    let active: HTMLAnchorElement | null = null;
    for (const { link, el } of targets) {
      if (el.getBoundingClientRect().top <= line) active = link;
    }
    for (const { link } of targets) {
      if (link === active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  };
  updateActive();
  addEventListener("scroll", updateActive, { passive: true });
}

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
  const keys = hasCv ? "press [c] for the cv, [t] for the lights." : "press [t] for the lights.";
  console.log(`\n${art}\n\n  hi. code lives at github.com/farrelrp\n  ${keys}\n`);
}
