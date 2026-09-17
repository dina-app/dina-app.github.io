#!/usr/bin/env python3
"""Build darker DinaLab gradient concepts with a bolder outer frame."""

from __future__ import annotations

import colorsys
import runpy
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent.parent
BASE = runpy.run_path(str(ROOT / "scripts/build-logo-gradient-ideas.py"))
SOURCE = BASE["SOURCE"]
IDEAS = BASE["IDEAS"]
gradient_at = BASE["gradient_at"]
inside_ellipse = BASE["inside_ellipse"]

OUTPUT_DIR = ROOT / "assets/dinalab-logo-gradient-ideas-v2"
PREVIEW = OUTPUT_DIR / "dinalab-logo-gradient-ideas-v2-preview.png"
COLOR_DARKEN = 0.82
FRAME_DARKEN = 0.78
FRAME_BOLDEN_PIXELS = 6


def is_ai_region(x: int, y: int) -> bool:
    return (
        inside_ellipse(x, y, 380, 133, 62, 67)
        or inside_ellipse(x, y, 420, 201, 39, 43)
        or inside_ellipse(x, y, 399, 260, 27, 30)
    )


def render(source: Image.Image, colors: list[str]) -> Image.Image:
    output = source.copy().convert("RGBA")
    pixels = output.load()
    frame_core = Image.new("L", output.size, 0)
    frame_pixels = frame_core.load()

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
            inside_ai = is_ai_region(x, y)
            is_d_pixel = inside_d and x <= 375 and saturation > 0.35

            if is_d_pixel:
                mapped_saturation = target_saturation * (0.72 + saturation * 0.28)
                mapped_value = value * COLOR_DARKEN
            elif inside_ai:
                if value > 0.64:
                    # Keep the pearl-white cores legible after the surrounding
                    # colored geometry moves one luminance step darker.
                    mapped_saturation = target_saturation * 0.15
                    mapped_value = value * 0.96
                else:
                    mapped_saturation = target_saturation * 0.84
                    mapped_value = value * COLOR_DARKEN
            elif inside_d:
                mapped_saturation = target_saturation * (0.70 + saturation * 0.30)
                mapped_value = value * COLOR_DARKEN
            else:
                mapped_saturation = target_saturation * (0.66 + saturation * 0.34)
                mapped_value = value * FRAME_DARKEN
                if saturation > 0.25 and value > 0.30:
                    frame_pixels[x, y] = min(255, round(150 + value * 105))

            mapped = colorsys.hsv_to_rgb(
                target_hue,
                min(1.0, mapped_saturation),
                min(1.0, mapped_value),
            )
            pixels[x, y] = tuple(round(channel * 255) for channel in mapped) + (alpha,)

    # Expand only the high-value frame core. The original glossy frame stays
    # on top; this adds a six-pixel colored shoulder on both sides, making the
    # border materially thicker instead of merely increasing its glow.
    filter_size = FRAME_BOLDEN_PIXELS * 2 + 1
    expanded = frame_core.filter(ImageFilter.MaxFilter(filter_size))
    added = ImageChops.subtract(expanded, frame_core).filter(
        ImageFilter.GaussianBlur(0.55)
    )
    fill = Image.new("RGBA", output.size, (0, 0, 0, 0))
    fill_pixels = fill.load()
    for y in range(output.height):
        for x in range(output.width):
            if added.getpixel((x, y)) == 0:
                continue
            target = gradient_at(x, colors)
            hue, saturation, value = colorsys.rgb_to_hsv(
                *(channel / 255 for channel in target)
            )
            red, green, blue = colorsys.hsv_to_rgb(
                hue,
                min(1.0, saturation * 0.92),
                min(0.62, 0.34 + value * 0.28),
            )
            fill_pixels[x, y] = (
                round(red * 255),
                round(green * 255),
                round(blue * 255),
                added.getpixel((x, y)),
            )

    return Image.alpha_composite(output, fill)


def build_preview(images: list[tuple[str, Image.Image]]) -> None:
    columns = 5
    rows = 2
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
    for name, colors in IDEAS:
        image = render(source, colors)
        destination = OUTPUT_DIR / f"dinalab-logo-gradient-v2-{name}.png"
        image.save(destination, optimize=True)
        rendered.append((name, image))
        print(f"wrote {destination}")

    build_preview(rendered)


if __name__ == "__main__":
    main()
