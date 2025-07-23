#!/usr/bin/env python
"""
Helper functions for generating responsive image markup.
These functions can be used in Jinja2 templates to create responsive images.
"""
from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

def responsive_image(
    src: str,
    alt: str,
    width: Optional[int] = None,
    height: Optional[int] = None,
    sizes: Optional[str] = None,
    class_name: Optional[str] = None,
    lazy: bool = True,
    breakpoints: Optional[Dict[str, int]] = None,
) -> str:
    """Generate responsive image markup with WebP and fallback.
    
    Args:
        src: Path to the image (without extension)
        alt: Alt text for the image
        width: Width of the image (optional)
        height: Height of the image (optional)
        sizes: Sizes attribute for responsive images (optional)
        class_name: CSS class name(s) for the image (optional)
        lazy: Whether to use lazy loading (default: True)
        breakpoints: Dictionary of breakpoints for srcset (optional)
        
    Returns:
        HTML markup for the responsive image
    """
    # Default breakpoints if not provided
    if breakpoints is None:
        breakpoints = {
            "sm": 576,
            "md": 768,
            "lg": 992,
            "xl": 1200,
            "xxl": 1400,
        }
    
    # Extract base path and extension
    path = Path(src)
    base_path = str(path.parent / path.stem)
    ext = path.suffix
    
    # Check if WebP version exists
    webp_path = f"{base_path}.webp"
    original_path = src
    
    # Build attributes
    attrs = []
    if width:
        attrs.append(f'width="{width}"')
    if height:
        attrs.append(f'height="{height}"')
    if class_name:
        attrs.append(f'class="{class_name}"')
    if lazy:
        attrs.append('loading="lazy" decoding="async"')
    if sizes:
        attrs.append(f'sizes="{sizes}"')
    
    # Generate picture element with WebP and fallback
    html = f'<picture>\n'
    html += f'  <source srcset="{webp_path}" type="image/webp">\n'
    html += f'  <img src="{original_path}" alt="{alt}" {" ".join(attrs)}>\n'
    html += f'</picture>'
    
    return html

def register_jinja_filters(app):
    """Register Jinja2 filters for the Flask app.
    
    Args:
        app: Flask application instance
    """
    app.jinja_env.filters['responsive_image'] = responsive_image