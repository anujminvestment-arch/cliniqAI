# /add-api — Create API Endpoint

Create a new API endpoint for the CliniqAI platform.

## Instructions

1. Parse the user's request to determine:
   - Resource name (e.g., appointments, patients, clinics)
   - HTTP methods needed (GET, POST, PUT, DELETE)
   - Whether it's a collection or single resource endpoint

2. Check for an existing contract in `.gsd-t/contracts/` for the domain. If found, follow the contract's interface definitions.

3. Create the API route following Next.js App Router conventions:
   - Collection: `src/app/api/[resource]/route.ts`
   - Single item: `src/app/api/[resource]/[id]/route.ts`
   - Nested: `src/app/api/[parent]/[parentId]/[resource]/route.ts`

4. Each endpoint must:
   - Validate request body/params
   - Enforce tenant isolation (clinic scoping)
   - Return consistent response format: `{ success: boolean, data?: T, error?: string }`
   - Handle errors gracefully
   - Use proper HTTP status codes

5. Create or update types in `src/types/` for request/response shapes.

6. Add the endpoint to the relevant contract if one exists.

## Response Format Convention
```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: "Human-readable message" }

// List
{ success: true, data: T[], total: number, page: number, limit: number }
```

## Auth Context
All API routes should expect tenant context (clinic ID) from the authenticated session. Never trust client-provided tenant IDs for data access.
