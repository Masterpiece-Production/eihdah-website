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
from app import app

# -----------------------------------------------------------------------------
# Configuration --------------------------------------------------------------
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
# HTML render pass ------------------------------------------------------------
# -----------------------------------------------------------------------------
print("▸ Rendering static HTML …")
urls_for_sitemap: list[str] = []

a = app  # alias
with a.app_context():
    for tpl_name, (outfile, indexable) in PAGES.items():
        path = "/" if outfile == "index.html" else f"/{outfile}"
        with a.test_request_context(path):
            # Get page metadata from app.py if available
            page_name = tpl_name.replace(".html", "")
            page_meta = getattr(a, "PAGE_METADATA", {}).get(page_name, {})
            
            # Determine page type for structured data
            page_type = "home" if outfile == "index.html" else outfile.replace(".html", "")
            
            html = (
                a.jinja_env
                .get_or_select_template(tpl_name)
                .render(
                    GA_TRACKING_CODE=GA_TRACKING_CODE,
                    page_meta=page_meta,
                    page_type=page_type
                )
            )
        Path(outfile).write_text(html, encoding="utf-8")
        if indexable:
            urls_for_sitemap.append(f"https://eihdah.com{path}")
        print(f" ✔  {outfile} → {path}")

# -----------------------------------------------------------------------------
# sitemap.xml & robots.txt ----------------------------------------------------
# -----------------------------------------------------------------------------
print("▸ Generating enhanced sitemap.xml & robots.txt …")
STATIC_DIR.mkdir(exist_ok=True)

# Import and use the enhanced sitemap generator
import sys
from pathlib import Path
sys.path.append(str(Path.cwd()))
from scripts.generate_sitemap import generate_sitemap, update_robots_txt

# Generate sitemap and robots.txt with enhanced metadata
generate_sitemap()
update_robots_txt()

print("✅  Static HTML regeneration complete")
# -----------------------------------------------------------------------------
# End of file --------------------------------------------------------------
# -----------------------------------------------------------------------------
