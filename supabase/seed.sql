-- Seed data for ANJIBABUJOB.COM

-- 1. Insert Job Categories
INSERT INTO public.job_categories (id, name, icon) VALUES
  ('d1f5d81b-5e69-42b7-88f5-19a9a3b6f2b1', 'Loading & Unloading', 'Truck'),
  ('d2f5d81b-5e69-42b7-88f5-19a9a3b6f2b2', 'Drivers', 'Car'),
  ('d3f5d81b-5e69-42b7-88f5-19a9a3b6f2b3', 'Milk Suppliers', 'Milk'),
  ('d4f5d81b-5e69-42b7-88f5-19a9a3b6f2b4', 'Distributors', 'Package'),
  ('d5f5d81b-5e69-42b7-88f5-19a9a3b6f2b5', 'Marketing Executive', 'Briefcase'),
  ('d6f5d81b-5e69-42b7-88f5-19a9a3b6f2b6', 'Working Partners', 'Handshake'),
  ('d7f5d81b-5e69-42b7-88f5-19a9a3b6f2b7', 'Iron Staff', 'Hammer'),
  ('d8f5d81b-5e69-42b7-88f5-19a9a3b6f2b8', 'Washing Staff', 'Droplets'),
  ('d9f5d81b-5e69-42b7-88f5-19a9a3b6f2b9', 'Technical Staff', 'Wrench'),
  ('e0f5d81b-5e69-42b7-88f5-19a9a3b6f2c0', 'Delivery Boys', 'Bike'),
  ('e1f5d81b-5e69-42b7-88f5-19a9a3b6f2c1', 'House Keepers', 'Home'),
  ('e2f5d81b-5e69-42b7-88f5-19a9a3b6f2c2', 'Cleaning Staff', 'Broom'),
  ('e3f5d81b-5e69-42b7-88f5-19a9a3b6f2c3', 'Security Guards', 'Shield'),
  ('e4f5d81b-5e69-42b7-88f5-19a9a3b6f2c4', 'Maintenance Staff', 'Tool'),
  ('e5f5d81b-5e69-42b7-88f5-19a9a3b6f2c5', 'Office Staff', 'Monitor')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Base Form Fields (Application Fields)
INSERT INTO public.application_fields (id, field_name, label, type, placeholder, options) VALUES
  ('f1f5d81b-5e69-42b7-88f5-19a9a3b6f2f1', 'full_name', 'Full Name', 'text', 'Enter your full name', null),
  ('f2f5d81b-5e69-42b7-88f5-19a9a3b6f2f2', 'mobile', 'Mobile Number', 'text', 'Enter your mobile number', null),
  ('f3f5d81b-5e69-42b7-88f5-19a9a3b6f2f3', 'address', 'Current Address', 'textarea', 'Enter your full address', null),
  ('f4f5d81b-5e69-42b7-88f5-19a9a3b6f2f4', 'experience_years', 'Years of Experience', 'number', 'E.g., 2', null),
  ('f5f5d81b-5e69-42b7-88f5-19a9a3b6f2f5', 'driving_license', 'Driving License Number', 'text', 'Enter license number', null),
  ('f6f5d81b-5e69-42b7-88f5-19a9a3b6f2f6', 'resume_upload', 'Upload Resume', 'file', null, null)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Example Jobs
INSERT INTO public.jobs (id, title, category_id, status, description, responsibilities, requirements, location, salary_min, salary_max, experience, employment_type, vacancies) VALUES
  ('a1f5d81b-5e69-42b7-88f5-19a9a3b6f2a1', 'Experienced Delivery Boy', 'e0f5d81b-5e69-42b7-88f5-19a9a3b6f2c0', 'PUBLISHED', 'Looking for reliable delivery boys for local area deliveries.', 'Deliver packages on time, maintain delivery logs, ensure package safety.', 'Valid driving license, own two-wheeler, good local area knowledge.', 'Hyderabad', 15000, 20000, '0-2 Years', 'Full-Time', 10),
  ('a2f5d81b-5e69-42b7-88f5-19a9a3b6f2a2', 'Professional Security Guard', 'e3f5d81b-5e69-42b7-88f5-19a9a3b6f2c3', 'PUBLISHED', 'Seeking alert and responsible security guards for apartment complexes.', 'Monitor entrance, patrol premises, report suspicious activities.', 'Physically fit, no criminal background, minimum 1 year experience.', 'Secunderabad', 18000, 22000, '1-3 Years', 'Full-Time', 5),
  ('a3f5d81b-5e69-42b7-88f5-19a9a3b6f2a3', 'Heavy Vehicle Driver', 'd2f5d81b-5e69-42b7-88f5-19a9a3b6f2b2', 'PUBLISHED', 'Heavy vehicle drivers required for inter-state transport.', 'Drive transport vehicles safely, maintain logs, perform basic maintenance.', 'Heavy driving license, 5+ years experience, clean driving record.', 'Multiple Locations', 25000, 35000, '5+ Years', 'Full-Time', 8)
ON CONFLICT (id) DO NOTHING;

-- 4. Map Fields to Jobs
-- Delivery Boy mappings
INSERT INTO public.job_application_fields (job_id, field_id, required, display_order) VALUES
  ('a1f5d81b-5e69-42b7-88f5-19a9a3b6f2a1', 'f1f5d81b-5e69-42b7-88f5-19a9a3b6f2f1', true, 1),
  ('a1f5d81b-5e69-42b7-88f5-19a9a3b6f2a1', 'f2f5d81b-5e69-42b7-88f5-19a9a3b6f2f2', true, 2),
  ('a1f5d81b-5e69-42b7-88f5-19a9a3b6f2a1', 'f3f5d81b-5e69-42b7-88f5-19a9a3b6f2f3', true, 3),
  ('a1f5d81b-5e69-42b7-88f5-19a9a3b6f2a1', 'f5f5d81b-5e69-42b7-88f5-19a9a3b6f2f5', true, 4)
ON CONFLICT DO NOTHING;

-- Driver mappings
INSERT INTO public.job_application_fields (job_id, field_id, required, display_order) VALUES
  ('a3f5d81b-5e69-42b7-88f5-19a9a3b6f2a3', 'f1f5d81b-5e69-42b7-88f5-19a9a3b6f2f1', true, 1),
  ('a3f5d81b-5e69-42b7-88f5-19a9a3b6f2a3', 'f2f5d81b-5e69-42b7-88f5-19a9a3b6f2f2', true, 2),
  ('a3f5d81b-5e69-42b7-88f5-19a9a3b6f2a3', 'f4f5d81b-5e69-42b7-88f5-19a9a3b6f2f4', true, 3),
  ('a3f5d81b-5e69-42b7-88f5-19a9a3b6f2a3', 'f5f5d81b-5e69-42b7-88f5-19a9a3b6f2f5', true, 4)
ON CONFLICT DO NOTHING;
