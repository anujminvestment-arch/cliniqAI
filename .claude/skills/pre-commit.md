# /pre-commit — Pre-Commit Gate Check

Run the pre-commit quality gate before committing changes.

## Instructions

Execute these checks in order. Stop and fix any failures before proceeding.

### 1. TypeScript Compilation
```bash
npx tsc --noEmit
```
Fix any type errors before continuing.

### 2. Linting
```bash
npx next lint
```
Fix any lint errors. Warnings are acceptable but should be minimized.

### 3. Build Check
```bash
npm run build
```
Ensure the project builds without errors.

### 4. Test (if tests exist)
```bash
npm test 2>/dev/null || echo "No tests configured"
```

### 5. Security Check
- Scan changed files for hardcoded secrets, API keys, or credentials
- Ensure no `.env` files are staged
- Check for any `console.log` statements in production code

### 6. Living Docs Check
- If any module was added or changed, verify the corresponding docs are updated:
  - `docs/requirements.md`
  - `docs/architecture.md`
  - `.gsd-t/progress.md`

### Report
After all checks, output a summary:
```
Pre-Commit Gate Results
=======================
TypeScript:  PASS/FAIL
Lint:        PASS/FAIL
Build:       PASS/FAIL
Tests:       PASS/FAIL/SKIP
Security:    PASS/FAIL
Docs:        PASS/FAIL
=======================
Ready to commit: YES/NO
```
