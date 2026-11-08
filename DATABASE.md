# Make My Marriage — Database & Backend Implementation

**Database Platform:** Supabase PostgreSQL  
**Authentication:** Supabase Auth (JWT + Sessions)  
**Security:** PostgreSQL Row Level Security (RLS)  
**File Storage:** Supabase Storage (`wedding-files` private bucket)  
**Client:** `@supabase/supabase-js` with full TypeScript definitions  

---

## 1. Quick Start & Setup

### 1.1 Environment Configuration
Create a `.env` file in the project root (based on `.env.example`):
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
VITE_APP_URL=http://localhost:3000
```

> **Security Note:** Never include `service_role` keys in client code or frontend `.env` files. RLS policies protect data based on user identity.

### 1.2 Applying Database Migrations

You can apply the database schema to your Supabase project in one of two ways:

#### Option A: Supabase Dashboard SQL Editor (Fastest)
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Copy the contents of [`supabase/schema.sql`](file:///c:/Users/hanzla/Downloads/MMM/supabase/schema.sql) and paste it into the editor.
4. Click **Run**. All tables, constraints, triggers, indexes, and RLS policies will be applied.

#### Option B: Supabase CLI
```bash
npx supabase link --project-ref <your-project-id>
npx supabase db push
```

---

## 2. Main Tables & Schema Summary

| Table | Primary Key | Scoped To | Description |
|---|---|---|---|
| `profiles` | `id (references auth.users)` | User | User details, full name, avatar, phone. Auto-created on signup via trigger. |
| `weddings` | `id (UUID)` | `created_by` | Wedding workspace, budget, couple names, venue, date. Auto-creates owner role for creator. |
| `wedding_members` | `id (UUID)` | `wedding_id` | Role-based membership (`owner`, `admin`, `member`, `viewer`) and family side (`bride`, `groom`). |
| `expenses` | `id (UUID)` | `wedding_id` | Budget & expense tracking, payments, paid amount, receipts. |
| `tasks` | `id (UUID)` | `wedding_id` | Task tracking, priority, status (`todo`, `in_progress`, `completed`), assignment validation. |
| `events` | `id (UUID)` | `wedding_id` | Ceremonies (Sangeet, Mehendi, Haldi, Reception), timestamps, venues. |
| `guests` | `id (UUID)` | `wedding_id` | Guest list, family side, guest count, RSVP status (`pending`, `accepted`, `declined`). |
| `announcements` | `id (UUID)` | `wedding_id` | Workspace broadcasts, pinned announcements. |
| `discussions` | `id (UUID)` | `wedding_id` | Workspace family discussions, threaded comments (`parent_id`). |
| `invitations` | `id (UUID)` | `wedding_id` | Workspace membership invites with SHA-256 hashed tokens and expiration dates. |
| `digital_invitations` | `id (UUID)` | `wedding_id` | Public digital invitation e-card, theme configuration, slug-based public access. |
| `activity_logs` | `id (UUID)` | `wedding_id` | Audit trail of member actions and updates. |

---

## 3. Row Level Security (RLS) & Helper Functions

All tables have RLS enabled with explicit policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.

### Helper Functions:
1. **`is_wedding_member(wedding_id UUID)`**:
   Validates that the authenticated user (`auth.uid()`) belongs to the wedding.
2. **`has_wedding_role(wedding_id UUID, allowed_roles TEXT[])`**:
   Validates that the authenticated user holds an authorized role (`owner`, `admin`, `member`, or `viewer`).
3. **`handle_new_user()`**:
   Trigger on `auth.users` that automatically inserts a profile row into `public.profiles`.
4. **`handle_new_wedding_creator_membership()`**:
   Trigger on `public.weddings` that automatically grants the creator `owner` membership in `public.wedding_members`.
5. **`validate_task_assignment()`**:
   Trigger verifying that task assignees must be members of the same wedding.

---

## 4. Supabase Storage: `wedding-files`

- **Bucket:** `wedding-files` (Private)
- **Object Path Format:** `<wedding_id>/<folder>/<filename>`
- **Folders:**
  - `<wedding_id>/documents/`
  - `<wedding_id>/photos/`
  - `<wedding_id>/attachments/`
- **Policies:**
  - Members can read files belonging to their `wedding_id`.
  - Owners/Admins/Members can upload files.
  - Owners/Admins can delete files.
  - Temporary signed URLs are generated via `storageService.getSignedUrl()`.

---

## 5. Frontend Service Layer

Typed services in [`src/services/`](file:///c:/Users/hanzla/Downloads/MMM/src/services/):
- **`authService`** ([`src/services/auth.service.ts`](file:///c:/Users/hanzla/Downloads/MMM/src/services/auth.service.ts))
- **`weddingService`** ([`src/services/wedding.service.ts`](file:///c:/Users/hanzla/Downloads/MMM/src/services/wedding.service.ts))
- **`expenseService`** ([`src/services/expense.service.ts`](file:///c:/Users/hanzla/Downloads/MMM/src/services/expense.service.ts))
- **`taskService`** ([`src/services/task.service.ts`](file:///c:/Users/hanzla/Downloads/MMM/src/services/task.service.ts))
- **`eventService`** ([`src/services/event.service.ts`](file:///c:/Users/hanzla/Downloads/MMM/src/services/event.service.ts))
- **`guestService`** ([`src/services/guest.service.ts`](file:///c:/Users/hanzla/Downloads/MMM/src/services/guest.service.ts))
- **`announcementService`** ([`src/services/announcement.service.ts`](file:///c:/Users/hanzla/Downloads/MMM/src/services/announcement.service.ts))
- **`discussionService`** ([`src/services/discussion.service.ts`](file:///c:/Users/hanzla/Downloads/MMM/src/services/discussion.service.ts))
- **`invitationService`** ([`src/services/invitation.service.ts`](file:///c:/Users/hanzla/Downloads/MMM/src/services/invitation.service.ts))
- **`storageService`** ([`src/services/storage.service.ts`](file:///c:/Users/hanzla/Downloads/MMM/src/services/storage.service.ts))
- **`activityService`** ([`src/services/activity.service.ts`](file:///c:/Users/hanzla/Downloads/MMM/src/services/activity.service.ts))

---

## 6. Verification Status

- [x] Schema & Migration scripts created matching `superbase.md`
- [x] TypeScript database definitions (`src/types/database.types.ts`) compiled with 0 errors
- [x] Service layer implemented for all tables
- [x] Contexts (`AuthContext`, `WeddingContext`) integrated with Supabase and demo fallback
- [x] Storage bucket and RLS policies configured
- [x] Production build (`npm run build`) succeeded with 0 errors
