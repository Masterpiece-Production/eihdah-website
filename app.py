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

from image_helpers import register_jinja_filters

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
SUBSCRIBER_CSV = BASE_DIR / "subscribers.csv"

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["GA_TRACKING_CODE"] = os.getenv("GA_TRACKING_CODE", "")

# Register Jinja2 filters for responsive images
register_jinja_filters(app)

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


# ── Page Metadata for Open Graph Tags and SEO ──────────────────
PAGE_METADATA = {
    "landing": {
        "title": "EihDah – AI Sentiment Analysis Platform",
        "description": "AI‑powered public sentiment insights from real conversations across YouTube, Instagram, X, and more. Transform social media data into actionable business intelligence.",
        "url": "https://eihdah.com/",
        "image": "https://eihdah.com/static/img/og-cover.png",
        "og_type": "website",
        "twitter_card": "summary_large_image",
        "og_image_width": "1200",
        "og_image_height": "630",
        "keywords": "sentiment analysis, AI, social media analytics, public opinion, YouTube analytics, Instagram analytics, Twitter analytics, social listening, brand monitoring"
    },
    "privacy": {
        "title": "Privacy Policy | EihDah",
        "description": "Learn how EihDah handles your data and protects your privacy.",
        "url": "https://eihdah.com/privacy.html",
        "image": "https://eihdah.com/static/img/og-cover.png",
        "og_type": "website",
        "twitter_card": "summary",
        "og_image_width": "1200",
        "og_image_height": "630"
    },
    "terms": {
        "title": "Terms of Service | EihDah",
        "description": "Terms and conditions for using the EihDah platform.",
        "url": "https://eihdah.com/terms.html",
        "image": "https://eihdah.com/static/img/og-cover.png",
        "og_type": "website",
        "twitter_card": "summary",
        "og_image_width": "1200",
        "og_image_height": "630"
    },
    "contact": {
        "title": "Contact Us | EihDah",
        "description": "Get in touch with the EihDah team for questions or support.",
        "url": "https://eihdah.com/contact.html",
        "image": "https://eihdah.com/static/img/og-cover.png",
        "og_type": "website",
        "twitter_card": "summary",
        "og_image_width": "1200",
        "og_image_height": "630"
    },
    "thanks": {
        "title": "Thanks for Joining | EihDah",
        "description": "Thank you for joining the EihDah waitlist. We'll keep you updated on our progress.",
        "url": "https://eihdah.com/thanks.html",
        "image": "https://eihdah.com/static/img/og-thanks.png",
        "og_type": "website",
        "twitter_card": "summary_large_image",
        "og_image_width": "1200",
        "og_image_height": "630"
    }
}

# ── Routes ───────────────────────────────────────────────
@app.route("/")
def landing():
    # Define breadcrumbs for the landing page
    breadcrumbs = []
    
    # Define product schema data
    product = {
        "name": "EihDah",
        "description": "AI‑powered public sentiment insights from real conversations across YouTube, Instagram, X, and more.",
        "image": "https://eihdah.com/static/img/logo.svg",
        "price": "0",
        "currency": "USD",
        "availability": "https://schema.org/ComingSoon"
    }
    
    return render_template(
        "landing.html", 
        page_meta=PAGE_METADATA["landing"], 
        page_type="home",
        breadcrumbs=breadcrumbs,
        product=product
    )


# ── Privacy ──
@app.route("/privacy")
@app.route("/privacy.html")          # <- alias
def privacy():
    breadcrumbs = [{"title": "Privacy Policy", "url": "/privacy.html"}]
    return render_template("privacy.html", page_meta=PAGE_METADATA["privacy"], page_type="privacy", breadcrumbs=breadcrumbs)


# ── Terms ──
@app.route("/terms")
@app.route("/terms.html")            # <- alias
def terms():
    breadcrumbs = [{"title": "Terms of Service", "url": "/terms.html"}]
    return render_template("terms.html", page_meta=PAGE_METADATA["terms"], page_type="terms", breadcrumbs=breadcrumbs)


# ── Contact ──
@app.route("/contact")
@app.route("/contact.html")          # <- alias
def contact():
    breadcrumbs = [{"title": "Contact Us", "url": "/contact.html"}]
    return render_template("contact.html", page_meta=PAGE_METADATA["contact"], page_type="contact", breadcrumbs=breadcrumbs)


# ── Thanks page (new) ──
@app.route("/thanks")
@app.route("/thanks.html")          # <- alias
def thanks():
    breadcrumbs = [{"title": "Thank You", "url": "/thanks.html"}]
    return render_template("thanks.html", page_meta=PAGE_METADATA["thanks"], page_type="thanks", breadcrumbs=breadcrumbs)


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