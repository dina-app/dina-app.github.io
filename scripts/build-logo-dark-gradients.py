#!/usr/bin/env python3
"""Build 20 dark-gradient DinaLab logo variants from the approved master."""

from __future__ import annotations

import colorsys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
SOURCE = (
    ROOT
    / "assets/dinalab-logo-pro-colors"
    / "dinalab-logo-pro-01-electric-blue-gradient.png"
)
OUTPUT_DIR = ROOT / "assets/dinalab-logo-dark-gradients"
PREVIEW = OUTPUT_DIR / "dinalab-logo-dark-gradients-preview.png"

# Each palette starts with a deep anchor and ends with a restrained luminous
# accent. The black source field is preserved exactly.
PALETTES = [
    ("01-midnight-cyan", ["#071A3D", "#0B4F8A", "#00A6C7"]),
    ("02-navy-violet", ["#0A1538", "#312E81", "#7C3AED"]),
    ("03-deep-ocean", ["#042F46", "#075985", "#0E7490"]),
    ("04-abyss-blue", ["#061A40", "#1E3A8A", "#0284C7"]),
    ("05-storm-teal", ["#102A31", "#115E59", "#14B8A6"]),
    ("06-forest-emerald", ["#052E16", "#065F46", "#10B981"]),
    ("07-pine-cyan", ["#0A332B", "#0F766E", "#0891B2"]),
    ("08-deep-indigo", ["#17133D", "#3730A3", "#6D28D9"]),
    ("09-plum-magenta", ["#300A36", "#701A75", "#C026D3"]),
    ("10-wine-rose", ["#3A0B28", "#831843", "#E11D48"]),
    ("11-burgundy-violet", ["#350B1A", "#6B214F", "#7E22CE"]),
    ("12-ember-red", ["#3F0A0A", "#991B1B", "#EA580C"]),
    ("13-burnt-copper", ["#381409", "#7C2D12", "#D97706"]),
    ("14-dark-amber", ["#352105", "#854D0E", "#CA8A04"]),
    ("15-olive-emerald", ["#1A2E0A", "#3F6212", "#059669"]),
    ("16-slate-ice", ["#111827", "#334155", "#38BDF8"]),
    ("17-graphite-violet", ["#18181B", "#3F3F46", "#8B5CF6"]),
    ("18-dusk-blue-rose", ["#172554", "#3730A3", "#BE185D"]),
    ("19-aurora-night", ["#082F49", "#0F766E", "#7E22CE"]),
    ("20-eclipse", ["#181125", "#3B3158", "#A78BFA"]),
]


def rgb(hex_color: str) -> tuple[int, int, int]:
    value = hex_color.removeprefix("#")
    return tuple(int(value[index:index + 2], 16) for index in (0, 2, 4))


def mix(
    left: tuple[int, int, int],
    right: tuple[int, int, int],
    amount: float,
) -> tuple[int, int, int]:
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

            # Tie luminance to the dark palette while retaining the master's
            # highlights and glow falloff. The AI cores stay nearly white so
            # the mark remains identifiable at favicon sizes.
            dark_value = value * (0.22 + 0.78 * target_value)
            if is_d_pixel:
                mapped_saturation = target_saturation * (0.72 + saturation * 0.28)
                mapped_value = min(1.0, dark_value * 1.08)
            elif inside_ai:
                if value > 0.64:
                    mapped_saturation = target_saturation * 0.16
                    mapped_value = value * 0.94
                else:
                    mapped_saturation = target_saturation * 0.82
                    mapped_value = dark_value * 0.96
            elif inside_d:
                mapped_saturation = target_saturation * (0.68 + saturation * 0.32)
                mapped_value = dark_value
            else:
                mapped_saturation = target_saturation * (0.64 + saturation * 0.36)
                mapped_value = dark_value * 0.84

            mapped = colorsys.hsv_to_rgb(
                target_hue,
                min(1.0, mapped_saturation),
                min(1.0, mapped_value),
            )
            pixels[x, y] = tuple(round(channel * 255) for channel in mapped) + (alpha,)

    return output


def build_preview(images: list[tuple[str, Image.Image]]) -> None:
    columns = 5
    rows = 4
    tile_width = 196
    tile_height = 222
    thumbnail_size = 172
    canvas = Image.new("RGB", (columns * tile_width, rows * tile_height), "#090b10")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()

    for index, (name, logo) in enumerate(images):
        column = index % columns
        row = index // columns
        left = column * tile_width + (tile_width - thumbnail_size) // 2
        top = row * tile_height + 8
        thumbnail = logo.convert("RGB").resize(
            (thumbnail_size, thumbnail_size), Image.Resampling.LANCZOS
        )
        canvas.paste(thumbnail, (left, top))
        label = name.split("-", 1)[1].replace("-", " ").title()
        box = draw.textbbox((0, 0), label, font=font)
        text_width = box[2] - box[0]
        draw.text(
            (column * tile_width + (tile_width - text_width) / 2, top + 182),
            label,
            fill="#d8dee9",
            font=font,
        )

    canvas.save(PREVIEW)
    print(f"wrote {PREVIEW}")


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    if source.size != (512, 512):
        raise ValueError(f"Expected a 512x512 source, got {source.size}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    rendered = []
    for name, colors in PALETTES:
        image = render(source, colors)
        destination = OUTPUT_DIR / f"dinalab-logo-dark-gradient-{name}.png"
        image.save(destination, optimize=True)
        rendered.append((name, image))
        print(f"wrote {destination}")

    build_preview(rendered)


if __name__ == "__main__":
    main()
