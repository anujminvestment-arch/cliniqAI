# /add-component — Create a Reusable Component

Create a new reusable component for the CliniqAI platform.

## Instructions

1. Determine the component type:
   - **UI primitive** → `src/components/ui/` (button, input, card, etc.)
   - **Shared/domain** → `src/components/shared/` (stat-card, data-table, etc.)
   - **Module-specific** → `src/components/[module]/` (appointment-card, queue-list, etc.)

2. Create the component with:
   - TypeScript with explicit prop types
   - Use existing UI primitives from `src/components/ui/` as building blocks
   - Follow the existing component patterns (check `src/components/shared/` for examples)
   - Support dark/light theme via CSS variables (project uses theme toggle)
   - Responsive design

3. Component conventions:
   - Named exports (not default exports)
   - Props interface named `[ComponentName]Props`
   - Use `cn()` utility from `src/lib/utils.ts` for conditional class merging
   - Use shadcn/ui patterns — this project uses shadcn components

4. If the component needs data, accept it via props. Don't fetch data inside shared components.

## Existing UI Components (shadcn/ui)
avatar, badge, breadcrumb, button, calendar, card, chart, command, dialog,
dropdown-menu, input, input-group, label, popover, progress, select, separator,
sheet, sidebar, skeleton, switch, table, tabs, textarea, tooltip
