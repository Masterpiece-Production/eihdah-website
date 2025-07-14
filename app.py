# EihDah-Website/app.py
"""Flask web app for EihDah.com, a static site for a fictional product.
"""

import os
import csv
import datetime
from pathlib import Path

from flask import Flask, render_template, request, redirect, url_for

BASE_DIR = Path(__file__).resolve().parent
SUBSCRIBER_CSV = BASE_DIR / "subscribers.csv"

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["GA_TRACKING_CODE"] = os.getenv("GA_TRACKING_CODE", "")


# ── Context Processor ────────────────────────────────────
@app.context_processor
def inject_globals():
    """Expose GA code & year to all templates."""
    return dict(
        GA_TRACKING_CODE=app.config["GA_TRACKING_CODE"],
        year=datetime.datetime.now().year,
    )


# ── Routes ───────────────────────────────────────────────
@app.route("/")
def landing():
    return render_template("landing.html")


# ── Privacy ──
@app.route("/privacy")
@app.route("/privacy.html")          # <- alias
def privacy():
    return render_template("privacy.html")


# ── Terms ──
@app.route("/terms")
@app.route("/terms.html")            # <- alias
def terms():
    return render_template("terms.html")


# ── Contact ──
@app.route("/contact")
@app.route("/contact.html")          # <- alias
def contact():
    return render_template("contact.html")


# ── Thanks page (new) ──
@app.route("/thanks.html")
def thanks():
    return render_template("thanks.html")


@app.route("/subscribe", methods=["POST"])
def subscribe():
    """Very simple email capture → CSV. Replace with DB/Mailchimp later."""
    email = request.form.get("email", "").strip().lower()
    if email:
        SUBSCRIBER_CSV.parent.mkdir(parents=True, exist_ok=True)
        with SUBSCRIBER_CSV.open("a", newline="") as fh:
            csv.writer(fh).writerow(
                [datetime.datetime.utcnow().isoformat(), email])
    # Redirect back to landing with anchor so user sees confirmation.
    return redirect(url_for("landing") + "#cta")


# ── Entrypoint ───────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
# ────────────────────────────────────────────────────────
