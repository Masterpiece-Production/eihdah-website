# render_static.py
"""
Generate a static index.html suitable for GitHub Pages by asking Flask to
render landing.html inside a request context.
"""
from pathlib import Path
from app import app

OUTPUT = Path("index.html")

PAGES = {
    "landing.html": "index.html",
    "privacy.html": "privacy.html",
    "terms.html": "terms.html",
    "contact.html": "contact.html",
}

with app.app_context():
    for tpl, outfile in PAGES.items():
        html_out = app.jinja_env.get_or_select_template(tpl).render()
        Path(outfile).write_text(html_out, encoding="utf-8")
        print(f"✔  {outfile} written")

OUTPUT.write_text(html_out, encoding="utf-8")
print(f"✅  {OUTPUT} generated ({OUTPUT.stat().st_size} bytes)")

print("✅  All static pages generated")
# ────────────────────────────────────────────────────────
