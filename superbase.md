# Make My Marriage — Database & Backend Specification

**Project:** Make My Marriage
**Database:** Supabase PostgreSQL
**Authentication:** Supabase Auth
**Security:** PostgreSQL Row Level Security (RLS)
**File Storage:** Supabase Storage
**Frontend:** React + Vite + TypeScript + Tailwind CSS
**Development Environment:** Google Antigravity
**Status:** Implementation specification

---

## 1. Purpose

Build the database and backend foundation for Make My Marriage, a wedding planning platform where users and families can manage wedding expenses, tasks, events, guests, invitations, discussions, announcements, and wedding-related information.

Antigravity must follow this document when implementing the backend.

### Important rules

* Use Supabase as the only database platform.
* Use PostgreSQL through Supabase.
* Use Supabase Auth for authentication.
* Use Supabase Row Level Security (RLS) for data access control.
* Use Supabase Storage for wedding-related file uploads.
* Use TypeScript for application code.
* Do not install or configure MongoDB.
* Do not use Mongoose.
* Do not create a separate Express/MongoDB backend unless a future requirement explicitly needs one.
* Do not place the Supabase service-role key in frontend code.
* Do not bypass RLS to make the application work.
* Keep the existing product requirements and `DESIGN.md` as the source of truth for the UI and user experience.

Official documentation:

* Supabase documentation: https://supabase.com/docs
* Supabase Dashboard: https://supabase.com/dashboard
* Supabase JavaScript client: https://supabase.com/docs/reference/javascript/introduction
* Supabase Auth: https://supabase.com/docs/guides/auth
* PostgreSQL RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
* Supabase CLI: https://supabase.com/docs/guides/local-development/cli/getting-started

---

## 2. Core Architecture

Use the following architecture:

```text
React + Vite + TypeScript
          |
          v
Supabase JavaScript Client
          |
          +---- Supabase Auth
          |
          +---- PostgreSQL Database
          |         |
          |         +---- Row Level Security
          |
          +---- Supabase Storage
          |
          +---- Supabase Realtime (only where needed)
```

The frontend should access Supabase through the official Supabase JavaScript client.

Database authorization must be enforced by PostgreSQL RLS policies, not just by hiding buttons or filtering data in React.

### Application responsibilities

**Frontend**

* Render the UI defined by `DESIGN.md`.
* Handle forms and client-side validation.
* Manage loading, empty, success, and error states.
* Use the authenticated Supabase client.
* Never contain privileged database credentials.

**Supabase**

* Authenticate users.
* Store application records.
* Enforce database permissions.
* Store private wedding documents and files.
* Provide realtime updates where appropriate.

---

## 3. Environment Configuration

Create `.env.example`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Use the current Supabase publishable key if available. A legacy anon key can be used where applicable.

Create the local `.env` file using the project's actual Supabase project URL and publishable/anon key.

### Security requirements

* Never commit real secrets to Git.
* Never expose the `service_role` key or secret API keys through `VITE_` variables.
* Do not use privileged keys in browser code.
* Do not hardcode credentials in source files.
* Add `.env` to `.gitignore`.
* If a privileged operation is needed, implement it through a properly secured server-side or Supabase Edge Function endpoint.
* Verify authorization inside every privileged function.

Create a Supabase client at:

`src/lib/supabase.ts`

Use `@supabase/supabase-js`.

The client must read configuration from environment variables and provide a clear error if required variables are missing.

---

## 4. Database Naming and Conventions

Use the following conventions:

* Table names: `snake_case`, plural.
* Column names: `snake_case`.
* Primary keys: UUID.
* Timestamps: `timestamptz`.
* Currency amounts: `numeric(12,2)`.
* Dates without a time: `date`.
* Use foreign keys for relational integrity.
* Add appropriate indexes for foreign keys and frequently filtered columns.
* Use database constraints to prevent invalid records.
* Use UTC timestamps internally.
* Display dates and times in the user's selected locale.
* Use explicit foreign-key deletion behavior.
* Do not store arrays of complex relational records in JSON when a separate table is more appropriate.

Standard timestamps:

```sql
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now()
```

Create a reusable trigger function that updates `updated_at` on tables that contain this column.

Use database migrations for all schema changes. Do not rely on manually editing the production database without recording the change in a migration.

---

## 5. Main Database Tables

Create the following tables.

### 5.1 `profiles`

