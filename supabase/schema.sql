-- ============================================================================
-- MAKE MY MARRIAGE - COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- Specification: superbase.md
-- Run this script in the Supabase SQL Editor or via Supabase CLI
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS & GENERAL FUNCTIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. TABLES
-- ----------------------------------------------------------------------------

-- 5.1 Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5.2 Weddings Table
CREATE TABLE IF NOT EXISTS public.weddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    partner_one_name TEXT,
    partner_two_name TEXT,
    wedding_date DATE,
    wedding_time TIME,
    venue_name TEXT,
    venue_address TEXT,
    map_url TEXT,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (budget >= 0),
    currency_code TEXT NOT NULL DEFAULT 'INR',
    notes TEXT,
    description TEXT,
    couple_photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_weddings_updated_at ON public.weddings;
CREATE TRIGGER update_weddings_updated_at
    BEFORE UPDATE ON public.weddings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5.3 Wedding Members Table
CREATE TABLE IF NOT EXISTS public.wedding_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    family_side TEXT CHECK (family_side IN ('bride', 'groom')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_wedding_members_user UNIQUE (wedding_id, user_id)
);

-- 5.4 Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0 AND paid_amount <= amount),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partially_paid', 'paid', 'cancelled')),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    vendor_name TEXT,
    payment_method TEXT,
    notes TEXT,
    family_side TEXT CHECK (family_side IN ('bride', 'groom')),
    receipt_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5.5 Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5.6 Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'wedding_ceremony',
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ,
    venue_name TEXT,
    venue_address TEXT,
    map_url TEXT,
    organizer TEXT,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_event_time_order CHECK (end_at IS NULL OR end_at > start_at)
);

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5.7 Guests Table
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    side TEXT CHECK (side IN ('bride', 'groom', 'both')),
    group_name TEXT,
    guest_count INTEGER NOT NULL DEFAULT 1 CHECK (guest_count >= 1),
    invitation_status TEXT NOT NULL DEFAULT 'not_sent' CHECK (invitation_status IN ('not_sent', 'sent', 'delivered')),
    rsvp_status TEXT NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'accepted', 'declined')),
    dietary_requirements TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_guests_updated_at ON public.guests;
CREATE TRIGGER update_guests_updated_at
    BEFORE UPDATE ON public.guests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5.8 Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5.9 Discussions Table
