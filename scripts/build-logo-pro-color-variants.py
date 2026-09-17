#!/usr/bin/env python3
"""Build professional D + AI-mark colorways with a locked outer frame."""

from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets/dinalab-logo-pro-master.png"
OUTPUT_DIR = ROOT / "assets/dinalab-logo-pro-colors"

COLORS = [
    ("01-electric-blue", "#1677ff"),
    ("02-azure", "#278cff"),
    ("03-cyan", "#00c8e8"),
    ("04-ocean", "#0096c7"),
    ("05-teal", "#0db5a5"),
    ("06-mint", "#4fd1b5"),
    ("07-emerald", "#22b573"),
    ("08-lime", "#93d92b"),
    ("09-gold", "#f2b705"),
    ("10-amber", "#f59e0b"),
    ("11-orange", "#f97316"),
    ("12-coral", "#f2645a"),
    ("13-red", "#ef3e55"),
    ("14-rose", "#e94f87"),
    ("15-pink", "#ec4899"),
    ("16-magenta", "#d946ef"),
    ("17-violet", "#9b5cf6"),
    ("18-purple", "#7c3aed"),
    ("19-indigo", "#5b5ce2"),
    ("20-platinum", "#c7d3df"),
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

            # Keep the AI stars luminous at small sizes: a softly tinted white
            # core plus a hue-matched edge light. The dark field is untouched.
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
        destination = OUTPUT_DIR / f"dinalab-logo-pro-{name}.png"
        recolor(source, target_hex).save(destination)
        print(f"wrote {destination}")


if __name__ == "__main__":
    main()
