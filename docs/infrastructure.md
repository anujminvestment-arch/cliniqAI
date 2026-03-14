# Infrastructure — CliniqAI

## Development Setup

> To be configured once tech stack is chosen.

## Database

> To be configured. Must support multi-tenant data isolation (row-level security or schema-per-tenant).

**Requirements:**
- Tenant-level isolation for all patient data
- Point-in-time recovery capability
- Encrypted at rest (AES-256)
- RPO < 1 hour, RTO < 4 hours

## Cloud / Hosting

> To be determined.

## External Services (Planned Integrations)

| Service            | Purpose                          | Phase | Notes                                        |
|--------------------|----------------------------------|-------|----------------------------------------------|
| **Razorpay**       | Online payments (UPI, cards, wallets, net banking) | 1 | India-first payment gateway |
| **WhatsApp Business API** | Patient communication, chatbot | 1 (notifications), 2 (chatbot) | Via official BSP or Meta Cloud API |
| **Twilio / Sarvam AI** | Voice AI, telephony          | 1     | Sarvam AI preferred for Indian language support |
| **Jitsi / Daily.co** | Video consultation (telemedicine) | 2  | Open source (Jitsi) or managed (Daily) |
| **SMS Gateway**    | Fallback notifications           | 1     | MSG91, Twilio, or similar |
| **FCM / APNs**     | Push notifications               | 2     | For mobile app (if built) |
| **Lab Chain APIs** | Test ordering, result delivery   | 3     | 1mg, Thyrocare, SRL — partnerships needed |

## API Documentation

> Swagger/OpenAPI docs will be set up with the first API endpoint.
> When configured, the Swagger URL must be added to CLAUDE.md and README.md.

## Environment Variables

> To be documented as services are added.

**Expected categories:**
- Database connection (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- Razorpay (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET)
- WhatsApp (WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_WEBHOOK_VERIFY_TOKEN)
- Voice AI (VOICE_AI_API_KEY, VOICE_AI_PHONE_NUMBER)
- JWT (JWT_SECRET, JWT_EXPIRY, REFRESH_TOKEN_EXPIRY)
- SMS (SMS_API_KEY, SMS_SENDER_ID)
- Video (VIDEO_API_KEY — Jitsi/Daily)

## Deployment

> To be configured.

## Security & Compliance

- **DPDPA compliance:** Consent capture, data export, right-to-deletion
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Authentication:** JWT + refresh tokens, MFA for clinic staff (Phase 2)
- **Rate limiting:** Required on all API endpoints
- **Audit logging:** Immutable log for all PHI access
- **Backup:** Daily automated backups, RPO < 1 hour

## Credentials & Secrets

> Store securely. Never commit to git.
> Use environment variables or secret management service (AWS Secrets Manager, Vault).
