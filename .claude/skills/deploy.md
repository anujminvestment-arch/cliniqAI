# /deploy — Build & Deployment

Handle build, deployment, and environment configuration.

## Instructions

### Build
```bash
npm run build
```
Fix any build errors before proceeding.

### Environment Setup
Check that required environment variables are configured:
- Database connection
- Auth provider keys
- AI/Voice service API keys
- SMS provider credentials

Never commit `.env` files. Use `.env.example` as a template.

### Pre-Deploy Checklist
1. All TypeScript compiles cleanly (`npx tsc --noEmit`)
2. Build succeeds (`npm run build`)
3. No hardcoded secrets in source
4. Database migrations are up to date
5. E2E tests pass on staging

### Deployment
- Follow the deployment process documented in `docs/infrastructure.md`
- If no deployment is configured yet, help the user set one up (Vercel recommended for Next.js)

### Post-Deploy
- Verify the deployment URL is accessible
- Check that all portals load: /admin, /clinic, /patient
- Verify API endpoints respond
