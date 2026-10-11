---
name: update-site-content
description: Update lcbcfoo.dev content (bio, links and contact, work history, studio projects, images, stars and status) while keeping its look and navigation intact. Use for any text, link, project or image change; not for redesigns.
---

# Update lcbcfoo.dev content

lcbcfoo.dev is Lucas's personal site and the studio page for his hobby projects. It is a static page with no build
step: edit the files, run the checker, open it in a browser.

| What | Where |
| --- | --- |
| All text, links, projects | `index.html` |
| Look (foocolors tokens at the top) | `css/site.css` |
| Tabs, studio routing, keys, generated prev/next links | `js/site.js` |
| Images | `assets/` (`assets/projects/<key>/` per project) |
| Page for missing URLs (served by Cloudflare Pages) | `404.html` |
| Checker | `scripts/check-site.py` |
| Design history, not part of the site | `mockups/` |

## Rules that keep the site his

- **His words.** Copy comes from Lucas's LinkedIn bio and each project's own README or website. Reuse sentences as
  written; don't rewrite them into marketing copy. New copy should be short labels, not new claims.
- **"foo" only in the terminal.** Shell prompts read `foo@arch` (`<span class="u">foo</span>@<span class="h">arch</span>`).
  Everywhere else he is Lucas / Lucas Castro. The email `foo@lcbcfoo.dev` is the exception he chose.
- **Terminal identity, ordinary navigation.** Big tabs on top, one full-screen kitty-style window per tab, shell
  prompts as section labels. Do not bring back vim chrome (line numbers, `~` lines, NORMAL statuslines, dimming):
  visitors should not feel stuck inside vim. Keyboard shortcuts are optional extras behind the `?` button.
- **No flicker.** No blinking cursors or looping animations. Short slides and hover transitions are fine.
- **Arch and Hyprland, not macOS.** No traffic-light window buttons. The Arch nod stays subtle (`@arch` in prompts).
- **Images are welcome.** Prefer a real screenshot or artwork over a text-only card.
- **Colors come from the tokens** in `css/site.css` (foocolors.nvim). Each project has an accent class:
  `p-letrado` sky, `p-olyrion` gold, `p-deaddice` coral, `p-reonv` lime, `p-heimdall` cyan, `p-tinker` lilac.

## Page map (`index.html`)

- `<head>`: title, description and Open Graph text. Update these when the bio changes.
- `.topbar`: name, the three tabs (`#hello`, `#work`, `#studio`), clock, github / linkedin / email, `?`.
- `#hello`: `cat hello.md` (greeting, two bio sentences, buttons), avatar, then `ls` with two cards: work, and
  studio with a strip of four project images.
- `#work`: `## Now` (role, NVIDIA, bio sentences, tags) and `## Before` (timeline cards).
- `#studio`: `#studio-overview` holds cards grouped as `games/`, `open-source/` and `tinkering/`. Each card opens an
  `<article class="view detail">` project page further down.

## Common changes

### Bio, links or contact

Search before editing; links appear in several places:

```sh
grep -n 'linkedin\|github.com/lcbcFoo\|mailto:' index.html
```

The topbar and the hello buttons each have github, linkedin and email. Bio sentences appear in `#hello`, `#work`,
the hello "What I work on" card and the `<head>` description.

### A project's status, stars or text

Each project appears twice: its card in `#studio-overview` and its page `<article ... data-key="<key>">`. Change both.
Refresh GitHub stars with:

```sh
gh api repos/lcbcFoo/<repo> --jq .stargazers_count
```

Statuses in use: `live`, `closed beta`, `coming soon`. Dead Dice has its own site (deaddice.com) but isn't in a store
yet: when it reaches Google Play, change its status, and turn the dashed `<span class="btn off">coming soon to Google
Play</span>` into `<a class="btn" href="<store url>">Google Play ↗</a>` next to the deaddice.com button.

### Add a project

1. Pick a key: lowercase letters only, e.g. `newgame`. It becomes the URL `#studio/newgame`.
2. Put images in `assets/projects/newgame/` (see Images below).
3. Add a card to the right group in `#studio-overview`; its position sets the prev/next order:

   ```html
   <a class="card p-tinker" href="#studio/newgame" data-key="newgame">
     <div class="media"><img src="assets/projects/newgame/shot.jpg" alt=""></div>
     <div class="row1"><span class="name">newgame</span><span class="st">live</span></div>
     <p class="tag">One sentence from the project's own README.</p>
     <span class="more">stack · words</span>
   </a>
   ```

