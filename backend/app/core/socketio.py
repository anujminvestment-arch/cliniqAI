import socketio
from app.core.config import settings
from app.core.security import decode_access_token
import logging

logger = logging.getLogger(__name__)

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    logger=False,
    engineio_logger=False,
)


@sio.event
async def connect(sid, environ, auth):
    """Handle client connection. Auth via token."""
    token = None
    if auth and isinstance(auth, dict):
        token = auth.get("token")

    if not token:
        # Allow unauthenticated connections for TV display
        logger.info(f"Anonymous connection: {sid}")
        return True

    payload = decode_access_token(token)
    if not payload:
        logger.warning(f"Invalid token on connect: {sid}")
        return False

    user_id = payload.get("userId")
    clinic_id = payload.get("clinicId")
    role = payload.get("role")

    # Save session data
    async with sio.session(sid) as session:
        session["user_id"] = user_id
        session["clinic_id"] = clinic_id
        session["role"] = role

    # Join rooms
    if user_id:
        await sio.enter_room(sid, f"user:{user_id}")
    if clinic_id:
        await sio.enter_room(sid, f"clinic:{clinic_id}")

    logger.info(f"Connected: {sid} user={user_id} clinic={clinic_id} role={role}")
    return True


@sio.event
async def join_tv(sid, data):
    """TV display joins a clinic-specific TV room."""
    clinic_slug = data.get("clinic_slug") if isinstance(data, dict) else data
    if clinic_slug:
        await sio.enter_room(sid, f"tv:{clinic_slug}")
        logger.info(f"TV joined: {sid} slug={clinic_slug}")


@sio.event
async def disconnect(sid):
    logger.info(f"Disconnected: {sid}")


# ── Helper functions to emit events from anywhere in the app ──

async def emit_queue_updated(clinic_id: str, clinic_slug: str | None = None, data: dict | None = None):
    """Notify all viewers that queue has changed."""
    payload = {"clinic_id": clinic_id, "timestamp": __import__("datetime").datetime.now().isoformat(), **(data or {})}
    # Notify clinic staff
    await sio.emit("queue:updated", payload, room=f"clinic:{clinic_id}")
    # Notify TV display
    if clinic_slug:
        await sio.emit("queue:updated", payload, room=f"tv:{clinic_slug}")


async def emit_notification(user_id: str, notification: dict):
    """Send a real-time notification to a specific user."""
    await sio.emit("notification:new", notification, room=f"user:{user_id}")


async def emit_appointment_updated(clinic_id: str, data: dict | None = None):
    """Notify clinic that an appointment changed."""
    await sio.emit("appointment:updated", data or {}, room=f"clinic:{clinic_id}")


async def emit_queue_to_patient(user_id: str, data: dict):
    """Send queue position update directly to a patient."""
    await sio.emit("queue:position", data, room=f"user:{user_id}")
