#!/usr/bin/env python3
"""Copy the iOS app icons into apps/<app>/logo.png for the workshop grid.

The store icons ship as hard 1024px squares. The homepage renders them at 52px
inside .lab-logo, whose 12px frame would leave the artwork's square corners
poking into the rounded border, so the corners are masked here instead. The mask
is built at 4x and downsampled, which keeps the curve clean at display size.

Run from the repository root after an icon changes in the sibling dina-app
checkout:

    uv run --with pillow python3 scripts/build-ios-app-marks.py
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SOURCE = ROOT.parent / "dina-app"

# apps/<slug>/logo.png <- <dina-app>/<appicon set>/<file>
MARKS = [
    ("dina", "dina-ios/Dina/Assets.xcassets/AppIcon.appiconset/AppIcon.png"),
    ("dina-3d", "dina-3d-ios/Dina3D/Assets.xcassets/AppIcon.appiconset/icon-1024.png"),
    ("dina-draw", "dina-draw-ios/DinaDraw/Assets.xcassets/AppIcon.appiconset/icon-1024.png"),
    ("dina-snap", "dina-snap-ios/DinaSnap/Assets.xcassets/AppIcon.appiconset/icon-1024.png"),
    ("dina-bloom", "dina-bloom-ios/DinaBloom/Assets.xcassets/AppIcon.appiconset/icon-1024.png"),
]

SIZE = 128
RADIUS = 28
SUPERSAMPLE = 4


def rounded_mask(size: int, radius: int) -> Image.Image:
    scale = size * SUPERSAMPLE
    mask = Image.new("L", (scale, scale), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, scale - 1, scale - 1], radius=radius * SUPERSAMPLE, fill=255
    )
    return mask.resize((size, size), Image.LANCZOS)


def build(source_root: Path) -> None:
    mask = rounded_mask(SIZE, RADIUS)
    for slug, relative in MARKS:
        source = source_root / relative
        if not source.exists():
            raise SystemExit(f"missing icon: {source}")

        icon = Image.open(source).convert("RGBA").resize((SIZE, SIZE), Image.LANCZOS)
        icon.putalpha(mask)

        destination = ROOT / "apps" / slug / "logo.png"
        destination.parent.mkdir(parents=True, exist_ok=True)
        icon.save(destination, optimize=True)
        print(f"wrote {destination.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source",
        type=Path,
        default=DEFAULT_SOURCE,
        help="Path to the sibling dina-app checkout.",
    )
    build(parser.parse_args().source)


if __name__ == "__main__":
    main()
