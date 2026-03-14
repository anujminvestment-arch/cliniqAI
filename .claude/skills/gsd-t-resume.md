# /gsd-t-resume — Resume from Last State

Continue development from where the project left off.

## Instructions

1. Read `.gsd-t/progress.md` to determine the last completed action and current phase.

2. Read `.gsd-t/backlog.md` to find the next priority item.

3. Check `.gsd-t/contracts/` for any contracts that are defined but not yet implemented.

4. Determine the next logical task based on:
   - Incomplete items in the current phase
   - Next item in the backlog
   - Dependencies between modules

5. Present the next task to the user with:
   - What will be built/done
   - Which files will be affected
   - Any dependencies or prerequisites

6. On user confirmation, begin executing the task.

7. After completion, update `.gsd-t/progress.md` with the new state.

## MVP Priority Order
1. Multi-tenant clinic system (data models, tenant isolation)
2. Appointment management (CRUD, slots, scheduling)
3. Queue tracking (real-time queue, wait times)
4. AI call booking (voice receptionist integration)
5. Doctor dashboard (clinic management views)
6. Patient portal (patient-facing views)
7. Billing system (invoices, payments, receipts)
