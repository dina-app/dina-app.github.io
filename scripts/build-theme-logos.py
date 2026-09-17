#!/usr/bin/env python3
"""Build the light-theme counterpart of the option-20 DinaLab logo."""

from __future__ import annotations

import argparse
import colorsys
from pathlib import Path

from PIL import Image


def mix(a: tuple[int, int, int], b: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    return tuple(round(left + (right - left) * amount) for left, right in zip(a, b))


def build_light(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGBA")
    output = Image.new("RGBA", image.size)
    source_pixels = image.load()
    output_pixels = output.load()
    width, height = image.size

    indigo = (28, 42, 122)
    violet = (104, 37, 145)
    white = (250, 250, 255)

    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = source_pixels[x, y]
            if alpha == 0:
                output_pixels[x, y] = (0, 0, 0, 0)
                continue

            hue, saturation, value = colorsys.rgb_to_hsv(red / 255, green / 255, blue / 255)
            diagonal = (x + y) / max(1, width + height - 2)

            if saturation < 0.22 and value > 0.68:
                # White D/frame/sparkles become dark ink with a subtle diagonal
                # indigo-to-violet shift, preserving their exact silhouette.
                color = mix(indigo, violet, diagonal * 0.62)
                shade = 0.84 + value * 0.16
                color = tuple(round(channel * shade) for channel in color)
            elif value < 0.48:
                # The dark violet tile becomes a quiet light-theme surface.
                tint = tuple(round(channel * 255) for channel in colorsys.hsv_to_rgb(hue, 0.16, 0.98))
                color = mix(white, tint, 0.42)
            else:
                # Keep prismatic cyan/magenta edge light, with enough density to
                # remain visible against the pale tile.
                accent = colorsys.hsv_to_rgb(hue, min(0.9, max(0.62, saturation)), min(0.82, value))
                color = tuple(round(channel * 255) for channel in accent)

            output_pixels[x, y] = (*color, alpha)

    destination.parent.mkdir(parents=True, exist_ok=True)
    output.save(destination)
    print(f"wrote {destination}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    build_light(args.source, args.out)


if __name__ == "__main__":
    main()
