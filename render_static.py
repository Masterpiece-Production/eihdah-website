# render_static.py
"""
Generate a static index.html suitable for GitHub Pages by asking Flask to
render landing.html inside a request context.
"""
from app import app
from pathlib import Path

PAGES = {
    "landing.html": "index.html",
    "privacy.html": "privacy.html",
    "terms.html":   "terms.html",
    "contact.html": "contact.html",
    "thanks.html":  "thanks.html",
}

with app.app_context():
    for tpl, outfile in PAGES.items():
        # derive a fake path (root for index; otherwise '/filename')
        path = "/" if outfile == "index.html" else f"/{outfile}"
        with app.test_request_context(path):
            html_out = app.jinja_env.get_or_select_template(tpl).render(
                GA_TRACKING_CODE=""  # empty for static build
            )
            Path(outfile).write_text(html_out, encoding="utf-8")
            print(f"✔  {outfile} written as {path}")

print("✅  Static HTML regeneration complete")
# ────────────────────────────────────────────────────────
