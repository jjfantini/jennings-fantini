#!/usr/bin/env python3
"""Build app/favicon.ico from scripts/favicon-source.png.

Center-crop zoom uses FAVICON_CROP_SCALE (lower = zoom out, show more in frame).
Chasing logo uses a separate scale in chasing-logo.tsx.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

# Lower than chasing-logo on purpose: favicon reads better with a bit more headroom.
FAVICON_CROP_SCALE = 1.55
# Nudge crop upward so framing favors the face over shoulders.
HEAD_BIAS_Y = 0.04

REPO = Path(__file__).resolve().parent.parent
SOURCE = REPO / "scripts" / "favicon-source.png"
OUT_ICO = REPO / "app" / "favicon.ico"
RENDER_PX = 512
ICO_SIZES = [(16, 16), (32, 32), (48, 48), (64, 64)]


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing source: {SOURCE}")

    im = Image.open(SOURCE).convert("RGBA")
    arr = np.array(im)
    rgb = arr[:, :, :3]
    bright = rgb.max(axis=2)
    fg = bright > 22

    if not fg.any():
        raise SystemExit("Could not find subject (foreground) pixels.")

    ys, xs = np.where(fg)
    y0, y1 = int(ys.min()), int(ys.max())
    x0, x1 = int(xs.min()), int(xs.max())
    cx = (x0 + x1) // 2
    cy = (y0 + y1) // 2
    side = max(x1 - x0 + 1, y1 - y0 + 1)

    # Bias crop toward head
    cy = int(cy - HEAD_BIAS_Y * side)

    half = side // 2
    left = max(0, cx - half)
    top = max(0, cy - half)
    right = min(im.width, left + side)
    bottom = min(im.height, top + side)
    if right - left < side:
        left = max(0, right - side)
    if bottom - top < side:
        top = max(0, bottom - side)

    square = im.crop((left, top, right, bottom))
    w, h = square.size
    side = min(w, h)
    inner = max(2, int(round(side / FAVICON_CROP_SCALE)))
    margin = (side - inner) // 2
    zoomed = square.crop((margin, margin, margin + inner, margin + inner))

    zoomed_resized = zoomed.resize((RENDER_PX, RENDER_PX), Image.Resampling.LANCZOS)

    mask = Image.new("L", (RENDER_PX, RENDER_PX), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, RENDER_PX - 1, RENDER_PX - 1), fill=255)

    out_rgba = Image.new("RGBA", (RENDER_PX, RENDER_PX), (0, 0, 0, 0))
    out_rgba.paste(zoomed_resized, (0, 0))
    out_rgba.putalpha(mask)

    OUT_ICO.parent.mkdir(parents=True, exist_ok=True)
    out_rgba.save(OUT_ICO, format="ICO", sizes=ICO_SIZES)
    print(f"Wrote {OUT_ICO} ({RENDER_PX}px master -> {ICO_SIZES})")


if __name__ == "__main__":
    main()
