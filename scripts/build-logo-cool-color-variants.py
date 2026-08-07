#!/usr/bin/env python3
"""Build an additional cool-tone DinaLab D + AI-mark color collection."""

from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets/dinalab-logo-pro-master.png"
OUTPUT_DIR = ROOT / "assets/dinalab-logo-cool-colors"

COLORS = [
    ("01-glacier", "#b8efff"),
    ("02-arctic", "#8bdcff"),
    ("03-polar-blue", "#63c7ff"),
    ("04-neon-cyan", "#00f0ff"),
    ("05-aqua", "#22d3ee"),
    ("06-lagoon", "#00cdbf"),
    ("07-turquoise", "#2dd4bf"),
    ("08-seafoam", "#5eead4"),
    ("09-jade", "#34d399"),
    ("10-aurora-green", "#42f59e"),
    ("11-sky", "#38bdf8"),
    ("12-cobalt", "#2563eb"),
    ("13-royal-blue", "#4169e1"),
    ("14-ultramarine", "#4f46e5"),
    ("15-deep-indigo", "#6366f1"),
    ("16-periwinkle", "#818cf8"),
    ("17-lavender", "#a78bfa"),
    ("18-electric-violet", "#8b5cf6"),
    ("19-neon-purple", "#a855f7"),
    ("20-ultraviolet", "#c026d3"),
]


def rgb(hex_color: str) -> tuple[int, int, int]:
    value = hex_color.removeprefix("#")
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))


def inside_ellipse(x: int, y: int, cx: int, cy: int, rx: int, ry: int) -> bool:
    return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1


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

            inside_d = 78 <= x <= 400 and 88 <= y <= 426
            inside_ai = (
                inside_ellipse(x, y, 380, 133, 62, 67)
                or inside_ellipse(x, y, 420, 201, 39, 43)
                or inside_ellipse(x, y, 399, 260, 27, 30)
            )

            if inside_ai and value > 0.16:
                if saturation < 0.20:
                    mapped_saturation = target_saturation * 0.16
                    mapped = colorsys.hsv_to_rgb(target_hue, mapped_saturation, value)
                    pixels[x, y] = tuple(round(channel * 255) for channel in mapped) + (alpha,)
                elif 0.50 <= hue <= 0.72:
                    mapped_saturation = min(1.0, target_saturation * (0.66 + saturation * 0.34))
                    mapped = colorsys.hsv_to_rgb(target_hue, mapped_saturation, value)
                    pixels[x, y] = tuple(round(channel * 255) for channel in mapped) + (alpha,)
            elif inside_d and saturation > 0.18 and 0.50 <= hue <= 0.72:
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
        destination = OUTPUT_DIR / f"dinalab-logo-cool-{name}.png"
        recolor(source, target_hex).save(destination)
        print(f"wrote {destination}")


if __name__ == "__main__":
    main()
