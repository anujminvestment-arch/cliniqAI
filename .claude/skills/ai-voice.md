# /ai-voice — AI Voice Receptionist Development

Build and configure the AI Voice Receptionist module.

## Instructions

The AI Voice Receptionist is a core differentiator of the CliniqAI platform. It handles:

### Call Handling Features
- Answer clinic calls with AI
- Book appointments via voice
- Provide doctor availability info
- Share clinic timings
- Provide queue status to callers
- Cancel or reschedule appointments
- Register new patients via phone

### Implementation Approach

1. **Voice Provider Integration**
   - Design the voice AI integration layer as a pluggable adapter
   - Support webhook-based call flow (inbound call → webhook → AI processing → response)
   - Define call flow state machine: Greeting → Intent Detection → Action → Confirmation → Goodbye

2. **Call Flow Design**
   - Each call flow should be a defined conversation script with branching
   - Intents: book_appointment, check_queue, cancel_appointment, reschedule, clinic_info, register, other
   - Fallback to human receptionist for unresolvable queries

3. **Data Access During Calls**
   - Read-only: doctor availability, clinic timings, queue status
   - Write: create appointment, register patient, cancel appointment
   - All scoped to the calling clinic's tenant

4. **Configuration (per clinic)**
   - Greeting message
   - Working hours
   - Enabled features
   - Fallback phone number
   - Language preference

### Files
- API: `src/app/api/ai/voice/`
- Config UI: `src/app/clinic/ai-settings/page.tsx`
- Types: `src/types/ai-voice.ts`
- Logic: `src/lib/ai-voice/`
