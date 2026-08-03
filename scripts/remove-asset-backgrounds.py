#!/usr/bin/env python3
"""Remove flat logo canvases while preserving same-colored foreground strokes."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


def color_distance(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5


def corner_key(image: Image.Image) -> tuple[int, int, int]:
    pixels = image.load()
    width, height = image.size
    samples = [
        pixels[x, y]
        for x0, y0 in ((0, 0), (width - 5, 0), (0, height - 5), (width - 5, height - 5))
        for y in range(y0, y0 + 5)
        for x in range(x0, x0 + 5)
    ]
    return tuple(sorted(pixel[channel] for pixel in samples)[len(samples) // 2] for channel in range(3))


def center_color(image: Image.Image) -> tuple[int, int, int]:
    pixels = image.load()
    width, height = image.size
    x0, y0 = width // 2 - 4, height // 2 - 4
    samples = [pixels[x, y] for y in range(y0, y0 + 9) for x in range(x0, x0 + 9)]
    return tuple(sorted(pixel[channel] for pixel in samples)[len(samples) // 2] for channel in range(3))


def extract(source: Path, destination: Path) -> None:
    original = Image.open(source).convert("RGB")
    width, height = original.size
    pixels = original.load()
    key = corner_key(original)

    # White outer canvases need a tighter threshold than dark gradient fields.
    is_light = sum(key) / 3 >= 210
    opaque_threshold = 82 if is_light else 190
    transparent_threshold = 10 if is_light else 16
    connected_only = color_distance(center_color(original), key) > opaque_threshold

    candidate = bytearray(width * height)
    distance = [0.0] * (width * height)
    for y in range(height):
        for x in range(width):
            index = y * width + x
            value = color_distance(pixels[x, y], key)
            distance[index] = value
            candidate[index] = value < opaque_threshold

    visited = bytearray(width * height)
    remove = bytearray(width * height)

    def collect(seed: int) -> tuple[list[int], bool]:
        queue = deque([seed])
        visited[seed] = 1
        component: list[int] = []
        touches_border = False
        while queue:
            index = queue.popleft()
            component.append(index)
            x, y = index % width, index // width
            touches_border |= x == 0 or y == 0 or x == width - 1 or y == height - 1
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < width and 0 <= ny < height:
                    neighbor = ny * width + nx
                    if candidate[neighbor] and not visited[neighbor]:
                        visited[neighbor] = 1
                        queue.append(neighbor)
        return component, touches_border

    minimum_hole = int(width * height * 0.01)
    for index in range(width * height):
        if not candidate[index] or visited[index]:
            continue
        component, touches_border = collect(index)
        if touches_border or (not connected_only and len(component) >= minimum_hole):
            for pixel_index in component:
                remove[pixel_index] = 1

    alpha = Image.new("L", (width, height), 255)
    alpha_pixels = alpha.load()
    span = opaque_threshold - transparent_threshold
    for index, should_remove in enumerate(remove):
        if not should_remove:
            continue
        value = distance[index]
        if value <= transparent_threshold:
            opacity = 0
        else:
            progress = min(1.0, (value - transparent_threshold) / span)
            smooth = progress * progress * (3 - 2 * progress)
            opacity = round(255 * smooth)
        alpha_pixels[index % width, index // width] = opacity

    output = original.convert("RGBA")
    output.putalpha(alpha)
    destination.parent.mkdir(parents=True, exist_ok=True)
    output.save(destination)
    print(
        f"wrote {destination} key=#{key[0]:02x}{key[1]:02x}{key[2]:02x} "
        f"mode={'connected' if connected_only else 'components'}"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("inputs", nargs="+", type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    args = parser.parse_args()
    for source in args.inputs:
        extract(source, args.out_dir / source.name)


if __name__ == "__main__":
    main()
