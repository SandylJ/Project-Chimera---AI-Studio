#!/usr/bin/env python3
"""Generate Party Idle app icon. Output: /tmp/party-idle-icon.png (1024x1024)."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

SIZE = 1024
OUT = "/tmp/party-idle-icon.png"

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Rounded-rect background with warm gradient effect.
bg_top = (46, 37, 28)      # warmish brown
bg_bot = (13, 11, 9)       # near black

# Build gradient onto a square, then mask rounded corners.
grad = Image.new("RGB", (1, SIZE))
for y in range(SIZE):
    t = y / (SIZE - 1)
    r = int(bg_top[0] * (1 - t) + bg_bot[0] * t)
    g = int(bg_top[1] * (1 - t) + bg_bot[1] * t)
    b = int(bg_top[2] * (1 - t) + bg_bot[2] * t)
    grad.putpixel((0, y), (r, g, b))
grad = grad.resize((SIZE, SIZE))

# Rounded rect mask.
mask = Image.new("L", (SIZE, SIZE), 0)
mdraw = ImageDraw.Draw(mask)
radius = int(SIZE * 0.22)
mdraw.rounded_rectangle((0, 0, SIZE - 1, SIZE - 1), radius=radius, fill=255)

img.paste(grad, (0, 0), mask)

# Outer glow / border (subtle gold).
border = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
bdraw = ImageDraw.Draw(border)
bdraw.rounded_rectangle((6, 6, SIZE - 7, SIZE - 7), radius=radius - 4,
                        outline=(212, 169, 67, 180), width=8)
img.alpha_composite(border)

# Draw crossed swords in gold.
gold = (242, 198, 92, 255)
gold_dim = (180, 140, 60, 255)

cx, cy = SIZE // 2, SIZE // 2

def draw_sword(angle_deg: float, length: int, width: int):
    import math
    a = math.radians(angle_deg)
    dx, dy = math.cos(a), math.sin(a)
    # blade
    x1, y1 = cx - dx * length / 2, cy - dy * length / 2
    x2, y2 = cx + dx * length / 2, cy + dy * length / 2
    # perpendicular for width
    px, py = -dy, dx
    hw = width / 2
    pts = [
        (x1 + px * hw, y1 + py * hw),
        (x2 + px * hw, y2 + py * hw),
        (x2 - px * hw, y2 - py * hw),
        (x1 - px * hw, y1 - py * hw),
    ]
    draw.polygon(pts, fill=gold)
    # point tip (triangle)
    tx = x2 + dx * (width * 0.8)
    ty = y2 + dy * (width * 0.8)
    draw.polygon([
        (x2 + px * hw, y2 + py * hw),
        (tx, ty),
        (x2 - px * hw, y2 - py * hw),
    ], fill=gold)
    # crossguard near hilt
    hx1, hy1 = x1 + px * width * 1.5, y1 + py * width * 1.5
    hx2, hy2 = x1 - px * width * 1.5, y1 - py * width * 1.5
    draw.line((hx1, hy1, hx2, hy2), fill=gold_dim, width=int(width * 0.9))

blade_len = int(SIZE * 0.62)
blade_w = int(SIZE * 0.042)
draw_sword(-45, blade_len, blade_w)
draw_sword(225, blade_len, blade_w)

# Bottom text "PARTY IDLE".
try:
    font_path = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
    if not os.path.exists(font_path):
        font_path = "/Library/Fonts/Georgia.ttf"
    if not os.path.exists(font_path):
        font_path = "/System/Library/Fonts/Helvetica.ttc"
    font = ImageFont.truetype(font_path, int(SIZE * 0.075))
except Exception:
    font = ImageFont.load_default()
text = "PARTY IDLE"
bbox = draw.textbbox((0, 0), text, font=font)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
tx = (SIZE - tw) // 2
ty = int(SIZE * 0.82)
# shadow
draw.text((tx + 3, ty + 3), text, font=font, fill=(0, 0, 0, 220))
draw.text((tx, ty), text, font=font, fill=(242, 230, 168, 255))

img.save(OUT)
print("wrote", OUT)
