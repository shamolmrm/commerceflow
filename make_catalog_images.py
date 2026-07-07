from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math

OUT = "d:/devloper/CommerceFlow/portfolio_screenshots/mobile_catalog"
os.makedirs(OUT, exist_ok=True)

W, H = 1000, 750

def hex(c): return tuple(int(c[i:i+2],16) for i in (1,3,5))

# Colors
BG1    = hex("#0A0A1A")
BG2    = hex("#1A0A3A")
INDIGO = hex("#6366F1")
PURPLE = hex("#8B5CF6")
CYAN   = hex("#06B6D4")
GREEN  = hex("#10B981")
YELLOW = hex("#FBBF24")
ORANGE = hex("#F59E0B")
WHITE  = (255,255,255)
LGRAY  = (180,180,200)
DGRAY  = (100,100,120)

def gradient_bg(w, h, c1, c2, diagonal=False):
    img = Image.new("RGB", (w,h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y/h
        if diagonal:
            t = (y/h + 0) * 0.7
        r = int(c1[0]*(1-t) + c2[0]*t)
        g = int(c1[1]*(1-t) + c2[1]*t)
        b = int(c1[2]*(1-t) + c2[2]*t)
        d.line([(0,y),(w,y)], fill=(r,g,b))
    return img

def glow_circle(draw, cx, cy, r, color, alpha=60):
    for i in range(3):
        a = int(alpha/(i+1))
        rr = r + i*20
        bbox = [cx-rr, cy-rr, cx+rr, cy+rr]
        draw.ellipse(bbox, fill=color+(a,))

def font(size, bold=False):
    try:
        name = "arialbd.ttf" if bold else "arial.ttf"
        return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size)
    except:
        return ImageFont.load_default()

def center_text(draw, y, text, f, color, w=W):
    bb = draw.textbbox((0,0), text, font=f)
    x = (w - (bb[2]-bb[0])) // 2
    draw.text((x, y), text, font=f, fill=color)
    return bb[3]-bb[1]

def pill(draw, x, y, text, bg, fg, f, pad_x=18, pad_y=8):
    bb = draw.textbbox((0,0), text, font=f)
    tw, th = bb[2]-bb[0], bb[3]-bb[1]
    draw.rounded_rectangle([x, y, x+tw+pad_x*2, y+th+pad_y*2], radius=20, fill=bg)
    draw.text((x+pad_x, y+pad_y), text, font=f, fill=fg)
    return tw+pad_x*2, th+pad_y*2

# ══════════════════════════════════════════════════════
# IMAGE 1 — Hero / Title
# ══════════════════════════════════════════════════════
img = gradient_bg(W, H, BG1, (20, 5, 50))
glow = Image.new("RGBA", (W,H), (0,0,0,0))
gd = ImageDraw.Draw(glow)
gd.ellipse([600,50,1000,450], fill=INDIGO+(25,))
gd.ellipse([700,200,1100,600], fill=PURPLE+(20,))
gd.ellipse([-100,300,300,750], fill=CYAN+(15,))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
draw = ImageDraw.Draw(img)

# Grid dots decoration
for gx in range(0, W, 40):
    for gy in range(0, H, 40):
        draw.ellipse([gx-1,gy-1,gx+1,gy+1], fill=(255,255,255,20))

# Badge top
pill(draw, 30, 30, "⚡  AI-POWERED", INDIGO+(180,), WHITE, font(13,True))

# Main title
f48 = font(52, True)
f28 = font(28, True)
f16 = font(16)
f14 = font(14)

draw.text((30, 90), "Custom Mobile App", font=f48, fill=WHITE)
draw.text((30, 148), "for Android & iOS", font=f48, fill=YELLOW)

# Divider line
draw.line([(30,215),(400,215)], fill=INDIGO, width=3)
draw.text((30, 228), "Built with Flutter  •  React Native  •  Django REST API", font=f16, fill=LGRAY)

# Feature checkmarks — left side
checks = [
    ("Startup & Business Apps",  GREEN),
    ("AI Features Integrated",   CYAN),
    ("Full Source Code Included", YELLOW),
    ("Android + iOS in One Build", PURPLE),
    ("Admin Dashboard Optional",  ORANGE),
]
y_c = 280
for txt, clr in checks:
    draw.ellipse([30, y_c+2, 48, y_c+20], fill=clr)
    draw.text((33, y_c+1), "✓", font=font(13, True), fill=(10,10,20))
    draw.text((58, y_c), txt, font=font(17, True), fill=WHITE)
    y_c += 38

# Right side — big phone mockup shape
px, py, pw, ph = 580, 80, 200, 380
draw.rounded_rectangle([px, py, px+pw, py+ph], radius=28, fill=(255,255,255,12), outline=INDIGO, width=2)
draw.rounded_rectangle([px+8, py+8, px+pw-8, py+ph-8], radius=22, fill=(10,10,30))
# screen content bars
for i, clr in enumerate([INDIGO, PURPLE, CYAN, GREEN, YELLOW]):
    bx = px+20
    by = py+40 + i*60
    draw.rounded_rectangle([bx, by, bx+160, by+44], radius=8, fill=clr+(40,))
    draw.rounded_rectangle([bx, by, bx+100-i*12, by+12], radius=4, fill=clr)
    draw.rounded_rectangle([bx, by+20, bx+60+i*8, by+28], radius=4, fill=(255,255,255,40))

# second phone
px2, py2 = 800, 160
draw.rounded_rectangle([px2, py2, px2+160, py2+300], radius=22, fill=(255,255,255,8), outline=PURPLE, width=2)
draw.rounded_rectangle([px2+8, py2+8, px2+152, py2+292], radius=18, fill=(10,10,30))
for i in range(5):
    draw.rounded_rectangle([px2+16, py2+30+i*50, px2+144, py2+68+i*50], radius=6, fill=PURPLE+(30,))
    draw.rounded_rectangle([px2+16, py2+30+i*50, px2+80, py2+42+i*50], radius=4, fill=PURPLE)

# Bottom strip
draw.rectangle([0, H-80, W, H], fill=(255,255,255,8))
draw.line([(0, H-80),(W, H-80)], fill=INDIGO, width=1)
tiers = [("STARTER", "$499", GREEN), ("STANDARD", "$2,999", CYAN), ("ADVANCED", "$6,999", YELLOW)]
for i,(t,p,c) in enumerate(tiers):
    x = 60 + i*310
    draw.text((x, H-62), t, font=font(12,True), fill=c)
    draw.text((x, H-42), p, font=font(22,True), fill=WHITE)

img.save(f"{OUT}/01_hero.jpg", quality=95)
print("OK 01_hero.jpg")

# ══════════════════════════════════════════════════════
# IMAGE 2 — Process / Workflow
# ══════════════════════════════════════════════════════
img = gradient_bg(W, H, (5,5,20), (15,5,40))
glow = Image.new("RGBA",(W,H),(0,0,0,0))
gd = ImageDraw.Draw(glow)
gd.ellipse([700,400,1100,800], fill=PURPLE+(20,))
gd.ellipse([-100,-100,300,300], fill=CYAN+(15,))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
draw = ImageDraw.Draw(img)

center_text(draw, 35, "HOW IT WORKS", font(13,True), CYAN)
center_text(draw, 60, "My Development Process", font(42,True), WHITE)
draw.line([(W//2-60, 115),(W//2+60, 115)], fill=INDIGO, width=3)

steps = [
    ("01", "Discovery",    "Review requirements,\ngoals & design style",       INDIGO, "🎯"),
    ("02", "UI Design",    "Wireframes, screens,\ncolor & layout",              PURPLE, "🎨"),
    ("03", "Development",  "Flutter/React Native\ncode + API integration",      CYAN,   "⚡"),
    ("04", "Testing",      "Device testing,\nbug fixes & QA",                   GREEN,  "✅"),
    ("05", "Delivery",     "Source code, builds\n& deployment guide",           YELLOW, "🚀"),
]

box_w = 168
start_x = (W - (box_w*5 + 16*4)) // 2

for i,(num,title,desc,clr,icon) in enumerate(steps):
    bx = start_x + i*(box_w+16)
    by = 145

    # Connector line
    if i < 4:
        draw.line([(bx+box_w, by+75), (bx+box_w+16, by+75)], fill=clr, width=2)
        draw.polygon([(bx+box_w+12, by+70),(bx+box_w+12, by+80),(bx+box_w+20, by+75)], fill=clr)

    # Card
    card = Image.new("RGBA",(box_w, 300),(0,0,0,0))
    cd = ImageDraw.Draw(card)
    cd.rounded_rectangle([0,0,box_w-1,299], radius=16, fill=clr+(25,), outline=clr+(80,), width=1)

    # Number badge
    cd.ellipse([box_w//2-22, 16, box_w//2+22, 60], fill=clr+(60,))
    cd.ellipse([box_w//2-18, 20, box_w//2+18, 56], fill=clr)
    nb = cd.textbbox((0,0), num, font=font(15,True))
    cd.text(((box_w-(nb[2]-nb[0]))//2, 29), num, font=font(15,True), fill=(10,10,20))

    # Icon
    ib = cd.textbbox((0,0), icon, font=font(22))
    cd.text(((box_w-(ib[2]-ib[0]))//2, 72), icon, font=font(22), fill=WHITE)

    # Title
    tb = cd.textbbox((0,0), title, font=font(16,True))
    cd.text(((box_w-(tb[2]-tb[0]))//2, 110), title, font=font(16,True), fill=WHITE)

    # Desc
    for j,line in enumerate(desc.split("\n")):
        lb = cd.textbbox((0,0), line, font=font(12))
        cd.text(((box_w-(lb[2]-lb[0]))//2, 138+j*18), line, font=font(12), fill=LGRAY)

    img.paste(card, (bx, by), card)

# Bottom CTA
draw.rounded_rectangle([W//2-200, H-100, W//2+200, H-30], radius=30,
    fill=INDIGO, outline=PURPLE, width=2)
center_text(draw, H-85, "Start Your Project Today  →", font(18,True), WHITE)

img.save(f"{OUT}/02_process.jpg", quality=95)
print("OK 02_process.jpg")

# ══════════════════════════════════════════════════════
# IMAGE 3 — Deliverables / What You Get
# ══════════════════════════════════════════════════════
img = gradient_bg(W, H, (8,5,25), (20,8,45))
glow = Image.new("RGBA",(W,H),(0,0,0,0))
gd = ImageDraw.Draw(glow)
gd.ellipse([750,50,1100,400], fill=CYAN+(20,))
gd.ellipse([-50,400,350,800], fill=PURPLE+(18,))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
draw = ImageDraw.Draw(img)

draw.text((50, 38), "WHAT YOU WILL RECEIVE", font=font(13,True), fill=CYAN)
draw.text((50, 65), "Complete Deliverables", font=font(42,True), fill=WHITE)
draw.line([(50, 120),(280, 120)], fill=INDIGO, width=3)

deliverables = [
    ("Full Source Code",         "GitHub repo, clean & commented",      GREEN,  "📦"),
    ("Android & iOS Builds",     "APK + IPA ready to publish",          CYAN,   "📱"),
    ("Custom UI/UX Design",      "Figma screens & final implementation", PURPLE, "🎨"),
    ("API Integration",          "REST API, auth & data connected",      INDIGO, "🔌"),
    ("AI Features",              "Smart search, recommendations",        YELLOW, "🤖"),
    ("App Icon & Splash Screen", "Branded assets for both platforms",    ORANGE, "⭐"),
    ("Testing & Bug Fixes",      "Tested on real Android & iOS devices", GREEN,  "✅"),
    ("Deployment Guide",         "Step-by-step store submission help",   CYAN,   "🚀"),
]

col_items = [deliverables[:4], deliverables[4:]]
for ci, col in enumerate(col_items):
    cx = 50 + ci*470
    for ri, (title, desc, clr, icon) in enumerate(col):
        cy = 145 + ri*130
        # Card
        card = Image.new("RGBA",(430,115),(0,0,0,0))
        cd = ImageDraw.Draw(card)
        cd.rounded_rectangle([0,0,429,114], radius=14, fill=clr+(18,), outline=clr+(50,), width=1)

        # Icon circle
        cd.ellipse([14,22,66,74], fill=clr+(40,))
        ib = cd.textbbox((0,0), icon, font=font(22))
        cd.text((14+(52-(ib[2]-ib[0]))//2, 27), icon, font=font(22), fill=WHITE)

        # Text
        cd.text((84, 24), title, font=font(17,True), fill=WHITE)
        cd.text((84, 52), desc, font=font(13), fill=LGRAY)

        # Checkmark badge
        cd.ellipse([385,40,409,64], fill=clr)
        cd.text((389,43), "✓", font=font(13,True), fill=(10,10,20))

        img.paste(card, (cx, cy), card)

img.save(f"{OUT}/03_deliverables.jpg", quality=95)
print("OK 03_deliverables.jpg")

# ══════════════════════════════════════════════════════
# IMAGE 4 — Pricing Tiers
# ══════════════════════════════════════════════════════
img = gradient_bg(W, H, (5,5,18), (18,5,40))
glow = Image.new("RGBA",(W,H),(0,0,0,0))
gd = ImageDraw.Draw(glow)
gd.ellipse([300,200,700,600], fill=INDIGO+(20,))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
draw = ImageDraw.Draw(img)

center_text(draw, 30, "PRICING PLANS", font(13,True), CYAN)
center_text(draw, 55, "Choose Your Package", font(42,True), WHITE)
draw.line([(W//2-80, 110),(W//2+80, 110)], fill=INDIGO, width=3)

tiers = [
    {
        "name": "STARTER",
        "price": "$499",
        "days": "5 Days",
        "color": GREEN,
        "features": [
            "1-5 Screens",
            "Flutter / React Native",
            "Basic UI Design",
            "Android & iOS",
            "App Icon + Splash Screen",
            "0 Revisions",
        ],
        "popular": False,
    },
    {
        "name": "STANDARD",
        "price": "$2,999",
        "days": "15 Days",
        "color": INDIGO,
        "features": [
            "10-15 Screens",
            "Custom UI/UX Design",
            "REST API Integration",
            "Payment Gateway",
            "Push Notifications",
            "Admin Panel",
            "Source Code",
            "2 Revisions",
        ],
        "popular": True,
    },
    {
        "name": "ADVANCED",
        "price": "$6,999",
        "days": "40 Days",
        "color": YELLOW,
        "features": [
            "Unlimited Screens",
            "AI Features Included",
            "Full Backend (Django)",
            "Admin Dashboard",
            "App Store Upload",
            "Ad Network Integration",
            "Source Code",
            "Unlimited Revisions",
        ],
        "popular": False,
    },
]

card_w = 285
gap = 22
start_x = (W - card_w*3 - gap*2) // 2

for i, t in enumerate(tiers):
    clr = t["color"]
    bx = start_x + i*(card_w+gap)
    by = 130

    card_h = 590
    card = Image.new("RGBA",(card_w, card_h),(0,0,0,0))
    cd = ImageDraw.Draw(card)

    if t["popular"]:
        cd.rounded_rectangle([0,0,card_w-1,card_h-1], radius=18,
            fill=clr+(40,), outline=clr, width=2)
        # Popular badge
        bw = 120
        cd.rounded_rectangle([(card_w-bw)//2, -14, (card_w+bw)//2, 18],
            radius=12, fill=clr)
        pb = cd.textbbox((0,0),"⭐ POPULAR", font=font(11,True))
        cd.text(((card_w-(pb[2]-pb[0]))//2, -7), "⭐ POPULAR", font=font(11,True), fill=(10,10,20))
    else:
        cd.rounded_rectangle([0,0,card_w-1,card_h-1], radius=18,
            fill=(255,255,255,8), outline=clr+(60,), width=1)

    # Header band
    cd.rounded_rectangle([0,0,card_w-1,100], radius=18, fill=clr+(50,))
    cd.rectangle([0,82,card_w,100], fill=clr+(50,))

    # Tier name
    nb = cd.textbbox((0,0), t["name"], font=font(14,True))
    cd.text(((card_w-(nb[2]-nb[0]))//2, 14), t["name"], font=font(14,True), fill=WHITE)

    # Price
    pb = cd.textbbox((0,0), t["price"], font=font(32,True))
    cd.text(((card_w-(pb[2]-pb[0]))//2, 36), t["price"], font=font(32,True), fill=WHITE)

    # Days badge
    db = cd.textbbox((0,0), t["days"], font=font(11))
    dw = db[2]-db[0]+16
    cd.rounded_rectangle([(card_w-dw)//2, 78, (card_w+dw)//2, 100], radius=8, fill=clr)
    cd.text(((card_w-db[2]+db[0])//2, 81), t["days"], font=font(11), fill=(10,10,20))

    # Features
    for j, feat in enumerate(t["features"]):
        fy = 115 + j*56
        cd.ellipse([18, fy+4, 36, fy+22], fill=clr+(60,))
        cd.text((21, fy+4), "✓", font=font(12,True), fill=clr)
        cd.text((46, fy+2), feat, font=font(14), fill=WHITE)
        if j < len(t["features"])-1:
            cd.line([(18, fy+36),(card_w-18, fy+36)], fill=(255,255,255,15), width=1)

    img.paste(card, (bx, by), card)

center_text(draw, H-38, "All packages include Android & iOS  •  Message me to discuss your project", font(13), LGRAY)

img.save(f"{OUT}/04_pricing.jpg", quality=95)
print("OK 04_pricing.jpg")
print(f"\nAll 4 images saved → {OUT}")
