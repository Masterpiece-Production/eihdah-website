#!/usr/bin/env python
"""
Add explicit width and height attributes to images in HTML files.
This helps prevent layout shifts (CLS) during page load.
"""
from __future__ import annotations

import os
import re
from pathlib import Path
from PIL import Image

# Regular expression to find img tags
IMG_PATTERN = re.compile(r'<img\s+([^>]*)src=["\'](.*?)["\']([^>]*)>')

def get_image_dimensions(image_path):
    """Get the dimensions of an image.
    
    Args:
        image_path: Path to the image
        
    Returns:
        Tuple of (width, height) or None if the image doesn't exist
    """
    try:
        with Image.open(image_path) as img:
            return img.size
    except Exception as e:
        print(f"Error getting dimensions for {image_path}: {e}")
        return None

def add_dimensions_to_html(html_path, base_path="."):
    """Add width and height attributes to img tags in an HTML file.
    
    Args:
        html_path: Path to the HTML file
        base_path: Base path for resolving relative image paths
    """
    html_path = Path(html_path)
    if not html_path.exists():
        print(f"HTML file {html_path} does not exist")
        return
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    def replace_img(match):
        before_src = match.group(1)
        src = match.group(2)
        after_src = match.group(3)
        
        # Skip if already has width and height
        if re.search(r'width=["\']\d+["\']', before_src + after_src) and \
           re.search(r'height=["\']\d+["\']', before_src + after_src):
            return match.group(0)
        
        # Resolve image path
        if src.startswith('/'):
            # Absolute path within the site
            image_path = Path(base_path) / src.lstrip('/')
        elif src.startswith(('http://', 'https://', 'data:')):
            # External URL or data URL, can't determine dimensions
            return match.group(0)
        else:
            # Relative path
            image_path = Path(html_path).parent / src
        
        # Get dimensions
        dimensions = get_image_dimensions(image_path)
        if not dimensions:
            return match.group(0)
        
        width, height = dimensions
        
        # Add width and height attributes if they don't exist
        if not re.search(r'width=["\']\d+["\']', before_src + after_src):
            after_src += f' width="{width}"'
        if not re.search(r'height=["\']\d+["\']', before_src + after_src):
            after_src += f' height="{height}"'
        
        return f'<img {before_src}src="{src}"{after_src}>'
    
    # Replace img tags
    new_content = re.sub(IMG_PATTERN, replace_img, content)
    
    # Write back to file
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✓ Updated {html_path}")

def process_html_files(directory, base_path="."):
    """Process all HTML files in a directory.
    
    Args:
        directory: Directory to process
        base_path: Base path for resolving relative image paths
    """
    directory = Path(directory)
    if not directory.exists():
        print(f"Directory {directory} does not exist")
        return
    
    # Process all HTML files
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                file_path = Path(root) / file
                add_dimensions_to_html(file_path, base_path)

if __name__ == "__main__":
    print("Adding dimensions to images in HTML files...")
    # Process HTML files in the root directory and templates directory
    process_html_files(".", ".")
    print("Done!")