Stores application profile information for authenticated users.

Columns:

* `id uuid primary key references auth.users(id) on delete cascade`
* `full_name text`
* `avatar_url text`
* `phone text`
* `created_at timestamptz`
* `updated_at timestamptz`

Requirements:

* Every profile belongs to one Supabase Auth user.
* Users can read their own profile.
* Users can update permitted fields on their own profile.
* Users must not change their own ID or privileged attributes.
* Do not store passwords in this table.
* Authentication credentials are managed by Supabase Auth.

Create a secure trigger or an appropriate application flow to create profiles for new users. The trigger must not trust arbitrary user-provided metadata for privileged fields.

### 5.2 `weddings`

Represents an individual wedding workspace.

Columns:

* `id uuid primary key default gen_random_uuid()`
* `name text not null`
* `created_by uuid not null references auth.users(id)`
* `partner_one_name text`
* `partner_two_name text`
* `wedding_date date`
* `venue_name text`
* `venue_address text`
* `budget numeric(12,2) not null default 0`
* `currency_code text not null default 'INR'`
* `notes text`
* `created_at timestamptz`
* `updated_at timestamptz`

Requirements:

* One user may create or participate in multiple weddings.
* A wedding can have multiple authorized members.
* A user may only access weddings in which they have an authorized membership.
* Validate budget values to prevent negative budgets.
* Use a valid ISO 4217 currency code.
* Default currency should be INR.
* Do not make wedding data public by default.

### 5.3 `wedding_members`

Connects users to wedding workspaces and defines their roles.

Columns:

* `id uuid primary key default gen_random_uuid()`
* `wedding_id uuid not null references weddings(id) on delete cascade`
* `user_id uuid not null references auth.users(id) on delete cascade`
* `role text not null`
* `joined_at timestamptz not null default now()`

Constraints:

* Allowed roles: `owner`, `admin`, `member`, `viewer`.
* Unique constraint on `(wedding_id, user_id)`.
* Index on `user_id`.
* Index on `wedding_id`.

Role meanings:

**owner**

* Full control of the wedding workspace.
* Can manage members and workspace settings.
* Can manage wedding data.
* Ownership changes must follow a secure, explicit process.

**admin**

* Can manage most wedding information.
* Can manage expenses, events, tasks, guests, and invitations.
* Cannot arbitrarily take ownership or grant themselves elevated permissions.

**member**

* Can view the workspace and participate in permitted planning activities.
* Can create or update records according to table-specific policies.
* Cannot manage membership roles or transfer ownership.

**viewer**

* Read-only access to permitted wedding information.
* Cannot create, edit, or delete planning records.

Do not allow users to promote themselves to owner or admin by directly updating their membership row.

### 5.4 `expenses`

Stores wedding budget and expense records.

Columns:

* `id uuid primary key default gen_random_uuid()`
* `wedding_id uuid not null references weddings(id) on delete cascade`
* `title text not null`
* `category text not null`
* `amount numeric(12,2) not null`
* `paid_amount numeric(12,2) not null default 0`
* `payment_status text not null default 'pending'`
* `expense_date date`
* `vendor_name text`
* `payment_method text`
* `notes text`
* `created_by uuid references auth.users(id)`
* `created_at timestamptz`
* `updated_at timestamptz`

Constraints:

* `amount >= 0`
* `paid_amount >= 0`
* `paid_amount <= amount`
* `payment_status` must be one of `pending`, `partially_paid`, `paid`, or `cancelled`.

Categories can include:

* Venue
* Catering
* Decoration
* Photography
* Videography
* Clothing
* Jewellery
* Makeup
* Invitations
* Transportation
* Accommodation
* Entertainment
* Gifts
* Miscellaneous

The application may allow additional categories if the product requirements need them.

Requirements:

* Every expense must belong to a wedding.
* Only authorized wedding members may access the record.
* Viewers cannot modify expenses.
* Calculate totals using database queries rather than storing duplicate totals.
* Validate currency and amount formatting in the application.

### 5.5 `tasks`

Stores planning tasks and responsibilities.

Columns:

* `id uuid primary key default gen_random_uuid()`
* `wedding_id uuid not null references weddings(id) on delete cascade`
* `title text not null`
* `description text`
* `status text not null default 'todo'`
* `priority text not null default 'medium'`
* `due_date date`
* `assigned_to uuid references auth.users(id) on delete set null`
* `created_by uuid references auth.users(id)`
* `created_at timestamptz`
* `updated_at timestamptz`

