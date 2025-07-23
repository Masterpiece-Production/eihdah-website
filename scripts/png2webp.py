#!/usr/bin/env python
# png2webp.py
"""Convert images in the static directory to WebP format.
Run this script to optimize images for web use.
"""
from __future__ import annotations

import os
from pathlib import Path
from PIL import Image

def convert_to_webp(source_path, quality=82, method=6):
    """Convert an image to WebP format.
    
    Args:
        source_path: Path to the source image
        quality: WebP quality (0-100)
        method: WebP compression method (0-6), higher is slower but better
    
    Returns:
        Path to the WebP image
    """
    source_path = Path(source_path)
    if not source_path.exists():
        print(f"❌ {source_path} does not exist")
        return None
    
    # Skip if already WebP
    if source_path.suffix.lower() == '.webp':
        print(f"⏭️ {source_path} is already WebP")
        return source_path
    
    # Skip SVG files
    if source_path.suffix.lower() == '.svg':
        print(f"⏭️ {source_path} is SVG, skipping")
        return None
    
    # Create WebP path
    webp_path = source_path.with_suffix('.webp')
    
    try:
        # Open and convert image
        img = Image.open(source_path)
        
        # Convert to RGB if needed (WebP doesn't support RGBA with quality=100)
        if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
            # Need to preserve alpha channel
            img.save(webp_path, "WEBP", quality=quality, method=method, lossless=False)
        else:
            # No alpha channel needed
            img = img.convert("RGB")
            img.save(webp_path, "WEBP", quality=quality, method=method)
        
        # Calculate size reduction
        original_size = source_path.stat().st_size / 1024  # KB
        webp_size = webp_path.stat().st_size / 1024  # KB
        reduction = (1 - (webp_size / original_size)) * 100 if original_size > 0 else 0
        
        print(
            f"✓ {webp_path} saved"
            f" ({round(webp_size)} KB, {round(reduction)}% smaller than original)"
        )
        return webp_path
    except Exception as e:
        print(f"❌ Error converting {source_path}: {e}")
        return None

def process_directory(directory, recursive=True):
    """Process all images in a directory.
    
    Args:
        directory: Directory to process
        recursive: Whether to process subdirectories
    """
    directory = Path(directory)
    if not directory.exists():
        print(f"❌ Directory {directory} does not exist")
        return
    
    # Get all image files
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif']
    
    if recursive:
        # Process all files in directory and subdirectories
        for root, _, files in os.walk(directory):
            for file in files:
                file_path = Path(root) / file
                if file_path.suffix.lower() in image_extensions:
                    convert_to_webp(file_path)
    else:
        # Process only files in the directory
        for file_path in directory.glob('*'):
            if file_path.is_file() and file_path.suffix.lower() in image_extensions:
                convert_to_webp(file_path)

if __name__ == "__main__":
    # Process all images in static/img
    print("Converting images to WebP format...")
    process_directory(Path("static/img"))
    print("Done!")