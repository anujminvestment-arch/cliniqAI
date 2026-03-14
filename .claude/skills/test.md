# /test — Run or Write Tests

Run existing tests or write new tests for the CliniqAI platform.

## Instructions

### Running Tests
- **All tests**: `npm test`
- **E2E tests**: `npx playwright test` (config at `playwright.config.ts`, tests in `e2e/`)
- **Specific file**: `npx playwright test e2e/[name].spec.ts`

### Writing Tests
When asked to write tests, determine the type:

#### E2E Tests (Playwright)
- Place in `e2e/` directory
- File naming: `[feature].spec.ts`
- Test user flows across portals (admin, clinic, patient)
- Cover critical paths from the PRD:
  - Patient booking an appointment
  - Clinic staff managing queue
  - Doctor viewing dashboard
  - Patient checking queue status
  - Billing flow (invoice → payment)

#### Unit/Integration Tests
- Co-locate with source: `src/[path]/__tests__/[name].test.ts`
- Test API route handlers
- Test utility functions in `src/lib/`
- Test data transformations

### Test Conventions
- Use descriptive test names: `should [expected behavior] when [condition]`
- Test both happy path and error cases
- For multi-tenant features, verify tenant isolation (no cross-tenant data leakage)
- Mock external services only, not internal database (use real DB for integration tests)
