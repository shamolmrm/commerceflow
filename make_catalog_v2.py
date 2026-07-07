from PIL import Image, ImageDraw, ImageFont
import random, math, os

OUT = "d:/devloper/CommerceFlow/portfolio_screenshots/mobile_catalog"
os.makedirs(OUT, exist_ok=True)

W, H = 1000, 750

def hx(c): return tuple(int(c[i:i+2],16) for i in (1,3,5))

BG1    = hx("#0B0B1E")
BG2    = hx("#130B2E")
INDIGO = hx("#6366F1")
PURPLE = hx("#7C3AED")
VIOLET = hx("#8B5CF6")
CYAN   = hx("#22D3EE")
GREEN  = hx("#10B981")
YELLOW = hx("#FBBF24")
PINK   = hx("#EC4899")
WHITE  = (255,255,255)
LGRAY  = (160,160,185)
DGRAY  = (80,80,100)

def font(size, bold=False):
    try:
        name = "arialbd.ttf" if bold else "arial.ttf"
        return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size)
    except:
        return ImageFont.load_default()

def make_base(seed=42, glow_center=(700,300)):
    random.seed(seed)
    img = Image.new("RGB", (W,H), BG1)
    draw = ImageDraw.Draw(img)
    for y in range(H):
        t = y/H
        r = int(BG1[0]*(1-t)+BG2[0]*t)
        g = int(BG1[1]*(1-t)+BG2[1]*t)
        b = int(BG1[2]*(1-t)+BG2[2]*t)
        draw.line([(0,y),(W,y)], fill=(r,g,b))

    glow = Image.new("RGBA",(W,H),(0,0,0,0))
    gd = ImageDraw.Draw(glow)
    gx, gy = glow_center
    gd.ellipse([gx-200,gy-200,gx+350,gy+350], fill=PURPLE+(20,))
    gd.ellipse([gx-100,gy+100,gx+450,gy+500],fill=INDIGO+(16,))
    gd.ellipse([-100,gy-100,300,gy+400], fill=VIOLET+(14,))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(img)

    for _ in range(100):
        sx = random.randint(0,W); sy = random.randint(0,H)
        sz = random.choice([1,1,1,2])
        draw.ellipse([sx-sz,sy-sz,sx+sz,sy+sz], fill=(255,255,255,random.randint(60,160)))

    return img, draw

# ──────────────────────────────────────────────────────────
# IMAGE 2 — How It Works (5-step process)
# ──────────────────────────────────────────────────────────
img2, d2 = make_base(seed=11, glow_center=(600,200))

# Header badge
d2.rounded_rectangle([28,24,230,52], radius=14, fill=(255,255,255,12), outline=CYAN+(150,), width=1)
d2.text((40,30), "SIMPLE 5-STEP PROCESS", font=font(11,True), fill=CYAN)

d2.text((28,64),  "HOW WE BUILD", font=font(56,True), fill=WHITE)
d2.text((28,124), "YOUR APP", font=font(56,True), fill=WHITE)
d2.text((28,186), "From idea to live App Store in weeks.", font=font(18), fill=LGRAY)

steps = [
    (CYAN,   "01", "DISCOVERY",    "Requirements, wireframes & scope"),
    (VIOLET, "02", "UI DESIGN",    "Modern, branded screens & flows"),
    (INDIGO, "03", "DEVELOPMENT",  "Flutter/React Native + AI features"),
    (GREEN,  "04", "QA TESTING",   "Device testing & performance checks"),
    (YELLOW, "05", "DEPLOYMENT",   "App Store, Play Store & handover"),
]

