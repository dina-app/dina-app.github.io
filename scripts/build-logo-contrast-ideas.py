#!/usr/bin/env python3
"""Build twenty two-zone contrast concepts for the DinaLab mark.

Each version gives the inner D one color and the outer frame a contrasting
color.  The AI sparkles share the frame accent while retaining bright cores.
"""

from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets/dinalab-logo-pro-colors/dinalab-logo-pro-01-electric-blue-gradient.png"
OUTPUT_DIR = ROOT / "assets/dinalab-logo-contrast-ideas"

IDEAS = [
    ("01-cyan-orange", "#00d9ff", "#ff7a1a"),
    ("02-blue-gold", "#2563eb", "#f7c948"),
    ("03-teal-coral", "#14b8a6", "#ff6b6b"),
    ("04-purple-lime", "#8b5cf6", "#a3e635"),
    ("05-indigo-amber", "#4f46e5", "#f59e0b"),
    ("06-emerald-magenta", "#10b981", "#ec4899"),
    ("07-violet-yellow", "#7c3aed", "#fde047"),
    ("08-cobalt-peach", "#1d4ed8", "#ffaa7a"),
    ("09-aqua-red", "#22d3ee", "#ef4444"),
    ("10-navy-neon-green", "#1e40af", "#39ff88"),
    ("11-sky-coral", "#38bdf8", "#fb7185"),
    ("12-turquoise-rose", "#2dd4bf", "#f43f8c"),
    ("13-sapphire-sunset", "#0f52ba", "#ff8a3d"),
    ("14-green-violet", "#22c55e", "#a855f7"),
    ("15-blue-pink", "#3b82f6", "#f472b6"),
    ("16-cyan-magenta", "#06b6d4", "#d946ef"),
    ("17-orange-electric-blue", "#f97316", "#2f80ff"),
    ("18-lime-royal-purple", "#84cc16", "#6d28d9"),
    ("19-gold-teal", "#f5b700", "#0f9f8f"),
    ("20-ice-blue-hot-pink", "#a5e9ff", "#ff3dbb"),
]


def rgb(hex_color: str) -> tuple[int, int, int]:
    value = hex_color.removeprefix("#")
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))


def inside_ellipse(x: int, y: int, cx: int, cy: int, rx: int, ry: int) -> bool:
    return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1


def inside_d(x: int, y: int) -> bool:
    """Approximate the D silhouette, including its antialiased edge and glow."""
    vertical_stem = 92 <= x <= 224 and 104 <= y <= 414
    curved_bowl = x >= 196 and inside_ellipse(x, y, 218, 260, 169, 154)
    return vertical_stem or curved_bowl


def inside_diamond(x: int, y: int, cx: int, cy: int, rx: int, ry: int) -> bool:
    """Tight sparkle mask that does not spill into the D's curved bowl."""
    return abs(x - cx) / rx + abs(y - cy) / ry <= 1.05


def target_hsv(hex_color: str) -> tuple[float, float]:
    hue, saturation, _ = colorsys.rgb_to_hsv(
        *(channel / 255 for channel in rgb(hex_color))
    )
    return hue, saturation


def render(source: Image.Image, d_color: str, border_color: str) -> Image.Image:
    output = source.copy().convert("RGBA")
    pixels = output.load()
    d_hue, d_saturation = target_hsv(d_color)
    border_hue, border_saturation = target_hsv(border_color)

    for y in range(output.height):
        for x in range(output.width):
            red, green, blue, alpha = pixels[x, y]
            _, saturation, value = colorsys.rgb_to_hsv(
                red / 255, green / 255, blue / 255
            )
            if saturation <= 0.14 or value <= 0.01:
                continue

            inside_ai = (
                inside_diamond(x, y, 380, 133, 62, 67)
                or inside_diamond(x, y, 420, 201, 39, 44)
                or inside_diamond(x, y, 399, 260, 28, 31)
            )

            if inside_ai:
                target_hue = border_hue
                if value > 0.64:
                    mapped_saturation = border_saturation * 0.18
                    mapped_value = value
                else:
                    mapped_saturation = border_saturation * 0.88
                    mapped_value = value * 0.92
            elif inside_d(x, y):
                target_hue = d_hue
                mapped_saturation = d_saturation * (0.72 + saturation * 0.28)
                mapped_value = value
            else:
                target_hue = border_hue
                mapped_saturation = border_saturation * (0.66 + saturation * 0.34)
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
    for name, d_color, border_color in IDEAS:
        destination = OUTPUT_DIR / f"dinalab-logo-contrast-{name}.png"
        render(source, d_color, border_color).save(destination)
        print(f"wrote {destination}")


if __name__ == "__main__":
    main()
