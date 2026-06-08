"""
Packcheck OG Image Renderer
Produces four 1200x630 PNG files per the OG_Image_Brief.md spec.
"""
from PIL import Image, ImageDraw, ImageFont
import numpy as np

W, H = 1200, 630

# Brand palette
PINE     = (46, 74, 57)
CREAM    = (244, 236, 216)
PAPER    = (239, 230, 207)
GOLD     = (214, 169, 63)
GOLD_DRK = (170, 120, 20)
RED      = (197, 23, 43)

# Fonts
F_WORD   = ImageFont.truetype('/tmp/Oswald-Bold-v5.ttf', 124)
F_KICK   = ImageFont.truetype('/tmp/Oswald-Regular-v5.ttf', 36)
F_TAG    = ImageFont.truetype('/tmp/ZillaSlab-500-Italic.ttf', 46)

TOPO_PATH = '/tmp/packcheck-topo.jpg'

# ── Ink measurement ───────────────────────────────────────────────
def measure(text, font):
    tmp = Image.new("RGB", (2000, 400), (0, 0, 0))
    d = ImageDraw.Draw(tmp)
    d.text((100, 100), text, font=font, fill=(255, 255, 255))
    bb = tmp.getbbox()
    if bb is None:
        return 0, 0, 0, 0
    return bb[0]-100, bb[1]-100, bb[2]-bb[0], bb[3]-bb[1]  # ox, oy, w, h

def he_gap(font):
    _, _, he_w, _ = measure("HE", font)
    _, _, h_w,  _ = measure("H",  font)
    _, _, e_w,  _ = measure("E",  font)
    return he_w - h_w - e_w

# ── Topo backgrounds ─────────────────────────────────────────────
def make_pine_base():
    topo = Image.open(TOPO_PATH).convert("L")
    ratio = topo.width / topo.height
    if ratio > W/H:
        new_h, new_w = H, int(ratio * H)
    else:
        new_w, new_h = W, int(W / ratio)
    topo = topo.resize((new_w, new_h), Image.LANCZOS)
    ox, oy = (new_w - W)//2, (new_h - H)//2
    topo = topo.crop((ox, oy, ox+W, oy+H))

    arr = np.array(topo, dtype=np.float32)
    inv = np.clip((255.0 - arr - 40) * 4.0, 0, 255)
    alpha = (inv * 0.30).astype(np.uint8)
    cream_layer = np.full((H, W, 3), CREAM, dtype=np.uint8)
    topo_overlay = Image.fromarray(np.dstack([cream_layer, alpha]), 'RGBA')

    base = Image.new("RGBA", (W, H), PINE + (255,))
    base.alpha_composite(topo_overlay)
    return base

def make_cream_base():
    topo = Image.open(TOPO_PATH).convert("L")
    ratio = topo.width / topo.height
    if ratio > W/H:
        new_h, new_w = H, int(ratio * H)
    else:
        new_w, new_h = W, int(W / ratio)
    topo = topo.resize((new_w, new_h), Image.LANCZOS)
    ox, oy = (new_w - W)//2, (new_h - H)//2
    topo = topo.crop((ox, oy, ox+W, oy+H))

    arr = np.array(topo, dtype=np.float32)
    # Cream bg: blend topo at 60% opacity (full detail visible)
    normalized = arr / 255.0
    paper_arr = np.full((H, W, 3), PAPER, dtype=np.float32)
    topo_rgb = np.stack([arr]*3, axis=-1)
    blended = (paper_arr * (1 - 0.60 * (1 - normalized[:,:,None]))).astype(np.uint8)
    return Image.fromarray(blended, 'RGB').convert('RGBA')

# ── Checkbox ─────────────────────────────────────────────────────
def draw_checkbox(d, x, y, size, wall, box_color, check_color):
    # Outer box
    d.rectangle([x, y, x+size, y+size], outline=box_color, width=wall)
    # Check mark: 78% of box height, vertically centered
    ck_h = size * 0.78
    ck_y = y + (size - ck_h) / 2
    # Checkmark: two lines forming a tick
    p1 = (x + size * 0.18, ck_y + ck_h * 0.52)
    p2 = (x + size * 0.42, ck_y + ck_h * 0.80)
    p3 = (x + size * 0.82, ck_y + ck_h * 0.12)
    stroke = max(3, int(wall * 1.8))
    d.line([p1, p2, p3], fill=check_color, width=stroke)

# ── Layout engine ─────────────────────────────────────────────────
def render(bg, has_kicker, box_color, word_color, kick_color, tag_color, tag_text="Pack Smart. Go Far."):
    img = bg.copy().convert('RGBA')
    d = ImageDraw.Draw(img)

    # Measure wordmark
    w_ox, w_oy, w_w, w_h = measure("PACKCHECK", F_WORD)
    gap = he_gap(F_WORD)
    wall = max(4, int(w_h * 0.045))
    cb_size = w_h

    if has_kicker:
        k_ox, k_oy, k_w, k_h = measure("PHILMONT EDITION", F_KICK)
        t_ox, t_oy, t_w, t_h = measure(tag_text, F_TAG)

        total_h = (k_h - k_oy) + 14 + w_h + 12 + t_h
        base_y = (H - total_h) // 2

        # X: center the wordmark+checkbox block
        block_w = cb_size + gap + w_w
        base_x = (W - block_w) // 2
        word_x = base_x + cb_size + gap - w_ox
        cb_x   = base_x
        kick_x = word_x + w_ox - k_ox

        # Y positions
        kick_draw_y = base_y - k_oy
        word_draw_y = base_y + (k_h - k_oy) + 17 - w_oy
        cb_y        = base_y + (k_h - k_oy) + 17
        tag_draw_y  = cb_y + w_h + 12 - t_oy
        tag_draw_x  = word_x + w_ox - t_ox

        d.text((kick_x, kick_draw_y), "PHILMONT EDITION", font=F_KICK, fill=kick_color)
    else:
        t_ox, t_oy, t_w, t_h = measure(tag_text, F_TAG)
        total_h = w_h + 12 + t_h
        base_y = (H - total_h) // 2

        block_w = cb_size + gap + w_w
        base_x = (W - block_w) // 2
        word_x = base_x + cb_size + gap - w_ox
        cb_x   = base_x
        cb_y   = base_y
        word_draw_y = base_y - w_oy
        tag_draw_y  = base_y + w_h + 12 - t_oy
        tag_draw_x  = word_x + w_ox - t_ox

    draw_checkbox(d, cb_x, cb_y, cb_size, wall, box_color, RED)
    d.text((word_x, word_draw_y), "PACKCHECK", font=F_WORD, fill=word_color)
    d.text((tag_draw_x, tag_draw_y), tag_text, font=F_TAG, fill=tag_color)

    return img.convert('RGB')

# ── Render all four ───────────────────────────────────────────────
pine_bg  = make_pine_base()
cream_bg = make_cream_base()

imgs = {
    'og-image-generic-pine.png':    render(pine_bg,  False, CREAM, CREAM, None,     GOLD),
    'og-image-generic-cream.png':   render(cream_bg, False, PINE,  PINE,  None,     RED),
    'og-image-philmont-pine.png':   render(pine_bg,  True,  CREAM, CREAM, GOLD,     CREAM),
    'og-image-philmont-cream.png':  render(cream_bg, True,  PINE,  PINE,  GOLD_DRK, PINE),
}

for name, img in imgs.items():
    img.save(f'/tmp/{name}', 'PNG')
    print(f'Saved {name}')
