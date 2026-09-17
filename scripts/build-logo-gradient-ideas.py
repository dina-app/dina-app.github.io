#!/usr/bin/env python3
"""Build ten curated gradient concepts from the approved DinaLab master."""

from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets/dinalab-logo-pro-colors/dinalab-logo-pro-01-electric-blue-gradient.png"
OUTPUT_DIR = ROOT / "assets/dinalab-logo-gradient-ideas"

IDEAS = [
    ("01-blue-cyan-green", ["#1f7aff", "#22d3ee", "#32e88f"]),
    ("02-deep-blue-violet", ["#1d4ed8", "#8b5cf6"]),
    ("03-cyan-royal-blue", ["#22d3ee", "#2563eb"]),
    ("04-indigo-magenta", ["#4f46e5", "#ec4899"]),
    ("05-teal-lime", ["#14b8a6", "#a3e635"]),
    ("06-blue-ice-silver", ["#3b82f6", "#e2f2ff"]),
    ("07-sapphire-aqua", ["#0f52ba", "#2de2e6"]),
    ("08-emerald-cyan", ["#10b981", "#22d3ee"]),
    ("09-violet-rose", ["#8b5cf6", "#f43f8c"]),
    ("10-amber-coral-rose", ["#f59e0b", "#f97363", "#ec4899"]),
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
            target_hue, target_saturation, _ = colorsys.rgb_to_hsv(
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
            if is_d_pixel:
                mapped_saturation = target_saturation * (0.72 + saturation * 0.28)
                mapped_value = value
            elif inside_ai:
                if value > 0.64:
                    mapped_saturation = target_saturation * 0.18
                    mapped_value = value
                else:
                    mapped_saturation = target_saturation * 0.86
                    mapped_value = value * 0.92
            elif inside_d:
                mapped_saturation = target_saturation * (0.72 + saturation * 0.28)
                mapped_value = value
            else:
                # The outer frame uses the same gradient at slightly lower
                # intensity, keeping the D as the visual focal point.
                mapped_saturation = target_saturation * (0.66 + saturation * 0.34)
                mapped_value = value * 0.88

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
        destination = OUTPUT_DIR / f"dinalab-logo-gradient-{name}.png"
        render(source, colors).save(destination)
        print(f"wrote {destination}")


if __name__ == "__main__":
    main()
