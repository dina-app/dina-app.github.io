#!/usr/bin/env python3
"""Build a Blue/Gold Admin Toolkit logo that works on light and dark UI."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parent.parent
SOURCE = (
    ROOT
    / "assets/dinalab-logo-contrast-ideas"
    / "dinalab-logo-contrast-02-blue-gold.png"
)
OUTPUT_DIR = ROOT / "assets/admin-toolkit-logo-options"
SIZES = (16, 32, 48, 128, 512)
NAVY = (5, 18, 43, 246)
BLACK_FLOOR = 3 / 255
GAIN = 1.35


def knock_out_black(source: Image.Image) -> Image.Image:
    """Recover transparency from artwork rendered additively over black."""
    source = source.convert("RGBA")
    output = Image.new("RGBA", source.size, (0, 0, 0, 0))
    source_pixels = source.load()
    output_pixels = output.load()

    for y in range(source.height):
        for x in range(source.width):
            red, green, blue, source_alpha = source_pixels[x, y]
            coverage = max(red, green, blue) / 255
            coverage = max(0.0, min(1.0, ((coverage - BLACK_FLOOR) / (1 - BLACK_FLOOR)) * GAIN))
            if coverage <= 0:
                continue
            color = tuple(
                min(255, round(channel / coverage))
                for channel in (red, green, blue)
            )
            alpha = round(source_alpha * coverage)
            output_pixels[x, y] = color + (alpha,)

    return output


def add_adaptive_keyline(mark: Image.Image) -> Image.Image:
    """Add a compact navy edge so bright shapes remain visible on white."""
    alpha = mark.getchannel("A")
    core = alpha.point(lambda value: 255 if value >= 92 else 0)
    radius = max(1, round(mark.width * 0.0078))
    dilated = core.filter(ImageFilter.MaxFilter(radius * 2 + 1))
    ring = ImageChops.subtract(dilated, core)

    keyline = Image.new("RGBA", mark.size, NAVY)
    keyline.putalpha(ring.point(lambda value: round(value * NAVY[3] / 255)))
    result = Image.new("RGBA", mark.size, (0, 0, 0, 0))
    result.alpha_composite(keyline)
    result.alpha_composite(mark)
    return result


def build_preview(mark: Image.Image) -> Image.Image:
    preview = Image.new("RGB", (1024, 512), "white")
    dark = Image.new("RGB", (512, 512), "#050914")
    preview.paste(dark, (512, 0))

    display = mark.resize((420, 420), Image.Resampling.LANCZOS)
    preview.paste(display, (46, 46), display)
    preview.paste(display, (558, 46), display)
    return preview


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    transparent = knock_out_black(source)
    master = add_adaptive_keyline(transparent)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    master_path = OUTPUT_DIR / "admin-toolkit-blue-gold-adaptive-512.png"
    master.save(master_path)
    print(f"wrote {master_path}")

    for size in SIZES[:-1]:
        resized = transparent.resize((size, size), Image.Resampling.LANCZOS)
        adaptive = add_adaptive_keyline(resized)
        destination = OUTPUT_DIR / f"admin-toolkit-blue-gold-adaptive-{size}.png"
        adaptive.save(destination)
        print(f"wrote {destination}")

    preview_path = OUTPUT_DIR / "admin-toolkit-blue-gold-adaptive-preview.png"
    build_preview(master).save(preview_path)
    print(f"wrote {preview_path}")


if __name__ == "__main__":
    main()