Allowed status values:

* `todo`
* `in_progress`
* `completed`
* `cancelled`

Allowed priority values:

* `low`
* `medium`
* `high`
* `urgent`

Requirements:

* Task creation and modification must follow wedding membership policies.
* If `assigned_to` is not null, the assigned user must be an authorized member of the same wedding.
* Validate assignment through a secure database constraint, trigger, or equivalent database-side mechanism.
* Do not rely solely on frontend validation.

### 5.6 `events`

Stores wedding ceremonies and planning events.

Columns:

* `id uuid primary key default gen_random_uuid()`
* `wedding_id uuid not null references weddings(id) on delete cascade`
* `title text not null`
* `description text`
* `event_type text`
* `start_at timestamptz not null`
* `end_at timestamptz`
* `venue_name text`
* `venue_address text`
* `status text not null default 'planned'`
* `created_by uuid references auth.users(id)`
* `created_at timestamptz`
* `updated_at timestamptz`

Constraints:

* `end_at` must be later than `start_at` when provided.
* Allowed status values: `planned`, `confirmed`, `completed`, `cancelled`.

Example event types:

* Engagement
* Haldi
* Mehndi
* Sangeet
* Wedding Ceremony
* Reception
* Other

Store timestamps with time-zone awareness.

### 5.7 `guests`

Stores the guest list and RSVP information.

Columns:

* `id uuid primary key default gen_random_uuid()`
* `wedding_id uuid not null references weddings(id) on delete cascade`
* `full_name text not null`
* `email text`
* `phone text`
* `side text`
* `group_name text`
* `guest_count integer not null default 1`
* `invitation_status text not null default 'not_sent'`
* `rsvp_status text not null default 'pending'`
* `dietary_requirements text`
* `notes text`
* `created_by uuid references auth.users(id)`
* `created_at timestamptz`
* `updated_at timestamptz`

Constraints:

* `guest_count >= 1`.
* `invitation_status` must be one of `not_sent`, `sent`, or `delivered` where supported.
* `rsvp_status` must be one of `pending`, `accepted`, or `declined`.

Requirements:

* Guest information is private to authorized wedding members.
* Do not expose the entire guest list through a public invitation page.
* Validate phone and email fields.
* A public RSVP flow must use a secure, narrowly scoped invitation or RSVP token. It must not grant general database access.

### 5.8 `announcements`

Stores wedding-related announcements.

Columns:

* `id uuid primary key default gen_random_uuid()`
* `wedding_id uuid not null references weddings(id) on delete cascade`
* `title text not null`
* `body text not null`
* `created_by uuid references auth.users(id)`
* `created_at timestamptz`
* `updated_at timestamptz`

Requirements:

* Authorized members can read announcements.
* Owners, admins, and appropriately authorized members can create announcements.
* Viewers cannot create, update, or delete announcements.
* Only permitted roles can delete announcements.

### 5.9 `discussions`

Stores messages or discussion posts within a wedding workspace.

Columns:

* `id uuid primary key default gen_random_uuid()`
* `wedding_id uuid not null references weddings(id) on delete cascade`
* `author_id uuid not null references auth.users(id)`
* `body text not null`
* `parent_id uuid references discussions(id) on delete cascade`
* `created_at timestamptz`
* `updated_at timestamptz`

Requirements:

* Only wedding members can read discussions.
* The author must be a member of the same wedding.
* Users may edit or delete their own posts according to product rules.
* Admins may moderate content when authorized.
* Prevent users from assigning a different author ID to their own messages.
* Validate that replies belong to the same wedding as their parent post.

If the UI needs threaded discussions, use `parent_id` for replies. If a separate comment system is required later, introduce a dedicated `discussion_comments` table through a migration.

### 5.10 `invitations`

Stores invitations to join a wedding workspace.

Columns:

* `id uuid primary key default gen_random_uuid()`
* `wedding_id uuid not null references weddings(id) on delete cascade`
* `email text not null`
* `role text not null default 'member'`
* `token_hash text not null unique`
* `expires_at timestamptz not null`
* `accepted_at timestamptz`
* `invited_by uuid not null references auth.users(id)`
* `created_at timestamptz not null default now()`

Requirements:

