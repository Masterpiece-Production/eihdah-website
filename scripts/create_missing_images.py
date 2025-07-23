#!/usr/bin/env python
"""
Create placeholder images for missing image files.
This script creates placeholder images for files that are referenced in HTML but don't exist.
"""
from __future__ import annotations

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

def create_placeholder_image(path, width=800, height=450, text=None):
    """Create a placeholder image.
    
    Args:
        path: Path to save the image
        width: Width of the image
        height: Height of the image
        text: Text to display on the image
    """
    path = Path(path)
    
    # Create directory if it doesn't exist
    path.parent.mkdir(parents=True, exist_ok=True)
    
    # Create a blank image with a gray background
    img = Image.new('RGB', (width, height), color=(240, 240, 240))
    draw = ImageDraw.Draw(img)
    
    # Add a border
    draw.rectangle([(0, 0), (width-1, height-1)], outline=(200, 200, 200), width=1)
    
    # Add text
    if text is None:
        text = path.name
    
    # Use default font
    font = ImageFont.load_default()
    
    # Draw text in the center
    draw.text((width // 2, height // 2), text, fill=(100, 100, 100), font=font, anchor="mm")
    
    # Save the image
    img.save(path)
    print(f"Created placeholder image: {path}")
    
    # Also create WebP version
    webp_path = path.with_suffix('.webp')
    img.save(webp_path, "WEBP", quality=80)
    print(f"Created WebP version: {webp_path}")

if __name__ == "__main__":
    # Create video thumbnail placeholder
    video_thumbnail_path = Path("static/img/video-thumbnail.jpg")
    if not video_thumbnail_path.exists():
        create_placeholder_image(
            video_thumbnail_path, 
            width=800, 
            height=450, 
            text="EihDah Demo Video"
        )
    
    # Create OG image placeholders
    og_cover_path = Path("static/img/og-cover.png")
    if not og_cover_path.exists():
        create_placeholder_image(
            og_cover_path, 
            width=1200, 
            height=630, 
            text="EihDah - AI Sentiment Analysis"
        )
    
    og_thanks_path = Path("static/img/og-thanks.png")
    if not og_thanks_path.exists():
        create_placeholder_image(
            og_thanks_path, 
            width=1200, 
            height=630, 
            text="Thanks for joining EihDah!"
        )
    
    print("Done creating placeholder images!")