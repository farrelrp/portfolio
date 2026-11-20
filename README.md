# reksa-portfolio

Personal site. Astro builds static HTML, Cloudflare Workers serves it.

```sh
pnpm dev       # local dev server
pnpm build     # build to ./dist
pnpm preview   # serve ./dist through wrangler, same as production
pnpm deploy    # build and deploy to Cloudflare
```

## Where things live

- `src/data/profile.ts` holds all the content. The site and the CV view both read from it.
- `src/scripts/duck.ts` draws the dithered hero. It samples `public/duck.png`.
- `scripts/make-duck.py` rebuilds that texture from a source drawing:
  `python3 scripts/make-duck.py source.png public/duck.png`
- `src/scripts/ui.ts` handles the theme toggle, the CV toggle, the clock and the console art.

The CV view lives at `/#cv`. Press `c` to switch to it and `t` to change theme. Printing the page gives a black-on-white CV.
