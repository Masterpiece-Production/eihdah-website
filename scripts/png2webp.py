# png2wevp.py
"""Convert PNG images in the static directory to WebP format.
Run this script to optimize images for web use.
"""
from __future__ import annotations

from pathlib import Path
from PIL import Image

targets = [
    "feature-sentiment",
    "feature-wordcloud",
    "feature-topcommenters",
    "team-ayman",
]

for name in targets:
    src = Path("static/img") / f"{name}.png"
    if not src.exists():
        src = src.with_suffix(".jpg")   # fallback to JPG
    dst = src.with_suffix(".webp")

    img = Image.open(src).convert("RGB")
    img.save(dst, "WEBP", quality=82, method=6)
    print(
        "✓", dst, "saved",
        "(" + str(round(dst.stat().st_size / 1024)) + " KB )")
