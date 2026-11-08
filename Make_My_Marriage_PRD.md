# MAKE MY MARRIAGE

## Product Requirements Document (PRD)

**Version:** 1.0\
**Stage:** MVP\
**Market:** India\
**Development environment:** Google Antigravity\
**Stack:** React + Vite + TypeScript, Tailwind CSS, Framer Motion,
Supabase, Vercel

------------------------------------------------------------------------

## 1. Product Overview

Make My Marriage is an all-in-one wedding management platform where the
bride's family and groom's family can manage wedding expenses,
coordinate tasks, share announcements and discussions, organize guests,
collect RSVPs, and create digital wedding invitations in one shared
workspace.

**Core value proposition:** One Wedding. Two Families. One Shared
Workspace.

Example: wedding budget ₹20,00,000; groom's family expenses ₹12,00,000;
bride's family expenses ₹1,50,000; combined recorded expenses
₹13,50,000; remaining budget ₹6,50,000.

The dashboard must distinguish total budget, recorded expenses, amount
paid, outstanding payments, and remaining budget. Remaining budget =
total budget minus total recorded expenses, not total paid.

## 2. Product Goals

-   Provide a shared workspace for both families.
-   Track budget, expenses, payments, and family-wise spending.
-   Coordinate family members, tasks, events, announcements,
    discussions, and decisions.
-   Manage guests and RSVP responses.
-   Create beautiful, customizable, shareable digital invitations.
-   Provide an administrator panel for wedding configuration and
    permissions.
-   Protect private wedding data with authentication and database
    security.
-   Deliver a premium, minimal, mobile-first experience.

## 3. User Roles

### Wedding Admin

Manage wedding details, budget, expenses, members, roles, tasks, events,
guests, invitations, RSVP settings, and workspace configuration.

### Family Admin

Manage permitted family members, expenses, tasks, announcements, and
discussions within assigned permissions.

### Family Member

View permitted workspace data, add expenses if allowed, update assigned
tasks, and participate in discussions.

### Guest

Open a public invitation and submit an RSVP without creating a dashboard
account.

Never allow guests to access private dashboards, expenses, discussions,
or guest contact lists.

## 4. MVP Modules

1.  Authentication and onboarding.
2.  Wedding setup.
3.  Dashboard.
4.  Expense Tracker.
5.  Family Coordination.
6.  Tasks and Events.
7.  Guest Management.
8.  RSVP Management.
9.  Digital Invitation Editor.
10. Public Invitation.
11. Admin Settings.
12. In-app Notifications.
13. Security, testing, and deployment.

All primary buttons must work. Use real Supabase data and operations,
not a frontend-only demo or fake success states.

## 5. Design and UX

Build a premium SaaS dashboard combined with elegant Indian wedding
aesthetics.

Suggested design tokens: - Warm ivory/off-white backgrounds. - Deep
burgundy/wine accents. - Muted gold highlights. - Charcoal text and soft
neutral borders. - Green for paid/success, amber for pending, red for
errors/overdue.

Use generous spacing, clear typography, rounded cards, subtle shadows,
consistent icons, practical charts, and restrained animations. Avoid
clutter, excessive gradients, and distracting effects.

The public invitation has a more expressive design with elegant
typography, optional floral/ornamental details, couple photos, event
timeline, venue details, and a responsive RSVP form. Respect
reduced-motion preferences.

Support desktop, laptop, tablet, and mobile. Include loading, empty,
success, error, permission-denied, and not-found states. Use semantic
HTML, keyboard-friendly controls, visible focus states, and accessible
contrast.

## 6. Routes and Navigation

  Page                   Route                  Access
  ---------------------- ---------------------- ------------------------
  Login                  `/login`               Public
  Signup                 `/signup`              Public
  Password reset         `/forgot-password`     Public
  Wedding setup          `/setup`               Authenticated
  Dashboard              `/dashboard`           Authorized members
  Expenses               `/expenses`            Authorized members
  Tasks & Events         `/tasks-events`        Authorized members
  Family & Discussions   `/family`              Authorized members
  Guests & RSVP          `/guests`              Authorized members
  Invitation Editor      `/invitation/editor`   Authorized admins
  Settings               `/settings`            Authorized admins
  Profile                `/profile`             Authenticated
  Public Invitation      `/invite/:slug`        Public, published only
  Not Found              `*`                    All

