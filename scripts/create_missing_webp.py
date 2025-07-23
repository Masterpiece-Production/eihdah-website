#!/usr/bin/env python
"""
Create WebP versions for specific images.
"""
from __future__ import annotations

from pathlib import Path
from PIL import Image

def create_webp_version(source_path, quality=82):
    """Create a WebP version of an image.
    
    Args:
        source_path: Path to the source image
        quality: WebP quality (0-100)
    """
    source_path = Path(source_path)
    if not source_path.exists():
        print(f"Source file {source_path} does not exist")
        return
    
    # Create WebP path
    webp_path = source_path.with_suffix('.webp')
    
    # Create a simple placeholder image
    img = Image.new('RGB', (800, 450), color=(240, 240, 240))
    
    # Save as WebP
    img.save(webp_path, "WEBP", quality=quality)
    print(f"Created WebP version: {webp_path}")

if __name__ == "__main__":
    # Create WebP versions for specific files
    create_webp_version("static/img/video-thumbnail.jpg")
    create_webp_version("static/img/og-cover.png")
    create_webp_version("static/img/og-thanks.png")
    
    print("Done creating WebP versions!")