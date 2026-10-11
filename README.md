# lcbcfoo.dev

Personal site of Lucas Castro: what I work on, and the studio page for my hobby projects
(Letrado, Trials of Olyrion, Dead Dice, ReonV, Heimdall and some smaller tinkering).

Live at <https://lcbcfoo.dev>.

Plain static files with no build step: `index.html`, `404.html`, `css/`, `js/` and `assets/`. It wears my
[foocolors.nvim](https://github.com/lcbcFoo/foocolors.nvim) palette on a Hyprland-style desktop.

## Run it locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Check

```sh
python3 scripts/check-site.py
```

## Deploy

Pushes to `main` run the check, build `dist/` (`python3 scripts/build-dist.py`, which versions asset links), and
deploy it to Cloudflare Pages through GitHub Actions
(`.github/workflows/deploy.yml`). Pull requests get a preview deployment. The workflow needs two repository
secrets: `CLOUDFLARE_API_TOKEN` (permission: Account · Cloudflare Pages · Edit) and `CLOUDFLARE_ACCOUNT_ID`.

## Editing

See [AGENTS.md](AGENTS.md) and [update-site-content](.agents/skills/update-site-content/SKILL.md).
`mockups/` holds the design rounds that led to this page; it is not deployed.
