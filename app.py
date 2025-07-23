# EihDah-Website/app.py
"""Flask web app for EihDah.com, a static site for a fictional product.
"""

import os
import csv
import datetime
import json
from pathlib import Path

from flask import Flask, render_template, request, redirect, url_for, jsonify
import mailchimp_marketing as MailchimpMarketing
from mailchimp_marketing.api_client import ApiClientError
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
SUBSCRIBER_CSV = BASE_DIR / "subscribers.csv"

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["GA_TRACKING_CODE"] = os.getenv("GA_TRACKING_CODE", "")

# Mailchimp configuration
MAILCHIMP_API_KEY = os.getenv("MAILCHIMP_API_KEY", "")
MAILCHIMP_SERVER_PREFIX = os.getenv("MAILCHIMP_SERVER_PREFIX", "us1")
MAILCHIMP_AUDIENCE_ID = os.getenv("MAILCHIMP_AUDIENCE_ID", "eihdah_waitlist")

# Initialize Mailchimp client
mailchimp = None
if MAILCHIMP_API_KEY:
    try:
        mailchimp = MailchimpMarketing.Client()
        mailchimp.set_config({
            "api_key": MAILCHIMP_API_KEY,
            "server": MAILCHIMP_SERVER_PREFIX
        })
        # Verify API connection by pinging the API
        mailchimp.ping.get()
        app.logger.info(f"Mailchimp API connected successfully with server prefix: {MAILCHIMP_SERVER_PREFIX}")
        
        # Verify audience ID exists
        try:
            audience_info = mailchimp.lists.get_list(MAILCHIMP_AUDIENCE_ID)
            app.logger.info(f"Mailchimp audience '{audience_info['name']}' found with ID: {MAILCHIMP_AUDIENCE_ID}")
        except ApiClientError as e:
            app.logger.error(f"Mailchimp audience ID '{MAILCHIMP_AUDIENCE_ID}' not found: {e}")
    except Exception as e:
        app.logger.error(f"Failed to initialize Mailchimp API client: {e}")
        mailchimp = None


# ── Context Processor ────────────────────────────────────
@app.context_processor
def inject_globals():
    """Expose GA code, year, and debug flag to all templates."""
    return dict(
        GA_TRACKING_CODE=app.config["GA_TRACKING_CODE"],
        year=datetime.datetime.now().year,
        debug=app.debug,  # Pass debug flag to templates
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
@app.route("/thanks")
@app.route("/thanks.html")          # <- alias
def thanks():
    return render_template("thanks.html")


@app.route("/subscribe", methods=["POST"])
def subscribe():
    """Add subscriber to Mailchimp list and backup to CSV."""
    email = request.form.get("email", "").strip().lower()
    
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    
    # Validate email format
    import re
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        return jsonify({"success": False, "message": "Please enter a valid email address"}), 400
    
    # Always save to CSV as backup
    SUBSCRIBER_CSV.parent.mkdir(parents=True, exist_ok=True)
    with SUBSCRIBER_CSV.open("a", newline="") as fh:
        csv.writer(fh).writerow(
            [datetime.datetime.utcnow().isoformat(), email])
    
    # If Mailchimp is configured, add to Mailchimp list
    if mailchimp:
        try:
            # Prepare the data for Mailchimp
            member_info = {
                "email_address": email,
                "status": "subscribed",
                "tags": ["website_signup"],
                "merge_fields": {
                    "SOURCE": "Website Waitlist"
                }
            }
            
            # Add to Mailchimp list
            response = mailchimp.lists.add_list_member(
                MAILCHIMP_AUDIENCE_ID,
                member_info
            )
            
            app.logger.info(f"Successfully added {email} to Mailchimp list {MAILCHIMP_AUDIENCE_ID}")
            
            # If AJAX request, return JSON response
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({"success": True, "message": "Successfully subscribed"})
            
            # Otherwise, redirect to thanks page
            return redirect(url_for("thanks"))
            
        except ApiClientError as error:
            try:
                error_details = json.loads(error.text)
                
                # If already subscribed, treat as success
                if error_details.get("title") == "Member Exists":
                    app.logger.info(f"Email {email} is already subscribed to Mailchimp list")
                    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                        return jsonify({"success": True, "message": "Already subscribed"})
                    return redirect(url_for("thanks"))
                
                # Log specific error details
                error_type = error_details.get("title", "Unknown Error")
                error_detail = error_details.get("detail", "No details available")
                app.logger.error(f"Mailchimp API error: {error_type} - {error_detail}")
                
            except (json.JSONDecodeError, AttributeError):
                app.logger.error(f"Mailchimp API error (unparseable): {error}")
            
            # Return appropriate error response
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    "success": False, 
                    "message": "Failed to subscribe. Please try again."
                }), 500
            
            # Fallback to redirect with error parameter
            return redirect(url_for("landing") + "#cta?error=subscription_failed")
        
        except Exception as e:
            app.logger.error(f"Unexpected error during Mailchimp subscription: {e}")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    "success": False, 
                    "message": "An unexpected error occurred. Please try again."
                }), 500
            return redirect(url_for("landing") + "#cta?error=subscription_failed")
    
    # If Mailchimp is not configured, just redirect
    app.logger.warning("Mailchimp API not configured. Saving subscriber to CSV only.")
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({"success": True, "message": "Successfully subscribed"})
    
    return redirect(url_for("thanks"))


# ── Entrypoint ───────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
# ────────────────────────────────────────────────────────