from pydantic import BaseModel
from datetime import date
from decimal import Decimal


class InvoiceItemSchema(BaseModel):
    description: str
    quantity: int = 1
    unit_price: Decimal
    total: Decimal


class InvoiceCreate(BaseModel):
    patient_id: str
    appointment_id: str | None = None
    date: date
    due_date: date | None = None
    items: list[InvoiceItemSchema]
    tax: Decimal = Decimal("0")
    discount: Decimal = Decimal("0")
    notes: str | None = None


class InvoiceUpdate(BaseModel):
    items: list[InvoiceItemSchema] | None = None
    tax: Decimal | None = None
    discount: Decimal | None = None
    status: str | None = None
    notes: str | None = None


class PaymentRecord(BaseModel):
    invoice_id: str
    amount: Decimal
    method: str = "razorpay"
    razorpay_payment_id: str | None = None
    razorpay_order_id: str | None = None
