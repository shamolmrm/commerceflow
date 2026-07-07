from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

OUT = "d:/devloper/CommerceFlow/portfolio_screenshots/CommerceFlow_Project_Overview.pdf"

doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    rightMargin=2*cm, leftMargin=2*cm,
    topMargin=2*cm, bottomMargin=2*cm
)

# ── Colors ──────────────────────────────────────────────
INDIGO   = colors.HexColor("#4F46E5")
DARK     = colors.HexColor("#0F172A")
GRAY     = colors.HexColor("#64748B")
LIGHT    = colors.HexColor("#F8FAFC")
GREEN    = colors.HexColor("#10B981")
ORANGE   = colors.HexColor("#F59E0B")
PURPLE   = colors.HexColor("#8B5CF6")
WHITE    = colors.white

# ── Styles ───────────────────────────────────────────────
def S(name, **kw):
    s = ParagraphStyle(name, **kw)
    return s

H1   = S("H1",  fontSize=26, textColor=DARK,   fontName="Helvetica-Bold",   spaceAfter=4,  leading=32)
H2   = S("H2",  fontSize=14, textColor=INDIGO,  fontName="Helvetica-Bold",   spaceAfter=4,  leading=18)
H3   = S("H3",  fontSize=11, textColor=DARK,    fontName="Helvetica-Bold",   spaceAfter=3,  leading=14)
BODY = S("BODY",fontSize=10, textColor=GRAY,    fontName="Helvetica",        spaceAfter=4,  leading=15)
BOLD = S("BOLD",fontSize=10, textColor=DARK,    fontName="Helvetica-Bold",   spaceAfter=3,  leading=14)
SMALL= S("SM",  fontSize=9,  textColor=GRAY,    fontName="Helvetica",        spaceAfter=2,  leading=12)
TAG  = S("TAG", fontSize=9,  textColor=INDIGO,  fontName="Helvetica-Bold",   spaceAfter=0,  leading=12)
CENT = S("CT",  fontSize=10, textColor=GRAY,    fontName="Helvetica",        alignment=TA_CENTER, leading=14)
SUB  = S("SUB", fontSize=13, textColor=GRAY,    fontName="Helvetica",        spaceAfter=6,  leading=18)

story = []
sp = lambda n=1: Spacer(1, n*0.35*cm)
hr = lambda c=INDIGO, w=0.5: HRFlowable(width="100%", thickness=w, color=c, spaceAfter=8, spaceBefore=4)

# ════════════════════════════════════════════
# PAGE 1 — Cover / Overview
# ════════════════════════════════════════════
story += [
    sp(2),
    Paragraph("CommerceFlow", H1),
    Paragraph("Full-Stack E-Commerce Platform with AI-Powered Features", SUB),
    hr(),
    sp(),
    Paragraph(
        "A complete, production-ready online store built from scratch — modern customer storefront "
        "combined with a powerful admin dashboard. Every feature a real business needs, "
        "built with clean code and best practices.",
        BODY
    ),
    sp(),
]

# Key numbers table — use Paragraph for reliable large-font rendering
NUM  = S("NUM",  fontSize=22, textColor=WHITE, fontName="Helvetica-Bold", alignment=TA_CENTER, leading=26)
LAB  = S("LAB",  fontSize=9,  textColor=GRAY,  fontName="Helvetica",      alignment=TA_CENTER, leading=12)

kpi_data = [
    [Paragraph("222",       NUM), Paragraph("214",    NUM), Paragraph("102",       NUM), Paragraph("$42,635", NUM)],
    [Paragraph("Products",  LAB), Paragraph("Orders", LAB), Paragraph("Customers", LAB), Paragraph("Revenue (Demo)", LAB)],
]
kpi_tbl = Table(kpi_data, colWidths=[4.1*cm]*4, rowHeights=[1.4*cm, 0.75*cm])
kpi_tbl.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (-1,0),  INDIGO),
    ("ROWBACKGROUNDS",(0,1),(-1,1),  [LIGHT]),
    ("ALIGN",        (0,0), (-1,-1), "CENTER"),
    ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
    ("TOPPADDING",   (0,0), (-1,0),  10),
    ("BOTTOMPADDING",(0,0), (-1,0),  10),
    ("TOPPADDING",   (0,1), (-1,1),  6),
    ("BOTTOMPADDING",(0,1), (-1,1),  6),
    ("BOX",          (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ("INNERGRID",    (0,0), (-1,-1), 0.3, colors.HexColor("#E2E8F0")),
]))
story += [kpi_tbl, sp(1.5)]

# What's included — 2 column
story.append(Paragraph("What's Included", H2))
story.append(hr(colors.HexColor("#E2E8F0"), 0.3))
story.append(sp(0.5))

