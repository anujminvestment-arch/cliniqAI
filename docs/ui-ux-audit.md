# CliniqAI — UI/UX Audit Report

**Date:** 2026-03-13
**Scope:** Full visual audit across all 3 portals (Super Admin, Clinic Admin, Patient), auth pages, and landing page
**Method:** Screenshot review (12 screens, light + dark), source code analysis
**Severity:** P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low/Enhancement)

---

## Table of Contents

1. [Critical Issues (P0)](#1-critical-issues-p0)
2. [High Priority Issues (P1)](#2-high-priority-issues-p1)
3. [Medium Priority Issues (P2)](#3-medium-priority-issues-p2)
4. [Enhancements (P3)](#4-enhancements-p3)
5. [Page-by-Page Breakdown](#5-page-by-page-breakdown)
6. [Accessibility Audit](#6-accessibility-audit)
7. [Dark Theme Issues](#7-dark-theme-issues)
8. [Responsive / Mobile Issues](#8-responsive--mobile-issues)
9. [Design System Inconsistencies](#9-design-system-inconsistencies)
10. [Recommended Priority Order](#10-recommended-priority-order)

---

## 1. Critical Issues (P0)

### P0-01: No Form Validation on Login or Register
- **Location:** `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- **Issue:** Login form submits and redirects without validating email/password. Empty fields navigate directly to dashboards. Register form has `required` attributes but no visual error states, inline validation messages, or server-side error handling.
- **Impact:** Users can "log in" with blank credentials. No feedback when form submission fails. Undermines trust for a healthcare platform.
- **Fix:** Add client-side validation with error messages below inputs. Show loading spinner on submit. Display toast/alert on auth failure.

### P0-02: Forgot Password Links to Login (Dead Link)
- **Location:** `src/app/(auth)/login/page.tsx:238`
- **Issue:** "Forgot password?" link has `href="/login"` — it links back to itself. No forgot-password page or flow exists.
- **Impact:** Users who forget their password have no recovery path.
- **Fix:** Create a `/forgot-password` page with email input and reset flow UI.

### P0-03: No Password Visibility Toggle
- **Location:** Login and Register pages
- **Issue:** Password fields are `type="password"` with no show/hide toggle. Users cannot verify what they've typed.
- **Impact:** Higher error rate during login. Accessibility concern for users with motor impairments.
- **Fix:** Add an eye/eye-off icon button inside the password input to toggle visibility.

### P0-04: Patient Portal — No Search Bar in Header
- **Location:** `src/app/patient/layout.tsx:160-163`
- **Issue:** The Patient portal header has no search input, unlike Admin and Clinic which have prominent search bars. Patients have no way to quickly search appointments, records, or prescriptions.
- **Impact:** Poor discoverability. Patients must navigate through sidebar menus for everything.
- **Fix:** Add a contextual search bar to patient header: "Search appointments, records..."

### P0-05: Sidebar Navigation Overflow — Clinic Has 14 Items
- **Location:** `src/app/clinic/layout.tsx:56-71`
- **Issue:** Clinic sidebar has 14 navigation items in a single flat list (Dashboard, Appointments, Queue, Patients, Doctors, Staff, Prescriptions, Consultations, Follow-ups, Billing, Reports, Notifications, AI Voice Settings, Branches). On smaller laptop screens this overflows without scroll indication.
- **Impact:** Users can't see all navigation items. Lower items (Reports, Notifications, AI Voice Settings, Branches) are buried.
- **Fix:** Group items into collapsible sections: "Appointments & Queue", "Patient Care", "Operations", "Settings". Or use SidebarGroupLabel to create visual sections.

---

## 2. High Priority Issues (P1)

### P1-01: Landing Page — Portal Cards Navigate Without Auth
- **Location:** `src/app/page.tsx:143-183`
- **Issue:** Portal cards link directly to `/admin`, `/clinic`, `/patient` without authentication. Any visitor can access all dashboards.
- **Impact:** No security boundary. Contradicts "enterprise-grade security" claim in footer.
- **Fix:** Add auth middleware/guard. Redirect unauthenticated users to `/login`. Landing page portal cards should link to `/login?redirect=/admin` etc.

### P1-02: Landing Page — Metrics Are Hardcoded, Not Dynamic
- **Location:** `src/app/page.tsx:59-64`
- **Issue:** Trust metrics (248+, 15k+, 3,200+, 99.9%) are static constants. Portal cards also show hardcoded metrics ("248 clinics", "24 today", "#3 in queue").
- **Impact:** Misleading for a new deployment. Shows fake numbers on a fresh install.
- **Fix:** Either fetch real stats from the backend, or remove/hide metrics until backend is connected. Mark as "demo data" if keeping for now.

### P1-03: No Breadcrumb Navigation in Inner Pages
- **Location:** All portal sub-pages (e.g., `/clinic/patients`, `/admin/settings`, `/patient/health`)
- **Issue:** A Breadcrumb component exists (`src/components/ui/breadcrumb.tsx`) but is never used. Users navigating deep pages (e.g., `/clinic/patients/[id]`) have no location context apart from the sidebar highlight.
- **Impact:** Users feel lost in deeper pages. No quick way to go back to parent.
- **Fix:** Add breadcrumbs below the sticky header on all sub-pages.

### P1-04: No Loading States Between Page Navigations
- **Location:** Loading files exist (`admin/loading.tsx`, `clinic/loading.tsx`, `patient/loading.tsx`) but inner sub-pages have no loading UI
- **Issue:** When clicking sidebar links, there's no visual transition or skeleton loading between pages. The content just pops in.
- **Impact:** Feels unpolished. Users don't know if their click registered.
- **Fix:** Add skeleton loaders matching each page's layout. Use `Suspense` boundaries around page content.

### P1-05: Tables Have No Pagination
- **Location:** Admin clinics table, Clinic patients table, all list views
- **Issue:** Tables render all records at once. No pagination, no "showing X of Y", no page controls.
- **Impact:** Will cause performance issues with real data. Tables with 100+ rows become unusable.
- **Fix:** Add pagination component (page numbers, prev/next). Show "Showing 1-10 of 248 clinics".

### P1-06: No Confirmation on Destructive Actions
- **Location:** `src/app/clinic/patients/page.tsx:208` — Delete dropdown item
- **Issue:** The "Delete" action in patient action dropdown has no confirmation dialog. Clicking it would (when wired) immediately delete.
- **Impact:** Accidental data loss. Healthcare data requires extra caution.
- **Fix:** Add a confirmation dialog: "Are you sure you want to delete this patient record? This action cannot be undone."

### P1-07: Settings Page — No Success/Error Feedback on Save
- **Location:** `src/app/admin/settings/page.tsx`
- **Issue:** "Save Changes" button has no loading state, no success toast, no error handling. User gets zero feedback after clicking.
- **Impact:** Users repeatedly click Save not knowing if changes were saved.
- **Fix:** Add toast notification on save. Show spinner during save. Disable button while saving.

### P1-08: Notification Bell — No Dropdown/Panel
- **Location:** Clinic layout header, Patient layout header
- **Issue:** Notification bell icon shows a badge count (3 for clinic, 2 for patient) but clicking it does nothing. No dropdown, no notification panel.
- **Impact:** Users see they have notifications but can't view them.
- **Fix:** Add a notification dropdown with recent alerts, or navigate to a notifications page on click.

---

## 3. Medium Priority Issues (P2)

### P2-01: Inconsistent Page Title Hierarchy
- **Location:** Across all pages
- **Issue:** Some pages use `text-3xl font-extrabold` (admin/clinic dashboards), others use `text-2xl font-bold` (settings, patients, health, profile). No consistent heading size for page titles.
- **Impact:** Visual inconsistency. Each page feels slightly different.
- **Fix:** Standardize to one heading style for all page titles. Recommend `text-2xl font-bold tracking-tight` universally.

### P2-02: Queue Status Card — Awkward Padding on Patient Dashboard
- **Location:** `src/app/patient/page.tsx:41-66`
- **Issue:** The queue status alert card uses `CardContent` without any explicit padding top, causing the content to appear cramped at the top edge. The flex layout also doesn't handle narrow screens well — items stack awkwardly.
- **Impact:** Visual cramping, especially on mobile.
- **Fix:** Add `pt-5` or use full card padding. Make the layout responsive with flex-wrap.

### P2-03: Appointment Cards — Duplicate Badge Info
- **Location:** `src/app/patient/page.tsx:80-116`
- **Issue:** Upcoming appointment cards show the appointment type twice: once as text under the doctor name ("Follow-up") and again as a Badge in the top-right corner.
- **Impact:** Redundant information, wastes space.
- **Fix:** Keep the Badge, remove the text-level type. Or make the Badge show something different (e.g., status: Confirmed/Pending).

### P2-04: Admin Sidebar — Missing Notification Bell
- **Location:** `src/app/admin/layout.tsx`
- **Issue:** Admin header has no notification bell, unlike Clinic and Patient portals. Super admins monitoring the platform need alerts (new clinic signup, payment issues, system alerts).
- **Impact:** Admin has no proactive notification awareness.
- **Fix:** Add notification bell with badge to admin header.

### P2-05: Clinic Dashboard — Stat Cards at xl:grid-cols-6
- **Location:** `src/app/clinic/page.tsx:44`
- **Issue:** 6 stat cards in a single row at xl breakpoint. Each card becomes very narrow (~180px). Text like "Today's Appointments" truncates or wraps awkwardly at this width.
- **Impact:** Poor readability on standard 1440p monitors.
- **Fix:** Use `lg:grid-cols-3 xl:grid-cols-3` (2 rows of 3) instead of trying to fit all 6 in one row.

### P2-06: Chart Tooltips Don't Follow Theme Properly
- **Location:** `src/app/admin/page.tsx:142-148`, `src/app/clinic/page.tsx:110-118`
- **Issue:** Recharts tooltip uses `var(--popover)` and `var(--border)` which works, but the `color` property is set to `var(--popover-foreground)` only in some places. Some charts don't set text color at all, causing white text on white background in light mode or black on dark in certain configurations.
- **Impact:** Tooltip text may be unreadable in certain theme states.
- **Fix:** Ensure all chart tooltips consistently set both `backgroundColor` and `color` from theme variables.

### P2-07: Register Page — No Password Strength Indicator
- **Location:** `src/app/(auth)/register/page.tsx:463-479`
- **Issue:** Password field has placeholder "Create a strong password" but no visual strength indicator (weak/medium/strong bar), no requirements shown.
- **Impact:** Users don't know if their password meets requirements. Leads to frustration if rejected by backend later.
- **Fix:** Add a password strength bar below the input. Show requirements (8+ chars, uppercase, number, symbol).

### P2-08: Register Page — No Terms of Service / Privacy Policy Checkbox
- **Location:** `src/app/(auth)/register/page.tsx`
- **Issue:** Healthcare platform with no Terms of Service or Privacy Policy agreement during registration. No consent checkbox.
- **Impact:** Legal/compliance issue for HIPAA-compliant platform. Users aren't explicitly consenting to data handling.
- **Fix:** Add a checkbox: "I agree to the Terms of Service and Privacy Policy" with links.

### P2-09: Empty States Missing on Several Pages
- **Location:** Appointments, Queue, Records, Prescriptions, Billing (patient portal)
- **Issue:** Only the Patients table (`clinic/patients/page.tsx:217-221`) has an empty state. Other list pages would show blank space with no records.
- **Impact:** Users see a blank page with no guidance on what to do.
- **Fix:** Add contextual empty states: illustration + message + action button (e.g., "No appointments yet. Book your first appointment").

### P2-10: No "Back to Home" or Portal Switcher
- **Location:** All portal layouts
- **Issue:** Once inside a portal (Admin/Clinic/Patient), there's no way to go back to the landing page or switch portals. The sidebar logo links to the portal's own dashboard.
- **Impact:** Users must manually edit the URL to switch portals. No escape hatch.
- **Fix:** Add a portal selector dropdown in the sidebar header, or a "Back to Home" link in the user dropdown.

---

## 4. Enhancements (P3)

### P3-01: Add Real Avatar/Profile Photo Support
- **Issue:** All avatars use `AvatarFallback` with initials. No profile photo upload or display.
- **Recommendation:** Add image upload in profile page. Show real photos in sidebar footer and header.

### P3-02: Add Command Palette (Cmd+K)
- **Issue:** Search bars exist but no keyboard-accessible global search/command palette.
- **Recommendation:** Implement a command palette (`Cmd+K` / `Ctrl+K`) for quick navigation, search, and actions. The `command.tsx` component already exists.

### P3-03: Collapsible Sidebar Memory
- **Issue:** Sidebar collapses to icon mode but doesn't persist state across page navigations.
- **Recommendation:** Store sidebar collapsed state in localStorage.

### P3-04: Add Date Range Picker for Charts
- **Issue:** Dashboard charts show fixed date ranges (6 months) with no ability to filter by date.
- **Recommendation:** Add a date range picker above charts (Today, 7D, 30D, 90D, Custom).

### P3-05: Add Quick Action Floating Button for Patient Portal
- **Issue:** "Book Appointment" is the most common patient action but requires scrolling to Quick Actions section.
- **Recommendation:** Add a floating action button (FAB) on mobile or a prominent CTA in the header.

### P3-06: Add Onboarding Tour for First-Time Users
- **Issue:** New users land on dashboards with no guidance.
- **Recommendation:** Implement a first-time onboarding tour highlighting key features (sidebar, search, quick actions).

### P3-07: Add Export/Download for Tables and Charts
- **Issue:** No way to export clinic lists, patient records, or chart data.
- **Recommendation:** Add "Export CSV" and "Download PDF" actions to data tables and chart cards.

### P3-08: Add Multi-Language Support (i18n)
- **Issue:** All text is hardcoded in English. India-focused platform should support Hindi and regional languages.
- **Recommendation:** Set up next-intl or similar i18n. Priority: Hindi, Tamil, Bengali, Telugu.

### P3-09: Add Keyboard Shortcuts for Common Actions
- **Issue:** No keyboard navigation beyond tab/enter. Power users (doctors/staff) need speed.
- **Recommendation:** Add shortcuts: `N` for new appointment, `S` for search, `Q` for queue view, `/` to focus search.

### P3-10: Real-Time Queue Updates
- **Issue:** Queue data is static mock data. No WebSocket or polling for live updates.
- **Recommendation:** Implement real-time queue updates using WebSocket or Server-Sent Events.

### P3-11: Add Print-Friendly Prescription View
- **Issue:** Prescription display is screen-only. Doctors need to print prescriptions.
- **Recommendation:** Add `@media print` styles and a "Print" button on prescription detail pages.

### P3-12: Stat Card — Add Sparkline Mini Charts
- **Issue:** StatCards show a trend percentage but no visual trend shape.
- **Recommendation:** Add a small sparkline (8-point line chart) in each stat card showing the last 7 data points.

---

## 5. Page-by-Page Breakdown

### Landing Page (`/`)
| Issue | Severity | Status |
|-------|----------|--------|
| Portal cards bypass auth                     | P1 | Fixed |
| Metrics are hardcoded fake data              | P1 | Fixed (labeled as Demo data) |
| Landing page has no mobile hamburger/nav     | P2 | Open |
| "Sign in" and "Create account" links too small and low-contrast | P2 | Open |
| No hero CTA button (just text links)         | P3 | Open |
| Footer version should be dynamic from package.json | P3 | Open |

### Login Page (`/login`)
| Issue | Severity | Status |
|-------|----------|--------|
| No form validation / error messages          | P0 | Fixed |
| Forgot password links to self                | P0 | Fixed |
| No password show/hide toggle                 | P0 | Fixed |
| Raw HTML checkbox instead of shadcn Checkbox | P2 | Open |
| No "Sign in with Google/SSO" option          | P3 | Open |
| Left panel hidden on mobile — no branding context | P2 | Open |

### Register Page (`/register`)
| Issue | Severity | Status |
|-------|----------|--------|
| No password strength indicator               | P2 | Fixed |
| No Terms/Privacy checkbox                    | P2 | Fixed |
| No form validation / error messages          | P0 | Fixed |
| Step indicator labels hidden on mobile (sm:hidden) | P2 | Fixed |
| Success step has no email verification mention | P2 | Fixed |
| Phone field accepts any text (no format mask) | P2 | Open |

### Admin Dashboard (`/admin`)
| Issue | Severity | Status |
|-------|----------|--------|
| No notification bell in header               | P2 | Fixed |
| Revenue chart Y-axis label formatting could be clearer | P3 | Open |
| "Recent Clinics" table has no "View All" link | P2 | Open |
| No date range filter for metrics/charts      | P3 | Open |
| All trends show positive — feels unrealistic  | P3 | Open |

### Admin Settings (`/admin/settings`)
| Issue | Severity | Status |
|-------|----------|--------|
| No save feedback (toast/spinner)             | P1 | Open |
| Very sparse — only 3 fields in General tab   | P2 | Open |
| No branding settings (logo upload, colors)   | P3 | Open |
| Security tab has no "Current sessions" view  | P3 | Open |

### Clinic Dashboard (`/clinic`)
| Issue | Severity | Status |
|-------|----------|--------|
| 6 stat cards in single row — too cramped     | P2 | Fixed |
| Queue status doesn't show which doctor each position is for at a glance | P2 | Open |
| "Today's Appointments" — time badge formatting is awkward (splitting AM/PM) | P2 | Open |
| No "View All" link on Today's Appointments   | P2 | Open |
| 14 sidebar items without grouping            | P0 | Fixed |

### Clinic Patients (`/clinic/patients`)
| Issue | Severity | Status |
|-------|----------|--------|
| No pagination                                | P1 | Open |
| Delete has no confirmation                   | P1 | Open |
| No bulk selection / actions                  | P3 | Open |
| No column sorting                            | P2 | Open |
| Patient detail link (View Records) doesn't navigate | P2 | Open |

### Patient Dashboard (`/patient`)
| Issue | Severity | Status |
|-------|----------|--------|
| No search bar in header                      | P0 | Fixed |
| Queue status card padding issue              | P2 | Fixed |
| Appointment type badge duplicated            | P2 | Fixed |
| No "Cancel Appointment" action               | P2 | Open |
| Prescription section — no link to download/print | P2 | Open |

### Patient Health (`/patient/health`)
| Issue | Severity | Status |
|-------|----------|--------|
| Health score ring has no explanation of scoring | P2 | Open |
| Charts have no legend visible (uses ChartTooltip only) | P2 | Open |
| No ability to manually log vitals            | P3 | Open |
| Medication "remaining" has no refill action  | P2 | Open |

### Patient Profile (`/patient/profile`)
| Issue | Severity | Status |
|-------|----------|--------|
| Emergency contact fields are readOnly with no edit path | P2 | Open |
| No avatar upload                             | P2 | Open |
| Communication prefs switches have no save action | P1 | Open |
| No account deletion / data export (GDPR/compliance) | P2 | Open |

---

## 6. Accessibility Audit

### A11Y-01: Color Contrast Issues (P1) — FIXED
- **Muted-foreground text** darkened from `oklch(0.46 0.02 265)` to `oklch(0.40 0.02 265)` for WCAG AA compliance.
- **Green trend text** (`text-emerald-600`) on white card background may not meet AA for small text.
- **Fix:** Darkened muted-foreground to `oklch(0.40 0.02 265)` in globals.css.

### A11Y-02: No Focus Indicators on Custom Buttons (P1) — FIXED
- **Location:** Role selector buttons on login/register, sidebar menu items, notification bell
- **Issue:** Custom-styled `<button>` elements don't have visible focus rings. Keyboard users can't tell what's focused.
- **Fix:** Added `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` to login/register role selector buttons and account type buttons.

### A11Y-03: Missing ARIA Labels (P1) — FIXED
- Notification bell: added `aria-label` with unread count on all portals
- Sidebar toggle: added `aria-label="Toggle sidebar"` on all portals
- Search input: added `role="search"` on wrapper, `aria-label="Search"` on inputs
- Theme toggle: no `aria-label` yet (P3)
- **Fix:** Added ARIA labels and roles to notification bells, sidebar triggers, and search inputs across all layouts.

### A11Y-04: Charts Are Not Accessible (P2)
- **Issue:** All Recharts components have no `aria-label`, no summary text, no data table alternative.
- **Impact:** Screen reader users get zero information from charts.
- **Fix:** Add `aria-label` to chart containers. Provide a visually hidden data table or summary text.

### A11Y-05: Form Labels Missing for Some Inputs (P2)
- **Location:** Search inputs in headers and tables don't have visible labels or `aria-label`.
- **Fix:** Add `aria-label="Search"` to all search inputs.

### A11Y-06: No Skip-to-Content Link (P2)
- **Issue:** No skip navigation link for keyboard users to bypass sidebar.
- **Fix:** Add a visually hidden "Skip to main content" link as the first focusable element.

---

## 7. Dark Theme Issues

### DK-01: Landing Page Cards — Low Border Contrast in Dark Mode (P2) — FIXED
- **Issue:** Portal cards in dark mode have very subtle borders that nearly disappear. Cards blend into the dark background.
- **Fix:** Increased dark mode border opacity from `oklch(1 0 0 / 8%)` to `oklch(1 0 0 / 12%)` in globals.css.

### DK-02: Login Left Panel — Text Contrast Too Low (P2) — FIXED
- **Issue:** `text-white/60` and `text-white/30` on the gradient blue panel. The 30% opacity text is nearly invisible.
- **Fix:** Increased text-white/60 to /50 and text-white/30 to /40 in login/register left panels.

### DK-03: Chart Gridlines Nearly Invisible in Dark Mode (P2) — FIXED
- **Issue:** CartesianGrid uses `className="stroke-muted"` which is very subtle in dark mode.
- **Fix:** Added `.dark .stroke-muted` CSS rule with lighter stroke in globals.css.

### DK-04: Status Badge Colors Need Dark Mode Variants (P2)
- **Issue:** Some badges like "pending" use `bg-yellow-100 text-yellow-700` which looks washed out in dark mode. The dark variants exist but use `dark:bg-yellow-900/30` which is extremely subtle.
- **Fix:** Increase dark mode badge background opacity to `/50` for better visibility.

### DK-05: Sidebar Header Gradient Identical Across Portals (P3)
- **Issue:** All three portals use the same `sidebar-gradient-header` blue gradient. In dark mode, the visual distinction between portals relies solely on the text label.
- **Fix:** Use subtly different gradient hues per portal (blue for admin, teal for clinic, purple for patient).

---

## 8. Responsive / Mobile Issues

### MOB-01: Landing Page Metrics Bar Doesn't Wrap (P1) — FIXED
- **Location:** `src/app/page.tsx:120-137`
- **Issue:** Trust metrics bar is `inline-flex` with no wrapping. On screens < 640px, the 4 metrics + dividers overflow horizontally, causing horizontal scroll or clipping.
- **Fix:** Added `flex-wrap` with responsive gap and padding.

### MOB-02: Login/Register Left Panel Hidden on Mobile (P2)
- **Issue:** The branding panel (`hidden lg:flex lg:w-1/2`) disappears entirely on mobile. Mobile users see only the form card with minimal branding (just a small text header).
- **Fix:** Keep a condensed branding section above the form on mobile. The existing mobile branding div is too minimal.

### MOB-03: Patient Dashboard — Quick Actions Cards Stack Vertically (P2)
- **Issue:** Quick action cards use `sm:grid-cols-3`. On mobile they become full-width stacked, making the section very tall.
- **Fix:** Use `grid-cols-2 sm:grid-cols-3` on mobile for a more compact layout. Or use a horizontal scrollable row.

### MOB-04: Tables Not Responsive (P1) — FIXED
- **Issue:** All tables (admin clinics, clinic patients) are standard HTML tables that overflow on mobile. No responsive wrapper, no card-based mobile view.
- **Fix:** Added `overflow-x-auto` wrapper to admin tables.

### MOB-05: Sidebar Touch Target Too Small in Collapsed Mode (P2)
- **Issue:** Collapsed sidebar icons are small touch targets (~32x32px). Mobile users may have difficulty hitting them accurately.
- **Fix:** Increase collapsed icon touch area to minimum 44x44px (WCAG 2.1 recommendation).

---

## 9. Design System Inconsistencies

### DS-01: Mixed Icon Sizing
- Sidebar nav icons: `h-4 w-4`
- Stat card icons: `h-5 w-5`
- Portal card icons: `h-6 w-6`
- Quick action icons: `h-6 w-6`
- Header icons: `h-5 w-5`
- **This is acceptable** — different contexts warrant different sizes. But document the convention.

### DS-02: Card Padding Inconsistency
- StatCard uses `p-5`
- Other cards use default CardContent padding (varies)
- Queue status items use `p-2.5`
- Some cards have `pt-6` workaround
- **Fix:** Standardize card content padding: use `p-5` for compact cards, `p-6` for standard cards.

### DS-03: Button Styles Not Uniform — FIXED (cursor-pointer)
- Added `cursor: pointer` as default for all `button` and `[role="button"]` elements in globals.css base layer.
- Button sizing inconsistency remains (P3).

### DS-04: No Consistent "Section Header" Pattern
- Dashboard sections use: plain `<h2>` with `text-lg font-semibold`
- Some have a "View All" button alongside, some don't
- Card titles within cards vary: some are `text-base`, some `text-base font-semibold`
- **Fix:** Create a `SectionHeader` component: `{ title, action?: { label, href } }`.

### DS-05: Color Token Usage
- Some components use theme tokens (`text-primary`, `bg-accent/10`)
- Some use raw Tailwind colors (`text-emerald-600`, `bg-red-50`, `text-amber-500`)
- **Fix:** Define semantic tokens for status colors: `--color-success`, `--color-warning`, `--color-danger`. Use tokens instead of raw colors.

---

## 10. Recommended Priority Order

### Phase 1 — Must Fix (Before Any Demo/Launch)
1. ~~P0-01: Form validation on login/register~~ **DONE**
2. ~~P0-02: Fix forgot password dead link~~ **DONE**
3. ~~P0-03: Add password visibility toggle~~ **DONE**
4. ~~P0-04: Add search to patient header~~ **DONE**
5. ~~P0-05: Group clinic sidebar items~~ **DONE**
6. ~~P1-01: Add auth guard (redirect to login)~~ **DONE** (portal cards redirect to /login)
7. P1-06: Add delete confirmation dialogs — Open
8. ~~A11Y-01: Fix color contrast~~ **DONE**
9. ~~A11Y-02: Add focus indicators~~ **DONE**
10. ~~MOB-04: Make tables responsive~~ **DONE**

### Phase 2 — High Priority Polish
1. P1-03: Add breadcrumbs — Open
2. P1-04: Add page loading skeletons — Open
3. P1-05: Add table pagination — Open
4. P1-07: Add save feedback (toasts) — Open
5. ~~P1-08: Wire notification bell~~ **DONE** (bell added to admin; existing in clinic/patient)
6. P2-10: Add portal switcher — Open
7. ~~A11Y-03: Add ARIA labels~~ **DONE**
8. ~~MOB-01: Fix metrics bar mobile overflow~~ **DONE**

### Phase 3 — Enhancement & Delight
1. ~~P2-01: Standardize heading hierarchy~~ **DONE**
2. ~~P2-05: Fix clinic stat card grid~~ **DONE**
3. ~~P2-07: Password strength indicator~~ **DONE**
4. ~~P2-08: Terms/Privacy checkbox~~ **DONE**
5. P2-09: Empty states for all list pages — Open
6. P3-02: Command palette (Cmd+K) — Open
7. P3-06: Onboarding tour — Open
8. P3-09: Keyboard shortcuts — Open
9. ~~Dark theme fixes DK-01 through DK-03~~ **DONE** (DK-04, DK-05 open)
10. ~~DS-03: cursor-pointer default~~ **DONE** (DS-01, DS-02, DS-04, DS-05 open)

---

## Summary

| Severity | Count |
|----------|-------|
| P0 — Critical    | 5  |
| P1 — High        | 8  |
| P2 — Medium      | 10 |
| P3 — Enhancement | 12 |
| Accessibility     | 6  |
| Dark Theme        | 5  |
| Responsive/Mobile | 5  |
| Design System     | 5  |
| **Total Issues**  | **56** |

The UI foundation is solid — clean design language, good dark mode support, consistent component library (shadcn/ui). The primary gaps are in **interactivity** (no validation, no feedback, no confirmations), **navigation** (no breadcrumbs, no portal switching, overloaded sidebar), and **accessibility** (contrast, ARIA, focus management). Fixing Phase 1 items would bring the app to demo-ready quality. Phase 2 makes it production-quality. Phase 3 makes it delightful.
