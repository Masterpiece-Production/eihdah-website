"""Static site generator for GitHub Pages.

* Renders Flask–Jinja templates into standalone `.html` files.
* Injects GA4 ID from the `GA_TRACKING_CODE` environment variable (optional).
* Writes a minimal `sitemap.xml` (excludes no‑index pages) and `robots.txt`.

Run locally via `python render_static.py` or automatically in CI before
`webpack` builds.
"""
from __future__ import annotations

import os
from pathlib import Path
from datetime import datetime, timezone

from app import app  # Flask factory already initialised elsewhere

# -----------------------------------------------------------------------------
# Configuration ----------------------------------------------------------------
# -----------------------------------------------------------------------------
BUILD_DIR = Path.cwd()            # project root – html files at repo root
STATIC_DIR = Path("static")      # /static exists for images & dist bundles
GA_TRACKING_CODE = os.getenv("GA_TRACKING_CODE", "")

# Map template → (output filename, indexable?)
PAGES: dict[str, tuple[str, bool]] = {
    "landing.html": ("index.html", True),
    "privacy.html": ("privacy.html", True),
    "terms.html":   ("terms.html", True),
    "contact.html": "contact.html",   # type: ignore[assignment]
    "thanks.html":  "thanks.html",    # no‑index
}
# Expand shorthand tuples (legacy mapping)
for k, v in list(PAGES.items()):
    if isinstance(v, str):
        PAGES[k] = (v, k != "thanks.html")

# -----------------------------------------------------------------------------
# HTML render pass --------------------------------------------------------------
# -----------------------------------------------------------------------------
print("▸ Rendering static HTML …")
urls_for_sitemap: list[str] = []

a = app  # alias
with a.app_context():
    for tpl_name, (outfile, indexable) in PAGES.items():
        path = "/" if outfile == "index.html" else f"/{outfile}"
        with a.test_request_context(path):
            html = (
                a.jinja_env
                .get_or_select_template(tpl_name)
                .render(GA_TRACKING_CODE=GA_TRACKING_CODE)
            )
        Path(outfile).write_text(html, encoding="utf-8")
        if indexable:
            urls_for_sitemap.append(f"https://eihdah.com{path}")
        print(f" ✔  {outfile} → {path}")

# -----------------------------------------------------------------------------
# sitemap.xml & robots.txt ------------------------------------------------------
# -----------------------------------------------------------------------------
print("▸ Writing sitemap.xml & robots.txt …")
STATIC_DIR.mkdir(exist_ok=True)

# sitemap
sitemap_xml = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
]
for url in urls_for_sitemap:
    sitemap_xml.append(f"  <url><loc>{url}</loc></url>")

sitemap_xml.append("</urlset>\n")
(STATIC_DIR / "sitemap.xml").write_text("\n".join(sitemap_xml), encoding="utf-8")

# robots
robots_txt = (
    "User-agent: *\n"
    "Disallow: /thanks.html\n\n"
    "Sitemap: https://eihdah.com/sitemap.xml\n"
)
(Path("robots.txt")).write_text(robots_txt, encoding="utf-8")

print("✅  Static HTML regeneration complete")
# -----------------------------------------------------------------------------
# End of file --------------------------------------------------------------
# -----------------------------------------------------------------------------
