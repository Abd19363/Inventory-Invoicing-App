from io import BytesIO

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
    # HEADER
    # ==========================================

    pdf.setFont("Helvetica-Bold", 20)

    pdf.drawString(
        50,
        height - 50,
        "INVOICE"
    )

    pdf.setFont("Helvetica", 10)

    pdf.drawString(
        50,
        height - 75,
        f"Invoice ID: {invoice.id}"
    )

    pdf.drawString(
        50,
        height - 90,
        f"Date: {invoice.created_at.strftime('%Y-%m-%d %H:%M')}"
    )

    # ==========================================
    # CUSTOMER
    # ==========================================

    pdf.setFont("Helvetica-Bold", 12)

    pdf.drawString(
        50,
        height - 130,
        "Customer"
    )

    pdf.setFont("Helvetica", 10)

    pdf.drawString(
        50,
        height - 150,
        f"Name: {invoice.customer_name}"
    )

    if invoice.customer_email:

        pdf.drawString(
            50,
            height - 165,
            f"Email: {invoice.customer_email}"
        )

    # ==========================================
    # TABLE HEADER
    # ==========================================

    y = height - 220

    pdf.setFont("Helvetica-Bold", 10)

    pdf.drawString(50, y, "Product")
    pdf.drawString(280, y, "Qty")
    pdf.drawString(340, y, "Unit Price")
    pdf.drawString(430, y, "Subtotal")

    y -= 20

    pdf.setFont("Helvetica", 10)

    # ==========================================
    # INVOICE ITEMS
    # ==========================================

    for item in invoice.items:

        product_name = item.product.name

        pdf.drawString(
            50,
            y,
            product_name[:35]
        )

        pdf.drawString(
            280,
            y,
            str(item.quantity)
        )

        pdf.drawString(
            340,
            y,
            f"{item.unit_price:.2f}"
        )

        pdf.drawString(
            430,
            y,
            f"{item.subtotal:.2f}"
        )

        y -= 20

        # Prevent drawing outside the page
        if y < 70:

            pdf.showPage()

            pdf.setFont(
                "Helvetica",
                10
            )

            y = height - 50

    # ==========================================
    # TOTAL
    # ==========================================

    y -= 20

    pdf.setFont(
        "Helvetica-Bold",
        12
    )

    pdf.drawString(
        340,
        y,
        "Total:"
    )

    pdf.drawString(
        430,
        y,
        f"{invoice.total_amount:.2f}"
    )

    # ==========================================
    # FINALIZE PDF
    # ==========================================

    pdf.save()

    buffer.seek(0)

    return buffer