step_y = 240
for i, (clr, num, title, desc) in enumerate(steps):
    x = 28

    # Step bubble
    d2.ellipse([x,step_y,x+38,step_y+38], fill=clr+(50,), outline=clr+(200,), width=2)
    nb = d2.textbbox((0,0), num, font=font(11,True))
    d2.text((x+(38-(nb[2]-nb[0]))//2, step_y+10), num, font=font(11,True), fill=WHITE)

    # connector line (not after last)
    if i < 4:
        d2.line([(x+19, step_y+38),(x+19, step_y+58)], fill=clr+(80,), width=2)

    # Title + desc
    d2.text((x+48, step_y+4),  title, font=font(15,True), fill=WHITE)
    d2.text((x+48, step_y+22), desc,  font=font(12),      fill=LGRAY)

    step_y += 86 if i < 4 else 0

# Right side: device illustration (large phone)
def draw_phone_right(d, px, py, pw, ph):
    d.rounded_rectangle([px,py,px+pw,py+ph], radius=int(pw*0.1),
        fill=(255,255,255,15), outline=VIOLET+(140,), width=2)
    sx,sy = px+7, py+14
    sw,sh = pw-14, ph-28
    d.rounded_rectangle([sx,sy,sx+sw,sy+sh], radius=int(pw*0.08), fill=(14,12,32))
    nw = int(pw*0.28)
    d.rounded_rectangle([px+pw//2-nw//2,py+6,px+pw//2+nw//2,py+18], radius=5, fill=(14,12,32))

    cx, cy2 = sx+8, sy+18
    cw2 = sw-16

    d.text((cx,cy2), "MY APP", font=font(10,True), fill=CYAN)
    d.text((cx,cy2+16), "Dashboard", font=font(14,True), fill=WHITE)

    # Chart
    pts = [(cx+i*10, cy2+90-int(math.sin(i*0.8)*22)+random.randint(-5,5)) for i in range(cw2//10)]
    for j in range(len(pts)-1):
        d.line([pts[j],pts[j+1]], fill=VIOLET, width=2)
    d.ellipse([pts[-1][0]-5,pts[-1][1]-5,pts[-1][0]+5,pts[-1][1]+5], fill=GREEN)

    for i2,(l2,v2,c2) in enumerate([("Users","12,450",CYAN),("Revenue","$84K",GREEN),("Orders","1,230",VIOLET)]):
        bx2 = cx + i2*(cw2//3+2)
        d.rounded_rectangle([bx2,cy2+108,bx2+cw2//3-4,cy2+148], radius=6, fill=c2+(25,))
        d.text((bx2+5,cy2+112), l2, font=font(8),      fill=LGRAY)
        d.text((bx2+5,cy2+126), v2, font=font(11,True), fill=c2)

    # Chat bubble
    d.rounded_rectangle([cx,cy2+158,cx+cw2,cy2+200], radius=8, fill=INDIGO+(40,))
    d.text((cx+6,cy2+160), "AI Assistant", font=font(9,True), fill=INDIGO)
    d.text((cx+6,cy2+175), '"Your sales are up +12%"', font=font(9), fill=LGRAY)

    # Bottom bar
    d.rounded_rectangle([cx,cy2+210,cx+cw2,cy2+240], radius=6, fill=(255,255,255,10))
    for i3,ic in enumerate(["Home","Search","Orders","Profile"]):
        bx3 = cx + i3*(cw2//4)
        d.text((bx3+4,cy2+220), ic, font=font(7), fill=LGRAY)

draw_phone_right(d2, 560, 60, 230, 520)

# Second smaller phone (angled)
draw_phone_right(d2, 820, 160, 160, 380)

# Bottom CTA bar
d2.rounded_rectangle([0,H-72,W,H], radius=0, fill=INDIGO+(220,))
d2.text((40, H-50), "READY TO START YOUR PROJECT?", font=font(16,True), fill=WHITE)
d2.text((40, H-28), "Professional delivery. Clean code. Full source code ownership.", font=font(12), fill=(200,210,255))

img2.save(f"{OUT}/02_process.jpg", quality=97)
print("DONE 02_process.jpg")


# ──────────────────────────────────────────────────────────
# IMAGE 3 — Deliverables (what client gets)
# ──────────────────────────────────────────────────────────
img3, d3 = make_base(seed=77, glow_center=(500,350))

d3.rounded_rectangle([28,24,260,52], radius=14, fill=(255,255,255,12), outline=GREEN+(150,), width=1)
d3.text((40,30), "100% COMPLETE DELIVERY", font=font(11,True), fill=GREEN)

d3.text((28,64),  "EVERYTHING YOU", font=font(50,True), fill=WHITE)
d3.text((28,118), "NEED TO LAUNCH", font=font(50,True), fill=WHITE)
d3.text((28,176), "Full source code, AI integration & deployment.", font=font(16), fill=LGRAY)

deliver_items = [
    (CYAN,   "Flutter or React Native App",      "iOS + Android from one codebase"),
    (VIOLET, "AI Chatbot & Smart Features",       "OpenAI-powered assistant built-in"),
    (GREEN,  "Firebase / Backend Integration",    "Auth, database, push notifications"),
    (INDIGO, "Stripe / bKash Payment Gateway",    "Secure checkout, fully tested"),
    (YELLOW, "App Store Submission Ready",         "Icons, splash, store screenshots"),
    (PINK,   "Full Source Code (GitHub)",          "Private repo, you own 100%"),
    (CYAN,   "Admin Dashboard Panel",              "Manage users, orders, products"),
    (GREEN,  "API Documentation (Swagger)",        "Clean REST API with full docs"),
]

col1 = deliver_items[:4]
col2 = deliver_items[4:]
item_h = 74

for col_i, col in enumerate([col1, col2]):
    bx = 24 + col_i * 494
    for row_i, (clr, title, desc) in enumerate(col):
        by = 230 + row_i * item_h
        # Card
        d3.rounded_rectangle([bx,by,bx+474,by+item_h-8], radius=10,
            fill=(255,255,255,8), outline=clr+(70,), width=1)
        # Color accent bar left
        d3.rounded_rectangle([bx,by,bx+4,by+item_h-8], radius=2, fill=clr)
        # Icon circle
        d3.ellipse([bx+14,by+14,bx+46,by+46], fill=clr+(30,), outline=clr+(100,), width=1)
        d3.text((bx+22,by+21), str(col_i*4+row_i+1), font=font(11,True), fill=clr)
        # Text
        d3.text((bx+56, by+10), title, font=font(14,True), fill=WHITE)
        d3.text((bx+56, by+32), desc,  font=font(11),      fill=LGRAY)
        # Checkmark
        d3.text((bx+445, by+20), "OK", font=font(9,True), fill=GREEN)

# Bottom strip
d3.line([(0,H-56),(W,H-56)], fill=VIOLET+(40,), width=1)
d3.rounded_rectangle([0,H-55,W,H], radius=0, fill=(255,255,255,5))
tags3 = ["Flutter","React Native","Firebase","Stripe","OpenAI","Django","PostgreSQL"]
tx3 = 30
for tag in tags3:
    tf3 = font(11)
    tb3 = d3.textbbox((0,0),tag,font=tf3)
    tw3 = tb3[2]-tb3[0]+18
    d3.rounded_rectangle([tx3,H-44,tx3+tw3,H-16], radius=12,
        fill=(255,255,255,10), outline=(255,255,255,40), width=1)
    d3.text((tx3+9,H-40), tag, font=tf3, fill=WHITE)
    tx3 += tw3+10

img3.save(f"{OUT}/03_deliverables.jpg", quality=97)
print("DONE 03_deliverables.jpg")


# ──────────────────────────────────────────────────────────
# IMAGE 4 — Pricing (3 tiers)
# ──────────────────────────────────────────────────────────
img4, d4 = make_base(seed=55, glow_center=(500,250))

d4.rounded_rectangle([28,24,220,52], radius=14, fill=(255,255,255,12), outline=YELLOW+(150,), width=1)
d4.text((40,30), "TRANSPARENT PRICING", font=font(11,True), fill=YELLOW)

d4.text((28,64),  "CHOOSE YOUR", font=font(50,True), fill=WHITE)
d4.text((28,118), "PACKAGE", font=font(50,True), fill=WHITE)
d4.text((28,172), "No hidden fees. Fixed price. On-time delivery.", font=font(16), fill=LGRAY)

tiers = [
    {
        "name":  "STARTER",
        "price": "$499",
        "time":  "7 Days",
        "clr":   CYAN,
        "items": [
            "Flutter or React Native",
            "5 core app screens",
            "Firebase auth & database",
            "Basic UI, responsive design",
            "Play Store submission",
            "Full source code (GitHub)",
        ],
        "cta":   "GET STARTED",
    },
    {
        "name":  "STANDARD",
        "price": "$2,999",
        "time":  "21 Days",
        "clr":   VIOLET,
        "items": [
            "Everything in Starter",
            "AI Chatbot integration",
            "Stripe/bKash payment",
            "Admin dashboard panel",
            "Push notifications",
            "App Store + Play Store",
            "REST API + Swagger docs",
        ],
        "cta":   "MOST POPULAR",
        "popular": True,
    },
    {
        "name":  "ADVANCED",
        "price": "$6,999",
        "time":  "45 Days",
        "clr":   YELLOW,
        "items": [
            "Everything in Standard",
            "Full AI suite (search, recs)",
            "Analytics & reports",
            "Multi-language support",
            "Custom backend (Django)",
            "PostgreSQL production DB",
            "CI/CD + deployment setup",
        ],
        "cta":   "ENTERPRISE",
    },
]

card_w = 300
card_x_starts = [18, 340, 662]

for i, (tier, cx4) in enumerate(zip(tiers, card_x_starts)):
    clr = tier["clr"]
    is_pop = tier.get("popular", False)

    card_y = 215
    card_h = 500

    # Card background
    fill_col = (255,255,255,20) if is_pop else (255,255,255,8)
    border_col = clr+(200,) if is_pop else clr+(80,)
    d4.rounded_rectangle([cx4, card_y, cx4+card_w, card_y+card_h],
        radius=16, fill=fill_col, outline=border_col, width=2 if is_pop else 1)

    # Popular glow
    if is_pop:
        d4.rounded_rectangle([cx4-3,card_y-3,cx4+card_w+3,card_y+card_h+3],
            radius=18, outline=clr+(60,), width=4)
        d4.rounded_rectangle([cx4+60,card_y-18,cx4+card_w-60,card_y+4],
            radius=10, fill=clr)
        d4.text((cx4+88,card_y-14), "BEST VALUE", font=font(11,True), fill=(14,12,32))

    # Header bar
    d4.rounded_rectangle([cx4,card_y,cx4+card_w,card_y+90], radius=16, fill=clr+(40,))
    d4.text((cx4+20, card_y+12), tier["name"], font=font(18,True), fill=clr)
    d4.text((cx4+20, card_y+36), tier["price"], font=font(36,True), fill=WHITE)
    d4.text((cx4+20, card_y+76), "Delivery: "+tier["time"], font=font(11), fill=LGRAY)

    # Feature list
    fy = card_y+100
    for feat in tier["items"]:
        d4.ellipse([cx4+18,fy+4,cx4+28,fy+14], fill=clr+(50,), outline=clr+(150,), width=1)
        d4.text((cx4+20,fy+3), ".", font=font(9,True), fill=clr)
        d4.text((cx4+34, fy), feat, font=font(11), fill=LGRAY if not is_pop else (200,200,220))
        fy += 30

    # CTA button
    btn_y = card_y+card_h-52
    d4.rounded_rectangle([cx4+18, btn_y, cx4+card_w-18, btn_y+34],
        radius=17, fill=clr if is_pop else clr+(60,), outline=clr+(200,) if not is_pop else clr)
    ctab = d4.textbbox((0,0), tier["cta"], font=font(12,True))
    ctaw = ctab[2]-ctab[0]
    d4.text((cx4+card_w//2-ctaw//2, btn_y+9), tier["cta"],
        font=font(12,True), fill=(14,12,32) if is_pop else WHITE)

# Bottom note
d4.text((W//2-240, H-28), "All tiers include full source code + 7-day post-delivery support", font=font(12), fill=DGRAY)

img4.save(f"{OUT}/04_pricing.jpg", quality=97)
print("DONE 04_pricing.jpg")

print("\nAll 3 images saved to:", OUT)