Sidebar: Dashboard, Expenses, Tasks & Events, Family & Discussions,
Guests & RSVP, Invitation Editor, Settings. Add profile, notifications,
and logout controls. One active wedding per user for MVP, but design
schema to allow future multi-wedding support.

## 7. Authentication and Wedding Setup

Use Supabase Auth for email/password signup, login, logout, email
verification, password reset, session persistence, and protected routes.
Never store plaintext passwords.

Create a setup wizard: 1. Couple details: bride name, groom name,
optional couple photo. 2. Wedding details: date, optional time, venue,
address, optional map URL, description. 3. Budget: total budget and
currency (default INR/₹). 4. Family setup: identify creator's family
side and optionally add/invite members. 5. Completion: create workspace
and redirect to dashboard.

Validate required fields, allow optional details to be completed later,
prevent duplicate creation on repeated submissions, and persist data.

## 8. Dashboard

Display: - Total wedding budget. - Total recorded expenses. - Remaining
budget. - Total paid. - Outstanding payments. - Bride's family
expenses. - Groom's family expenses. - Upcoming events. - Budget
progress. - Category-wise expense chart. - Family-wise spending
comparison. - Recent expenses and activities. - Pending tasks and
payments. - Recent announcements. - Quick actions: Add Expense, Create
Task, Add Guest, Add Family Member, Create Announcement, Edit
Invitation.

Calculations: - **Total Budget:** configured wedding budget. -
**Recorded Expenses:** sum of expense amounts, regardless of payment
status. - **Total Paid:** sum of actual paid amounts. - **Outstanding:**
sum of unpaid balances. - **Remaining Budget:** total budget minus
recorded expenses. - **Budget Utilization:** recorded expenses / budget
× 100; handle zero budget safely.

Calculate values from database records, never hardcode dashboard totals.
Refresh values after successful mutations. Charts must reflect
underlying data.

## 9. Expense Tracker

### Expense fields

ID, wedding ID, category, name, description, total amount, amount paid,
family side, creator, optional vendor, expense date, optional due date,
payment method, optional receipt path, timestamps.

Use numeric database types suitable for currency and avoid
floating-point currency arithmetic.

### Default categories

-   Venue and Decoration
-   Catering and Food
-   Clothing and Jewellery
-   Photography and Videography
-   Makeup and Salon
-   Invitations and Printing
-   Transportation
-   Accommodation
-   Wedding Gifts
-   Religious Ceremonies
-   Entertainment and Music
-   Miscellaneous

Admins can create, edit, or deactivate categories and allocate category
budgets.

### Features

-   Create, view, edit, and authorized delete.
-   Search by expense name.
-   Filter by category, family side, payment status, and date.
-   Sorting and pagination where appropriate.
-   Track who created a record separately from which family is
    responsible.
-   Record amount paid, balance, payment method, due date, and optional
    receipt.
-   Family-wise and combined reports.
-   Category budget vs actual spending.
-   CSV export.
-   Confirmation before deletion.
-   Protect financial records and receipt files.

Payment states: Paid, Pending, Partially Paid. Paid means amount paid
equals full amount; Pending means zero paid; Partially Paid means some
but not all paid. Prefer deriving status from amounts. Amount must be
greater than zero; paid amount must be between zero and total amount.
Category must belong to the same wedding.

Use private Supabase Storage for receipts; validate file type/size and
enforce authorized access.

## 10. Family Coordination

### Members

Store name, email, optional phone, family side (Bride's Family/Groom's
Family), role, membership status, and linked user account if available.

Support member invitations, pending/accepted status, duplicate
prevention, revoking pending invitations, and secure acceptance. Knowing
the public invitation URL must never grant workspace access.

### Announcements

Create, view, edit, delete, pin, and unpin announcements. Store title,
body, author, timestamps, and pinned state.

### Discussions and decisions

