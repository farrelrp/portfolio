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

## Personal page: rrreksa.com/hi (2026-11-21)

The link that goes in social bios. Same type, colours and 1-bit dither as the main site, but casual in tone.

### References

| Site | Take | Leave |
|---|---|---|
| [lmnt.me/favorites](https://lmnt.me/favorites/) | One shelf per category (music, movies, TV, games). Big cover grid, title and artist under each. Covers play a 10-second sample on tap | The badge wall and the busy home page |
| [maggieappleton.com/library](https://maggieappleton.com/library) | One line of framing ("books that changed how I see the world") so a list reads as taste, not inventory. The "Library / Antilibrary" split. A count above the title | The serif look |
| [rknight.me/almanac](https://rknight.me/almanac) | A log of everything watched, played and listened to, filterable by type, with a "view as list" toggle | Too much to keep up by hand. Pull it from APIs or skip it |
| [dimden.dev](https://dimden.dev) | Personality: quick facts list, "last song" widget, online/offline status, small games tucked into the site | The neocities clutter |
| [shud.in/guestbook](https://shud.in/guestbook) | A plain guestbook. Visitors leave a line, newest first | — |
| [neal.fun](https://neal.fun) | Small, original browser games that people share | — |
| [Raymond Camden /now](https://www.raymondcamden.com/now) | Live "recently" sections: last watched, last listened (via last.fm), current reading | — |

### Layout (single column, mobile first)

```
rrreksa                                   jkt 14:02   work   ◐
─────────────────────────────────────────────────────────────
[dithered portrait]   hi, i'm reksa.
                      I build Tofly, read too much manga,
                      and will talk about albums for hours.
                      ♪ now: <track> — <artist>   (last.fm, live)

* currently
  playing   <game>          reading   <manga>, ch. 112
  watching  <show>          on repeat <album>

* albums              all 24 →
  [■][■][■][■]   1-bit covers, colour on hover or tap,
                 one line on why under the cover
* games               all →
  [■][■][■][■]
* movies              all →
  [■][■][■][■]
* manga               all →
  [■][■][■][■]

* undither            (the game, see below)

* guestbook           leave a 16×16 pixel stamp

* elsewhere
  instagram ↗  letterboxd ↗  anilist ↗  spotify ↗  steam ↗
  the serious version → rrreksa.com
```

- Each shelf shows a "favourite four" (Letterboxd style) with an "all →" link to `/hi/albums` and so on. That stays scannable on a phone: a 2×2 grid per shelf.
- Covers render through the same dither as the hero: grey 1-bit until hover or tap, then full colour. Same rule as the logos.
- The main site gets a `me` chip in the top bar next to `cv`.

### Game ideas (all original)

1. **Undither** (recommended). A daily puzzle built from my shelves. A cover starts as a 4×4 grid of dithered pixels. Each wrong guess or skip doubles the resolution (8, 16, 32, 64). Guess with type-ahead from the shelf list. The share text is a row of squares showing which step you got it on. D1 stores daily stats ("41% got it at 16×16"). It fits the site's dither look, and it's a reason to come back daily.
2. **Pixel guestbook.** Visitors draw a 16×16 1-bit stamp and sign it, and the stamps tile into a wall. D1 plus Turnstile for spam.
3. **Tiny bird game.** An original 1-bit bird mascot (not Punpun) in a one-button arcade game with a D1 leaderboard. The most generic of the three.

### Data

| Shelf | Source | Key needed |
|---|---|---|
| Albums, now playing | Last.fm API (scrobbles from Spotify) | free API key |
| Album covers | MusicBrainz + Cover Art Archive | none |
| Movies, shows | TMDB, or Letterboxd RSS if I log there | free TMDB key |
| Manga | AniList GraphQL | none (public list) |
| Games | Steam Web API for recent, IGDB for covers | Steam key, Twitch app for IGDB |

- Favourites are hand-picked in a data file (like `profile.ts`) with a one-line note each. APIs only fill in covers and metadata at build time.
- Covers get downloaded at build into the repo or R2, so the canvas dither can read their pixels (cross-origin images can't be read).
- Live bits (now playing, currently) come from a small Worker endpoint, cached for 60 s.

### Cloudflare stack

- Workers static assets (already set up) plus a Worker `main` for `/api/*`.
- `/api/now`: Last.fm proxy, cached with the Cache API.
- `/api/undither`: today's puzzle and stats in D1. A cron trigger picks the daily cover.
- `/api/guestbook`: D1, Turnstile to block bots.

### Needed from me

- Top 4 (and up to ~12) albums, games, movies, manga, each with one line on why.
- Usernames: Last.fm, AniList or MAL, Letterboxd, Steam, Instagram.
- A photo for the dithered portrait.
- Which game to build first.
