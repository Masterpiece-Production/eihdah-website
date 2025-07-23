#!/usr/bin/env python
"""
Generate favicon and browser assets from a source image.
This script creates all the necessary favicon sizes and browser-specific icons.
"""

import os
import sys
from PIL import Image

def generate_favicons(source_path, output_dir):
    """Generate all favicon and browser assets from a source image."""
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Define favicon sizes
    favicon_sizes = [
        (16, 16),    # favicon-16x16.png
        (32, 32),    # favicon-32x32.png
        (48, 48),    # favicon-48x48.png
        (57, 57),    # apple-touch-icon-57x57.png (iOS)
        (60, 60),    # apple-touch-icon-60x60.png (iOS)
        (72, 72),    # apple-touch-icon-72x72.png (iOS)
        (76, 76),    # apple-touch-icon-76x76.png (iOS)
        (96, 96),    # favicon-96x96.png
        (114, 114),  # apple-touch-icon-114x114.png (iOS)
        (120, 120),  # apple-touch-icon-120x120.png (iOS)
        (144, 144),  # apple-touch-icon-144x144.png (iOS)
        (152, 152),  # apple-touch-icon-152x152.png (iOS)
        (180, 180),  # apple-touch-icon-180x180.png (iOS)
        (192, 192),  # android-chrome-192x192.png
        (512, 512),  # android-chrome-512x512.png
    ]
    
    try:
        # Open the source image
        with Image.open(source_path) as img:
            # Generate each size
            for width, height in favicon_sizes:
                resized_img = img.resize((width, height), Image.LANCZOS)
                
                # Save as PNG
                if width == 16:
                    output_path = os.path.join(output_dir, f"favicon-{width}x{height}.png")
                elif width == 32:
                    output_path = os.path.join(output_dir, f"favicon-{width}x{height}.png")
                elif width == 48:
                    output_path = os.path.join(output_dir, f"favicon-{width}x{height}.png")
                elif width == 96:
                    output_path = os.path.join(output_dir, f"favicon-{width}x{height}.png")
                elif width in [57, 60, 72, 76, 114, 120, 144, 152, 180]:
                    output_path = os.path.join(output_dir, f"apple-touch-icon-{width}x{height}.png")
                elif width in [192, 512]:
                    output_path = os.path.join(output_dir, f"android-chrome-{width}x{width}.png")
                else:
                    output_path = os.path.join(output_dir, f"icon-{width}x{height}.png")
                
                resized_img.save(output_path, "PNG")
                print(f"Generated {output_path}")
            
            # Create apple-touch-icon.png (default)
            apple_touch_icon = img.resize((180, 180), Image.LANCZOS)
            apple_touch_icon.save(os.path.join(output_dir, "apple-touch-icon.png"), "PNG")
            print(f"Generated {os.path.join(output_dir, 'apple-touch-icon.png')}")
            
            # Create favicon.ico with multiple sizes
            favicon_sizes = [(16, 16), (32, 32), (48, 48)]
            favicon_images = []
            for size in favicon_sizes:
                favicon_images.append(img.resize(size, Image.LANCZOS))
            
            favicon_path = os.path.join(output_dir, "favicon.ico")
            favicon_images[0].save(
                favicon_path, 
                format="ICO", 
                sizes=[(16, 16), (32, 32), (48, 48)],
                append_images=favicon_images[1:]
            )
            print(f"Generated {favicon_path}")
            
            # Create a site.webmanifest file
            manifest_path = os.path.join(output_dir, "site.webmanifest")
            with open(manifest_path, "w") as f:
                f.write('''{
  "name": "EihDah",
  "short_name": "EihDah",
  "icons": [
    {
      "src": "/static/img/icons/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/static/img/icons/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#3949ab",
  "background_color": "#ffffff",
  "display": "standalone"
}''')
            print(f"Generated {manifest_path}")
            
            # Create browserconfig.xml
            browserconfig_path = os.path.join(output_dir, "browserconfig.xml")
            with open(browserconfig_path, "w") as f:
                f.write('''<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square70x70logo src="/static/img/icons/mstile-70x70.png"/>
            <square150x150logo src="/static/img/icons/mstile-150x150.png"/>
            <square310x310logo src="/static/img/icons/mstile-310x310.png"/>
            <wide310x150logo src="/static/img/icons/mstile-310x150.png"/>
            <TileColor>#3949ab</TileColor>
        </tile>
    </msapplication>
</browserconfig>''')
            print(f"Generated {browserconfig_path}")
            
            # Create Microsoft tile images
            mstile_sizes = [
                (70, 70),      # mstile-70x70.png
                (150, 150),    # mstile-150x150.png
                (310, 310),    # mstile-310x310.png
                (310, 150),    # mstile-310x150.png
            ]
            
            for width, height in mstile_sizes:
                resized_img = img.resize((width, height), Image.LANCZOS)
                output_path = os.path.join(output_dir, f"mstile-{width}x{height}.png")
                resized_img.save(output_path, "PNG")
                print(f"Generated {output_path}")
                
        print("\nFavicon generation complete!")
        return True
        
    except Exception as e:
        print(f"Error generating favicons: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python generate_favicons.py <source_image_path>")
        sys.exit(1)
        
    source_path = sys.argv[1]
    output_dir = os.path.join("static", "img", "icons")
    
    if not os.path.exists(source_path):
        print(f"Error: Source file '{source_path}' not found.")
        sys.exit(1)
        
    success = generate_favicons(source_path, output_dir)
    sys.exit(0 if success else 1)