#!/usr/bin/env python3
"""Match the DinaLab D and AI mark to the outer-frame gradient."""

from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets/dinalab-logo-pro-colors/dinalab-logo-pro-01-electric-blue.png"
OUTPUT = ROOT / "assets/dinalab-logo-pro-colors/dinalab-logo-pro-01-electric-blue-gradient.png"

# Cyan -> violet -> magenta, matching the outer-frame color progression.
STOPS = [
    (0.0, (26, 218, 255)),
    (0.5, (105, 65, 255)),
    (1.0, (255, 45, 215)),
]


def inside_ellipse(x: int, y: int, cx: int, cy: int, rx: int, ry: int) -> bool:
    return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1


def mix(left: tuple[int, int, int], right: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    return tuple(round(a + (b - a) * amount) for a, b in zip(left, right))


def gradient_at(x: int) -> tuple[int, int, int]:
    # The content group spans roughly x=80..460. Mapping across the whole
    # group keeps the D cool and moves the right-side AI mark into magenta,
    # exactly like the surrounding frame.
    position = max(0.0, min(1.0, (x - 80) / 380))
    for (start_at, start), (end_at, end) in zip(STOPS, STOPS[1:]):
        if position <= end_at:
            amount = (position - start_at) / (end_at - start_at)
            return mix(start, end, amount)
    return STOPS[-1][1]


def build() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    if source.size != (512, 512):
        raise ValueError(f"Expected a 512x512 source, got {source.size}")

    output = source.copy()
    pixels = output.load()

    for y in range(output.height):
        for x in range(output.width):
            red, green, blue, alpha = pixels[x, y]
            hue, saturation, value = colorsys.rgb_to_hsv(
                red / 255, green / 255, blue / 255
            )
            target = gradient_at(x)
            target_hue, target_saturation, _ = colorsys.rgb_to_hsv(
                *(channel / 255 for channel in target)
            )

            inside_d = 78 <= x <= 400 and 88 <= y <= 426
            inside_ai = (
                inside_ellipse(x, y, 380, 133, 62, 67)
                or inside_ellipse(x, y, 420, 201, 39, 43)
                or inside_ellipse(x, y, 399, 260, 27, 30)
            )

            if inside_ai and value > 0.16:
                # Keep a luminous core while giving every sparkle the same
                # spatial gradient direction as the D and outer frame.
                mapped_saturation = target_saturation * (0.45 if saturation < 0.20 else 0.88)
                mapped = colorsys.hsv_to_rgb(target_hue, mapped_saturation, value)
                pixels[x, y] = tuple(round(channel * 255) for channel in mapped) + (alpha,)
            elif inside_d and saturation > 0.18 and 0.50 <= hue <= 0.72:
                mapped_saturation = min(1.0, target_saturation * (0.72 + saturation * 0.28))
                mapped = colorsys.hsv_to_rgb(target_hue, mapped_saturation, value)
                pixels[x, y] = tuple(round(channel * 255) for channel in mapped) + (alpha,)

    output.save(OUTPUT)
    print(f"wrote {OUTPUT}")


if __name__ == "__main__":
    build()
