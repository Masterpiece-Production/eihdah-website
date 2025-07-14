# render_static.py
"""
Generate a static index.html suitable for GitHub Pages by asking Flask to
render landing.html inside a request context.
"""

from app import app      # re-use your existing Flask app
from pathlib import Path

OUTPUT = Path("index.html")

with app.test_request_context("/"):
    html_out = app.jinja_env.get_or_select_template("landing.html").render()

OUTPUT.write_text(html_out, encoding="utf-8")
print(f"✅  {OUTPUT} generated ({OUTPUT.stat().st_size} bytes)")
