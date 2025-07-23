"""
Enhanced sitemap generator for EihDah website.

This script generates a comprehensive sitemap.xml file with:
- All indexable pages from the site
- Last modification dates
- Change frequency hints
- Priority values
- Proper XML formatting

Run as part of the build process or manually with `python scripts/generate_sitemap.py`
"""
from __future__ import annotations

import os
import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# -----------------------------------------------------------------------------
# Configuration --------------------------------------------------------------
# -----------------------------------------------------------------------------
BUILD_DIR = Path.cwd()            # project root
STATIC_DIR = Path("static")       # /static directory for sitemap output
SITE_URL = "https://eihdah.com"   # Base URL for the site

# Map pages to their metadata: (filename, indexable, changefreq, priority)
PAGES: Dict[str, Tuple[str, bool, str, float]] = {
    "landing.html": ("index.html", True, "weekly", 1.0),
    "privacy.html": ("privacy.html", True, "monthly", 0.5),
    "terms.html":   ("terms.html", True, "monthly", 0.5),
    "contact.html": ("contact.html", True, "monthly", 0.7),
    "thanks.html":  ("thanks.html", False, "monthly", 0.3),
}

def get_last_modified(file_path: str) -> str:
    """Get the last modified date of a file in ISO format."""
    try:
        # For HTML files, check the template or the output file
        template_path = Path("templates") / file_path
        output_path = Path(file_path.replace(".html", ".html") 
                          if not file_path.endswith(".html") else file_path)
        
        # Use template file if it exists, otherwise use output file
        if template_path.exists():
            mtime = template_path.stat().st_mtime
        elif output_path.exists():
            mtime = output_path.stat().st_mtime
        else:
            # Default to current date if file doesn't exist
            return datetime.datetime.now().strftime("%Y-%m-%d")
        
        # Convert to ISO format date
        return datetime.datetime.fromtimestamp(mtime).strftime("%Y-%m-%d")
    except Exception:
        # Fallback to current date if any error occurs
        return datetime.datetime.now().strftime("%Y-%m-%d")

def generate_sitemap() -> None:
    """Generate an enhanced sitemap.xml file."""
    print("▸ Generating enhanced sitemap.xml...")
    
    # Ensure the static directory exists
    STATIC_DIR.mkdir(exist_ok=True)
    
    # Start XML file
    sitemap_xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    
    # Add each indexable page
    for tpl_name, (outfile, indexable, changefreq, priority) in PAGES.items():
        if indexable:
            path = "/" if outfile == "index.html" else f"/{outfile}"
            url = f"{SITE_URL}{path}"
            lastmod = get_last_modified(tpl_name)
            
            sitemap_xml.append(f'  <url>')
            sitemap_xml.append(f'    <loc>{url}</loc>')
            sitemap_xml.append(f'    <lastmod>{lastmod}</lastmod>')
            sitemap_xml.append(f'    <changefreq>{changefreq}</changefreq>')
            sitemap_xml.append(f'    <priority>{priority}</priority>')
            sitemap_xml.append(f'  </url>')
    
    # Close XML file
    sitemap_xml.append('</urlset>')
    
    # Write to file
    sitemap_path = STATIC_DIR / "sitemap.xml"
    sitemap_path.write_text('\n'.join(sitemap_xml) + '\n', encoding="utf-8")
    
    print(f"✅ Enhanced sitemap.xml generated at {sitemap_path}")

def update_robots_txt() -> None:
    """Update robots.txt to reference the sitemap."""
    print("▸ Updating robots.txt...")
    
    robots_path = Path("robots.txt")
    
    # Create or update robots.txt
    robots_txt = (
        "User-agent: *\n"
        "Disallow: /thanks.html\n\n"
        f"Sitemap: {SITE_URL}/sitemap.xml\n"
    )
    
    robots_path.write_text(robots_txt, encoding="utf-8")
    print(f"✅ robots.txt updated at {robots_path}")

if __name__ == "__main__":
    generate_sitemap()
    update_robots_txt()
    print("✅ Sitemap generation complete")