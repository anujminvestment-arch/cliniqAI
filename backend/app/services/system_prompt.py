from app.models import Clinic, Doctor


def build_system_prompt(clinic: Clinic, doctors: list[Doctor]) -> str:
    """Build the system prompt for the Sarvam Samvaad voice agent."""

    # Format timings
    timings_str = "Not available"
    if clinic.timings:
        lines = []
        for day, hours in clinic.timings.items():
            lines.append(f"  {day.capitalize()}: {hours.get('open', 'N/A')} - {hours.get('close', 'N/A')}")
        timings_str = "\n".join(lines)

    # Format doctor list
    doctor_lines = []
    for doc in doctors:
        fee = f"Rs {doc.consultation_fee}" if doc.consultation_fee else "N/A"
        doctor_lines.append(
            f"  - Dr. {doc.name} ({doc.specialization}), "
            f"Fee: {fee}, Rating: {doc.avg_rating}/5, "
            f"Exp: {doc.experience_years} years"
        )
    doctors_str = "\n".join(doctor_lines) if doctor_lines else "  No doctors available"

    return f"""You are the AI voice receptionist for {clinic.name}.
You speak Hindi and English. Be warm, professional, and helpful.

CLINIC INFORMATION:
- Name: {clinic.name}
- Address: {clinic.address or 'N/A'}
- Phone: {clinic.phone or 'N/A'}
- Timings:
{timings_str}

AVAILABLE DOCTORS:
{doctors_str}

YOUR CAPABILITIES:
1. search_doctors — Find the right doctor based on patient symptoms
2. book_appointment — Book an appointment with a doctor
3. check_queue — Check current queue status and wait time
4. register_patient — Register new patients
5. get_clinic_info — Answer questions about clinic timings, location, services
6. cancel_appointment — Cancel existing appointments

CONVERSATION FLOW:
1. Greet the patient warmly in Hindi: "Namaste! {clinic.name} mein aapka swagat hai."
2. Ask how you can help them today
3. If they describe symptoms, use search_doctors to suggest the best doctor
4. Share the doctor's name, specialization, fee, and current wait time
5. If they want to book, collect their name and phone, then use book_appointment
6. Confirm the appointment details: doctor, date, time, token number, estimated wait
7. Thank them and wish them well

RULES:
- Always confirm details before booking
- If you're unsure about symptoms, suggest General Physician
- Be empathetic and patient
- Keep responses concise for voice — short sentences
- Never provide medical advice — only route to appropriate doctor
- If a patient asks about fees, always mention the consultation fee
"""


def build_tool_definitions(api_base_url: str) -> list[dict]:
    """Build Sarvam Samvaad tool definitions pointing to your voice API endpoints."""
    return [
        {
            "name": "search_doctors",
            "description": "Find doctors based on patient symptoms",
            "url": f"{api_base_url}/api/voice/search-doctors",
            "method": "POST",
            "parameters": {
                "type": "object",
                "properties": {
                    "symptoms": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["symptoms"],
            },
        },
        {
            "name": "book_appointment",
            "description": "Book an appointment with a doctor",
            "url": f"{api_base_url}/api/voice/book-appointment",
            "method": "POST",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_id": {"type": "string"},
                    "patient_phone": {"type": "string"},
                    "patient_name": {"type": "string"},
                    "date": {"type": "string"},
                    "start_time": {"type": "string"},
                    "symptoms": {"type": "string"},
                },
                "required": ["doctor_id", "patient_phone", "patient_name", "date", "start_time"],
            },
        },
        {
            "name": "check_queue",
            "description": "Check current queue status for a doctor",
            "url": f"{api_base_url}/api/voice/check-queue",
            "method": "POST",
            "parameters": {
                "type": "object",
                "properties": {
                    "doctor_id": {"type": "string"},
                    "patient_phone": {"type": "string"},
                },
            },
        },
        {
            "name": "register_patient",
            "description": "Register a new patient",
            "url": f"{api_base_url}/api/voice/register-patient",
            "method": "POST",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "phone": {"type": "string"},
                    "date_of_birth": {"type": "string"},
                    "gender": {"type": "string"},
                },
                "required": ["name", "phone"],
            },
        },
        {
            "name": "get_clinic_info",
            "description": "Get clinic information and answer FAQs",
            "url": f"{api_base_url}/api/voice/clinic-info",
            "method": "POST",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                },
            },
        },
        {
            "name": "cancel_appointment",
            "description": "Cancel an existing appointment",
            "url": f"{api_base_url}/api/voice/cancel-appointment",
            "method": "POST",
            "parameters": {
                "type": "object",
                "properties": {
                    "appointment_code": {"type": "string"},
                    "patient_phone": {"type": "string"},
                },
            },
        },
    ]