Create discussion topics, add comments, edit/delete permitted content,
record important decisions and meeting notes, and pin important topics
if enabled. Examples: venue selection, catering decision, shopping
arrangements, and event responsibilities.

### Activity history

Record important changes such as expenses, tasks, events, announcements,
guests, and invitation publishing. Never log secrets or private tokens.

**MVP limitation:** no real-time chat, voice calls, or video calls.

## 11. Tasks and Events

### Tasks

Fields: wedding ID, title, description, assignee, creator, due date,
priority, status, timestamps.

Priorities: Low, Medium, High, Urgent.\
Statuses: To Do, In Progress, Completed.

Features: create, edit, assign, update status, set deadlines, delete if
authorized, search, filter by status/priority/assignee, and view
overdue/completed tasks.

### Events

Fields: wedding ID, name, description, start/end time, venue, address,
map URL, organizer, timestamps.

Default event types: Engagement, Haldi, Mehendi, Sangeet, Wedding
Ceremony, Reception, Custom Event.

Provide monthly calendar and upcoming events list. Store dates/times
consistently and display in the wedding's configured timezone.

## 12. Guest Management and RSVP

### Guest fields

Wedding ID, full name, optional phone/email, family side, optional
group/household, optional notes, invitation status, timestamps.

Features: add/edit/remove, search, filter by family and RSVP status, CSV
import/export. Validate CSV rows and report invalid rows. Do not
automatically send invitations during import.

Invitation status: Not Sent, Shared. Do not claim WhatsApp delivery
based only on a user marking an invitation shared.

### RSVP

Public form supports guest name, Attending / Not Attending / Maybe,
optional attendee count, and optional message. Admin configures RSVP
deadline.

Dashboard shows total guest records, confirmed, declined, maybe, no
response, and expected attendee count. Distinguish guest records from
actual attendee totals.

Prevent uncontrolled duplicate submissions and secure RSVP updates. A
public slug alone must not authorize editing any guest's response. Apply
validation and reasonable abuse protection. Never expose private contact
details publicly.

## 13. Digital Invitation System

Each wedding has a unique slug, e.g. `/invite/rahul-priya-wedding`.
Enforce slug uniqueness.

Invitation fields: wedding ID, slug, template key, theme configuration,
invitation content, publication state, publication timestamp,
timestamps. Content includes couple names, photos, date/time,
venue/address/map, welcome message, optional family names, event
schedule, RSVP deadline, theme, colors, fonts, and optional background.

Templates: 1. Royal Indian Wedding. 2. Traditional Floral Wedding. 3.
Modern Minimal Wedding. 4. Elegant Ivory and Gold. 5. Contemporary
Romantic Wedding.

Editor features: - Select template. - Change colors and fonts. -
Upload/replace couple photos and background. - Edit text, venue, and
event details. - Configure RSVP. - Preview, save, publish, and
unpublish.

Use validated JSONB for structured theme/content settings; do not allow
executable arbitrary content. Validate image types and sizes, preview
uploads, optimize images, and restrict editing to authorized admins.

Use Framer Motion for subtle opening transitions, text fades, section
transitions, and image reveals. Respect reduced motion.

Public invitation displays couple names, welcome message, date/time,
venue/address, map link, events, optional photos/family details, and
RSVP. Public visitors can only read published, intentionally public
fields. They must never access private wedding records.

### WhatsApp sharing

Use a WhatsApp-compatible share URL or device share interface. Include a
prefilled message and public invitation URL. Let the user review and
send. Do not implement automated WhatsApp messaging in MVP.

## 14. Admin Settings

Wedding settings: names, date/time, venue/address, map URL, budget,
currency, timezone, description, events.

Expense settings: categories, category budgets, relevant payment
preferences, and permissions.

Family settings: add/remove members, roles, invitation status, access
permissions, revoke membership.

Invitation settings: template, colors, fonts, photos, text, publishing,
RSVP deadline.

Guest settings: guest records, RSVP responses, RSVP options, export.

## 15. In-App Notifications

Types: task assigned, deadline approaching, overdue task, new
announcement, invitation accepted, new RSVP, upcoming event, pending
payment reminder.

