import uuid as uuid_mod
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, datetime, timezone

from app.db.session import get_db
from app.models.billing import Invoice, Payment
from app.models.patient import Patient
from app.core.deps import get_current_user, CurrentUser
from app.schemas.billing import InvoiceCreate, InvoiceUpdate, PaymentRecord

router = APIRouter(prefix="/invoices", tags=["billing"])


@router.get("")
async def list_invoices(
    status: str | None = None,
    patient_id: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Invoice, Patient.name.label("patient_name"))
        .join(Patient, Invoice.patient_id == Patient.id)
        .where(Invoice.clinic_id == user.clinic_id)
    )
    if status:
        query = query.where(Invoice.status == status)
    if patient_id:
        query = query.where(Invoice.patient_id == patient_id)
    query = query.order_by(Invoice.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    total_count = (await db.execute(
        select(func.count(Invoice.id)).where(Invoice.clinic_id == user.clinic_id)
    )).scalar() or 0

    return {
        "invoices": [
            {
                "id": str(inv.id),
                "invoice_number": inv.invoice_number,
                "patient_id": str(inv.patient_id),
                "patient_name": pn,
                "date": inv.date.isoformat(),
                "due_date": inv.due_date.isoformat() if inv.due_date else None,
                "items": inv.items,
                "subtotal": float(inv.subtotal),
                "tax": float(inv.tax),
                "discount": float(inv.discount),
                "total": float(inv.total),
                "status": inv.status,
                "notes": inv.notes,
                "created_at": inv.created_at.isoformat() if inv.created_at else None,
            }
            for inv, pn in rows
        ],
        "total": total_count,
    }


@router.post("")
async def create_invoice(
    body: InvoiceCreate,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    invoice_number = f"INV-{uuid_mod.uuid4().hex[:8].upper()}"
    subtotal = sum(item.total for item in body.items)
    total = subtotal + body.tax - body.discount

    invoice = Invoice(
        clinic_id=user.clinic_id,
        patient_id=body.patient_id,
        appointment_id=body.appointment_id,
        invoice_number=invoice_number,
        date=body.date,
        due_date=body.due_date,
        items=[item.model_dump() for item in body.items],
        subtotal=subtotal,
        tax=body.tax,
        discount=body.discount,
        total=total,
        notes=body.notes,
    )
    db.add(invoice)
    await db.commit()
    await db.refresh(invoice)
    return {"id": str(invoice.id), "invoice_number": invoice.invoice_number, "total": float(invoice.total)}


@router.put("/{invoice_id}")
async def update_invoice(
    invoice_id: str,
    body: InvoiceUpdate,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice).where(Invoice.id == invoice_id, Invoice.clinic_id == user.clinic_id)
    )
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if body.items is not None:
        inv.items = [item.model_dump() for item in body.items]
        inv.subtotal = sum(item.total for item in body.items)
        inv.total = inv.subtotal + (body.tax if body.tax is not None else inv.tax) - (body.discount if body.discount is not None else inv.discount)
    if body.tax is not None:
        inv.tax = body.tax
    if body.discount is not None:
        inv.discount = body.discount
    if body.status is not None:
        inv.status = body.status
    if body.notes is not None:
        inv.notes = body.notes
    await db.commit()
    return {"id": str(inv.id), "status": inv.status, "total": float(inv.total)}


@router.post("/razorpay-order")
async def create_razorpay_order(
    invoice_id: str,
    user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Invoice).where(Invoice.id == invoice_id, Invoice.clinic_id == user.clinic_id)
    )
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    from app.services.razorpay_client import create_order
    order = create_order(
        amount_paise=int(inv.total * 100),
        currency="INR",
        receipt=inv.invoice_number,
    )
    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "invoice_id": str(inv.id),
    }