* Allowed invited roles: `admin`, `member`, or `viewer`, subject to inviter permissions.
* Do not allow a normal invitation to grant owner privileges.
* Store only a cryptographic hash of the invitation token, not the raw token.
* Generate tokens securely using a trusted server-side or Edge Function process.
* Apply an expiration date.
* An invitation can only be accepted once.
* Acceptance must validate the authenticated user's email, token validity, expiration, and current membership.
* Do not allow users to insert arbitrary membership records or elevate their roles.
* Public token validation must reveal only the minimum information necessary.
* Protect against token reuse and race conditions.
* If an invitation is revoked or expires, it must no longer be accepted.

Implement sensitive invitation creation and acceptance using a properly secured server-side or Supabase Edge Function workflow.

### 5.11 `activity_logs`

Stores a history of important workspace actions.

Columns:

* `id uuid primary key default gen_random_uuid()`
* `wedding_id uuid not null references weddings(id) on delete cascade`
* `actor_id uuid references auth.users(id) on delete set null`
* `action text not null`
* `entity_type text`
* `entity_id uuid`
* `metadata jsonb not null default '{}'::jsonb`
* `created_at timestamptz not null default now()`

Requirements:

* Restrict logs to authorized wedding members.
* Do not allow normal users to forge activity records for other users.
* Prefer database triggers or secured backend functions for sensitive audit events.
* Avoid storing passwords, access tokens, invitation tokens, payment secrets, or unnecessary personal data in metadata.
* Do not allow users to edit or delete audit logs unless a documented administrative process requires it.

---

## 6. Relationships

Implement the following relationships:

```text
auth.users
    |
    +---- profiles
    |
    +---- weddings (created_by)
    |
    +---- wedding_members
    |          |
    |          +---- weddings
    |
    +---- expenses (created_by)
    +---- tasks (created_by / assigned_to)
    +---- events (created_by)
    +---- guests (created_by)
    +---- announcements (created_by)
    +---- discussions (author_id)
    +---- invitations (invited_by)
    +---- activity_logs (actor_id)

weddings
    |
    +---- wedding_members
    +---- expenses
    +---- tasks
    +---- events
    +---- guests
    +---- announcements
    +---- discussions
    +---- invitations
    +---- activity_logs
```

All wedding-owned records must be scoped to a valid `wedding_id`.

Use foreign keys and database constraints to maintain integrity.

---

## 7. Row Level Security (RLS)

RLS is mandatory.

Enable RLS on every application table containing private data.

At minimum, enable RLS on:

* `profiles`
* `weddings`
* `wedding_members`
* `expenses`
* `tasks`
* `events`
* `guests`
* `announcements`
* `discussions`
* `invitations`
* `activity_logs`

Create explicit policies for every required operation:

* `SELECT`
* `INSERT`
* `UPDATE`
* `DELETE`

Do not assume that enabling RLS automatically creates secure policies.

### 7.1 Membership helper functions

Create carefully secured database helper functions such as:

* `is_wedding_member(wedding_id uuid)`
* `has_wedding_role(wedding_id uuid, allowed_roles text[])`

Use them to check whether the current authenticated user has an active membership in the requested wedding.

Requirements:

* Use `auth.uid()` to identify the authenticated user.
* Prevent users from checking or accessing data belonging to unrelated weddings.
* If using `SECURITY DEFINER`, set a safe `search_path`.
* Fully qualify referenced tables in privileged functions.
* Revoke unnecessary execution privileges.
* Grant function execution only where required.
* Avoid recursive RLS policies that repeatedly invoke each other.
* Test policies against real authenticated sessions, not only the SQL editor or service role.

### 7.2 Policy requirements

**Profiles**

* Authenticated users can read their own profile.
* Users can update their own permitted profile fields.
* Public users cannot read the complete profile table.

**Weddings**

* Only wedding members can read a wedding.
* Only authorized roles can update workspace settings.
* Only authorized users can create a wedding.
* A wedding creator must receive membership through a secure, atomic creation flow.
* Users cannot make themselves members of arbitrary weddings.

**Wedding members**

* Only authorized members can view membership information.
* Only owners and appropriately authorized admins can manage memberships.
* Only owners can perform ownership transfers.
* Users cannot grant themselves elevated roles.
* Membership changes must validate the caller's role and the target role.

**Expenses**

* Members with permitted roles can read expenses.
* Viewers cannot create, update, or delete expenses.
* Writes must validate the user's membership in the expense's wedding.

