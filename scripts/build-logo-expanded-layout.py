#!/usr/bin/env python3
"""Expand the DinaLab layout while preserving the outer frame thickness."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
SOURCE = (
    ROOT
    / "assets/dinalab-logo-radial-gradient"
    / "dinalab-logo-radial-electric-blue-cyan-green.png"
)
OUTPUT = (
    ROOT
    / "assets/dinalab-logo-radial-gradient"
    / "dinalab-logo-radial-electric-blue-cyan-green-expanded.png"
)

CANVAS_SIZE = 512
CENTER = 256
INNER_SCALE = 1.10
BORDER_OUTWARD_SHIFT = 8
INNER_RADIUS = 168
BORDER_RADIUS = 188


def bilinear_sample(image: Image.Image, x: float, y: float) -> tuple[int, int, int, int]:
    if x < 0 or y < 0 or x > image.width - 1 or y > image.height - 1:
        return (0, 0, 0, 255)

    pixels = image.load()
    x0 = int(math.floor(x))
    y0 = int(math.floor(y))
    x1 = min(x0 + 1, image.width - 1)
    y1 = min(y0 + 1, image.height - 1)
    fx = x - x0
    fy = y - y0
    corners = (
        pixels[x0, y0],
        pixels[x1, y0],
        pixels[x0, y1],
        pixels[x1, y1],
    )

    result = []
    for channel in range(4):
        top = corners[0][channel] * (1 - fx) + corners[1][channel] * fx
        bottom = corners[2][channel] * (1 - fx) + corners[3][channel] * fx
        result.append(round(top * (1 - fy) + bottom * fy))
    return tuple(result)


def source_radius_for(output_radius: float) -> float:
    """Use scaling inside and pure translation across the frame.

    Pure radial translation has a derivative of one, so the frame moves
    outward without increasing its thickness. A smooth middle section joins
    that frame treatment to the enlarged D and AI mark.
    """
    scaled_radius = output_radius / INNER_SCALE
    shifted_radius = max(0.0, output_radius - BORDER_OUTWARD_SHIFT)

    if output_radius <= INNER_RADIUS:
        return scaled_radius
    if output_radius >= BORDER_RADIUS:
        return shifted_radius

    amount = (output_radius - INNER_RADIUS) / (BORDER_RADIUS - INNER_RADIUS)
    # Smoothstep prevents a visible kink in the AI glow near the frame.
    amount = amount * amount * (3 - 2 * amount)
    return scaled_radius * (1 - amount) + shifted_radius * amount


def render(source: Image.Image) -> Image.Image:
    output = Image.new("RGBA", source.size, (0, 0, 0, 255))
    output_pixels = output.load()

    for y in range(output.height):
        for x in range(output.width):
            dx = x - CENTER
            dy = y - CENTER
            radius = max(abs(dx), abs(dy))
            if radius == 0:
                output_pixels[x, y] = source.getpixel((CENTER, CENTER))
                continue

            source_radius = source_radius_for(radius)
            scale = source_radius / radius
            source_x = CENTER + dx * scale
            source_y = CENTER + dy * scale
            output_pixels[x, y] = bilinear_sample(source, source_x, source_y)

    return output


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    if source.size != (CANVAS_SIZE, CANVAS_SIZE):
        raise ValueError(f"Expected a 512x512 source, got {source.size}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    render(source).save(OUTPUT)
    print(f"wrote {OUTPUT}")


if __name__ == "__main__":
    main()
