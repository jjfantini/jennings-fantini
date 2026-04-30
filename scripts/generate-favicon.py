#!/usr/bin/env python3
"""Build app/favicon.ico from scripts/favicon-source.png.

Pipeline:
1. Detect bright (non-black) bbox of the subject; that ignores letterboxing.
2. Pad the bbox by FAVICON_PAD (negative = zoom in past the bbox).
3. Square-crop centered on the (head-biased) bbox center.
4. Resize, mask to a circle, save multi-size ICO.

FAVICON_PAD: negative shrinks (more zoom), positive expands (less zoom).
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

# Padding around detected subject bbox as a fraction of bbox side.
# 0.0 = exactly the bbox, 0.10 = 10% breathing room, -0.10 = tighter crop.
FAVICON_PAD = 0.06
# Nudge crop upward so framing favors the face over shoulders.
HEAD_BIAS_Y = 0.02
# Brightness threshold for "subject" pixels (0-255 of max channel).
FG_THRESHOLD = 22

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
    fg = bright > FG_THRESHOLD

    if not fg.any():
        raise SystemExit("Could not find subject (foreground) pixels.")

    ys, xs = np.where(fg)
    y0, y1 = int(ys.min()), int(ys.max())
    x0, x1 = int(xs.min()), int(xs.max())

    bbox_w = x1 - x0 + 1
    bbox_h = y1 - y0 + 1
    side = max(bbox_w, bbox_h)
    side = int(round(side * (1 + FAVICON_PAD)))

    cx = (x0 + x1) // 2
    cy = (y0 + y1) // 2 - int(round(HEAD_BIAS_Y * side))

    half = side // 2
    left = cx - half
    top = cy - half
    right = left + side
    bottom = top + side

    if left < 0 or top < 0 or right > im.width or bottom > im.height:
        pad_l = max(0, -left)
        pad_t = max(0, -top)
        pad_r = max(0, right - im.width)
        pad_b = max(0, bottom - im.height)
        canvas = Image.new("RGBA", (im.width + pad_l + pad_r, im.height + pad_t + pad_b), (0, 0, 0, 0))
        canvas.paste(im, (pad_l, pad_t))
        im = canvas
        left += pad_l
        top += pad_t
        right += pad_l
        bottom += pad_t

    square = im.crop((left, top, right, bottom))
    zoomed_resized = square.resize((RENDER_PX, RENDER_PX), Image.Resampling.LANCZOS)

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