**Tasks**

* Members can read tasks.
* Authorized roles can create and update tasks.
* Viewers cannot change task records.
* Task assignment must be validated against the wedding membership.

**Events**

* Members can read events.
* Authorized roles can create, update, and delete events.

**Guests**

* Members can read the wedding guest list.
* Authorized roles can manage guest records.
* Public invitation visitors cannot access the full guest list.

**Announcements**

* Members can read announcements.
* Authorized roles can publish announcements.
* Only authorized roles can edit or delete them.

**Discussions**

* Members can read discussions.
* Authors can modify their own posts where permitted.
* Moderation actions require appropriate authorization.

**Invitations**

* Only authorized roles can create or manage invitations.
* Public acceptance must use a narrowly scoped, secure workflow.
* Raw invitation tokens must never be stored in the database.

**Activity logs**

* Authorized members can read relevant logs.
* Ordinary users cannot forge logs or modify audit history.

### 7.3 Avoid unsafe shortcuts

Never solve a permission error by:

* Disabling RLS.
* Making private tables publicly readable.
* Granting unrestricted access to `anon`.
* Exposing the service-role key.
* Allowing every authenticated user to access every wedding.
* Trusting `user_id`, `role`, or `wedding_id` values supplied by the browser without authorization checks.

---

## 8. Database Migrations

Store database migrations in:

`supabase/migrations/`

Create versioned SQL migration files for:

1. Core schema and shared timestamp functions.
2. Profiles and user setup.
3. Weddings and wedding memberships.
4. Expenses.
5. Tasks.
6. Events.
7. Guests.
8. Announcements and discussions.
9. Invitations.
10. Activity logs.
11. Indexes and performance improvements.
12. RLS policies and security helper functions.
13. Storage policies, where managed through SQL.
14. Additional constraints and triggers.

The exact number of migration files can vary, but each change must be reproducible and version controlled.

Requirements:

* Never put real credentials in migration files.
* Do not manually edit the hosted database without creating a corresponding migration.
* Ensure migrations can run against a clean development project.
* Verify foreign keys and RLS policies after applying migrations.
* Include rollback guidance for risky schema changes where practical.
* Do not include destructive migrations without understanding their impact.

---

## 9. Supabase Storage

Use Supabase Storage for private files such as:

* Wedding documents.
* Private planning attachments.
* Guest-related documents where genuinely necessary.
* Wedding media that should be available only to workspace members.

Create a private bucket named:

`wedding-files`

If public wedding invitation pages need publicly visible images, use a separate bucket or a controlled image-delivery design. Do not make private documents public to simplify image rendering.

### Storage requirements

* Keep private files private by default.
* Use a consistent object path format, for example:

`<wedding_id>/<folder>/<unique_filename>`

* Validate that the authenticated user is a member of the wedding identified in the object path.
* Use Storage policies to enforce authorization.
* Validate MIME types and file sizes.
* Generate unique object names to avoid accidental overwrites.
* Do not trust filenames supplied by the user.
* Do not store secret or sensitive documents in public buckets.
* Use signed URLs for temporary access to private files.
* Apply appropriate retention and deletion behavior.
* Clean up orphaned files when associated records are deleted, where appropriate.

Example folders:

```text
<wedding_id>/documents/
<wedding_id>/photos/
<wedding_id>/attachments/
```

Storage authorization must be enforced by policies, not only by checking membership in the frontend.

---

## 10. Authentication

Use Supabase Auth.

Support the authentication methods selected in the product requirements, initially:

* Email and password.
* Email verification.
* Password reset.
* Sign out.
* Session restoration.
* Protected application routes.

Add Google OAuth only if it is part of the agreed product scope and the project credentials are configured.

### Authentication requirements

* Use the Supabase client session APIs.
* Do not implement custom password storage.
* Do not store passwords in `profiles`.
* Require authenticated access to private wedding workspaces.
* Provide clear messages for invalid credentials and expired sessions.
* Handle loading states while restoring the session.
* Protect routes in the frontend while relying on RLS for actual authorization.
* Redirect users appropriately after login and logout.
* Do not reveal whether an email belongs to an account where that would create an account-enumeration risk.

A user must not be considered authorized for a wedding merely because they are authenticated.

---

## 11. Dashboard Queries

The dashboard should retrieve data for the currently selected wedding.

It may display:

