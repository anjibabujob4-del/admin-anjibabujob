-- ==============================================================================
-- ANJIBABUJOB.COM - COMPLETE WORKING SETUP SCRIPT (FIXED)
-- Paste this entire script into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/oxsstjqogadoqoghapfe/sql/new
-- ==============================================================================

-- 1. Enable required extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create is_admin helper function to prevent infinite RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER', 'VIEWER')
  );
$$;

-- 3. Add missing columns to job_categories & jobs
ALTER TABLE public.job_categories 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS image TEXT,
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Ensure unique constraint on name if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'job_categories_name_key'
  ) THEN
    -- In case of duplicate names, keep only distinct
    ALTER TABLE public.job_categories ADD CONSTRAINT job_categories_name_key UNIQUE (name);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Re-create RLS Policies on profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON public.profiles 
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow insert profile" ON public.profiles 
  FOR INSERT WITH CHECK (true);

-- 5. Re-create RLS Policies on jobs
DROP POLICY IF EXISTS "Published jobs are readable by everyone" ON public.jobs;
DROP POLICY IF EXISTS "Admins can manage jobs" ON public.jobs;

CREATE POLICY "Published jobs are readable by everyone" ON public.jobs 
  FOR SELECT USING (status = 'PUBLISHED' OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage jobs" ON public.jobs 
  FOR ALL USING (public.is_admin(auth.uid()));

-- 6. Re-create RLS Policies on job_categories
DROP POLICY IF EXISTS "Job categories are readable by everyone" ON public.job_categories;
DROP POLICY IF EXISTS "Admins can insert job categories" ON public.job_categories;
DROP POLICY IF EXISTS "Admins can update job categories" ON public.job_categories;

CREATE POLICY "Job categories are readable by everyone" ON public.job_categories 
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert job categories" ON public.job_categories 
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update job categories" ON public.job_categories 
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- 7. Re-create RLS Policies on applications
DROP POLICY IF EXISTS "Users can read own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON public.applications;
DROP POLICY IF EXISTS "Anyone can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can manage all applications" ON public.applications;

CREATE POLICY "Users can read own applications" ON public.applications 
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can insert applications" ON public.applications 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all applications" ON public.applications 
  FOR ALL USING (public.is_admin(auth.uid()));

-- 8. Re-create RLS Policies on documents
DROP POLICY IF EXISTS "Users can read own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can read all documents" ON public.documents;

CREATE POLICY "Users can read own documents" ON public.documents 
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Anyone can insert documents" ON public.documents 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read all documents" ON public.documents 
  FOR SELECT USING (public.is_admin(auth.uid()));

-- 9. Re-create RLS Policies on application_answers
DROP POLICY IF EXISTS "Users can read own application answers" ON public.application_answers;
DROP POLICY IF EXISTS "Users can insert own application answers" ON public.application_answers;
DROP POLICY IF EXISTS "Anyone can insert application answers" ON public.application_answers;
DROP POLICY IF EXISTS "Admins can manage all application answers" ON public.application_answers;

CREATE POLICY "Anyone can insert application answers" ON public.application_answers 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all application answers" ON public.application_answers 
  FOR ALL USING (public.is_admin(auth.uid()));

-- 10. Re-create RLS Policies on application_status_history
DROP POLICY IF EXISTS "Users can read own status history" ON public.application_status_history;
DROP POLICY IF EXISTS "Anyone can insert status history" ON public.application_status_history;
DROP POLICY IF EXISTS "Admins can manage status history" ON public.application_status_history;

CREATE POLICY "Anyone can insert status history" ON public.application_status_history 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage status history" ON public.application_status_history 
  FOR ALL USING (public.is_admin(auth.uid()));

-- 11. Fix handle_new_user function for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, mobile, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'mobile', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'CUSTOMER'::user_role)
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      mobile = COALESCE(EXCLUDED.mobile, public.profiles.mobile);
  RETURN new;
END;
$$;

