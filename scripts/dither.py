"""Generate the dithered landscape artwork used on the site.

Procedural, deterministic, no assets. Requires Pillow:

    python3 scripts/dither.py

Writes public/art/*.png. Rendered at low resolution and scaled up with
nearest-neighbour so the pixels stay chunky.
"""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image

OUT = Path(__file__).resolve().parent.parent / "public" / "art"
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def hexrgb(s: str) -> tuple[int, int, int]:
    s = s.lstrip("#")
    return int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16)


def ridge(x: float, seed: int, base: float, amps: list[tuple[float, float]]) -> float:
    rnd = random.Random(seed)
    y = base
    for amp, freq in amps:
        y += amp * math.sin(freq * x + rnd.uniform(0, math.tau))
        y += amp * 0.25 * abs(math.sin(freq * 1.7 * x + rnd.uniform(0, math.tau)))
    return y


_LATTICE: dict[tuple[int, int, int], float] = {}


def _lattice(ix: int, iy: int, seed: int) -> float:
    key = (ix, iy, seed)
    v = _LATTICE.get(key)
    if v is None:
        v = random.Random(hash(key)).uniform(-1.0, 1.0)
        _LATTICE[key] = v
    return v


def _smooth(t: float) -> float:
    return t * t * (3 - 2 * t)


def value_noise(x: float, y: float, seed: int) -> float:
    """Smooth lattice value noise with three octaves, in roughly [-1, 1]."""
    total = 0.0
    amp = 0.6
    freq = 0.035
    for octave in range(3):
        fx, fy = x * freq, y * freq
        ix, iy = math.floor(fx), math.floor(fy)
        tx, ty = _smooth(fx - ix), _smooth(fy - iy)
        s = seed * 31 + octave
        a = _lattice(ix, iy, s)
        b = _lattice(ix + 1, iy, s)
        c = _lattice(ix, iy + 1, s)
        d = _lattice(ix + 1, iy + 1, s)
        top = a + (b - a) * tx
        bottom = c + (d - c) * tx
        total += amp * (top + (bottom - top) * ty)
        amp *= 0.5
        freq *= 2.1
    return total


def dither(shade: float, x: int, y: int, ramp: list[tuple[int, int, int]]) -> tuple[int, int, int]:
    shade = max(0.0, min(0.9999, shade))
    n = len(ramp) - 1
    v = shade * n
    i = int(v)
    frac = v - i
    if frac * 16 > BAYER[y % 4][x % 4]:
        i += 1
    return ramp[min(i, n)]


def render(w: int, h: int, sky: list[tuple[int, int, int]], layers: list[dict], seed: int, solid: float = 0.0) -> Image.Image:
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        for x in range(w):
            t = max(0.0, (y / h - solid) / max(0.01, 1 - solid))
            s = t * (0.55 + 0.45 * value_noise(x * 1.4, y * 2.2, seed)) + 0.08 * value_noise(x * 5, y * 5, seed + 9)
            px[x, y] = dither(s, x, y, sky)
    for li, layer in enumerate(layers):
        ramp = layer["ramp"]
        for x in range(w):
            top = ridge(x / w * math.tau, seed + li * 17, layer["base"] * h, [(a * h, f) for a, f in layer["amps"]])
            top_i = int(top)
            prev = ridge((x - 1) / w * math.tau, seed + li * 17, layer["base"] * h, [(a * h, f) for a, f in layer["amps"]])
            slope = top - prev
            for y in range(max(0, top_i), h):
                depth = (y - top) / max(1.0, h - top)
                light = 0.55 - 1.1 * slope / 5.0  # west faces lit, east faces dark
                s = light + 0.3 * value_noise(x * 2.4, y * 1.2, seed + li) + 0.35 * depth * layer.get("darken", 1.0)
                s += 0.15 * value_noise(x * 7, y * 7, seed + 40 + li)
                if y - top < 2 + 3 * layer.get("snow", 0):
                    s -= 0.6 * layer.get("snow", 0)
                px[x, y] = dither(s, x, y, ramp)
    return img


def hero() -> None:
    sky = [hexrgb("#E1E9F2"), hexrgb("#E1E9F2"), hexrgb("#EEF2F8"), hexrgb("#FFFFFF"), hexrgb("#FFFFFF")]
    warm = [hexrgb("#FFFFFF"), hexrgb("#F2F7C0"), hexrgb("#D6E600"), hexrgb("#FF7A1A"), hexrgb("#FF4500"), hexrgb("#1A1A1A"), hexrgb("#0B0B0B")]
    far = [hexrgb("#FFFFFF"), hexrgb("#E1E9F2"), hexrgb("#D6E600"), hexrgb("#FF4500"), hexrgb("#1A1A1A")]
    img = render(
        480,
        253,
        sky,
        [
            {"base": 0.66, "amps": [(0.14, 1.0), (0.06, 3.0), (0.02, 7.0), (0.006, 19.0)], "ramp": far, "darken": 0.4, "snow": 0.6},
            {"base": 0.78, "amps": [(0.11, 2.0), (0.05, 5.0), (0.018, 11.0), (0.005, 29.0)], "ramp": warm, "darken": 0.8, "snow": 0.3},
        ],
        seed=7,
        solid=0.3,
    )
    img.resize((1440, 760), Image.NEAREST).save(OUT / "hero.png", optimize=True)


def peak() -> None:
    sky = [hexrgb("#FFFFFF"), hexrgb("#FFFFFF")]
    green = [hexrgb("#FFFFFF"), hexrgb("#FFD5DE"), hexrgb("#CFD8EC"), hexrgb("#00D45A"), hexrgb("#00A84A"), hexrgb("#1A1A1A")]
    rock = [hexrgb("#FFFFFF"), hexrgb("#CFD8EC"), hexrgb("#FF7A1A"), hexrgb("#FF4500"), hexrgb("#1A1A1A"), hexrgb("#0B0B0B")]
    img = render(
        300,
        260,
        sky,
        [
            {"base": 0.42, "amps": [(0.30, 1.0), (0.06, 4.0), (0.02, 9.0), (0.005, 23.0)], "ramp": green, "darken": 0.5, "snow": 0.8},
            {"base": 0.86, "amps": [(0.09, 3.0), (0.03, 7.0), (0.01, 17.0)], "ramp": rock, "darken": 0.6, "snow": 0.0},
        ],
        seed=21,
    )
    img.resize((900, 780), Image.NEAREST).save(OUT / "peak.png", optimize=True)


def terminal() -> None:
    """A dithered 'terminal' slab: pale blue field with a chartreuse/green glow."""
    sky = [hexrgb("#FFFFFF"), hexrgb("#FFF6C8"), hexrgb("#CFD8EC"), hexrgb("#00D45A"), hexrgb("#1A1A1A")]
    img = render(320, 200, sky, [], seed=3)
    img.resize((960, 600), Image.NEAREST).save(OUT / "field.png", optimize=True)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    hero()
    peak()
    terminal()
    print("wrote", sorted(p.name for p in OUT.iterdir()))
