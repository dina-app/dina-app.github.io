#!/usr/bin/env python3
"""Create an outside-to-inside gradient treatment for the DinaLab logo."""

from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets/dinalab-logo-pro-colors/dinalab-logo-pro-01-electric-blue-gradient.png"
OUTPUT = (
    ROOT
    / "assets/dinalab-logo-radial-gradient"
    / "dinalab-logo-radial-electric-blue-cyan-green.png"
)

# Gradient direction: center -> outside. Read visually in reverse, this is
# Electric Blue at the outside, through Cyan, into Green toward the center.
STOPS = [
    (0.00, "#21F0A5"),
    (0.56, "#08DDF5"),
    (1.00, "#2F6BFF"),
]


def hex_rgb(value: str) -> tuple[int, int, int]:
    value = value.removeprefix("#")
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))


def mix(left: tuple[int, int, int], right: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    return tuple(round(a + (b - a) * amount) for a, b in zip(left, right))


def gradient_color(position: float) -> tuple[int, int, int]:
    position = max(0.0, min(1.0, position))
    for index in range(len(STOPS) - 1):
        left_at, left_color = STOPS[index]
        right_at, right_color = STOPS[index + 1]
        if position <= right_at:
            amount = (position - left_at) / (right_at - left_at)
            return mix(hex_rgb(left_color), hex_rgb(right_color), amount)
    return hex_rgb(STOPS[-1][1])


def inside_diamond(x: int, y: int, cx: int, cy: int, rx: int, ry: int) -> bool:
    return abs(x - cx) / rx + abs(y - cy) / ry <= 1.05


def render(source: Image.Image) -> Image.Image:
    output = source.copy().convert("RGBA")
    pixels = output.load()

    for y in range(output.height):
        for x in range(output.width):
            red, green, blue, alpha = pixels[x, y]
            _, source_saturation, source_value = colorsys.rgb_to_hsv(
                red / 255, green / 255, blue / 255
            )
            if source_saturation <= 0.14 or source_value <= 0.01:
                continue

            # A rounded-square radial field follows the logo's outer geometry
            # better than a circular radial gradient.
            radius = max(abs(x - 256), abs(y - 256)) / 246
            target = gradient_color(radius)
            target_hue, target_saturation, _ = colorsys.rgb_to_hsv(
                *(channel / 255 for channel in target)
            )

            inside_ai = (
                inside_diamond(x, y, 380, 133, 62, 67)
                or inside_diamond(x, y, 420, 201, 39, 44)
                or inside_diamond(x, y, 399, 260, 28, 31)
            )
            if inside_ai and source_value > 0.64:
                mapped_saturation = target_saturation * 0.16
                mapped_value = source_value
            else:
                mapped_saturation = target_saturation * (
                    0.70 + source_saturation * 0.30
                )
                mapped_value = source_value

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

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    render(source).save(OUTPUT)
    print(f"wrote {OUTPUT}")


if __name__ == "__main__":
    main()
