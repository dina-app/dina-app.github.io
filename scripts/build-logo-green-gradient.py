#!/usr/bin/env python3
"""Apply one green-to-magenta gradient to the frame, D, and AI mark."""

from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets/dinalab-logo-pro-colors/dinalab-logo-pro-01-electric-blue-gradient.png"
OUTPUT = ROOT / "assets/dinalab-logo-pro-colors/dinalab-logo-pro-01-green-gradient.png"

STOPS = [
    (0.0, (45, 245, 139)),
    (1.0, (255, 45, 215)),
]


def mix(left: tuple[int, int, int], right: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    return tuple(round(a + (b - a) * amount) for a, b in zip(left, right))


def gradient_at(x: int) -> tuple[int, int, int]:
    # Use nearly the full frame width so green starts on the left and blends
    # directly into magenta on the right, with no intermediate color stop.
    position = max(0.0, min(1.0, (x - 32) / 448))
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
            _, saturation, value = colorsys.rgb_to_hsv(
                red / 255, green / 255, blue / 255
            )

            # Recolor every existing chromatic pixel—including restrained
            # glow—while leaving the neutral black background untouched.
            if saturation <= 0.14 or value <= 0.01:
                continue

            target = gradient_at(x)
            target_hue, target_saturation, _ = colorsys.rgb_to_hsv(
                *(channel / 255 for channel in target)
            )
            mapped_saturation = min(
                1.0,
                target_saturation * (0.55 + saturation * 0.45),
            )
            mapped = colorsys.hsv_to_rgb(target_hue, mapped_saturation, value)
            pixels[x, y] = tuple(round(channel * 255) for channel in mapped) + (alpha,)

    output.save(OUTPUT)
    print(f"wrote {OUTPUT}")


if __name__ == "__main__":
    build()
