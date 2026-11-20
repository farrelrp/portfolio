# Portfolio design notes

## Direction (2026-11-21)

Clean and minimal with a **pixel / dithered** visual identity. References and what to take from each:

| Site | Take | Leave |
|---|---|---|
| [ibelick.com](https://ibelick.com) | The pixel look: a full-bleed dithered WebGL visual with tiny text pinned to the corners | — |
| [fathurwithyou.com](https://fathurwithyou.com) | The opening layout: big name, one-line role, pill-shaped links, lots of white space, Manrope | The very long scroll of photo essays |
| [nexxel.dev](https://nexxel.dev) | Below the fold: single-column sections (`* blog`, `* work`, `* projects`) with an "all →" link, a date column, and `[h] home`-style keyboard nav | Opening straight into a block of text. It feels too sudden, so give it a proper hero first |
| [maxleiter.com](https://maxleiter.com) | A thin utility bar (clock, theme toggle, search) and the Geist / Geist Mono pairing | The desktop-folder gimmick |
| [jhey.dev](https://jhey.dev) | Small live status lines (location, weather, now playing) and a metadata footer (`© 2026 · REV a81cd7b · VIEWPORT 1440×900`) | The stickers and mascot |

## Done: console ASCII-art easter egg (from ibelick)

Built in `src/scripts/ui.ts`. It prints on the home page and the 404 page.

Original note:

ibelick prints their name as big `*`-style ASCII art in the DevTools console (see the screenshot from 2026-11-21). Do the same for "reksa":

- Use `console.log` with a template literal containing the ASCII art, optionally followed by a short line (hiring note, repo link, "hi 👋").
- They only print it on certain routes (home, 404, and their main content pages). Do the same, so it doesn't fire on every client navigation.
- Generate the art with a figlet font in a similar style, or draw it by hand with `*`.

## How ibelick's Earth works (worth borrowing)

Read from their production bundle:

- **three.js** shader on a full-screen canvas, rendered with `antialias: false` so the dither pixels stay crisp.
- **Live satellite imagery**: textures come from NASA GIBS WMS (`gibs.earthdata.nasa.gov`). Day uses VIIRS true-color from 2 days ago and falls back to Blue Marble. Night uses VIIRS Black Marble city lights.
- **Real sun position**: solar declination is computed from today's date, so the lit side of the planet is correct.
- Imagery is cached with the **Cache API** (`earth-light-v3`) and stale caches are cleaned up.
- The **intro reveal** plays once per session (`sessionStorage` key `earth-intro-seen`). The camera position is saved on `pagehide`, so moving between pages doesn't restart it.
- The scene follows the pointer.

Idea for mine: the same dithered treatment, but framed on Indonesia / Jakarta. A dithered portrait or another subject would also work. Still to decide.