CREATE TABLE IF NOT EXISTS public.discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    parent_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_discussions_updated_at ON public.discussions;
CREATE TRIGGER update_discussions_updated_at
    BEFORE UPDATE ON public.discussions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5.10 Invitations Table (Workspace Membership Invites)
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5.11 Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Digital Invitations Table (Public Digital Wedding Cards)
CREATE TABLE IF NOT EXISTS public.digital_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL UNIQUE REFERENCES public.weddings(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    template_key TEXT NOT NULL DEFAULT 'royal_indian',
    theme_config JSONB NOT NULL DEFAULT '{}'::JSONB,
    content JSONB NOT NULL DEFAULT '{}'::JSONB,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_digital_invitations_updated_at ON public.digital_invitations;
CREATE TRIGGER update_digital_invitations_updated_at
    BEFORE UPDATE ON public.digital_invitations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3. INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_weddings_created_by ON public.weddings(created_by);
CREATE INDEX IF NOT EXISTS idx_wedding_members_user ON public.wedding_members(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_members_wedding ON public.wedding_members(wedding_id);
CREATE INDEX IF NOT EXISTS idx_expenses_wedding ON public.expenses(wedding_id);
CREATE INDEX IF NOT EXISTS idx_expenses_wedding_date ON public.expenses(wedding_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_tasks_wedding ON public.tasks(wedding_id);
CREATE INDEX IF NOT EXISTS idx_tasks_wedding_status ON public.tasks(wedding_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_wedding_due ON public.tasks(wedding_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_events_wedding ON public.events(wedding_id);
CREATE INDEX IF NOT EXISTS idx_events_wedding_start ON public.events(wedding_id, start_at);
CREATE INDEX IF NOT EXISTS idx_guests_wedding ON public.guests(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guests_wedding_rsvp ON public.guests(wedding_id, rsvp_status);
CREATE INDEX IF NOT EXISTS idx_announcements_wedding ON public.announcements(wedding_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_wedding ON public.discussions(wedding_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_parent ON public.discussions(parent_id);
CREATE INDEX IF NOT EXISTS idx_invitations_wedding ON public.invitations(wedding_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token_hash);
CREATE INDEX IF NOT EXISTS idx_activity_logs_wedding ON public.activity_logs(wedding_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_digital_invitations_slug ON public.digital_invitations(slug);

-- ----------------------------------------------------------------------------
-- 4. SECURITY FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_wedding_member(lookup_wedding_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.wedding_members
    WHERE wedding_id = lookup_wedding_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.has_wedding_role(lookup_wedding_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.wedding_members
    WHERE wedding_id = lookup_wedding_id
      AND user_id = auth.uid()
      AND role = ANY(allowed_roles)
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_wedding_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_wedding_member(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_wedding_role(UUID, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_wedding_role(UUID, TEXT[]) TO authenticated;

-- User Profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
      phone = COALESCE(EXCLUDED.phone, public.profiles.phone);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-owner trigger on wedding creation
CREATE OR REPLACE FUNCTION public.handle_new_wedding_creator_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wedding_members (wedding_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner')
  ON CONFLICT (wedding_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_wedding_created_add_creator ON public.weddings;
CREATE TRIGGER on_wedding_created_add_creator
  AFTER INSERT ON public.weddings
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_wedding_creator_membership();

-- Task Assignee Validation Trigger
CREATE OR REPLACE FUNCTION public.validate_task_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.wedding_members
      WHERE wedding_id = NEW.wedding_id AND user_id = NEW.assigned_to
    ) THEN
      RAISE EXCEPTION 'Task assignee must be a member of the wedding workspace';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_task_validate_assignment ON public.tasks;
CREATE TRIGGER on_task_validate_assignment
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.validate_task_assignment();

-- Discussion Reply Validation Trigger
CREATE OR REPLACE FUNCTION public.validate_discussion_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.discussions
      WHERE id = NEW.parent_id AND wedding_id = NEW.wedding_id
    ) THEN
      RAISE EXCEPTION 'Discussion reply must belong to the same wedding as the parent post';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_discussion_validate_reply ON public.discussions;
CREATE TRIGGER on_discussion_validate_reply
  BEFORE INSERT OR UPDATE ON public.discussions
  FOR EACH ROW EXECUTE FUNCTION public.validate_discussion_reply();

-- ----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_invitations ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "profiles_select_own_or_workspace_member" ON public.profiles;
CREATE POLICY "profiles_select_own_or_workspace_member" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.wedding_members m1
      JOIN public.wedding_members m2 ON m1.wedding_id = m2.wedding_id
      WHERE m1.user_id = auth.uid() AND m2.user_id = public.profiles.id
    )
  );

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Weddings
DROP POLICY IF EXISTS "weddings_select_members" ON public.weddings;
CREATE POLICY "weddings_select_members" ON public.weddings
  FOR SELECT TO authenticated
  USING (is_wedding_member(id));

DROP POLICY IF EXISTS "weddings_insert_authenticated" ON public.weddings;
CREATE POLICY "weddings_insert_authenticated" ON public.weddings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "weddings_update_admin" ON public.weddings;
CREATE POLICY "weddings_update_admin" ON public.weddings
  FOR UPDATE TO authenticated
  USING (has_wedding_role(id, ARRAY['owner', 'admin']))
  WITH CHECK (has_wedding_role(id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "weddings_delete_owner" ON public.weddings;
CREATE POLICY "weddings_delete_owner" ON public.weddings
  FOR DELETE TO authenticated
  USING (has_wedding_role(id, ARRAY['owner']));

-- Wedding Members
DROP POLICY IF EXISTS "members_select_workspace" ON public.wedding_members;
CREATE POLICY "members_select_workspace" ON public.wedding_members
  FOR SELECT TO authenticated
  USING (is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "members_insert_admin" ON public.wedding_members;
CREATE POLICY "members_insert_admin" ON public.wedding_members
  FOR INSERT TO authenticated
  WITH CHECK (
    has_wedding_role(wedding_id, ARRAY['owner', 'admin'])
    OR (user_id = auth.uid() AND role = 'owner')
  );

DROP POLICY IF EXISTS "members_update_owner" ON public.wedding_members;
CREATE POLICY "members_update_owner" ON public.wedding_members
  FOR UPDATE TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner']))
  WITH CHECK (has_wedding_role(wedding_id, ARRAY['owner']));

DROP POLICY IF EXISTS "members_delete_owner_or_self" ON public.wedding_members;
CREATE POLICY "members_delete_owner_or_self" ON public.wedding_members
  FOR DELETE TO authenticated
  USING (
    has_wedding_role(wedding_id, ARRAY['owner'])
    OR (user_id = auth.uid() AND role != 'owner')
  );

-- Expenses
DROP POLICY IF EXISTS "expenses_select_members" ON public.expenses;
CREATE POLICY "expenses_select_members" ON public.expenses
  FOR SELECT TO authenticated
  USING (is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "expenses_insert_members" ON public.expenses;
CREATE POLICY "expenses_insert_members" ON public.expenses
  FOR INSERT TO authenticated
  WITH CHECK (has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']));

DROP POLICY IF EXISTS "expenses_update_members" ON public.expenses;
CREATE POLICY "expenses_update_members" ON public.expenses
  FOR UPDATE TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']))
  WITH CHECK (has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']));

DROP POLICY IF EXISTS "expenses_delete_admin" ON public.expenses;
CREATE POLICY "expenses_delete_admin" ON public.expenses
  FOR DELETE TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

-- Tasks
DROP POLICY IF EXISTS "tasks_select_members" ON public.tasks;
CREATE POLICY "tasks_select_members" ON public.tasks
  FOR SELECT TO authenticated
  USING (is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "tasks_insert_members" ON public.tasks;
CREATE POLICY "tasks_insert_members" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']));

DROP POLICY IF EXISTS "tasks_update_members" ON public.tasks;
CREATE POLICY "tasks_update_members" ON public.tasks
  FOR UPDATE TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']))
  WITH CHECK (has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']));

DROP POLICY IF EXISTS "tasks_delete_admin" ON public.tasks;
CREATE POLICY "tasks_delete_admin" ON public.tasks
  FOR DELETE TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

-- Events
DROP POLICY IF EXISTS "events_select_members" ON public.events;
CREATE POLICY "events_select_members" ON public.events
  FOR SELECT TO authenticated
  USING (is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "events_insert_members" ON public.events;
CREATE POLICY "events_insert_members" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']));

DROP POLICY IF EXISTS "events_update_members" ON public.events;
CREATE POLICY "events_update_members" ON public.events
  FOR UPDATE TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']))
  WITH CHECK (has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']));

DROP POLICY IF EXISTS "events_delete_admin" ON public.events;
CREATE POLICY "events_delete_admin" ON public.events
  FOR DELETE TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

-- Guests
DROP POLICY IF EXISTS "guests_select_members" ON public.guests;
CREATE POLICY "guests_select_members" ON public.guests
  FOR SELECT TO authenticated
  USING (is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "guests_insert_members" ON public.guests;
CREATE POLICY "guests_insert_members" ON public.guests
  FOR INSERT TO authenticated
  WITH CHECK (has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']));

DROP POLICY IF EXISTS "guests_update_members" ON public.guests;
CREATE POLICY "guests_update_members" ON public.guests
  FOR UPDATE TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']))
  WITH CHECK (has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']));

DROP POLICY IF EXISTS "guests_delete_admin" ON public.guests;
CREATE POLICY "guests_delete_admin" ON public.guests
  FOR DELETE TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

-- Announcements
DROP POLICY IF EXISTS "announcements_select_members" ON public.announcements;
CREATE POLICY "announcements_select_members" ON public.announcements
  FOR SELECT TO authenticated
  USING (is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "announcements_insert_members" ON public.announcements;
CREATE POLICY "announcements_insert_members" ON public.announcements
  FOR INSERT TO authenticated
  WITH CHECK (has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']));

DROP POLICY IF EXISTS "announcements_update_admin_or_author" ON public.announcements;
CREATE POLICY "announcements_update_admin_or_author" ON public.announcements
  FOR UPDATE TO authenticated
  USING (
    has_wedding_role(wedding_id, ARRAY['owner', 'admin'])
    OR (created_by = auth.uid() AND has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']))
  );

DROP POLICY IF EXISTS "announcements_delete_admin" ON public.announcements;
CREATE POLICY "announcements_delete_admin" ON public.announcements
  FOR DELETE TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

-- Discussions
DROP POLICY IF EXISTS "discussions_select_members" ON public.discussions;
CREATE POLICY "discussions_select_members" ON public.discussions
  FOR SELECT TO authenticated
  USING (is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "discussions_insert_members" ON public.discussions;
CREATE POLICY "discussions_insert_members" ON public.discussions
  FOR INSERT TO authenticated
  WITH CHECK (
    has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member'])
    AND author_id = auth.uid()
  );

DROP POLICY IF EXISTS "discussions_update_author" ON public.discussions;
CREATE POLICY "discussions_update_author" ON public.discussions
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid() AND has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']))
  WITH CHECK (author_id = auth.uid() AND has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'member']));

DROP POLICY IF EXISTS "discussions_delete_author_or_admin" ON public.discussions;
CREATE POLICY "discussions_delete_author_or_admin" ON public.discussions
  FOR DELETE TO authenticated
  USING (
    author_id = auth.uid()
    OR has_wedding_role(wedding_id, ARRAY['owner', 'admin'])
  );

-- Invitations (Workspace)
DROP POLICY IF EXISTS "invitations_select_admin" ON public.invitations;
CREATE POLICY "invitations_select_admin" ON public.invitations
  FOR SELECT TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "invitations_insert_admin" ON public.invitations;
CREATE POLICY "invitations_insert_admin" ON public.invitations
  FOR INSERT TO authenticated
  WITH CHECK (has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "invitations_update_admin" ON public.invitations;
CREATE POLICY "invitations_update_admin" ON public.invitations
  FOR UPDATE TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "invitations_delete_admin" ON public.invitations;
CREATE POLICY "invitations_delete_admin" ON public.invitations
  FOR DELETE TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

-- Digital Invitations (Public)
DROP POLICY IF EXISTS "digital_invitations_select" ON public.digital_invitations;
CREATE POLICY "digital_invitations_select" ON public.digital_invitations
  FOR SELECT TO public
  USING (is_published = TRUE OR is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "digital_invitations_insert_admin" ON public.digital_invitations;
CREATE POLICY "digital_invitations_insert_admin" ON public.digital_invitations
  FOR INSERT TO authenticated
  WITH CHECK (has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "digital_invitations_update_admin" ON public.digital_invitations;
CREATE POLICY "digital_invitations_update_admin" ON public.digital_invitations
  FOR UPDATE TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner', 'admin']))
  WITH CHECK (has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "digital_invitations_delete_owner" ON public.digital_invitations;
CREATE POLICY "digital_invitations_delete_owner" ON public.digital_invitations
  FOR DELETE TO authenticated
  USING (has_wedding_role(wedding_id, ARRAY['owner']));

-- Activity Logs
DROP POLICY IF EXISTS "activity_logs_select_members" ON public.activity_logs;
CREATE POLICY "activity_logs_select_members" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "activity_logs_insert_members" ON public.activity_logs;
CREATE POLICY "activity_logs_insert_members" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (is_wedding_member(wedding_id));

-- ----------------------------------------------------------------------------
-- 6. STORAGE SETUP & POLICIES
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'wedding-files',
    'wedding-files',
    FALSE,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET public = FALSE,
    file_size_limit = 10485760;

DROP POLICY IF EXISTS "wedding_files_select_members" ON storage.objects;
CREATE POLICY "wedding_files_select_members" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'wedding-files'
    AND public.is_wedding_member((storage.foldername(name))[1]::uuid)
);

DROP POLICY IF EXISTS "wedding_files_insert_members" ON storage.objects;
CREATE POLICY "wedding_files_insert_members" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'wedding-files'
    AND public.has_wedding_role((storage.foldername(name))[1]::uuid, ARRAY['owner', 'admin', 'member'])
);

DROP POLICY IF EXISTS "wedding_files_delete_admin" ON storage.objects;
CREATE POLICY "wedding_files_delete_admin" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'wedding-files'
    AND public.has_wedding_role((storage.foldername(name))[1]::uuid, ARRAY['owner', 'admin'])
);
