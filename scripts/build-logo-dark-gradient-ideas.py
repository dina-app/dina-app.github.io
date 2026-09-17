#!/usr/bin/env python3
"""Build twenty deep/dark gradient colorways from the approved DinaLab master.

This is the dark-tone counterpart to build-logo-gradient-ideas.py. That script
transfers only hue and saturation and inherits brightness from the source art,
which is right for neon colorways but flattens any dark target back to full
brightness. Here the target's value is carried across as well, so the mark
actually reads as a deep colorway. Source value is demoted to a shading term
that rides on top of the target, preserving the art's modelling and edge light.

The AI sparkles deliberately keep their brightness: on a dark mark they are the
only highlight, and letting them darken with everything else kills the logo at
small sizes.
"""

from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets/dinalab-logo-pro-colors/dinalab-logo-pro-01-electric-blue-gradient.png"
OUTPUT_DIR = ROOT / "assets/dinalab-logo-dark-gradients"

IDEAS = [
    ("01-midnight-sapphire", ["#0a1f5c", "#1d4ed8"]),
    ("02-deep-indigo-violet", ["#1e1b4b", "#5b21b6"]),
    ("03-abyss-teal", ["#042f2e", "#0f766e"]),
    ("04-obsidian-emerald", ["#052e16", "#15803d"]),
    ("05-oxblood-crimson", ["#4c0519", "#9f1239"]),
    ("06-espresso-amber", ["#2b1503", "#b45309"]),
    ("07-blackcurrant-magenta", ["#3b0764", "#a21caf"]),
    ("08-slate-steel", ["#1e293b", "#475569"]),
    ("09-deep-forest-moss", ["#14251a", "#4d7c0f"]),
    ("10-wine-rose", ["#500724", "#be123c"]),
    ("11-navy-cobalt", ["#0c1a3a", "#1e40af"]),
    ("12-charcoal-copper", ["#1c1917", "#9a3412"]),
    ("13-plum-orchid", ["#2e1065", "#86198f"]),
    ("14-petrol-cyan", ["#083344", "#0e7490"]),
    ("15-ink-royal", ["#111827", "#3730a3"]),
    ("16-mahogany-ember", ["#431407", "#c2410c"]),
    ("17-jade-pine", ["#022c22", "#047857"]),
    ("18-eggplant-burgundy", ["#2d0b2e", "#831843"]),
    ("19-graphite-azure", ["#18202c", "#1d5fb0"]),
    ("20-nocturne-purple", ["#0f0a2e", "#6d28d9"]),
]


def rgb(hex_color: str) -> tuple[int, int, int]:
    value = hex_color.removeprefix("#")
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))


def mix(left: tuple[int, int, int], right: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    return tuple(round(a + (b - a) * amount) for a, b in zip(left, right))


def gradient_at(x: int, colors: list[str]) -> tuple[int, int, int]:
    position = max(0.0, min(1.0, (x - 32) / 448))
    converted = [rgb(color) for color in colors]
    scaled = position * (len(converted) - 1)
    index = min(int(scaled), len(converted) - 2)
    return mix(converted[index], converted[index + 1], scaled - index)


def inside_ellipse(x: int, y: int, cx: int, cy: int, rx: int, ry: int) -> bool:
    return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1


def render(source: Image.Image, colors: list[str]) -> Image.Image:
    output = source.copy().convert("RGBA")
    pixels = output.load()

    for y in range(output.height):
        for x in range(output.width):
            red, green, blue, alpha = pixels[x, y]
            _, saturation, value = colorsys.rgb_to_hsv(
                red / 255, green / 255, blue / 255
            )
            if saturation <= 0.14 or value <= 0.01:
                continue

            target = gradient_at(x, colors)
            target_hue, target_saturation, target_value = colorsys.rgb_to_hsv(
                *(channel / 255 for channel in target)
            )
            inside_d = 78 <= x <= 400 and 88 <= y <= 426
            inside_ai = (
                inside_ellipse(x, y, 380, 133, 62, 67)
                or inside_ellipse(x, y, 420, 201, 39, 43)
                or inside_ellipse(x, y, 399, 260, 27, 30)
            )
            is_d_pixel = inside_d and x <= 375 and saturation > 0.35

            # D pixels take precedence where the large sparkle's soft mask
            # overlaps the D's upper-right curve.
            if is_d_pixel or inside_d:
                mapped_saturation = target_saturation * (0.86 + saturation * 0.14)
                mapped_value = target_value * (0.80 + value * 0.20)
            elif inside_ai:
                if value > 0.64:
                    # Sparkle cores stay near-white so the dark mark keeps a
                    # highlight to read against.
                    mapped_saturation = target_saturation * 0.22
                    mapped_value = 0.62 + target_value * 0.38
                else:
                    mapped_saturation = target_saturation * 0.80
                    mapped_value = target_value * (0.74 + value * 0.26)
            else:
                # The outer frame sits a touch below the D so the letterform
                # stays the focal point.
                mapped_saturation = target_saturation * (0.80 + saturation * 0.20)
                mapped_value = target_value * (0.72 + value * 0.24)

            mapped = colorsys.hsv_to_rgb(
                target_hue,
                min(1.0, mapped_saturation),
                min(1.0, mapped_value),
            )
            pixels[x, y] = tuple(round(channel * 255) for channel in mapped) + (alpha,)

    return output


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    if source.size != (512, 512):
        raise ValueError(f"Expected a 512x512 source, got {source.size}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, colors in IDEAS:
        destination = OUTPUT_DIR / f"dinalab-logo-dark-gradient-{name}.png"
        render(source, colors).save(destination)
        print(f"wrote {destination}")


if __name__ == "__main__":
    main()