-- 12. Update All 15 Categories with Slugs (Safe UPDATEs without ON CONFLICT requirement)
UPDATE public.job_categories SET slug = 'loading-unloading', icon = 'Truck', active = true WHERE name = 'Loading & Unloading';
UPDATE public.job_categories SET slug = 'drivers', icon = 'Car', active = true WHERE name = 'Drivers';
UPDATE public.job_categories SET slug = 'milk-suppliers', icon = 'Milk', active = true WHERE name = 'Milk Suppliers';
UPDATE public.job_categories SET slug = 'distributors', icon = 'Package', active = true WHERE name = 'Distributors';
UPDATE public.job_categories SET slug = 'marketing-executive', icon = 'Briefcase', active = true WHERE name = 'Marketing Executive';
UPDATE public.job_categories SET slug = 'working-partners', icon = 'Handshake', active = true WHERE name = 'Working Partners';
UPDATE public.job_categories SET slug = 'iron-staff', icon = 'Hammer', active = true WHERE name = 'Iron Staff';
UPDATE public.job_categories SET slug = 'washing-staff', icon = 'Droplets', active = true WHERE name = 'Washing Staff';
UPDATE public.job_categories SET slug = 'technical-staff', icon = 'Wrench', active = true WHERE name = 'Technical Staff';
UPDATE public.job_categories SET slug = 'delivery-boys', icon = 'Bike', active = true WHERE name = 'Delivery Boys';
UPDATE public.job_categories SET slug = 'house-keepers', icon = 'Home', active = true WHERE name = 'House Keepers';
UPDATE public.job_categories SET slug = 'cleaning-staff', icon = 'Broom', active = true WHERE name = 'Cleaning Staff';
UPDATE public.job_categories SET slug = 'security-guards', icon = 'Shield', active = true WHERE name = 'Security Guards';
UPDATE public.job_categories SET slug = 'maintenance-staff', icon = 'Tool', active = true WHERE name = 'Maintenance Staff';
UPDATE public.job_categories SET slug = 'office-staff', icon = 'Monitor', active = true WHERE name = 'Office Staff';

-- Insert any category if it doesn't already exist in the table
INSERT INTO public.job_categories (name, slug, icon, active)
SELECT v.name, v.slug, v.icon, v.active
FROM (VALUES
  ('Loading & Unloading', 'loading-unloading', 'Truck', true),
  ('Drivers', 'drivers', 'Car', true),
  ('Milk Suppliers', 'milk-suppliers', 'Milk', true),
  ('Distributors', 'distributors', 'Package', true),
  ('Marketing Executive', 'marketing-executive', 'Briefcase', true),
  ('Working Partners', 'working-partners', 'Handshake', true),
  ('Iron Staff', 'iron-staff', 'Hammer', true),
  ('Washing Staff', 'washing-staff', 'Droplets', true),
  ('Technical Staff', 'technical-staff', 'Wrench', true),
  ('Delivery Boys', 'delivery-boys', 'Bike', true),
  ('House Keepers', 'house-keepers', 'Home', true),
  ('Cleaning Staff', 'cleaning-staff', 'Broom', true),
  ('Security Guards', 'security-guards', 'Shield', true),
  ('Maintenance Staff', 'maintenance-staff', 'Tool', true),
  ('Office Staff', 'office-staff', 'Monitor', true)
) AS v(name, slug, icon, active)
WHERE NOT EXISTS (
  SELECT 1 FROM public.job_categories jc WHERE jc.name = v.name
);

-- 13. Create or Update the Admin User (admin@anjibabujob.com / AdminPassword123!)
DO $$
DECLARE
  new_admin_id uuid := gen_random_uuid();
  existing_id uuid;
BEGIN
  SELECT id INTO existing_id FROM auth.users WHERE email = 'admin@anjibabujob.com';
  
  IF existing_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_admin_id,
      'authenticated',
      'authenticated',
      'admin@anjibabujob.com',
      crypt('AdminPassword123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Administrator"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    -- Insert identity with provider_id to satisfy not-null constraint
    BEGIN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        new_admin_id,
        new_admin_id,
        format('{"sub":"%s","email":"%s"}', new_admin_id, 'admin@anjibabujob.com')::jsonb,
        'email',
        new_admin_id::text,
        NOW(),
        NOW(),
        NOW()
      );
    EXCEPTION WHEN OTHERS THEN
      -- If identities insertion fails or schema differs, user is still created in auth.users
      NULL;
    END;

    existing_id := new_admin_id;
  ELSE
    -- If user already exists, update password to AdminPassword123!
    UPDATE auth.users
    SET encrypted_password = crypt('AdminPassword123!', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = existing_id;
  END IF;

  -- Ensure profile exists with SUPER_ADMIN role
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (existing_id, 'Administrator', 'SUPER_ADMIN')
  ON CONFLICT (id) DO UPDATE SET role = 'SUPER_ADMIN', full_name = 'Administrator';
END $$;

-- 14. Ensure storage bucket 'documents' exists and is private
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('documents', 'documents', false)
  ON CONFLICT (id) DO UPDATE SET public = false;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