* Wedding name and date.
* Total budget.
* Total expenses.
* Total amount paid.
* Remaining budget.
* Upcoming events.
* Pending tasks.
* Completed tasks.
* Guest count.
* RSVP summary.
* Recent announcements or activity.

Calculate values from the underlying database records.

Suggested calculations:

```text
Total Budget = weddings.budget

Total Expenses = SUM(expenses.amount)
  for the selected wedding
  excluding cancelled expenses if that is the agreed business rule

Total Paid = SUM(expenses.paid_amount)
  for the selected wedding
  excluding cancelled expenses if that is the agreed business rule

Remaining Budget = Total Budget - Total Expenses

Pending Tasks = COUNT(tasks where status = 'todo')

In-Progress Tasks = COUNT(tasks where status = 'in_progress')

Completed Tasks = COUNT(tasks where status = 'completed')

Total Guests = SUM(guests.guest_count)

Accepted RSVPs = SUM(guests.guest_count)
  for guest records with rsvp_status = 'accepted'
```

Confirm the exact guest-counting rule with the product requirements. If `guest_count` represents a household's expected party size rather than the number of individual people, display labels accordingly.

Requirements:

* Filter by the selected `wedding_id`.
* Allow RLS to enforce access.
* Handle null and empty query results.
* Avoid exposing information from other weddings.
* Use loading placeholders and clear error states.
* Do not store derived totals in multiple places unless a documented performance requirement justifies it.

---

## 12. Frontend Integration Structure

Use a clean project structure similar to:

```text
src/
  components/
    layout/
    ui/
    dashboard/
    expenses/
    tasks/
    events/
    guests/
    invitations/
  pages/
    auth/
    dashboard/
    expenses/
    tasks/
    events/
    guests/
    settings/
  hooks/
  lib/
    supabase.ts
  services/
    auth.service.ts
    wedding.service.ts
    expense.service.ts
    task.service.ts
    event.service.ts
    guest.service.ts
    announcement.service.ts
    discussion.service.ts
    invitation.service.ts
  types/
    database.types.ts
  utils/

supabase/
  migrations/
  functions/

.env.example
.gitignore
DATABASE.md
DESIGN.md
PRD.md
```

Adapt this structure to the existing project instead of duplicating files or replacing working code unnecessarily.

### Service layer

Create typed service functions for database operations.

Examples:

* `getWeddings()`
* `getWeddingById(id)`
* `createWedding(input)`
* `updateWedding(id, input)`
* `getExpenses(weddingId)`
* `createExpense(input)`
* `updateExpense(id, input)`
* `deleteExpense(id)`
* `getTasks(weddingId)`
* `createTask(input)`
* `updateTask(id, input)`
* `getEvents(weddingId)`
* `getGuests(weddingId)`
* `getDashboardSummary(weddingId)`

These names are suggestions; follow existing project conventions where possible.

Requirements:

* Define input and output types.
* Handle Supabase errors consistently.
* Do not swallow errors silently.
* Do not trust frontend-provided role values.
* Do not duplicate RLS authorization in a way that creates a false sense of security.
* Keep database calls out of unrelated UI components where practical.
* Avoid unnecessary repeated queries.
* Use pagination for large lists.
* Use generated Supabase TypeScript database types when practical.

---

## 13. Public Wedding Invitations

Public invitation pages may be accessible without logging in, but public access must be restricted to explicitly public information.

A public invitation may display:

* Couple names.
* Wedding date and event times.
* Venue details.
* Invitation artwork.
* A carefully scoped RSVP form.

It must not expose:

* Private wedding budget.
* Expense records.
* Internal tasks.
* Family discussions.
* Member email addresses or phone numbers.
* The full guest list.
* Private files.
* Activity logs.

Use an opaque, unguessable public invitation identifier or token.

If RSVP submission is supported:

1. Validate the invitation identifier or token.
2. Verify that the invitation is active.
3. Accept only the fields required for RSVP.
4. Validate input length and format.
5. Rate-limit submissions through an appropriate backend mechanism.
6. Avoid allowing arbitrary database updates.
7. Do not return unrelated guest records.
8. Record only the information required for the RSVP workflow.

Do not expose a privileged Supabase key to enable public RSVP updates.

---

## 14. Input Validation

Validate input both in the frontend and at the database or trusted backend boundary.

Examples:

