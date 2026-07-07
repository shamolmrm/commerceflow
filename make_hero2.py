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
WHITE  = (255,255,255)
LGRAY  = (160,160,185)
DGRAY  = (80,80,100)

def font(size, bold=False):
    try:
        name = "arialbd.ttf" if bold else "arial.ttf"
        return ImageFont.truetype(f"C:/Windows/Fonts/{name}", size)
    except:
        return ImageFont.load_default()

# ── Background ────────────────────────────────────────
img = Image.new("RGB", (W,H), BG1)
draw = ImageDraw.Draw(img)

# Gradient
for y in range(H):
    t = y/H
    r = int(BG1[0]*(1-t)+BG2[0]*t)
    g = int(BG1[1]*(1-t)+BG2[1]*t)
    b = int(BG1[2]*(1-t)+BG2[2]*t)
    draw.line([(0,y),(W,y)], fill=(r,g,b))

# Purple glow blobs
glow = Image.new("RGBA",(W,H),(0,0,0,0))
gd = ImageDraw.Draw(glow)
gd.ellipse([500,50,950,500],  fill=PURPLE+(22,))
gd.ellipse([600,300,1050,750],fill=INDIGO+(18,))
gd.ellipse([-50,500,350,850], fill=VIOLET+(15,))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
draw = ImageDraw.Draw(img)

# Star particles
random.seed(42)
for _ in range(120):
    sx = random.randint(0,W)
    sy = random.randint(0,H)
    sz = random.choice([1,1,1,2])
    alpha = random.randint(80,200)
    draw.ellipse([sx-sz,sy-sz,sx+sz,sy+sz], fill=(255,255,255,alpha))

# ── LEFT CONTENT ─────────────────────────────────────

# AI Badge
badge_text = "  AI-POWERED DEVELOPMENT  "
bf = font(12, True)
bb = draw.textbbox((0,0), badge_text, font=bf)
bw = bb[2]-bb[0]+24
draw.rounded_rectangle([28,28,28+bw,62], radius=18, fill=(255,255,255,15), outline=CYAN+(180,), width=1)
draw.ellipse([36,40,50,54], fill=CYAN)
draw.text((56,37), badge_text.strip(), font=bf, fill=CYAN)

# Main Title
t1 = "PREMIUM MOBILE"
t2 = "APP DEVELOPMENT"
t3 = "FOR YOUR BUSINESS"
draw.text((30,78),  t1, font=font(62,True), fill=WHITE)
draw.text((30,145), t2, font=font(62,True), fill=WHITE)
draw.text((30,212), t3, font=font(36,True), fill=LGRAY)

# Feature boxes
boxes = [
    ("AI-INTEGRATED DASHBOARDS",  "Smart Analytics & Modern UI",          INDIGO),
    ("CROSS-PLATFORM EXPERTISE",  "Flutter & React Native | Store-Ready", PURPLE),
]
by = 272
for title, sub, clr in boxes:
    bh = 58
    draw.rounded_rectangle([28,by,470,by+bh], radius=10,
        fill=clr+(35,), outline=clr+(120,), width=1)
    draw.text((48, by+8),  title, font=font(14,True), fill=WHITE)
    draw.text((48, by+30), sub,   font=font(11),      fill=LGRAY)
    by += 68

# Checkmark bullets
checks = [
    "Powerful AI Features & Smart Chatbots.",
    "Firebase, Stripe & REST API Integration.",
    "Cross-Platform App Store Deployment.",
    "Guaranteed Full Source Code Delivery.",
]
cy = 418
for txt in checks:
    draw.ellipse([28,cy,46,cy+18], fill=VIOLET+(80,), outline=VIOLET, width=1)
    draw.text((31,cy+1), "v", font=font(11,True), fill=WHITE)
    draw.text((56, cy), txt, font=font(14), fill=LGRAY)
    cy += 32

# Tech pills
tags = ["Flutter","React Native","Firebase","OpenAI","Django","Stripe"]
tx = 28
ty = 550
for tag in tags:
    tf = font(12)
    tb = draw.textbbox((0,0), tag, font=tf)
    tw = tb[2]-tb[0]+20
    draw.rounded_rectangle([tx,ty,tx+tw,ty+28], radius=14,
        fill=(255,255,255,12), outline=(255,255,255,50), width=1)
    draw.text((tx+10,ty+6), tag, font=tf, fill=WHITE)
    tx += tw+10
    if tx > 460:
        tx = 28
        ty += 36

