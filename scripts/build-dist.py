#!/usr/bin/env python3
"""Collect the published site into dist/ with versioned asset links. Run: python3 scripts/build-dist.py

Copies index.html, 404.html, css/, js/ and assets/ into dist/, then rewrites every local src/href/poster that
points into css/, js/ or assets/ to carry ?v=<hash of that file>. Browsers may keep CSS, JS and images for hours
(the lcbcfoo.dev zone sends max-age=14400), so a changed file must get a new URL or visitors see new HTML with
an old stylesheet. The source files stay unversioned so index.html still opens directly. Stdlib only.
"""
from pathlib import Path
import hashlib
import re
import shutil
import sys

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
PAGES = ["index.html", "404.html"]
FOLDERS = ["css", "js", "assets"]
REF = re.compile(r'\b(src|href|poster)="(/?)((?:css|js|assets)/[^"?#]+)"')


def file_hash(path, cache={}):
    if path not in cache:
        cache[path] = hashlib.sha256(path.read_bytes()).hexdigest()[:8]
    return cache[path]


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    for folder in FOLDERS:
        shutil.copytree(ROOT / folder, DIST / folder)

    missing = []
    for name in PAGES:
        html = (ROOT / name).read_text(encoding="utf-8")

        def version(m):
            attr, slash, rel = m.groups()
            target = ROOT / rel
            if not target.is_file():
                missing.append(f"{name}: {rel}")
                return m.group(0)
            return f'{attr}="{slash}{rel}?v={file_hash(target)}"'

        out, count = REF.subn(version, html)
        (DIST / name).write_text(out, encoding="utf-8")
        print(f"{name}: {count} asset links versioned")

    if missing:
        for m in missing:
            print(f"error: missing file {m}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