Fields: wedding ID, recipient user ID, type, message, related record,
read status, created timestamp.

Users can view notifications, mark read/unread, and open related
records. Notifications must only be visible to intended recipients.
Email and automated WhatsApp reminders are future scope; implement only
in-app notifications for MVP unless a real reminder mechanism is
explicitly added.

## 16. Database Schema

Use Supabase PostgreSQL. Initial tables:

1.  `profiles`: user ID, full name, avatar, timestamps.
2.  `weddings`: creator, couple names, date/time, venue/address, map
    URL, budget, currency, timezone, description, timestamps.
3.  `wedding_members`: wedding ID, user ID, family side, role,
    membership status, timestamps.
4.  `wedding_invitations`: pending membership invitations, invitee
    email, role/family side, secure token or token hash, expiry/status,
    timestamps.
5.  `expenses`: wedding ID, category ID, name, description, amount,
    amount paid, family side, creator, vendor, dates, payment method,
    receipt path, timestamps.
6.  `expense_categories`: wedding ID, name, allocated budget, active
    flag, timestamps.
7.  `tasks`: wedding ID, title, description, assignee, creator, due
    date, priority, status, timestamps.
8.  `events`: wedding ID, name, description, start/end time,
    venue/address, map URL, organizer, timestamps.
9.  `discussions`: wedding ID, title, content, creator, pinned flag,
    timestamps.
10. `discussion_comments`: wedding ID, discussion ID, creator, content,
    timestamps.
11. `announcements`: wedding ID, title, content, creator, pinned flag,
    timestamps.
12. `guests`: wedding ID, name, optional phone/email, family side,
    group, notes, invitation status, timestamps.
13. `rsvps`: wedding ID, guest ID, attendance status, attendee count,
    message, submitted/updated timestamps.
14. `invitations`: wedding ID, unique slug, template key, theme JSONB,
    invitation content JSONB, published flag, published timestamp,
    timestamps.
15. `notifications`: wedding ID, recipient user ID, type, message,
    related entity, read status, timestamp.
16. `activity_logs`: wedding ID, actor, action, entity reference, safe
    metadata, timestamp.
17. `expense_attachments` if multiple receipts per expense are needed.

Use UUIDs, foreign keys, checks, unique constraints, and indexes.
Enforce that related records belong to the same wedding. Prevent
duplicate active memberships and duplicate RSVP records according to the
chosen RSVP model. Add indexes for common filters such as wedding ID,
dates, status, and slug.

## 17. Security and RLS

Security is mandatory even for a personal MVP.

-   Enable RLS on all private tables.
-   Members can access only weddings they belong to.
-   Enforce permissions for reads, inserts, updates, and deletes.
-   Users cannot assign themselves admin roles.
-   Notifications are recipient-specific.
-   Guest contact details and receipts are private.
-   Public invitation access exposes only published public fields.
-   Use a scoped public endpoint or secure database function; never
    expose full wedding records publicly.
-   Public RSVP uses controlled, validated submission, not unrestricted
    anonymous writes.
-   Validate RSVP deadline, attendee count, and duplicate/update rules.
-   Use reasonable abuse protection.
-   Frontend may use the Supabase publishable key.
-   Never expose service-role credentials in client-side code.
-   Use trusted server-side code or secure database functions for
    privileged operations.
-   Validate input, file types, upload sizes, and safe rendering of
    user-generated content.
-   Keep environment secrets out of Git.

## 18. Technology Stack

-   React
-   Vite
-   TypeScript
-   Tailwind CSS
-   React Router
-   Framer Motion
-   Lucide React
-   Supabase PostgreSQL
-   Supabase Auth
-   Supabase Storage
-   Supabase RLS
-   Supabase Edge Functions or secure server-side functions where needed
-   Vercel
-   GitHub

Use compatible stable versions. Avoid unnecessary dependencies. Use
reusable components, typed models, centralized validation, organized
database queries, and migrations.

## 19. Suggested Project Structure

