# lcbcfoo.dev — agent guide

Lucas's personal site and the studio page for his hobby projects: one static page (`index.html`, `css/site.css`,
`js/site.js`, `assets/`), no build step.

- **Changing content** (bio, links, contact, projects, images, stars): follow
  [update-site-content](.agents/skills/update-site-content/SKILL.md). It also holds the design rules: his own words,
  "foo" only in terminal prompts, terminal look without vim chrome, no flicker, foocolors tokens.
- **Check:** `python3 scripts/check-site.py`, then open `index.html` in a browser at desktop and phone width.
- **Publishing:** pushes to `main` deploy to Cloudflare Pages via `.github/workflows/deploy.yml` (check first, then only the site files).
- `mockups/` is design history (the rounds that led to this page); it is not part of the site.