* Wedding name must not be empty.
* Budget and expense amounts must not be negative.
* Currency codes must be valid.
* Expense payment values must be consistent.
* Event end times must follow start times.
* Task status and priority must use allowed values.
* Guest counts must be at least one.
* Invitation expiry must be in the future when created.
* Invitations must not be accepted more than once.
* Discussion messages must not be empty.
* Uploaded file types and sizes must be limited.
* Referenced users must have the required wedding membership.

Use database constraints whenever they can safely enforce the rule.

Never rely only on HTML input attributes or client-side validation.

---

## 15. Performance and Indexing

Add indexes based on actual query patterns.

At minimum, consider indexes for:

* `wedding_members(user_id)`
* `wedding_members(wedding_id)`
* `expenses(wedding_id)`
* `expenses(wedding_id, expense_date)`
* `tasks(wedding_id)`
* `tasks(wedding_id, status)`
* `tasks(wedding_id, due_date)`
* `tasks(assigned_to)`
* `events(wedding_id)`
* `events(wedding_id, start_at)`
* `guests(wedding_id)`
* `guests(wedding_id, rsvp_status)`
* `announcements(wedding_id, created_at)`
* `discussions(wedding_id, created_at)`
* `invitations(wedding_id)`
* `invitations(token_hash)`
* `activity_logs(wedding_id, created_at)`

Do not create unnecessary indexes without considering write overhead.

Use pagination and sensible query limits for guest lists, expenses, discussions, and activity history.

For dashboard calculations, consider aggregate queries or carefully designed database views only when necessary.

Any view containing private information must be designed so it cannot bypass the intended authorization model. Test view access with non-privileged authenticated users.

---

## 16. Realtime Updates

Use Supabase Realtime only where it provides a clear product benefit.

Possible use cases:

* Discussion updates.
* New announcements.
* Task status updates.
* Shared wedding planning changes.

Requirements:

* Subscribe only to necessary tables and events.
* Confirm the authorization behavior of the selected Realtime configuration.
* Do not treat hiding realtime events in the UI as a security boundary.
* Remove subscriptions when components unmount or the active wedding changes.
* Avoid creating duplicate subscriptions.
* Provide a reliable refetch or refresh path if realtime updates fail.

Realtime is optional for the initial version if it would delay the core product.

---

## 17. Database Types

Generate TypeScript database types from the Supabase schema when practical.

Store them in:

`src/types/database.types.ts`

Use the generated types to improve type safety for:

* Table rows.
* Inserts.
* Updates.
* Relationships.
* Database RPC calls.

Do not manually claim a column exists if it has not been created in the actual schema.

Regenerate types after meaningful schema changes.

---

## 18. Testing and Verification

Test the schema and security before declaring the backend complete.

### Authentication tests

* A user can register and sign in.
* A user can sign out.
* Password reset follows the configured flow.
* A session persists and restores correctly.
* Unauthenticated users cannot access private wedding data.

### Wedding tests

* A user can create a wedding through the approved workflow.
* The creator receives the intended membership.
* A member can access the correct wedding.
* A non-member cannot read another wedding's records.
* A member cannot add themselves to an unrelated wedding.
* Users cannot promote themselves to owner or admin.

### Expenses tests

* An authorized user can create and read expenses.
* Negative amounts are rejected.
* Invalid payment states are rejected.
* A viewer cannot modify expenses.
* A non-member cannot read or modify expenses.

### Tasks and events tests

* Valid tasks and events can be created.
* Invalid statuses are rejected.
* Invalid event times are rejected.
* Task assignments are restricted to valid wedding members.
* Users cannot access records belonging to another wedding.

### Guest and invitation tests

* Authorized members can manage guests.
* Public invitation visitors cannot read the full guest list.
* Invalid or expired tokens are rejected.
* An invitation cannot be accepted twice.
* A normal invitation cannot grant owner privileges.
* Public RSVP operations cannot modify unrelated records.

### Storage tests

* Authorized members can access permitted files.
* Non-members cannot read private wedding files.
* Public users cannot access private documents.
* Unauthorized uploads and deletions are rejected.

### RLS verification

Test with multiple test accounts:

1. Wedding owner.
2. Admin.
3. Member.
4. Viewer.
5. Authenticated non-member.
6. Unauthenticated visitor.

Do not test security only with the Supabase service-role key or SQL editor. Those contexts may bypass the protections that ordinary users rely on.

---

## 19. Antigravity Implementation Instructions

Antigravity should implement this specification in the following phases.

