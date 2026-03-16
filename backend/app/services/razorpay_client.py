import hashlib
import hmac
from app.core.config import settings

try:
    import razorpay
    _client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)) if settings.RAZORPAY_KEY_ID else None
except ImportError:
    _client = None


def create_order(amount_paise: int, currency: str = "INR", receipt: str = "") -> dict:
    """Create a Razorpay order. Returns order dict with 'id'."""
    if not _client:
        # Return mock order for development
        import uuid
        return {
            "id": f"order_{uuid.uuid4().hex[:16]}",
            "amount": amount_paise,
            "currency": currency,
            "receipt": receipt,
            "status": "created",
        }
    return _client.order.create({
        "amount": amount_paise,
        "currency": currency,
        "receipt": receipt,
        "payment_capture": 1,
    })


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Verify Razorpay payment signature."""
    if not settings.RAZORPAY_KEY_SECRET:
        return True  # Skip verification in dev
    msg = f"{order_id}|{payment_id}"
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        msg.encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def verify_webhook_signature(body: bytes, signature: str) -> bool:
    """Verify Razorpay webhook signature."""
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        return True
    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