4. Add its page after the other `<article class="view detail">` elements:

   ```html
   <article class="view detail p-tinker" id="studio/newgame" data-key="newgame">
     <nav class="crumbs"><a class="back" href="#studio">← studio</a><span class="path">~/studio/tinkering/<b>newgame</b></span></nav>
     <div class="detail-grid">
       <div class="dtext">
         <h2>newgame <span class="st">live</span></h2>
         <p class="tag">Main sentence.</p>
         <p>More detail, in the project's own words.</p>
         <p class="stack">stack · words</p>
         <div class="btns"><a class="btn primary" href="https://..." target="_blank" rel="noopener">open ↗</a></div>
       </div>
       <div class="dmedia">
         <div class="hero"><img src="assets/projects/newgame/shot.jpg" alt="What the screenshot shows"></div>
       </div>
     </div>
   </article>
   ```

5. Don't write prev/next links or folder counts: `js/site.js` generates them from the card order.
6. For a new accent color, add `.p-newgame { --c: var(--<token>); }` next to the others in `css/site.css`, using an
   existing token.
7. Run the checker.

Without a screenshot, use one of the graphic media blocks already in the page: `.pipe` (ReonV), `.stripes`
(foocolors), `.glyph` with an SVG or a word (circuitly, meNES), `.contain-dark` for small UI screenshots.

### Remove a project

Delete its card, its `<article>` and `assets/projects/<key>/`. Then `grep -n '<key>' index.html` for other links: the
work timeline links to `#studio/reonv`, and the hello studio card shows four project images.

### Work history

`## Now` and `## Before` in `#work`. Timeline cards are `<li>` with `.when` (e.g. `5 years · Lumentum/Idea`), an `<h3>`
and a `<p>`. Keep the order Lucas gives; don't invent dates.

## Images

Where the current ones came from. The games' source repos are private: on Lucas's machine the exact folders are
listed in `.agents/local/asset-sources.md` (gitignored, never commit it). Anywhere else, ask Lucas for the files.
Don't write private repo names or local paths into tracked files.

- Dead Dice: its store key art, line logo (`@2x`) and store screenshots. The trailer cover (`trailer-cover.webp`) and
  the 32px party sprites (`hero-*.png`, shown at exactly 3×, 2× on phones) come from deaddice.com. The trailer itself
  is not copied: it streams from `https://deaddice.com/store/video/trailer-16x9.mp4` with `preload="none"`. If
  deaddice.com renames it, update the `<source>`; never autoplay it.
- Letrado: frames of the in-app guide GIF (`magick guide.gif -coalesce f-%03d.png`) and the app logo.
- Trials of Olyrion: only images already public on trialsofolyrion.com. Ask before using any unreleased art.
- Heimdall: YouTube thumbnail `https://img.youtube.com/vi/7X1gntAXsao/maxresdefault.jpg`.
- ironbar-gpu-top: README images, `gh api repos/lcbcFoo/ironbar-gpu-top/contents/assets/<file> --jq .content | base64 -d`.
- Avatar: `https://avatars.githubusercontent.com/u/13180559?v=4&s=460` (460px is the largest GitHub serves; don't
  display it larger than that).

How to prepare them:

- Pixel art (Dead Dice): keep the original PNG file and add `class="pixel"` so browsers scale it without blur. Don't
  resample the files themselves. Where an exact size matters, use whole multiples (the logo is `@2x`, shown at
  273px on its project page, exactly half).
- Photos, paintings and UI screenshots: JPEG, about quality 80, at most 1400px wide:
  `magick in.png -resize '1400x>' -quality 80 out.jpg`.
- Keep each image under 600 KB (the checker warns above that).
- `alt` describes what the picture shows on project pages. Decorative copies (card thumbnails, the hello strip) use
  `alt=""`.

## Check your change

```sh
python3 scripts/check-site.py   # cards ↔ pages, #studio links, files, foo@arch prompts, image weight
xdg-open index.html             # then click through 1 / 2 / 3, open a project, try a 400px-wide window
```

The checker must end with `0 errors`. In the browser, look at the tab you changed at desktop width and at phone width
(devtools, about 400px): nothing should scroll sideways, and the project's page should open from its card and return
to it with ← studio or Esc.

## Publishing

The repo is public at `github.com/lcbcFoo/lcbcfoo.dev`. Pushing to `main` runs `.github/workflows/deploy.yml`: it
runs the checker, copies only `index.html`, `404.html`, `css/`, `js/` and `assets/` into `dist/`, and deploys that to the
Cloudflare Pages project `lcbcfoo-dev`, which serves `lcbcfoo.dev`. A failed check stops the deploy, and the last
good version stays live. Pull requests get a preview URL. If you add a new top-level folder the page needs, add it to
the copy step in the workflow.
