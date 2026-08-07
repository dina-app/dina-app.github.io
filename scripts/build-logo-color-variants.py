#!/usr/bin/env python3
"""Recolor the D while preserving the original DinaLab outer border."""

from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets/dinalab-logo-original-border.png"
OUTPUT_DIR = ROOT / "assets/dinalab-logo-colors"

COLORS = [
    ("01-sapphire", "#1677ff"),
    ("02-cyan", "#00d9ff"),
    ("03-teal", "#00bfa6"),
    ("04-emerald", "#21d07a"),
    ("05-lime", "#a7f432"),
    ("06-yellow", "#ffe34d"),
    ("07-amber", "#ffb020"),
    ("08-orange", "#ff7a1a"),
    ("09-scarlet", "#ff334f"),
    ("10-coral", "#ff6f61"),
    ("11-rose", "#ff4f87"),
    ("12-hot-pink", "#ff3dcc"),
    ("13-magenta", "#e832ff"),
    ("14-violet", "#a855f7"),
    ("15-purple", "#7c3aed"),
    ("16-indigo", "#5b5ce2"),
    ("17-ice-blue", "#8cddff"),
    ("18-mint", "#66e6bd"),
    ("19-silver", "#c5d2df"),
    ("20-gold", "#f7b500"),
]


def rgb(hex_color: str) -> tuple[int, int, int]:
    value = hex_color.removeprefix("#")
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))


def recolor(source: Image.Image, target_hex: str) -> Image.Image:
    target_rgb = rgb(target_hex)
    target_hue, target_saturation, _ = colorsys.rgb_to_hsv(
        *(channel / 255 for channel in target_rgb)
    )
    output = source.copy().convert("RGBA")
    pixels = output.load()

    for y in range(output.height):
        for x in range(output.width):
            red, green, blue, alpha = pixels[x, y]
            hue, saturation, value = colorsys.rgb_to_hsv(
                red / 255, green / 255, blue / 255
            )

            # The spatial mask contains the D and its glow but excludes the
            # original cyan/violet/magenta outer frame. White sparkles and the
            # black background also remain untouched.
            inside_d = 80 <= x <= 400 and 90 <= y <= 425
            if inside_d and saturation > 0.18 and 0.50 <= hue <= 0.72:
                mapped_saturation = min(1.0, target_saturation * (0.72 + saturation * 0.28))
                mapped = colorsys.hsv_to_rgb(target_hue, mapped_saturation, value)
                pixels[x, y] = tuple(round(channel * 255) for channel in mapped) + (alpha,)

    return output


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    if source.size != (512, 512):
        raise ValueError(f"Expected a 512x512 source, got {source.size}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, target_hex in COLORS:
        destination = OUTPUT_DIR / f"dinalab-logo-{name}.png"
        recolor(source, target_hex).save(destination)
        print(f"wrote {destination}")


if __name__ == "__main__":
    main()
