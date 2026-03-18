import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.socketio import sio
from app.middleware.audit import AuditMiddleware
from app.api.routes import (
    auth, voice, webhooks, conversations, users, doctors, patients, staff,
    appointments, queue, billing, payments, prescriptions, notifications,
    compliance, knowledge_base, analytics, clinics, consultations, follow_ups,
    admin, feedback,
)

app = FastAPI(
    title=settings.APP_NAME,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuditMiddleware)

# Routes
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(voice.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(doctors.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(staff.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(queue.router, prefix="/api")
app.include_router(billing.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(prescriptions.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(compliance.router, prefix="/api")
app.include_router(knowledge_base.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(clinics.router, prefix="/api")
app.include_router(consultations.router, prefix="/api")
app.include_router(follow_ups.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": settings.APP_NAME}


# Mount Socket.IO on the FastAPI app
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
