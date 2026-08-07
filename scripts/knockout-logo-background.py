#!/usr/bin/env python3
"""Knock the black canvas out of the DinaLab logo renders.

The logos are neon art drawn on a black field, so the "background" is not a flat
region that can be flood-filled away: the frame glow fades continuously into it.
Treating the render as an additive composite over black recovers the true alpha
instead. For a source pixel S drawn over black we have S = F * a, so the maximum
channel gives the coverage and dividing it back out gives the unpremultiplied
colour. That keeps the glow as a soft halo, empties the tile and the D counter,
and leaves the mark pixel-identical wherever it still sits on something dark.

Max channel is used rather than luminance because the art is heavily saturated:
a pure blue stroke has a luminance of 0.07 but full coverage.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image


# Renders bottom out at 1-2/255 rather than a clean zero, so anything at or below
# the floor is treated as canvas. GAIN then lifts partial coverage until the solid
# strokes are fully opaque -- without it the D would stay faintly see-through,
# since its darkest colourway peaks at 237/255.
BLACK_FLOOR = 3.0 / 255.0
GAIN = 1.35


def already_knocked_out(alpha: np.ndarray) -> bool:
    """True if a previous pass already cut the canvas away."""
    border = np.concatenate(
        [alpha[0, :], alpha[-1, :], alpha[:, 0], alpha[:, -1]]
    )
    return bool(border.max() < 8)


def knockout(source: Path, destination: Path) -> str:
    image = Image.open(source).convert("RGBA")
    data = np.asarray(image).astype(np.float32) / 255.0
    rgb, alpha = data[..., :3], data[..., 3]

    if already_knocked_out(alpha * 255.0):
        return "skipped (already transparent)"

    coverage = rgb.max(axis=2)
    coverage = (coverage - BLACK_FLOOR) / (1.0 - BLACK_FLOOR)
    coverage = np.clip(coverage * GAIN, 0.0, 1.0)

    # Unpremultiply so the mark composites over black exactly as it renders now.
    safe = np.where(coverage > 0.0, coverage, 1.0)[..., None]
    unpremultiplied = np.clip(rgb / safe, 0.0, 1.0)
    unpremultiplied = np.where(coverage[..., None] > 0.0, unpremultiplied, 0.0)

    output = np.concatenate(
        [unpremultiplied, (alpha * coverage)[..., None]], axis=2
    )
    result = Image.fromarray(np.rint(output * 255.0).astype(np.uint8), mode="RGBA")

    destination.parent.mkdir(parents=True, exist_ok=True)
    result.save(destination)

    cleared = float((coverage <= 0.0).mean()) * 100.0
    return f"cleared {cleared:.1f}% of pixels"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("inputs", nargs="+", type=Path)
    parser.add_argument(
        "--out-dir",
        type=Path,
        help="Write beside the sources when omitted (in-place).",
    )
    args = parser.parse_args()

    for source in args.inputs:
        destination = args.out_dir / source.name if args.out_dir else source
        print(f"{source}: {knockout(source, destination)}")


if __name__ == "__main__":
    main()
