from io import BytesIO

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from app.models.invoice import Invoice


def generate_invoice_pdf(invoice: Invoice) -> BytesIO:

    buffer = BytesIO()

    pdf = canvas.Canvas(
        buffer,
        pagesize=A4
    )

    width, height = A4

    # ==========================================
    # COLORS
    # ==========================================

    primary_color = HexColor("#0f172a")    # Dark slate header
    accent_color = HexColor("#059669")     # Emerald accent
    text_color = HexColor("#334155")       # Slate text
    light_bg = HexColor("#f8fafc")         # Soft background table header

    status_str = getattr(invoice, "status", "unpaid") or "unpaid"
    status_upper = status_str.upper()

    # ==========================================
    # TOP HEADER BAND
    # ==========================================

    pdf.setFillColor(primary_color)
    pdf.rect(0, height - 90, width, 90, fill=True, stroke=False)

    pdf.setFillColor(HexColor("#ffffff"))
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(40, height - 45, "INVENTORY STORE MANAGER")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(40, height - 68, "Official Sales & Commercial Invoice")

    # Invoice Details on Header Right
    pdf.drawRightString(width - 40, height - 45, f"INVOICE #{invoice.id}")
    pdf.drawRightString(width - 40, height - 68, f"Date: {invoice.created_at.strftime('%b %d, %Y %H:%M')}")

    # ==========================================
    # PAYMENT STATUS BADGE
    # ==========================================

    badge_x = 40
    badge_y = height - 135
    badge_w = 110
    badge_h = 28

    if status_str.lower() == "paid":
        pdf.setFillColor(HexColor("#dcfce7"))  # Light green
        pdf.rect(badge_x, badge_y, badge_w, badge_h, fill=True, stroke=False)
        pdf.setFillColor(HexColor("#166534"))  # Dark green text
    else:
        pdf.setFillColor(HexColor("#fef3c7"))  # Light amber
        pdf.rect(badge_x, badge_y, badge_w, badge_h, fill=True, stroke=False)
        pdf.setFillColor(HexColor("#92400e"))  # Dark amber text

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(badge_x + 15, badge_y + 8, f"STATUS: {status_upper}")

    # Read-Only Notice
    pdf.setFillColor(HexColor("#64748b"))
    pdf.setFont("Helvetica-Oblique", 9)
    pdf.drawRightString(width - 40, badge_y + 10, "Official Copy — Server Generated PDF (Read-Only)")

    # ==========================================
    # CUSTOMER INFORMATION BOX
    # ==========================================

    cust_y = height - 165
    pdf.setFillColor(HexColor("#1e293b"))
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(40, cust_y, "Billed To:")

    pdf.setFillColor(text_color)
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(40, cust_y - 20, invoice.customer_name)

    if invoice.customer_email:
        pdf.setFont("Helvetica", 10)
        pdf.drawString(40, cust_y - 35, f"Email: {invoice.customer_email}")

    # ==========================================
    # TABLE HEADER
    # ==========================================

    y = height - 240

    # Draw Table Header Box
    pdf.setFillColor(light_bg)
    pdf.rect(40, y - 5, width - 80, 25, fill=True, stroke=False)

    pdf.setFillColor(primary_color)
    pdf.setFont("Helvetica-Bold", 9)

    pdf.drawString(50, y + 3, "Product Description")
    pdf.drawString(210, y + 3, "Qty")
    pdf.drawRightString(300, y + 3, "Retail Price")
    pdf.drawRightString(370, y + 3, "Discount")
    pdf.drawRightString(460, y + 3, "Sale Price")
    pdf.drawRightString(width - 50, y + 3, "Subtotal")

    # Table Header Line
    pdf.setStrokeColor(HexColor("#cbd5e1"))
    pdf.setLineWidth(1)
    pdf.line(40, y - 5, width - 40, y - 5)

    y -= 25

    # ==========================================
    # INVOICE ITEMS
    # ==========================================

    pdf.setFont("Helvetica", 9)
    pdf.setFillColor(text_color)

    for item in invoice.items:

        product_name = getattr(item.product, "name", "Product") if item.product else f"Product #{item.product_id}"
        retail_price = float(getattr(item.product, "retail_price", item.unit_price) if item.product else item.unit_price)
        discount_val = float(getattr(item.product, "discount", 0) if item.product else 0)
        sale_price = float(item.unit_price)
        subtotal = float(item.subtotal)

        pdf.drawString(50, y, product_name[:24])
        pdf.drawString(210, y, str(item.quantity))
        pdf.drawRightString(300, y, f"Rs. {retail_price:,.2f}")
        pdf.drawRightString(370, y, f"{discount_val:.1f}%" if discount_val > 0 else "0%")
        pdf.drawRightString(460, y, f"Rs. {sale_price:,.2f}")
        pdf.drawRightString(width - 50, y, f"Rs. {subtotal:,.2f}")

        # Light divider line
        pdf.setStrokeColor(HexColor("#f1f5f9"))
        pdf.line(40, y - 6, width - 40, y - 6)

        y -= 22

        if y < 90:
            pdf.showPage()
            pdf.setFont("Helvetica", 10)
            pdf.setFillColor(text_color)
            y = height - 50

    # ==========================================
    # GRAND TOTAL SUMMARY BOX
    # ==========================================

    y -= 15

    pdf.setFillColor(HexColor("#f8fafc"))
    pdf.rect(width - 240, y - 35, 200, 45, fill=True, stroke=True)

    pdf.setFillColor(primary_color)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(width - 225, y - 10, "Grand Total:")

    pdf.setFillColor(accent_color)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawRightString(width - 50, y - 10, f"Rs. {invoice.total_amount:,.2f}")

    if status_str.lower() == "paid":
        pdf.setFillColor(HexColor("#166534"))
        pdf.setFont("Helvetica-Bold", 9)
        pdf.drawRightString(width - 50, y - 28, "PAID IN FULL")

    # ==========================================
    # FOOTER
    # ==========================================

    pdf.setStrokeColor(HexColor("#e2e8f0"))
    pdf.line(40, 45, width - 40, 45)

    pdf.setFillColor(HexColor("#94a3b8"))
    pdf.setFont("Helvetica", 9)
    pdf.drawString(40, 30, "Thank you for your business!")
    pdf.drawRightString(width - 40, 30, "Generated automatically by Inventory Store API")

    # ==========================================
    # FINALIZE PDF
    # ==========================================

    pdf.save()

    buffer.seek(0)

    return buffer