left_items = [
    ("Storefront", [
        "Hero banner & flash sale countdown",
        "Product listing with filters & search",
        "Product detail: reviews, ratings, wishlist",
        "Shopping cart & checkout with coupons",
        "User accounts & order history",
    ]),
    ("AI Features", [
        "AI-powered product search suggestions",
        "Smart product recommendations",
        "Automated low-stock alerts",
        "AI-driven sales trend analysis",
    ]),
]
right_items = [
    ("Admin Dashboard", [
        "Real-time KPI cards (revenue, orders)",
        "Revenue & orders charts (analytics)",
        "Product, category, brand management",
        "Order processing & status updates",
        "Customer & inventory management",
        "Supplier & warehouse management",
        "Reports with CSV/Excel export",
    ]),
]

def bullet_block(sections):
    paras = []
    for title, items in sections:
        paras.append(Paragraph(title, H3))
        for item in items:
            paras.append(Paragraph(f"<font color='#4F46E5'>▸</font>  {item}", BODY))
        paras.append(sp(0.5))
    return paras

left_col  = bullet_block(left_items)
right_col = bullet_block(right_items)

from reportlab.platypus import KeepInFrame
lf = KeepInFrame(8.1*cm, 20*cm, left_col)
rf = KeepInFrame(8.1*cm, 20*cm, right_col)

two_col = Table([[lf, rf]], colWidths=[8.5*cm, 8.5*cm])
two_col.setStyle(TableStyle([
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING",  (0,0), (-1,-1), 0),
    ("RIGHTPADDING", (0,0), (-1,-1), 12),
]))
story += [two_col, sp()]

# ════════════════════════════════════════════
# PAGE 2 — Tech Stack + AI Integration
# ════════════════════════════════════════════
from reportlab.platypus import PageBreak
story.append(PageBreak())
story += [
    sp(),
    Paragraph("Technology & AI Integration", H2),
    hr(),
    sp(0.5),
]

