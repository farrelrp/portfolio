import { defineConfig } from "astro/config";

// Static output. Cloudflare Workers serves ./dist as static assets (see wrangler.jsonc).
export default defineConfig({
  site: "https://rrreksa.com",
  build: { format: "directory" },
});
