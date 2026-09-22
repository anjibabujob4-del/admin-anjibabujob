-- Initial Schema for ANJIBABUJOB.COM

-- Create custom types
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'RECRUITER', 'VIEWER', 'CUSTOMER');
CREATE TYPE job_status AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED');
CREATE TYPE application_status AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'CLOSED');

-- PROFILES
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role DEFAULT 'CUSTOMER'::user_role NOT NULL,
    full_name TEXT,
    mobile TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOB CATEGORIES
CREATE TABLE job_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOBS
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category_id UUID REFERENCES job_categories(id) ON DELETE SET NULL,
    status job_status DEFAULT 'DRAFT'::job_status NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT,
    requirements TEXT,
    location TEXT,
    salary_min NUMERIC,
    salary_max NUMERIC,
    experience TEXT,
    employment_type TEXT,
    vacancies INTEGER,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPLICATION FIELDS (Reusable form fields)
CREATE TABLE application_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_name TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'text', 'number', 'email', 'date', 'select', 'file'
    placeholder TEXT,
    options JSONB, -- For select/radio types
    validation_rules JSONB, -- e.g., {"min": 0, "max": 100}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOB APPLICATION FIELDS (Mapping fields to jobs)
CREATE TABLE job_application_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    field_id UUID REFERENCES application_fields(id) ON DELETE CASCADE,
    required BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, field_id)
);

-- APPLICATIONS
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    status application_status DEFAULT 'SUBMITTED'::application_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPLICATION ANSWERS
CREATE TABLE application_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    field_id UUID REFERENCES application_fields(id) ON DELETE CASCADE,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(application_id, field_id)
);

-- DOCUMENTS
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    size INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPLICATION STATUS HISTORY
CREATE TABLE application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    old_status application_status,
    new_status application_status NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Enablement
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_application_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Profiles: Users can read and update their own profile. Admins can read all.
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER', 'VIEWER'))
);

-- Job Categories: Everyone can read
CREATE POLICY "Job categories are readable by everyone" ON job_categories FOR SELECT USING (true);
-- Admins can manage categories
CREATE POLICY "Admins can insert job categories" ON job_categories FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER'))
);
CREATE POLICY "Admins can update job categories" ON job_categories FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER'))
);

-- Jobs: Everyone can read published jobs. Admins can manage all.
CREATE POLICY "Published jobs are readable by everyone" ON jobs FOR SELECT USING (status = 'PUBLISHED' OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER', 'VIEWER')));
CREATE POLICY "Admins can manage jobs" ON jobs FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER'))
);

-- Application Fields: Everyone can read. Admins manage.
CREATE POLICY "Application fields readable by everyone" ON application_fields FOR SELECT USING (true);
CREATE POLICY "Admins manage application fields" ON application_fields FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER'))
);

-- Job Application Fields: Everyone can read. Admins manage.
CREATE POLICY "Job Application fields readable by everyone" ON job_application_fields FOR SELECT USING (true);
CREATE POLICY "Admins manage job application fields" ON job_application_fields FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER'))
);

-- Applications: Users can read/insert own. Admins can read/update all.
CREATE POLICY "Users can read own applications" ON applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all applications" ON applications FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER', 'VIEWER'))
);

-- Application Answers: Users can read/insert own. Admins can read all.
CREATE POLICY "Users can read own application answers" ON application_answers FOR SELECT USING (
    EXISTS (SELECT 1 FROM applications WHERE id = application_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own application answers" ON application_answers FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM applications WHERE id = application_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all application answers" ON application_answers FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER', 'VIEWER'))
);

-- Documents: Users can read/insert own. Admins can read all.
CREATE POLICY "Users can read own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read all documents" ON documents FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER', 'VIEWER'))
);

-- Application Status History: Users can read own. Admins can manage.
CREATE POLICY "Users can read own status history" ON application_status_history FOR SELECT USING (
    EXISTS (SELECT 1 FROM applications WHERE id = application_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage status history" ON application_status_history FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER'))
);

-- Notifications: Users can read/update own.
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can insert notifications" ON notifications FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'RECRUITER'))
);

-- Create a function to handle new user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'CUSTOMER'::user_role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
