"""Build favicon.ico and icon PNG files from the LOTUS concentric-O mark."""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "src" / "app"
PUBLIC = ROOT / "public"

BG = (27, 29, 31, 255)  # #1b1d1f
FG = (255, 255, 255, 255)


def draw_mark(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)
    cx = cy = size / 2
    outer = size * 0.36
    gap = size * 0.055
    stroke = max(1.0, size * 0.045)
    for i in range(4):
        r = outer - i * (stroke + gap)
        if r <= stroke:
            break
        bbox = (cx - r, cy - r, cx + r, cy + r)
        draw.ellipse(bbox, outline=FG, width=max(1, round(stroke)))
    return img


def save_ico(path: Path, source: Image.Image, sizes=(16, 32, 48, 64)) -> None:
    # Pillow builds each size from the provided high-res image when sizes= is set.
    source.save(path, format="ICO", sizes=[(s, s) for s in sizes])


def main() -> None:
    APP.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)

    icon_512 = draw_mark(512)
    icon_512.save(APP / "icon.png", format="PNG", optimize=True)
    icon_512.save(PUBLIC / "icon-512.png", format="PNG", optimize=True)

    apple = draw_mark(180)
    apple.save(APP / "apple-icon.png", format="PNG", optimize=True)
    apple.save(PUBLIC / "apple-icon.png", format="PNG", optimize=True)

    save_ico(APP / "favicon.ico", icon_512)
    save_ico(PUBLIC / "favicon.ico", icon_512)
    print("Wrote favicon.ico, icon.png, apple-icon.png, public copies")


if __name__ == "__main__":
    main()
