import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT


def generate_prescription_pdf(
    clinic_name: str,
    clinic_address: str | None,
    clinic_phone: str | None,
    doctor_name: str,
    doctor_specialization: str | None,
    doctor_qualification: str | None,
    patient_name: str,
    patient_age: str | None,
    patient_gender: str | None,
    prescription_code: str,
    date: str,
    diagnosis: str | None,
    medications: list[dict],
    instructions: str | None,
    follow_up_date: str | None,
    is_signed: bool = False,
) -> bytes:
    """Generate a prescription PDF and return as bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=15 * mm, bottomMargin=15 * mm,
                            leftMargin=20 * mm, rightMargin=20 * mm)
    styles = getSampleStyleSheet()
    elements = []

    # Header styles
    clinic_style = ParagraphStyle("ClinicName", parent=styles["Heading1"], fontSize=16,
                                  alignment=TA_CENTER, spaceAfter=2)
    sub_style = ParagraphStyle("SubHead", parent=styles["Normal"], fontSize=9,
                                alignment=TA_CENTER, textColor=colors.grey)
    doctor_style = ParagraphStyle("DoctorInfo", parent=styles["Normal"], fontSize=10,
                                   alignment=TA_LEFT, spaceAfter=4)

    # Clinic header
    elements.append(Paragraph(clinic_name, clinic_style))
    if clinic_address:
        elements.append(Paragraph(clinic_address, sub_style))
    if clinic_phone:
        elements.append(Paragraph(f"Phone: {clinic_phone}", sub_style))
    elements.append(Spacer(1, 6 * mm))

    # Doctor info
    doctor_line = f"<b>{doctor_name}</b>"
    if doctor_specialization:
        doctor_line += f" &mdash; {doctor_specialization}"
    if doctor_qualification:
        doctor_line += f" ({doctor_qualification})"
    elements.append(Paragraph(doctor_line, doctor_style))
    elements.append(Spacer(1, 3 * mm))

    # Patient & Rx info
    info_data = [
        ["Patient:", patient_name, "Rx Code:", prescription_code],
        ["Age/Gender:", f"{patient_age or '-'} / {patient_gender or '-'}", "Date:", date],
    ]
    info_table = Table(info_data, colWidths=[60, 170, 60, 170])
    info_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 4 * mm))

    # Diagnosis
    if diagnosis:
        elements.append(Paragraph(f"<b>Diagnosis:</b> {diagnosis}", styles["Normal"]))
        elements.append(Spacer(1, 3 * mm))

    # Medications table
    if medications:
        elements.append(Paragraph("<b>Medications:</b>", styles["Normal"]))
        elements.append(Spacer(1, 2 * mm))

        med_header = ["#", "Medicine", "Dosage", "Frequency", "Duration", "Instructions"]
        med_rows = [med_header]
        for i, med in enumerate(medications, 1):
            med_rows.append([
                str(i),
                med.get("name", ""),
                med.get("dosage", ""),
                med.get("frequency", ""),
                med.get("duration", ""),
                med.get("instructions", ""),
            ])

        med_table = Table(med_rows, colWidths=[20, 120, 60, 70, 60, 120])
        med_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f0f0f0")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(med_table)
        elements.append(Spacer(1, 4 * mm))

    # Instructions
    if instructions:
        elements.append(Paragraph(f"<b>Instructions:</b> {instructions}", styles["Normal"]))
        elements.append(Spacer(1, 3 * mm))

    # Follow-up
    if follow_up_date:
        elements.append(Paragraph(f"<b>Follow-up:</b> {follow_up_date}", styles["Normal"]))
        elements.append(Spacer(1, 3 * mm))

    # Signature
    elements.append(Spacer(1, 10 * mm))
    sig_text = f"<b>{doctor_name}</b>"
    if is_signed:
        sig_text += "<br/><i>(Digitally Signed)</i>"
    sig_style = ParagraphStyle("Sig", parent=styles["Normal"], fontSize=10, alignment=2)
    elements.append(Paragraph(sig_text, sig_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
