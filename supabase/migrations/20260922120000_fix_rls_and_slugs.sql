-- Migration: Fix RLS Infinite Recursion, Add Category Slugs, and Seed Categories & Admin
-- Run this in your Supabase Project SQL Editor (https://supabase.com/dashboard/project/oxsstjqogadoqoghapfe/sql)

-- 1. Create is_admin helper function to prevent infinite RLS recursion
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

-- 2. Add missing columns to job_categories
ALTER TABLE public.job_categories 
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS image TEXT,
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 3. Add missing columns to jobs
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Re-create non-recursive RLS policies on profiles
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

-- 5. Re-create non-recursive RLS policies on jobs
DROP POLICY IF EXISTS "Published jobs are readable by everyone" ON public.jobs;
DROP POLICY IF EXISTS "Admins can manage jobs" ON public.jobs;

CREATE POLICY "Published jobs are readable by everyone" ON public.jobs 
  FOR SELECT USING (status = 'PUBLISHED' OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage jobs" ON public.jobs 
  FOR ALL USING (public.is_admin(auth.uid()));

-- 6. Re-create non-recursive RLS policies on job_categories
DROP POLICY IF EXISTS "Job categories are readable by everyone" ON public.job_categories;
DROP POLICY IF EXISTS "Admins can insert job categories" ON public.job_categories;
DROP POLICY IF EXISTS "Admins can update job categories" ON public.job_categories;

CREATE POLICY "Job categories are readable by everyone" ON public.job_categories 
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert job categories" ON public.job_categories 
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update job categories" ON public.job_categories 
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- 7. Re-create non-recursive RLS policies on applications
DROP POLICY IF EXISTS "Users can read own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can manage all applications" ON public.applications;

CREATE POLICY "Users can read own applications" ON public.applications 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON public.applications 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all applications" ON public.applications 
  FOR ALL USING (public.is_admin(auth.uid()));

-- 8. Re-create non-recursive RLS policies on documents
DROP POLICY IF EXISTS "Users can read own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can read all documents" ON public.documents;

CREATE POLICY "Users can read own documents" ON public.documents 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all documents" ON public.documents 
  FOR SELECT USING (public.is_admin(auth.uid()));

-- 9. Re-create non-recursive RLS policies on application_answers
DROP POLICY IF EXISTS "Users can read own application answers" ON public.application_answers;
DROP POLICY IF EXISTS "Users can insert own application answers" ON public.application_answers;
DROP POLICY IF EXISTS "Admins can manage all application answers" ON public.application_answers;

CREATE POLICY "Users can read own application answers" ON public.application_answers 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.applications WHERE id = application_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert own application answers" ON public.application_answers 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.applications WHERE id = application_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all application answers" ON public.application_answers 
  FOR ALL USING (public.is_admin(auth.uid()));

-- 10. Re-create non-recursive RLS policies on application_status_history
DROP POLICY IF EXISTS "Users can read own status history" ON public.application_status_history;
DROP POLICY IF EXISTS "Admins can manage status history" ON public.application_status_history;

CREATE POLICY "Users can read own status history" ON public.application_status_history 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.applications WHERE id = application_id AND user_id = auth.uid())
  );

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
  SET full_name = EXCLUDED.full_name,
      mobile = EXCLUDED.mobile;
  RETURN new;
END;
$$;

-- 12. Seed/Update All 15 Required Categories with Slugs
INSERT INTO public.job_categories (name, slug, icon, active) VALUES
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
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  icon = EXCLUDED.icon,
  active = EXCLUDED.active;

-- Update slug on any existing records that match name
UPDATE public.job_categories SET slug = 'loading-unloading' WHERE name = 'Loading & Unloading' AND (slug IS NULL OR slug = '');
UPDATE public.job_categories SET slug = 'drivers' WHERE name = 'Drivers' AND (slug IS NULL OR slug = '');
UPDATE public.job_categories SET slug = 'milk-suppliers' WHERE name = 'Milk Suppliers' AND (slug IS NULL OR slug = '');
UPDATE public.job_categories SET slug = 'distributors' WHERE name = 'Distributors' AND (slug IS NULL OR slug = '');
UPDATE public.job_categories SET slug = 'marketing-executive' WHERE name = 'Marketing Executive' AND (slug IS NULL OR slug = '');
UPDATE public.job_categories SET slug = 'working-partners' WHERE name = 'Working Partners' AND (slug IS NULL OR slug = '');
UPDATE public.job_categories SET slug = 'iron-staff' WHERE name = 'Iron Staff' AND (slug IS NULL OR slug = '');
UPDATE public.job_categories SET slug = 'washing-staff' WHERE name = 'Washing Staff' AND (slug IS NULL OR slug = '');
UPDATE public.job_categories SET slug = 'technical-staff' WHERE name = 'Technical Staff' AND (slug IS NULL OR slug = '');
UPDATE public.job_categories SET slug = 'delivery-boys' WHERE name = 'Delivery Boys' AND (slug IS NULL OR slug = '');
UPDATE public.job_categories SET slug = 'house-keepers' WHERE name = 'House Keepers' AND (slug IS NULL OR slug = '');
UPDATE public.job_categories SET slug = 'cleaning-staff' WHERE name = 'Cleaning Staff' AND (slug IS NULL OR slug = '');
UPDATE public.job_categories SET slug = 'security-guards' WHERE name = 'Security Guards' AND (slug IS NULL OR slug = '');
UPDATE public.job_categories SET slug = 'maintenance-staff' WHERE name = 'Maintenance Staff' AND (slug IS NULL OR slug = '');
UPDATE public.job_categories SET slug = 'office-staff' WHERE name = 'Office Staff' AND (slug IS NULL OR slug = '');
