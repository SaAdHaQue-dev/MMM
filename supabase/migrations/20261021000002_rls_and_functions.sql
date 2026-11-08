-- ============================================================================
-- 2. Row Level Security (RLS) & Security Functions
-- Migration: 20261021000002_rls_and_functions.sql
-- Specification: superbase.md (Make My Marriage Database Specification)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7.1 Security Helper Functions
-- ----------------------------------------------------------------------------

-- Check if current authenticated user is an active member of the wedding
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

-- Check if current authenticated user has one of the required roles in the wedding
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

-- Revoke public execution and re-grant explicitly to authenticated users
REVOKE EXECUTE ON FUNCTION public.is_wedding_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_wedding_member(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_wedding_role(UUID, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_wedding_role(UUID, TEXT[]) TO authenticated;

-- ----------------------------------------------------------------------------
-- User Profile & Membership Automation Triggers
-- ----------------------------------------------------------------------------

-- Auto-create profile on auth.users insert
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

-- Auto-grant 'owner' membership to the wedding creator upon wedding creation
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

-- Ensure assigned_to on tasks is a valid wedding member
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

-- Ensure discussion reply belongs to same wedding
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
-- 7. Enable Row Level Security (RLS) on all tables
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

-- ----------------------------------------------------------------------------
-- 7.2 Explicit Policies
-- ----------------------------------------------------------------------------

-- PROFILES POLICIES
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

-- WEDDINGS POLICIES
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

-- WEDDING_MEMBERS POLICIES
DROP POLICY IF EXISTS "members_select_workspace" ON public.wedding_members;
CREATE POLICY "members_select_workspace" ON public.wedding_members
  FOR SELECT TO authenticated
  USING (is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "members_insert_admin" ON public.wedding_members;
CREATE POLICY "members_insert_admin" ON public.wedding_members
  FOR INSERT TO authenticated
  WITH CHECK (
    has_wedding_role(wedding_id, ARRAY['owner', 'admin'])
    OR (user_id = auth.uid() AND role = 'owner') -- Creator bootstrap
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

-- EXPENSES POLICIES
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

-- TASKS POLICIES
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

-- EVENTS POLICIES
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

-- GUESTS POLICIES
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

-- ANNOUNCEMENTS POLICIES
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

-- DISCUSSIONS POLICIES
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

-- INVITATIONS POLICIES (Workspace Invites)
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

-- DIGITAL INVITATIONS POLICIES (Public E-Cards)
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

-- ACTIVITY LOGS POLICIES
DROP POLICY IF EXISTS "activity_logs_select_members" ON public.activity_logs;
CREATE POLICY "activity_logs_select_members" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "activity_logs_insert_members" ON public.activity_logs;
CREATE POLICY "activity_logs_insert_members" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (is_wedding_member(wedding_id));
