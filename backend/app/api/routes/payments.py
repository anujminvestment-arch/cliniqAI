from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.db.session import get_db
from app.models.billing import Invoice, Payment
from app.models.patient import Patient
from app.core.deps import get_current_user, CurrentUser
from app.schemas.billing import PaymentRecord

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("")
async def list_payments(
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Payment, Patient.name.label("patient_name"), Invoice.invoice_number)
        .join(Patient, Payment.patient_id == Patient.id)
        .join(Invoice, Payment.invoice_id == Invoice.id)
        .where(Payment.clinic_id == user.clinic_id)
        .order_by(Payment.created_at.desc())
        .offset(offset).limit(limit)
    )
    result = await db.execute(query)
    rows = result.all()

    return {
        "payments": [
            {
                "id": str(p.id),
                "invoice_id": str(p.invoice_id),
                "invoice_number": inv_num,
                "patient_name": pn,
                "amount": float(p.amount),
                "method": p.method,
                "status": p.status,
                "paid_at": p.paid_at.isoformat() if p.paid_at else None,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p, pn, inv_num in rows
        ],
    }


@router.post("/record")
async def record_payment(
    body: PaymentRecord,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice).where(Invoice.id == body.invoice_id, Invoice.clinic_id == user.clinic_id)
    )
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    payment = Payment(
        clinic_id=user.clinic_id,
        invoice_id=inv.id,
        patient_id=inv.patient_id,
        amount=body.amount,
        method=body.method,
        razorpay_payment_id=body.razorpay_payment_id,
        razorpay_order_id=body.razorpay_order_id,
        status="completed",
        paid_at=datetime.now(timezone.utc),
    )
    db.add(payment)
    inv.status = "paid"
    await db.commit()

    # Send payment notification
    try:
        from app.services.notification_service import notify_payment_received
        patient_result = await db.execute(select(Patient).where(Patient.id == inv.patient_id))
        patient = patient_result.scalar_one_or_none()
        if patient and patient.phone:
            await notify_payment_received(
                db, clinic_id=str(user.clinic_id), patient_id=str(inv.patient_id),
                patient_phone=patient.phone, patient_name=patient.name,
                amount=str(body.amount), invoice_number=inv.invoice_number,
            )
    except Exception:
        pass  # Don't fail the payment recording if notification fails

    return {"id": str(payment.id), "status": "completed"}