tech_data = [
    ["Layer", "Technology", "Purpose"],
    ["Frontend", "Next.js 15, React, TypeScript", "SSR, fast page loads, SEO-ready"],
    ["Styling", "Tailwind CSS", "Modern, responsive UI"],
    ["State", "Redux Toolkit + TanStack Query", "Auth state, server caching"],
    ["Backend", "Django 5 + DRF", "REST API, business logic"],
    ["Auth", "JWT (simplejwt)", "Secure login, auto token refresh"],
    ["Database", "PostgreSQL / SQLite", "Production / local dev"],
    ["Charts", "Recharts", "Revenue & orders analytics"],
    ["AI Layer", "OpenAI API / Claude API", "Recommendations, search, insights"],
]
tech_tbl = Table(tech_data, colWidths=[3.5*cm, 6*cm, 7.2*cm])
tech_tbl.setStyle(TableStyle([
    ("BACKGROUND",  (0,0), (-1,0),  DARK),
    ("TEXTCOLOR",   (0,0), (-1,0),  WHITE),
    ("FONTNAME",    (0,0), (-1,0),  "Helvetica-Bold"),
    ("FONTSIZE",    (0,0), (-1,-1), 9),
    ("FONTNAME",    (0,1), (-1,-1), "Helvetica"),
    ("TEXTCOLOR",   (0,1), (-1,-1), GRAY),
    ("TEXTCOLOR",   (0,1), (0,-1),  DARK),
    ("FONTNAME",    (0,1), (0,-1),  "Helvetica-Bold"),
    ("FONTSIZE",    (0,1), (0,-1),  9),
    # AI row highlight
    ("BACKGROUND",  (0,8), (-1,8),  colors.HexColor("#EEF2FF")),
    ("TEXTCOLOR",   (0,8), (-1,8),  INDIGO),
    ("FONTNAME",    (0,8), (-1,8),  "Helvetica-Bold"),
    ("ROWBACKGROUNDS",(0,1),(-1,7), [WHITE, LIGHT]),
    ("ALIGN",       (0,0), (-1,-1), "LEFT"),
    ("VALIGN",      (0,0), (-1,-1), "MIDDLE"),
    ("ROWHEIGHT",   (0,0), (-1,-1), 0.65*cm),
    ("LEFTPADDING", (0,0), (-1,-1), 8),
    ("BOX",         (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ("INNERGRID",   (0,0), (-1,-1), 0.3, colors.HexColor("#E2E8F0")),
]))
story += [tech_tbl, sp(1.5)]

# AI Features detail
story.append(Paragraph("AI-Powered Features Detail", H2))
story.append(hr())
story.append(sp(0.5))

ai_data = [
    ["Feature", "How It Works", "Benefit"],
    [
        "Smart Search",
        "AI understands natural language queries\n(e.g. 'red shoes under $50')",
        "Customers find products faster"
    ],
    [
        "Recommendations",
        "Analyzes browsing & purchase history\nto suggest relevant products",
        "Higher average order value"
    ],
    [
        "Sales Insights",
        "AI summarizes sales trends and\nflags anomalies in the admin panel",
        "Faster business decisions"
    ],
    [
        "Low Stock Alerts",
        "Predicts when stock will run out\nbased on sales velocity",
        "Prevents lost sales"
    ],
]
ai_tbl = Table(ai_data, colWidths=[3.8*cm, 7.2*cm, 5.7*cm])
ai_tbl.setStyle(TableStyle([
    ("BACKGROUND",  (0,0), (-1,0),  PURPLE),
    ("TEXTCOLOR",   (0,0), (-1,0),  WHITE),
    ("FONTNAME",    (0,0), (-1,0),  "Helvetica-Bold"),
    ("FONTSIZE",    (0,0), (-1,-1), 9),
    ("FONTNAME",    (0,1), (-1,-1), "Helvetica"),
    ("TEXTCOLOR",   (0,1), (-1,-1), GRAY),
    ("TEXTCOLOR",   (0,1), (0,-1),  DARK),
    ("FONTNAME",    (0,1), (0,-1),  "Helvetica-Bold"),
    ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE, LIGHT]),
    ("ALIGN",       (0,0), (-1,-1), "LEFT"),
    ("VALIGN",      (0,0), (-1,-1), "MIDDLE"),
    ("ROWHEIGHT",   (0,0), (-1,-1), 0.9*cm),
    ("LEFTPADDING", (0,0), (-1,-1), 8),
    ("BOX",         (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ("INNERGRID",   (0,0), (-1,-1), 0.3, colors.HexColor("#E2E8F0")),
]))
story += [ai_tbl, sp()]

# ════════════════════════════════════════════
# PAGE 3 — Deliverables + FAQ
# ════════════════════════════════════════════
story.append(PageBreak())
story += [
    sp(),
    Paragraph("What You Will Receive", H2),
    hr(),
    sp(0.5),
]

deliver_data = [
    ["#", "Deliverable", "Included In"],
    ["1", "Full source code (GitHub)",                   "All Tiers"],
    ["2", "Customer storefront (Next.js)",               "All Tiers"],
    ["3", "Admin dashboard (all pages)",                 "Standard & Advanced"],
    ["4", "REST API with 35+ endpoints",                 "All Tiers"],
    ["5", "JWT authentication system",                   "All Tiers"],
    ["6", "Product, order & customer management",        "Standard & Advanced"],
    ["7", "Inventory & analytics with charts",           "Standard & Advanced"],
    ["8", "AI-powered search & recommendations",        "Advanced"],
    ["9", "Supplier & warehouse management",             "Advanced"],
    ["10","Reports with CSV/Excel export",               "Advanced"],
    ["11","PostgreSQL production setup",                 "Advanced"],
    ["12","Swagger API documentation",                   "Advanced"],
    ["13","Deployment guide",                            "Advanced"],
]
del_tbl = Table(deliver_data, colWidths=[1*cm, 10.5*cm, 5.2*cm])
del_tbl.setStyle(TableStyle([
    ("BACKGROUND",  (0,0), (-1,0),  DARK),
    ("TEXTCOLOR",   (0,0), (-1,0),  WHITE),
    ("FONTNAME",    (0,0), (-1,0),  "Helvetica-Bold"),
    ("FONTSIZE",    (0,0), (-1,-1), 9),
    ("FONTNAME",    (0,1), (-1,-1), "Helvetica"),
    ("TEXTCOLOR",   (0,1), (0,-1),  GRAY),
    ("TEXTCOLOR",   (1,1), (1,-1),  DARK),
    ("FONTNAME",    (1,1), (1,-1),  "Helvetica-Bold"),
    ("TEXTCOLOR",   (2,1), (2,-1),  INDIGO),
    ("FONTNAME",    (2,1), (2,-1),  "Helvetica-Bold"),
    ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE, LIGHT]),
    ("ALIGN",       (0,0), (0,-1),  "CENTER"),
    ("ALIGN",       (1,0), (-1,-1), "LEFT"),
    ("VALIGN",      (0,0), (-1,-1), "MIDDLE"),
    ("ROWHEIGHT",   (0,0), (-1,-1), 0.6*cm),
    ("LEFTPADDING", (0,0), (-1,-1), 8),
    ("BOX",         (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
    ("INNERGRID",   (0,0), (-1,-1), 0.3, colors.HexColor("#E2E8F0")),
]))
story += [del_tbl, sp(1.5)]

story.append(Paragraph("Frequently Asked Questions", H2))
story.append(hr())
story.append(sp(0.5))

faqs = [
    ("Can I customize the design and colors?",
     "Yes — logo, colors, fonts, and branding are all customizable."),
    ("Will I own the full source code?",
     "Yes, 100%. Delivered via a private GitHub repository."),
    ("Is the site mobile-friendly?",
     "Fully responsive on all screen sizes — mobile, tablet, desktop."),
    ("Can you add a payment gateway?",
     "Stripe and PayPal integration available. Ask for a custom quote."),
    ("How does the AI integration work?",
     "Uses OpenAI or Claude API. You need an API key — setup is included."),
]
for q, a in faqs:
    story.append(Paragraph(q, BOLD))
    story.append(Paragraph(a, BODY))
    story.append(sp(0.3))

story += [
    sp(),
    hr(),
    Paragraph("Ready to build your store? Message me and let's get started.", CENT),
]

doc.build(story)

import os
size_kb = os.path.getsize(OUT) // 1024
print("PDF saved: " + OUT)
print("Size: " + str(size_kb) + " KB (limit 2048 KB)")