``` text
make-my-marriage/
├── public/
├── src/
│   ├── app/                 # App, router, providers
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── charts/
│   │   └── feedback/
│   ├── layouts/             # DashboardLayout, PublicLayout
│   ├── pages/               # auth, setup, dashboard, expenses, family,
│   │                        # tasks-events, guests, invitation, settings
│   ├── features/            # auth, weddings, expenses, tasks, events,
│   │                        # family, discussions, guests, rsvp,
│   │                        # invitations, notifications
│   ├── hooks/
│   ├── lib/                 # supabase client, validation, utils
│   ├── types/
│   ├── styles/
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed.sql
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

Keep structure practical; avoid unnecessary abstraction.

## 20. Development Roadmap

### Phase 1 --- Foundation

1.  Inspect existing files and preserve working code.
2.  Set up React, Vite, TypeScript, Tailwind, Router, Framer Motion,
    icons.
3.  Establish design system and responsive layout.
4.  Configure Supabase.
5.  Build signup, login, password reset, session handling, and protected
    routes.
6.  Build wedding setup wizard.
7.  Add initial migrations and RLS policies. **Deliverable:** working
    authentication, setup, and protected navigation.

### Phase 2 --- Dashboard and Expense Tracker

1.  Dashboard cards and calculations.
2.  Expense list and CRUD.
3.  Categories and family-side tracking.
4.  Payment amounts and statuses.
5.  Search, filters, budget comparisons.
6.  Receipt uploads and CSV export.
7.  Test financial edge cases. **Deliverable:** fully functional
    database-backed expense system.

### Phase 3 --- Family Coordination

1.  Members, roles, invitations.
2.  Announcements.
3.  Discussion topics and comments.
4.  Notes and activity history.
5.  Test permissions. **Deliverable:** shared family workspace.

### Phase 4 --- Tasks and Events

1.  Task CRUD, assignments, deadlines, priority/status.
2.  Event management.
3.  Calendar and upcoming event views.
4.  Time-zone tests. **Deliverable:** functional planning and schedule
    module.

### Phase 5 --- Guests and RSVP

1.  Guest CRUD and family grouping.
2.  CSV import/export.
3.  Public RSVP submission.
4.  RSVP summaries and filtering.
5.  Test duplicate submissions and privacy. **Deliverable:** guest and
    attendance management.

### Phase 6 --- Digital Invitations

1.  Templates and invitation editor.
2.  Colors, fonts, photos, text, events.
3.  Preview, save, publish, unpublish.
4.  Unique public URL.
5.  Public invitation page.
6.  WhatsApp sharing and RSVP integration.
7.  Mobile and accessibility testing. **Deliverable:** complete
    invitation workflow.

### Phase 7 --- Settings and Notifications

1.  Complete settings.
2.  In-app notifications.
3.  Read/unread states.
4.  Review permissions. **Deliverable:** complete administration
    experience.

### Phase 8 --- QA and Deployment

1.  Test all user journeys.
2.  Test calculations and edge cases.
3.  Test RLS and cross-wedding isolation.
4.  Test public/private data separation.
5.  Test responsive UI, loading, and errors.
6.  Configure production environment.
7.  Run production build.
8.  Deploy to Vercel and verify. **Deliverable:** tested, deployed MVP.

## 21. Out of Scope for MVP

Do not build yet: - Payment gateway or online wedding contributions. -
Vendor marketplace. - AI wedding planner. - Real-time chat, voice, or
video. - Automated WhatsApp messaging. - QR-code guest check-in. -
Advanced seating planner. - Subscription billing. - Complex analytics. -
Automated vendor contracts. - Advanced calendar integrations. -
Multi-wedding account management.

## 22. Non-Functional Requirements

-   Fast, responsive pages.
-   Optimize images and avoid unnecessary queries.
-   Pagination where appropriate.
-   Reliable network error handling.
-   Prevent duplicate submissions where possible.
-   Do not show success until operations succeed.
-   Maintain consistency after refresh.
-   Semantic HTML and keyboard navigation.
-   Visible focus states and sufficient contrast.
-   Reduced-motion support.
-   Reusable components and typed data.
-   Database migrations and setup documentation.

## 23. Acceptance Criteria

### Authentication

-   Signup, login, logout, and password reset work.
-   Private routes require authentication.
-   Unauthorized users cannot access wedding workspaces.

### Wedding Setup

-   Admin can create and update wedding details.
-   Data persists after refresh.
-   Dashboard reflects setup data.

### Expenses

-   Authorized CRUD works.
-   Family attribution is correct.
-   Paid and outstanding balances are correct.
-   Budget totals update after mutations.
-   Search, filters, receipt access, and CSV export work.
-   Data is stored in Supabase.

### Family

-   Admin can manage membership and roles.
-   Members can access permitted announcements/discussions.
-   Users cannot elevate their own roles.
-   Wedding data is isolated.

### Tasks and Events

-   Tasks can be assigned and updated.
-   Deadlines and statuses work.
-   Events appear in the calendar and upcoming list.
-   Time zones are handled consistently.

### Guests and RSVP

-   Guest CRUD and CSV flows work.
-   Valid public RSVPs can be submitted.
-   Counts are correct.
-   Guest contact information remains private.
-   Unauthorized RSVP updates are blocked.

### Invitations

-   Admin can customize and publish invitations.
-   Slugs are unique.
-   Public page displays correct details.
-   Unpublished invitations are inaccessible publicly.
-   WhatsApp share flow works.
-   Public page is mobile-friendly.

### Security and Deployment

-   RLS is enabled and tested.
-   No service-role secrets appear in frontend code.
-   Public routes expose only intended data.
-   Production build succeeds.
-   Deployment works on desktop and mobile.
-   Core user journeys are tested.

## 24. Future Roadmap

Potential future features: - Payment history and vendor payment
schedules. - Advanced financial analytics, PDF reports, receipt OCR,
budget alerts. - Real-time family chat and document sharing. -
Additional invitation themes, custom domains, QR invitations, digital
albums, invitation analytics. - QR guest check-in, seating plans, meal
preferences, event-specific guest access. - Approved WhatsApp
integrations, email notifications, calendar sync, online payments,
AI-assisted planning.

Only add these after the MVP is stable and validated.

## 25. Google Antigravity Instructions

Act as the lead full-stack engineer. Treat this PRD as the source of
truth.

### Before coding

1.  Inspect existing files and installed dependencies.
2.  Identify current technologies and working functionality.
3.  Preserve valid existing code.
4.  Do not overwrite files blindly.
5.  Create an implementation checklist and database plan.

### Implementation discipline

-   Build one phase at a time.
-   Complete Phase 1 and verify it before Phase 2.
-   For each feature, implement UI, real database operations,
    validation, permissions, loading/empty/error/success states, and
    tests.
-   Do not generate the entire app in one untested pass.
-   Do not use fake data as a substitute for database functionality.
-   Do not use localStorage instead of Supabase persistence.
-   Do not leave primary buttons nonfunctional.

### Security and database

-   Configure RLS and role permissions.
-   Use migrations for schema changes.
-   Add constraints and indexes.
-   Secure storage and public RSVP operations.
-   Never expose service-role secrets.
-   Create `.env.example` and document configuration.

### Testing

After each phase, run the app, available checks, and production build
where practical. Check console errors, network failures, forms, database
operations, responsive layouts, authorization, and edge cases. Fix
issues before proceeding.

### Reporting

At the end of each phase, report: - Features completed. - Files
created/changed. - Migrations and security policies added. - Tests
performed and results. - Required configuration. - Known limitations and
remaining work.

Do not claim a feature works unless it has actually been implemented and
tested.

## 26. Final Product Principle

Make My Marriage must be a genuinely useful wedding management
application, not just a beautiful wedding website.

Its three core pillars are:

1.  **Manage Money:** combined budget, expenses, payments, and pending
    balances.
2.  **Manage People:** family members, tasks, discussions, events, and
    guests.
3.  **Manage Invitations:** customizable digital cards, unique URLs,
    sharing, and RSVP.

Build a secure, maintainable, fully functional MVP first. Prioritize
Authentication + Wedding Setup + Dashboard + Expense Tracker, then build
Family Coordination, Tasks & Events, Guests & RSVP, and Digital
Invitations. Add advanced features only after the core product is
reliable.
