#!/usr/bin/env python3
"""Static checks for lcbcfoo.dev. Run from anywhere: python3 scripts/check-site.py

Checks that every studio card has a project page (and the reverse), that every #studio/<key>
link points at a real project, that local files referenced by the page exist, that terminal
prompts use foo@arch, and flags images heavy enough to slow the page down. Stdlib only.
"""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "index.html"
HEAVY_IMAGE_BYTES = 600_000


class Collector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.cards, self.details, self.studio_links, self.local_refs = [], [], [], []
        self.ids = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        classes = (a.get("class") or "").split()
        if "id" in a:
            self.ids.append(a["id"])
        if tag == "a" and "card" in classes:
            self.cards.append(a.get("data-key"))
        if tag == "article" and "detail" in classes:
            self.details.append((a.get("data-key"), a.get("id")))
        href = a.get("href") or ""
        if href.startswith("#studio/"):
            self.studio_links.append(href[len("#studio/"):])
        for attr in ("src", "href", "poster"):
            ref = a.get(attr)
            if ref and not re.match(r"^(https?:|mailto:|#|data:)", ref):
                self.local_refs.append(ref)


def main():
    html = PAGE.read_text(encoding="utf-8")
    page = Collector()
    page.feed(html)
    errors, warnings = [], []

    card_keys = set(page.cards)
    detail_keys = {k for k, _ in page.details}
    for key in sorted(card_keys - detail_keys):
        errors.append(f"card '{key}' has no <article class=\"view detail\" data-key=\"{key}\">")
    for key in sorted(detail_keys - card_keys):
        errors.append(f"project page '{key}' has no card in the studio overview")
    for key, element_id in page.details:
        if element_id != f"studio/{key}":
            errors.append(f"project page '{key}' should have id=\"studio/{key}\" (has {element_id!r})")
    for key in sorted(set(page.studio_links) - detail_keys):
        errors.append(f"link to #studio/{key} points at no project")
    if len(page.cards) != len(card_keys):
        errors.append("two cards share a data-key")
    dupes = {i for i in page.ids if page.ids.count(i) > 1}
    if dupes:
        errors.append(f"duplicate ids: {', '.join(sorted(dupes))}")

    for ref in sorted(set(page.local_refs)):
        path = ROOT / ref.split("#")[0].split("?")[0]
        if not path.is_file():
            errors.append(f"missing file: {ref}")
        elif path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".gif"} and path.stat().st_size > HEAVY_IMAGE_BYTES:
            warnings.append(f"heavy image ({path.stat().st_size // 1000} KB): {ref}")

    for user in re.findall(r'<span class="u">([^<]*)</span>@', html):
        if user != "foo":
            errors.append(f"terminal prompt uses '{user}@'; prompts are foo@arch")

    for w in warnings:
        print(f"warning: {w}")
    for e in errors:
        print(f"error: {e}")
    print(f"{len(card_keys)} projects, {len(set(page.local_refs))} local files, "
          f"{len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