# Bottom tagline
tagline = "DELIVER RESULTS. WIN MORE CLIENTS."
tb = draw.textbbox((0,0), tagline, font=font(15,True))
tw = tb[2]-tb[0]
draw.line([(W//2-tw//2-20, H-42),(W//2+tw//2+20, H-42)], fill=VIOLET+(60,), width=1)
draw.text(((W-tw)//2, H-34), tagline, font=font(15,True), fill=LGRAY)

# ── PHONE MOCKUPS (right side) ───────────────────────

def phone(draw, px, py, pw, ph, content_fn, border_clr=VIOLET):
    # outer shell
    draw.rounded_rectangle([px,py,px+pw,py+ph], radius=int(pw*0.12),
        fill=(255,255,255,18), outline=border_clr+(160,), width=2)
    # inner screen
    sx,sy = px+6, py+10
    sw,sh = pw-12, ph-20
    draw.rounded_rectangle([sx,sy,sx+sw,sy+sh], radius=int(pw*0.09), fill=(14,12,32))
    # notch
    nw = int(pw*0.3)
    draw.rounded_rectangle([px+pw//2-nw//2, py+4, px+pw//2+nw//2, py+16],
        radius=6, fill=(14,12,32))
    # status bar dots
    draw.ellipse([sx+sw-30,sy+6,sx+sw-22,sy+14], fill=(255,255,255,60))
    draw.ellipse([sx+sw-18,sy+6,sx+sw-10,sy+14], fill=(255,255,255,60))
    # content
    content_fn(draw, sx+8, sy+22, sw-16, sh-30)

# --- Phone 1 content: AI Dashboard
def phone1_content(draw, cx, cy, cw, ch):
    draw.text((cx, cy), "AI-INSIGHTS", font=font(10,True), fill=CYAN)
    draw.text((cx, cy+16), "Dashboard", font=font(13,True), fill=WHITE)
    # mini graph line
    pts = [(cx+i*8, cy+70-int(math.sin(i*0.7)*18)+random.randint(-4,4)) for i in range(cw//8)]
    for i in range(len(pts)-1):
        draw.line([pts[i], pts[i+1]], fill=CYAN, width=2)
    draw.ellipse([pts[-1][0]-4,pts[-1][1]-4,pts[-1][0]+4,pts[-1][1]+4], fill=GREEN)
    # stat cards
    cards = [("New Users","+12%",GREEN),("Active","15,200",CYAN)]
    for i,(l,v,c) in enumerate(cards):
        bx = cx + i*(cw//2+2)
        by2 = cy+82
        draw.rounded_rectangle([bx,by2,bx+cw//2-4,by2+38], radius=6, fill=c+(25,))
        draw.text((bx+5,by2+4),  l, font=font(9),     fill=LGRAY)
        draw.text((bx+5,by2+18), v, font=font(12,True),fill=c)
    # Revenue
    draw.text((cx, cy+128), "Revenue", font=font(10,True), fill=LGRAY)
    draw.text((cx, cy+142), "$68,700", font=font(18,True), fill=WHITE)
    # AI badge
    draw.rounded_rectangle([cx,cy+170,cx+cw,cy+200], radius=6, fill=INDIGO+(40,), outline=INDIGO+(80,),width=1)
    draw.text((cx+4,cy+172), "AI-POWERED INSIGHTS", font=font(9,True), fill=INDIGO)
    draw.text((cx+4,cy+184), "Chatbot + Smart Recs active", font=font(9), fill=LGRAY)

# --- Phone 2 content: Chat
def phone2_content(draw, cx, cy, cw, ch):
    draw.text((cx, cy), "AI ASSISTANT", font=font(9,True), fill=VIOLET)
    msgs = [
        ("How can I help today?", False),
        ("Summarize last week's sales.", True),
        ("Revenue: $58K | Orders: 730", False),
        ("AI Prediction: +8% next week", False),
    ]
    my = cy+16
    for txt, right in msgs:
        clr = INDIGO if right else (255,255,255,20)
        tf = font(9)
        tb = draw.textbbox((0,0),txt,font=tf)
        tw2 = min(tb[2]-tb[0]+12, cw-10)
        mx = cx + (cw - tw2 - 4) if right else cx
        draw.rounded_rectangle([mx,my,mx+tw2,my+22], radius=8, fill=clr if right else (255,255,255,15))
        draw.text((mx+6,my+5), txt[:int(tw2/6)], font=tf, fill=WHITE)
        my += 28
    # input bar
    draw.rounded_rectangle([cx,cy+ch-22,cx+cw,cy+ch-2], radius=8,
        fill=(255,255,255,12), outline=(255,255,255,30),width=1)
    draw.text((cx+6,cy+ch-18), "Send a message...", font=font(9), fill=DGRAY)

# --- Phone 3 content: Analytics
def phone3_content(draw, cx, cy, cw, ch):
    draw.text((cx, cy), "USER ANALYTICS", font=font(9,True), fill=YELLOW)
    draw.text((cx, cy+14), "Traffic Sources", font=font(10,True), fill=WHITE)
    # donut chart
    cx2,cy2,r = cx+cw//2, cy+55, 26
    segs = [(120,INDIGO),(100,VIOLET),(60,CYAN),(80,GREEN)]
    ang = -90
    for sweep, clr in segs:
        draw.arc([cx2-r,cy2-r,cx2+r,cy2+r], ang, ang+sweep, fill=clr, width=8)
        ang += sweep
    # legend
    legend = [("Organic",INDIGO),("Social",VIOLET),("Direct",CYAN)]
    for i,(l,c) in enumerate(legend):
        draw.ellipse([cx+i*40,cy+86,cx+i*40+8,cy+94], fill=c)
        draw.text((cx+i*40+10,cy+86), l, font=font(7), fill=LGRAY)
    draw.text((cx, cy+100), "Daily Active Users", font=font(10,True), fill=WHITE)
    # bar chart
    bar_vals = [40,65,50,80,60,90,55]
    bw3 = (cw-10)//(len(bar_vals)+1)
    for i,v in enumerate(bar_vals):
        bh3 = int(v*0.5)
        bx3 = cx+5+i*(bw3+3)
        draw.rounded_rectangle([bx3,cy+170-bh3,bx3+bw3,cy+170],
            radius=3, fill=INDIGO+(180,))
    # AI rec
    draw.rounded_rectangle([cx,cy+175,cx+cw,cy+ch-2], radius=6,
        fill=VIOLET+(30,), outline=VIOLET+(60,),width=1)
    draw.text((cx+4,cy+178), "AI Recommendation:", font=font(8,True), fill=VIOLET)
    draw.text((cx+4,cy+190), "Targeted Push for users", font=font(8), fill=LGRAY)

# Draw phones
phone(draw, 500, 40,  200, 440, phone1_content, CYAN)
phone(draw, 730, 30,  155, 260, phone2_content, INDIGO)
phone(draw, 730, 310, 155, 260, phone3_content, YELLOW)

img.save(f"{OUT}/01_hero.jpg", quality=97)
print("DONE 01_hero.jpg")