### Phase 1 — Inspect the project

* Inspect the existing repository.
* Read `PRD.md` and `DESIGN.md`.
* Preserve the current design system and existing working UI.
* Identify existing routes, components, dependencies, and environment files.
* Do not overwrite project files without understanding their purpose.
* Confirm that the project uses React, Vite, TypeScript, and Tailwind CSS where required.

### Phase 2 — Configure Supabase

* Install `@supabase/supabase-js` if it is not already installed.
* Create `src/lib/supabase.ts`.
* Create `.env.example`.
* Update `.gitignore`.
* Document how to configure the actual Supabase project.
* Do not invent project credentials.
* Do not expose privileged keys.

### Phase 3 — Create the schema

* Create versioned SQL migrations in `supabase/migrations/`.
* Implement tables, foreign keys, constraints, indexes, timestamp triggers, and required helper functions.
* Review deletion behavior and ownership relationships.
* Ensure the migrations can be applied to a clean development project.

### Phase 4 — Implement security

* Enable RLS on all private application tables.
* Create explicit policies for all required operations.
* Implement secure membership and role checks.
* Secure invitation creation and acceptance.
* Configure Storage policies.
* Verify that no policy grants unintended access.

### Phase 5 — Implement authentication

* Add registration, login, logout, session restoration, and password reset.
* Add profile creation and profile editing.
* Protect private routes.
* Handle loading and error states.

### Phase 6 — Implement wedding workflows

* Create and select wedding workspaces.
* Add member management using secure authorization.
* Implement wedding settings.
* Implement expenses, tasks, events, guests, announcements, and discussions.
* Add invitations and public RSVP workflows where required.
* Connect the existing UI to real Supabase data.

### Phase 7 — Implement dashboard

* Load data for the selected wedding.
* Calculate expense totals and remaining budget.
* Display upcoming events and task progress.
* Display guest and RSVP summaries.
* Add loading, empty, and error states.

### Phase 8 — Test and document

* Apply migrations to a development Supabase project.
* Run TypeScript checks and the available tests.
* Test RLS with different user roles.
* Verify that unauthorized users cannot access private data.
* Verify the frontend remains responsive and consistent with `DESIGN.md`.
* Document setup, migrations, environment variables, and known limitations.
* Report which features are complete and which require credentials or manual Supabase configuration.

### Implementation rules

* Work incrementally.
* Do not create fake successful database responses.
* Do not silently replace Supabase with local storage or another database.
* Do not disable RLS to make queries succeed.
* Do not create duplicate components or services unnecessarily.
* Keep the design consistent with the supplied design specification.
* If a Supabase project credential or dashboard action is required, clearly identify what the user must configure.
* Run available checks after each major implementation phase.
* Report errors honestly instead of claiming untested features work.

---

## 20. Acceptance Criteria

The database implementation is ready for initial application integration when:

* [ ] The project uses Supabase PostgreSQL, not MongoDB.
* [ ] Supabase Auth is configured.
* [ ] Environment variables are documented.
* [ ] No privileged keys are exposed in the browser.
* [ ] All required tables and relationships exist.
* [ ] Database constraints prevent invalid data.
* [ ] Required migrations are version controlled.
* [ ] RLS is enabled on every private application table.
* [ ] RLS policies enforce wedding-level isolation.
* [ ] Role changes cannot be self-authorized.
* [ ] Owners, admins, members, and viewers have the intended permissions.
* [ ] Expenses, tasks, events, and guests use real Supabase data.
* [ ] Private file access is protected by Storage policies.
* [ ] Public invitation pages expose only intended public information.
* [ ] Invitation tokens are securely generated and stored as hashes.
* [ ] Dashboard calculations are based on database records.
* [ ] TypeScript types are maintained.
* [ ] Loading, empty, and error states are implemented.
* [ ] Security tests cover members and non-members.
* [ ] Existing UI design remains consistent with `DESIGN.md`.
* [ ] Setup instructions are documented.

---

## 21. Final Instruction

Treat this document as the authoritative database and backend specification for Make My Marriage.

Use Supabase PostgreSQL, Supabase Auth, RLS, and Supabase Storage.

Preserve the product requirements in `PRD.md` and the visual requirements in `DESIGN.md`.

Before making architectural changes, explain why they are needed. Implement the database incrementally, validate security at every stage, and never sacrifice user data isolation for convenience.
