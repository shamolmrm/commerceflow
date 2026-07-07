"""
PDF invoice generation and report utilities.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import inch
import io


def generate_invoice_pdf(order):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, textColor=colors.HexColor('#0f172a'))
    story.append(Paragraph('INVOICE', title_style))
    story.append(Spacer(1, 0.2 * inch))

    # Company info
    story.append(Paragraph('CommerceFlow', styles['Heading2']))
    story.append(Paragraph('E-commerce Solutions', styles['Normal']))
    story.append(Spacer(1, 0.2 * inch))

    # Order info
    info_data = [
        ['Order Number:', order.order_number],
        ['Date:', order.created_at.strftime('%B %d, %Y')],
        ['Status:', order.status.capitalize()],
        ['Payment:', order.payment_method.upper()],
    ]
    info_table = Table(info_data, colWidths=[2 * inch, 4 * inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.3 * inch))

    # Customer & shipping
    if order.shipping_address:
        addr = order.shipping_address
        story.append(Paragraph('Bill To:', styles['Heading3']))
        story.append(Paragraph(addr.full_name, styles['Normal']))
        story.append(Paragraph(addr.address_line, styles['Normal']))
        story.append(Paragraph(f'{addr.city}, {addr.state} {addr.zip_code}', styles['Normal']))
        story.append(Paragraph(addr.country, styles['Normal']))
    story.append(Spacer(1, 0.3 * inch))

    # Items table
    items_data = [['Product', 'Variant', 'Qty', 'Unit Price', 'Total']]
    for item in order.items.all():
        items_data.append([
            item.product_name,
            item.variant_info or '—',
            str(item.quantity),
            f'${item.unit_price:.2f}',
            f'${item.total_price:.2f}',
        ])

    items_table = Table(items_data, colWidths=[2.5 * inch, 1.5 * inch, 0.5 * inch, 1 * inch, 1 * inch])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(items_table)
    story.append(Spacer(1, 0.3 * inch))

    # Totals
    totals_data = [
        ['Subtotal:', f'${order.subtotal:.2f}'],
        ['Tax:', f'${order.tax:.2f}'],
        ['Shipping:', f'${order.shipping_charge:.2f}'],
        ['Discount:', f'-${order.discount:.2f}'],
        ['TOTAL:', f'${order.total:.2f}'],
    ]
    totals_table = Table(totals_data, colWidths=[5 * inch, 1.5 * inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, -1), (-1, -1), 12),
        ('LINEABOVE', (0, -1), (-1, -1), 1, colors.HexColor('#6366f1')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(totals_table)
    story.append(Spacer(1, 0.5 * inch))
    story.append(Paragraph('Thank you for shopping with CommerceFlow!', styles['Normal']))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()
