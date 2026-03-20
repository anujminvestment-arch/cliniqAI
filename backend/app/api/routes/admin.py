import logging
import random
import string
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.clinic import Clinic
from app.models.user import User, ClinicMembership
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.billing import Payment
from app.models.doctor import Doctor
from app.models.branch import ClinicBranch
from app.models.knowledge_base import KnowledgeBase
from app.models.symptom import SymptomSpecializationMap
from app.core.deps import get_current_user, CurrentUser, require_roles
from app.core.security import hash_password

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/clinics")
async def list_all_clinics(
    search: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(require_roles("super_admin", "clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    query = select(Clinic)
    if search:
        query = query.where(Clinic.name.ilike(f"%{search}%"))
    query = query.order_by(Clinic.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    clinics = result.scalars().all()

    total = (await db.execute(select(func.count(Clinic.id)))).scalar() or 0

    return {
        "clinics": [
            {
                "id": str(c.id),
                "name": c.name,
                "slug": c.slug,
                "city": c.city,
                "is_active": c.is_active,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in clinics
        ],
        "total": total,
    }


@router.get("/stats")
async def platform_stats(
    user: CurrentUser = Depends(require_roles("super_admin", "clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    total_clinics = (await db.execute(select(func.count(Clinic.id)))).scalar() or 0
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_patients = (await db.execute(select(func.count(Patient.id)))).scalar() or 0
    total_appointments = (await db.execute(select(func.count(Appointment.id)))).scalar() or 0

    return {
        "total_clinics": total_clinics,
        "total_users": total_users,
        "total_patients": total_patients,
        "total_appointments": total_appointments,
    }


@router.get("/users")
async def list_all_users(
    search: str | None = None,
    role: str | None = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    user: CurrentUser = Depends(require_roles("super_admin", "clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(User, ClinicMembership.role, ClinicMembership.clinic_id)
        .outerjoin(ClinicMembership, ClinicMembership.user_id == User.id)
    )
    if search:
        query = query.where(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
    if role:
        query = query.where(ClinicMembership.role == role)
    query = query.order_by(User.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    total = (await db.execute(select(func.count(User.id)))).scalar() or 0

    return {
        "users": [
            {
                "id": str(u.id),
                "name": u.name,
                "email": u.email,
                "phone": u.phone,
                "role": r,
                "clinic_id": str(cid) if cid else None,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u, r, cid in rows
        ],
        "total": total,
    }


# ---------------------------------------------------------------------------
# Global symptom-to-specialization mapping used for auto-generating clinic
# symptom entries during onboarding.
# ---------------------------------------------------------------------------
GLOBAL_SYMPTOM_MAP: dict[str, list[tuple[str, int]]] = {
    "Dentist": [
        ("tooth pain", 10), ("toothache", 10), ("gum pain", 9), ("jaw pain", 8),
        ("cavity", 10), ("tooth sensitivity", 9), ("bleeding gums", 9),
        ("dant dard", 10), ("dant me dard", 10), ("masudo se khoon", 9),
    ],
    "General Physician": [
        ("fever", 8), ("cold", 7), ("cough", 8), ("headache", 7),
        ("body pain", 7), ("weakness", 6), ("vomiting", 7), ("diarrhea", 7),
        ("bukhar", 8), ("sardi", 7), ("khansi", 8), ("sir dard", 7),
        ("badan dard", 7), ("kamzori", 6), ("pet dard", 8),
    ],
    "General Medicine": [
        ("fever", 8), ("cold", 7), ("cough", 8), ("headache", 7),
        ("body pain", 7), ("weakness", 6), ("vomiting", 7), ("diarrhea", 7),
        ("bukhar", 8), ("sardi", 7), ("khansi", 8), ("sir dard", 7),
    ],
    "Dermatologist": [
        ("skin rash", 10), ("acne", 10), ("itching", 8), ("hair loss", 9),
        ("skin infection", 9), ("eczema", 10), ("pigmentation", 8),
        ("chamdi pe dane", 9), ("khujli", 8), ("baal jhadna", 9),
    ],
    "Dermatology": [
        ("skin rash", 10), ("acne", 10), ("itching", 8), ("hair loss", 9),
        ("skin infection", 9), ("eczema", 10), ("pigmentation", 8),
    ],
    "Orthopedic": [
        ("knee pain", 10), ("back pain", 9), ("joint pain", 9), ("fracture", 10),
        ("shoulder pain", 8), ("spine pain", 9),
        ("ghutne me dard", 10), ("kamar dard", 9), ("jodo me dard", 9),
    ],
    "Ophthalmologist": [
        ("eye pain", 10), ("blurry vision", 10), ("eye redness", 9), ("watery eyes", 8),
        ("aankh me dard", 10), ("dhundla dikhta hai", 10),
    ],
    "Pediatrician": [
        ("child fever", 10), ("child cough", 9), ("baby rash", 9), ("child vaccination", 10),
        ("bacche ko bukhar", 10), ("bacche ko khansi", 9),
    ],
    "Pediatrics": [
        ("child fever", 10), ("child cough", 9), ("baby rash", 9), ("child vaccination", 10),
        ("bacche ko bukhar", 10), ("bacche ko khansi", 9),
    ],
    "Cardiologist": [
        ("chest pain", 10), ("heart palpitations", 10), ("high blood pressure", 9),
        ("breathlessness", 8), ("seene me dard", 10), ("dil ki dhadkan tez", 10),
    ],
    "ENT Specialist": [
        ("ear pain", 10), ("sore throat", 8), ("hearing loss", 10),
        ("nose bleeding", 9), ("sinus", 9),
        ("kaan me dard", 10), ("gala kharab", 8), ("sunai nahi deta", 10),
    ],
    "Gynecologist": [
        ("pregnancy", 10), ("irregular periods", 10), ("pelvic pain", 9),
    ],
    "Gastroenterologist": [
        ("stomach pain", 9), ("acidity", 8), ("bloating", 7), ("constipation", 7),
        ("pet me gas", 8), ("kabz", 7), ("khana hazam nahi hota", 7),
    ],
    "Dental": [
        ("tooth pain", 10), ("toothache", 10), ("gum pain", 9), ("cavity", 10),
        ("tooth sensitivity", 9), ("bleeding gums", 9),
        ("dant dard", 10), ("masudo se khoon", 9),
    ],
}


def _generate_password(length: int = 12) -> str:
    """Generate a random alphanumeric password."""
    chars = string.ascii_letters + string.digits + "!@#$%"
    return "".join(random.SystemRandom().choice(chars) for _ in range(length))


def _build_default_kb_entries(
    clinic_id,
    clinic_data: dict,
    doctors: list[dict],
    admin_user_id=None,
) -> list[KnowledgeBase]:
    """Generate default knowledge-base entries for a newly onboarded clinic."""
    name = clinic_data.get("name", "Our Clinic")
    phone = clinic_data.get("phone", "")
    address = clinic_data.get("address", "")
    city = clinic_data.get("city", "")
    timings = clinic_data.get("timings", {})
    services = clinic_data.get("services", [])
    amenities = clinic_data.get("amenities", [])

    # Format timings string
    timing_lines = []
    for day, hours in timings.items():
        if isinstance(hours, dict):
            timing_lines.append(f"  {day.capitalize()}: {hours.get('open', '?')} – {hours.get('close', '?')}")
    timing_str = "\n".join(timing_lines) if timing_lines else "Please call the clinic for timings."

    # Format doctor profiles
    doctor_profiles = []
    for d in doctors:
        fee = d.get("consultation_fee", "N/A")
        doctor_profiles.append(
            f"- {d['name']} ({d.get('specialization', 'General')}), "
            f"{d.get('qualification', '')}, {d.get('experience_years', '')} yrs exp, "
            f"Fee: ₹{fee}"
        )
    doctor_str = "\n".join(doctor_profiles) if doctor_profiles else "No doctors listed yet."

    services_str = ", ".join(services) if services else "General consultation"
    amenities_str = ", ".join(amenities) if amenities else "N/A"

    entries = [
        KnowledgeBase(
            clinic_id=clinic_id,
            category="clinic_info",
            title=f"Welcome to {name}",
            content=(
                f"Namaste! Welcome to {name}. We are located at {address}, {city}. "
                f"You can reach us at {phone}. We offer: {services_str}. "
                f"Amenities: {amenities_str}."
            ),
            language="en",
            tags=["welcome", "greeting", "info"],
            priority=10,
            created_by=admin_user_id,
        ),
        KnowledgeBase(
            clinic_id=clinic_id,
            category="clinic_info",
            title=f"{name} — Swagat (Hindi)",
            content=(
                f"Namaste! {name} mein aapka swagat hai. Hum {address}, {city} mein hain. "
                f"Humara number hai {phone}. Humari sevayen: {services_str}."
            ),
            language="hi",
            tags=["welcome", "greeting", "hindi", "swagat"],
            priority=10,
            created_by=admin_user_id,
        ),
        KnowledgeBase(
            clinic_id=clinic_id,
            category="clinic_info",
            title="Clinic Timings",
            content=f"{name} timings:\n{timing_str}",
            language="en",
            tags=["timings", "hours", "schedule", "open", "close"],
            priority=9,
            created_by=admin_user_id,
        ),
        KnowledgeBase(
            clinic_id=clinic_id,
            category="doctor_info",
            title="Doctor Profiles & Fees",
            content=f"Doctors at {name}:\n{doctor_str}",
            language="en",
            tags=["doctors", "fees", "specialization", "profile"],
            priority=9,
            created_by=admin_user_id,
        ),
        KnowledgeBase(
            clinic_id=clinic_id,
            category="services",
            title="Services Offered",
            content=f"{name} offers the following services: {services_str}.",
            language="en",
            tags=["services", "treatments", "specialties"],
            priority=8,
            created_by=admin_user_id,
        ),
        KnowledgeBase(
            clinic_id=clinic_id,
            category="clinic_info",
            title="Location & Directions",
            content=f"{name} is located at {address}, {city}. Contact: {phone}.",
            language="en",
            tags=["location", "address", "directions", "map"],
            priority=7,
            created_by=admin_user_id,
        ),
        KnowledgeBase(
            clinic_id=clinic_id,
            category="appointment",
            title="How to Book an Appointment",
            content=(
                f"You can book an appointment at {name} by: "
                "1) Calling our reception, 2) Using our website/app, "
                "3) Walking in during clinic hours, 4) Via WhatsApp."
            ),
            language="en",
            tags=["appointment", "booking", "schedule"],
            priority=8,
            created_by=admin_user_id,
        ),
        KnowledgeBase(
            clinic_id=clinic_id,
            category="queue",
            title="Queue / Token System",
            content=(
                f"At {name}, we use a token system. You will receive a token number "
                "when you check in. You can track your position in the queue via our app "
                "or ask reception. Average wait time depends on the number of patients ahead."
            ),
            language="en",
            tags=["queue", "token", "wait", "line"],
            priority=7,
            created_by=admin_user_id,
        ),
        KnowledgeBase(
            clinic_id=clinic_id,
            category="billing",
            title="Payment Methods",
            content=(
                f"{name} accepts: Cash, UPI (GPay/PhonePe/Paytm), Credit/Debit cards, "
                "and online payment through our portal. Payment is collected after consultation."
            ),
            language="en",
            tags=["payment", "billing", "upi", "cash", "card"],
            priority=7,
            created_by=admin_user_id,
        ),
        KnowledgeBase(
            clinic_id=clinic_id,
            category="insurance",
            title="Insurance Information",
            content=(
                f"For insurance-related queries at {name}, please contact our billing desk "
                f"or call {phone}. We will assist you with claim processing and documentation."
            ),
            language="en",
            tags=["insurance", "claim", "cashless", "tpa"],
            priority=6,
            created_by=admin_user_id,
        ),
        KnowledgeBase(
            clinic_id=clinic_id,
            category="emergency",
            title="Emergency Contact",
            content=(
                f"For emergencies, please call {phone} or visit {name} at {address}, {city}. "
                "In case of life-threatening emergencies, please call 108 or visit the nearest hospital."
            ),
            language="en",
            tags=["emergency", "urgent", "ambulance"],
            priority=10,
            created_by=admin_user_id,
        ),
    ]

    return entries


@router.post("/onboard-clinic")
async def onboard_clinic(
    body: dict,
    user: CurrentUser = Depends(require_roles("super_admin")),
    db: AsyncSession = Depends(get_db),
):
    """
    One-shot clinic onboarding: creates clinic, admin user, doctors,
    branches, knowledge-base entries, and symptom mappings.
    """
    clinic_data = body.get("clinic", {})
    admin_data = body.get("admin", {})
    doctors_data = body.get("doctors", [])
    branches_data = body.get("branches", [])
    kb_data = body.get("knowledge_base", [])

    # ---------------------------------------------------------------
    # Validate required fields
    # ---------------------------------------------------------------
    if not clinic_data.get("name") or not clinic_data.get("slug"):
        raise HTTPException(status_code=400, detail="clinic.name and clinic.slug are required")
    if not admin_data.get("email"):
        raise HTTPException(status_code=400, detail="admin.email is required")

    # Check slug uniqueness
    existing = (
        await db.execute(select(Clinic).where(Clinic.slug == clinic_data["slug"]))
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail=f"Clinic slug '{clinic_data['slug']}' already exists")

    # ---------------------------------------------------------------
    # 1. Create admin user (or reuse existing)
    # ---------------------------------------------------------------
    admin_password_raw = admin_data.get("password", "auto")
    if admin_password_raw == "auto":
        admin_password_raw = _generate_password()

    existing_admin = (
        await db.execute(select(User).where(User.email == admin_data["email"]))
    ).scalar_one_or_none()

    if existing_admin:
        admin_user = existing_admin
    else:
        admin_user = User(
            name=admin_data.get("name", "Clinic Admin"),
            email=admin_data["email"],
            phone=admin_data.get("phone"),
            password_hash=hash_password(admin_password_raw),
        )
        db.add(admin_user)
        await db.flush()

    # ---------------------------------------------------------------
    # 2. Create clinic
    # ---------------------------------------------------------------
    settings_json = clinic_data.get("settings", {})
    if clinic_data.get("amenities"):
        settings_json["amenities"] = clinic_data["amenities"]
    if clinic_data.get("services"):
        settings_json["services"] = clinic_data["services"]

    clinic = Clinic(
        name=clinic_data["name"],
        slug=clinic_data["slug"],
        owner_id=admin_user.id,
        phone=clinic_data.get("phone"),
        email=clinic_data.get("email"),
        address=clinic_data.get("address"),
        city=clinic_data.get("city"),
        state=clinic_data.get("state"),
        pincode=clinic_data.get("pincode"),
        timings=clinic_data.get("timings"),
        settings=settings_json,
    )
    db.add(clinic)
    await db.flush()

    # ---------------------------------------------------------------
    # 3. Create ClinicMembership for admin as clinic_owner
    # ---------------------------------------------------------------
    admin_membership = ClinicMembership(
        user_id=admin_user.id,
        clinic_id=clinic.id,
        role="clinic_owner",
    )
    db.add(admin_membership)
    await db.flush()

    # ---------------------------------------------------------------
    # 4. Create doctors (with User + ClinicMembership per doctor)
    # ---------------------------------------------------------------
    created_doctors: list[dict] = []
    doctor_records: list[Doctor] = []

    for doc_data in doctors_data:
        doc_email = doc_data.get("email")
        doc_password_raw = _generate_password()

        # Check if user already exists (supports multi-clinic doctors)
        doc_user = None
        if doc_email:
            doc_user = (
                await db.execute(select(User).where(User.email == doc_email))
            ).scalar_one_or_none()

        if not doc_user:
            doc_user = User(
                name=doc_data.get("name", "Doctor"),
                email=doc_email or f"doctor-{random.randint(10000,99999)}@{clinic_data['slug']}.local",
                phone=doc_data.get("phone"),
                password_hash=hash_password(doc_password_raw),
            )
            db.add(doc_user)
            await db.flush()
            is_new_user = True
        else:
            doc_password_raw = "(existing user — password unchanged)"
            is_new_user = False

        # ClinicMembership for this clinic
        doc_membership = ClinicMembership(
            user_id=doc_user.id,
            clinic_id=clinic.id,
            role="doctor",
        )
        db.add(doc_membership)

        # Doctor record
        consultation_fee = doc_data.get("consultation_fee")
        if consultation_fee is not None:
            consultation_fee = Decimal(str(consultation_fee))

        doctor = Doctor(
            clinic_id=clinic.id,
            user_id=doc_user.id,
            name=doc_data.get("name", "Doctor"),
            specialization=doc_data.get("specialization"),
            qualification=doc_data.get("qualification"),
            experience_years=doc_data.get("experience_years"),
            phone=doc_data.get("phone"),
            email=doc_email,
            consultation_fee=consultation_fee,
            schedule=doc_data.get("schedule"),  # Per-clinic timings
            treatments=doc_data.get("treatments"),  # List of treatments
        )
        db.add(doctor)
        await db.flush()
        doctor_records.append(doctor)

        created_doctors.append({
            "doctor_id": str(doctor.id),
            "user_id": str(doc_user.id),
            "name": doctor.name,
            "email": doc_user.email,
            "password": doc_password_raw if is_new_user else None,
            "specialization": doctor.specialization,
            "is_new_user": is_new_user,
        })

    # ---------------------------------------------------------------
    # 5. Create branches
    # ---------------------------------------------------------------
    created_branches: list[str] = []
    for br_data in branches_data:
        branch = ClinicBranch(
            clinic_id=clinic.id,
            name=br_data.get("name", f"{clinic_data['name']} Branch"),
            address=br_data.get("address"),
            city=br_data.get("city"),
            state=br_data.get("state"),
            pincode=br_data.get("pincode"),
            phone=br_data.get("phone"),
            timings=br_data.get("timings"),
        )
        db.add(branch)
        await db.flush()
        created_branches.append(str(branch.id))

    # ---------------------------------------------------------------
    # 6. Knowledge-base entries
    # ---------------------------------------------------------------
    kb_entries: list[KnowledgeBase] = []

    # User-provided KB entries
    for kb_item in kb_data:
        entry = KnowledgeBase(
            clinic_id=clinic.id,
            category=kb_item.get("category", "clinic_info"),
            title=kb_item.get("title", "Untitled"),
            content=kb_item.get("content", ""),
            language=kb_item.get("language", "en"),
            tags=kb_item.get("tags", []),
            priority=kb_item.get("priority", 0),
            created_by=admin_user.id,
        )
        db.add(entry)
        kb_entries.append(entry)

    # 7. Auto-generate default KB entries if none provided
    if not kb_data:
        default_entries = _build_default_kb_entries(
            clinic_id=clinic.id,
            clinic_data=clinic_data,
            doctors=doctors_data,
            admin_user_id=admin_user.id,
        )
        for entry in default_entries:
            db.add(entry)
            kb_entries.append(entry)

    await db.flush()

    # ---------------------------------------------------------------
    # 8. Auto-generate symptom mappings per doctor specialization
    # ---------------------------------------------------------------
    symptom_count = 0
    seen_specializations: set[str] = set()
    for doc_data in doctors_data:
        spec = doc_data.get("specialization")
        if not spec or spec in seen_specializations:
            continue
        seen_specializations.add(spec)

        symptoms = GLOBAL_SYMPTOM_MAP.get(spec, [])
        for keyword, priority in symptoms:
            mapping = SymptomSpecializationMap(
                clinic_id=clinic.id,
                symptom_keyword=keyword,
                specialization=spec,
                priority=priority,
            )
            db.add(mapping)
            symptom_count += 1

    await db.flush()

    # ---------------------------------------------------------------
    # 9. Try to embed all KB entries (non-fatal on failure)
    # ---------------------------------------------------------------
    embed_result = {"embedded": 0, "skipped": 0, "error": None}
    try:
        from app.services.embedding_service import embed_all_kb_entries
        embed_result = await embed_all_kb_entries(db, str(clinic.id))
    except Exception as e:
        logger.warning(f"KB embedding failed during onboarding (non-fatal): {e}")
        embed_result["error"] = str(e)

    # ---------------------------------------------------------------
    # Commit everything
    # ---------------------------------------------------------------
    await db.commit()

    return {
        "status": "ok",
        "clinic_id": str(clinic.id),
        "clinic_name": clinic.name,
        "clinic_slug": clinic.slug,
        "admin": {
            "user_id": str(admin_user.id),
            "email": admin_user.email,
            "password": admin_password_raw if not existing_admin else "(existing user — password unchanged)",
        },
        "doctors_count": len(created_doctors),
        "doctors": created_doctors,
        "branches_count": len(created_branches),
        "branch_ids": created_branches,
        "kb_count": len(kb_entries),
        "symptom_mappings_count": symptom_count,
        "embedding": embed_result,
    }


@router.get("/clinic/{clinic_id}")
async def get_clinic_details(
    clinic_id: str,
    user: CurrentUser = Depends(require_roles("super_admin", "clinic_owner")),
    db: AsyncSession = Depends(get_db),
):
    """Return full clinic details including doctors, branches, and KB entry count."""
    clinic = (
        await db.execute(select(Clinic).where(Clinic.id == clinic_id))
    ).scalar_one_or_none()
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    # Doctors
    doctors_result = await db.execute(
        select(Doctor).where(Doctor.clinic_id == clinic.id, Doctor.is_active == True)
    )
    doctors = doctors_result.scalars().all()

    # Branches
    branches_result = await db.execute(
        select(ClinicBranch).where(ClinicBranch.clinic_id == clinic.id, ClinicBranch.is_active == True)
    )
    branches = branches_result.scalars().all()

    # KB count
    kb_count = (
        await db.execute(
            select(func.count(KnowledgeBase.id)).where(KnowledgeBase.clinic_id == clinic.id)
        )
    ).scalar() or 0

    # Symptom mappings count
    symptom_count = (
        await db.execute(
            select(func.count(SymptomSpecializationMap.id)).where(
                SymptomSpecializationMap.clinic_id == clinic.id
            )
        )
    ).scalar() or 0

    # Owner
    owner = (
        await db.execute(select(User).where(User.id == clinic.owner_id))
    ).scalar_one_or_none()

    return {
        "clinic": {
            "id": str(clinic.id),
            "name": clinic.name,
            "slug": clinic.slug,
            "phone": clinic.phone,
            "email": clinic.email,
            "address": clinic.address,
            "city": clinic.city,
            "state": clinic.state,
            "pincode": clinic.pincode,
            "timings": clinic.timings,
            "settings": clinic.settings,
            "is_active": clinic.is_active,
            "created_at": clinic.created_at.isoformat() if clinic.created_at else None,
        },
        "owner": {
            "id": str(owner.id) if owner else None,
            "name": owner.name if owner else None,
            "email": owner.email if owner else None,
        },
        "doctors": [
            {
                "id": str(d.id),
                "name": d.name,
                "specialization": d.specialization,
                "qualification": d.qualification,
                "experience_years": d.experience_years,
                "consultation_fee": float(d.consultation_fee) if d.consultation_fee else None,
                "phone": d.phone,
                "email": d.email,
                "is_active": d.is_active,
            }
            for d in doctors
        ],
        "branches": [
            {
                "id": str(b.id),
                "name": b.name,
                "address": b.address,
                "city": b.city,
                "phone": b.phone,
                "timings": b.timings,
                "is_active": b.is_active,
            }
            for b in branches
        ],
        "kb_entries_count": kb_count,
        "symptom_mappings_count": symptom_count,
    }
