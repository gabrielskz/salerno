from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

TERRACOTTA = "#8F430D"
CLAY = "#9F5621"
OLIVE = "#5A6339"
SAGE = "#6D7550"
CREAM = "#F7E9DE"


def font(size: int):
    candidates = [
        Path("C:/Windows/Fonts/segoeuib.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf"),
        Path("C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def draw_icon(size: int) -> Image.Image:
    scale = size / 512
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    radius = round(112 * scale)
    draw.rounded_rectangle((0, 0, size, size), radius=radius, fill=TERRACOTTA)

    draw.ellipse((round(248 * scale), round(-70 * scale), round(598 * scale), round(282 * scale)), fill=CLAY)
    draw.ellipse((round(-76 * scale), round(290 * scale), round(258 * scale), round(632 * scale)), fill=OLIVE)
    draw.pieslice((round(250 * scale), round(248 * scale), round(524 * scale), round(570 * scale)), 116, 296, fill=SAGE)

    monogram_font = font(round(322 * scale))
    bbox = draw.textbbox((0, 0), "S", font=monogram_font)
    x = (size - (bbox[2] - bbox[0])) / 2 - bbox[0]
    y = (size - (bbox[3] - bbox[1])) / 2 - bbox[1] - round(6 * scale)
    draw.text((x, y), "S", font=monogram_font, fill=CREAM)

    draw.line((round(158 * scale), round(266 * scale), round(354 * scale), round(266 * scale)), fill=CREAM, width=max(2, round(18 * scale)))
    draw.ellipse((round(382 * scale), round(382 * scale), round(424 * scale), round(424 * scale)), fill=CREAM)
    return image


def save_png(path: Path, size: int) -> None:
    draw_icon(size).save(path)


def main() -> None:
    PUBLIC.mkdir(exist_ok=True)
    save_png(PUBLIC / "apple-touch-icon.png", 180)
    save_png(PUBLIC / "icon-192.png", 192)
    save_png(PUBLIC / "icon-512.png", 512)
    favicon_sizes = [draw_icon(size) for size in (16, 32, 48)]
    favicon_sizes[0].save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=favicon_sizes[1:])


if __name__ == "__main__":
    main()
