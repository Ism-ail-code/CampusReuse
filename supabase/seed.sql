-- ============================================================================
-- CampusReuse — DEMO / development seed data
-- ----------------------------------------------------------------------------
-- This file ONLY adds clearly-labelled demo data so the app can be previewed
-- after connecting a Supabase project. It is NOT part of the real product.
-- Delete it (or don't run it) for production.
--
-- Demo login: demo@campusreuse.app  /  DemoPass123!
-- Admin login: admin@campusreuse.app / AdminPass123!
--
-- NOTE: listing images below use external placeholder URLs (picsum.photos).
-- Replace with real photos when you actually list items.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Institutions — national catalog (see src/lib/institutions.ts)
-- ----------------------------------------------------------------------------
-- The 6 core institutions keep fixed UUIDs because the demo users below
-- reference them. Everything else uses deterministic UUIDs derived from the
-- institution name (idempotent across re-runs).
insert into public.institutions (id, name, type, city, is_verified) values
  ('11111111-1111-1111-1111-111111111101', 'University of the Punjab',                     'university', 'Lahore', true),
  ('11111111-1111-1111-1111-111111111102', 'Government College University Lahore',         'university', 'Lahore', true),
  ('11111111-1111-1111-1111-111111111103', 'University of Engineering & Technology Lahore','university', 'Lahore', true),
  ('11111111-1111-1111-1111-111111111104', 'Lahore Grammar School',                        'school',     'Lahore', true),
  ('11111111-1111-1111-1111-111111111105', 'KIPS College',                                 'college',    'Lahore', true),
  ('11111111-1111-1111-1111-111111111106', 'Beaconhouse School System',                    'school',     'Lahore', true)
on conflict (id) do nothing;

insert into public.institutions (id, name, type, city, is_verified)
select
  ('00000000-0000-4000-8000-' || left(md5(t.name), 12))::uuid,
  t.name,
  t.type::public.institution_type,
  t.city,
  t.is_verified
from (values
  ('University of Central Punjab',                          'university', 'Lahore',     true),
  ('University of Management & Technology (UMT)',           'university', 'Lahore',     true),
  ('Lahore College for Women University',                   'university', 'Lahore',     true),
  ('Forman Christian College (A Chartered University)',     'university', 'Lahore',     true),
  ('The University of Lahore',                              'university', 'Lahore',     true),
  ('Beaconhouse National University',                       'university', 'Lahore',     true),
  ('Information Technology University (ITU)',               'university', 'Lahore',     true),
  ('Kinnaird College for Women University',                 'university', 'Lahore',     true),
  ('National College of Arts (NCA)',                        'university', 'Lahore',     true),
  ('Superior University',                                   'university', 'Lahore',     true),
  ('Hajvery University',                                    'university', 'Lahore',     true),
  ('Minhaj University Lahore',                              'university', 'Lahore',     true),
  ('University of Education (Lahore)',                      'university', 'Lahore',     true),
  ('National University of Sciences & Technology (NUST)',   'university', 'Islamabad',  true),
  ('Quaid-i-Azam University',                               'university', 'Islamabad',  true),
  ('International Islamic University Islamabad',            'university', 'Islamabad',  true),
  ('COMSATS University Islamabad',                          'university', 'Islamabad',  true),
  ('Air University',                                        'university', 'Islamabad',  true),
  ('Bahria University',                                     'university', 'Islamabad',  true),
  ('National University of Modern Languages (NUML)',        'university', 'Islamabad',  true),
  ('Riphah International University',                       'university', 'Islamabad',  true),
  ('Pakistan Institute of Engineering & Applied Sciences (PIEAS)', 'university', 'Islamabad', true),
  ('SZABIST',                                               'university', 'Islamabad',  true),
  ('Federal Urdu University of Arts, Science & Technology', 'university', 'Islamabad',  true),
  ('Foundation University Islamabad',                       'university', 'Islamabad',  true),
  ('Allama Iqbal Open University',                          'university', 'Islamabad',  true),
  ('Pir Mehr Ali Shah Arid Agriculture University',         'university', 'Rawalpindi', true),
  ('University of Karachi',                                 'university', 'Karachi',    true),
  ('NED University of Engineering & Technology',            'university', 'Karachi',    true),
  ('Aga Khan University',                                   'university', 'Karachi',    true),
  ('Institute of Business Administration (IBA) Karachi',    'university', 'Karachi',    true),
  ('Dow University of Health Sciences',                     'university', 'Karachi',    true),
  ('Sir Syed University of Engineering & Technology',       'university', 'Karachi',    true),
  ('Habib University',                                      'university', 'Karachi',    true),
  ('Iqra University',                                       'university', 'Karachi',    true),
  ('Hamdard University',                                    'university', 'Karachi',    true),
  ('Indus Valley School of Art & Architecture',             'university', 'Karachi',    true),
  ('Mohammad Ali Jinnah University',                        'university', 'Karachi',    true),
  ('University of Engineering & Technology Peshawar',       'university', 'Peshawar',   true),
  ('University of Peshawar',                                'university', 'Peshawar',   true),
  ('The University of Agriculture Peshawar',                'university', 'Peshawar',   true),
  ('University of Sargodha',                                'university', 'Sargodha',   true),
  ('Government College University Faisalabad',              'university', 'Faisalabad', true),
  ('University of Agriculture Faisalabad',                  'university', 'Faisalabad', true),
  ('National Textile University',                           'university', 'Faisalabad', true),
  ('Bahauddin Zakariya University',                         'university', 'Multan',     true),
  ('Nishtar Medical University',                            'university', 'Multan',     true),
  ('University of Gujrat',                                  'university', 'Gujrat',     true),
  ('University of Wah',                                     'university', 'Wah Cantt',  true),
  ('University of Balochistan',                             'university', 'Quetta',     true),
  ('Balochistan University of IT, Engineering & Management Sciences (BUITEMS)', 'university', 'Quetta', true),
  ('University of Sindh',                                   'university', 'Jamshoro',   true),
  ('Mehran University of Engineering & Technology',         'university', 'Jamshoro',   true),
  ('Sukkur IBA University',                                 'university', 'Sukkur',     true),
  ('The Islamia University of Bahawalpur',                  'university', 'Bahawalpur', true),
  ('Ghazi University',                                      'university', 'Dera Ghazi Khan', true),
  ('University of Swat',                                    'university', 'Swat',       true),
  ('Punjab Group of Colleges',                              'college',    'Lahore',     true),
  ('Punjab Colleges',                                       'college',    'Lahore',     true),
  ('Superior College',                                      'college',    'Lahore',     true),
  ('Edwardes College',                                      'college',    'Peshawar',   true),
  ('Islamia College Peshawar',                              'college',    'Peshawar',   true),
  ('D.J. Science College',                                  'college',    'Karachi',    true),
  ('Government National College',                           'college',    'Karachi',    true),
  ('Government Degree College',                             'college',    'Lahore',     false),
  ('Government College of Technology',                      'college',    'Lahore',     true),
  ('Cadet College Petaro',                                  'college',    'Jamshoro',   true),
  ('The City School',                                       'school',     'Karachi',    true),
  ('Roots Millennium Schools',                              'school',     'Islamabad',  true),
  ('The Educators',                                         'school',     'Lahore',     true),
  ('Aitchison College',                                     'school',     'Lahore',     true),
  ('Karachi Grammar School',                                'school',     'Karachi',    true),
  ('Army Public School & College System (APSACS)',          'school',     'Rawalpindi', true),
  ('Cadet College Hasan Abdal',                             'school',     'Hasan Abdal', true),
  ('Sadiq Public School',                                   'school',     'Bahawalpur', true),
  ('National Grammar School',                               'school',     'Karachi',    true),
  ('St. Patrick''s High School',                            'school',     'Karachi',    true),
  ('Divisional Public School',                              'school',     'Lahore',     true),
  ('Crescent Model Higher Secondary School',                'school',     'Lahore',     true),
  ('Garrison Academy',                                      'school',     'Lahore',     true),
  ('Froebel''s International School',                       'school',     'Islamabad',  true),
  ('Headstart School',                                      'school',     'Islamabad',  true),
  ('Islamabad Convent School',                              'school',     'Islamabad',  true),
  ('Kendall Pearson Academy',                               'school',     'Lahore',     true)
) as t(name, type, city, is_verified)
on conflict (lower(name)) do nothing;

-- ----------------------------------------------------------------------------
-- Demo users (auth users so login works, profiles via trigger)
-- ----------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  u.email,
  crypt(u.password, gen_salt('bf')),
  now(),
  jsonb_build_object('provider', 'email', 'providers', array['email']),
  u.meta,
  now(),
  now()
from (values
  ('demo@campusreuse.app', 'DemoPass123!', jsonb_build_object(
     'display_name', 'Ayesha Khan', 'username', 'ayesha_khan',
     'account_type', 'student', 'education_level', 'BS Computer Science Year 2',
     'institution_id', '11111111-1111-1111-1111-111111111101')),
  ('admin@campusreuse.app', 'AdminPass123!', jsonb_build_object(
     'display_name', 'Admin User', 'username', 'campus_admin',
     'account_type', 'student', 'education_level', 'Masters',
     'institution_id', '11111111-1111-1111-1111-111111111101')),
  ('bilal@campusreuse.app', 'DemoPass123!', jsonb_build_object(
     'display_name', 'Bilal Ahmed', 'username', 'bilal_ahmed',
     'account_type', 'student', 'education_level', 'Grade 11',
     'institution_id', '11111111-1111-1111-1111-111111111104')),
  ('fatima@campusreuse.app', 'DemoPass123!', jsonb_build_object(
     'display_name', 'Fatima Noor', 'username', 'fatima_noor',
     'account_type', 'student', 'education_level', 'Grade 12',
     'institution_id', '11111111-1111-1111-1111-111111111104')),
  ('daniyal@campusreuse.app', 'DemoPass123!', jsonb_build_object(
     'display_name', 'Daniyal Shah', 'username', 'daniyal_shah',
     'account_type', 'student', 'education_level', 'BS Physics Year 3',
     'institution_id', '11111111-1111-1111-1111-111111111103')),
  ('zara@campusreuse.app', 'DemoPass123!', jsonb_build_object(
     'display_name', 'Zara Malik', 'username', 'zara_malik',
     'account_type', 'student', 'education_level', 'Grade 10',
     'institution_id', '11111111-1111-1111-1111-111111111106')),
  ('mr_shah@campusreuse.app', 'DemoPass123!', jsonb_build_object(
     'display_name', 'Mr. Imran Shah', 'username', 'imran_shah',
     'account_type', 'teacher', 'education_level', 'Teaching Staff',
     'institution_id', '11111111-1111-1111-1111-111111111104'))
) as u(email, password, meta)
on conflict (email) do nothing;

-- Promote admin user
select public.make_admin('admin@campusreuse.app');

-- ----------------------------------------------------------------------------
-- Demo listings
-- ----------------------------------------------------------------------------
insert into public.listings (
  id, seller_id, title, category_id, subject, education_level, condition,
  description, transaction_type, price, exchange_want, status, expires_at
) values
  ('22222222-2222-2222-2222-222222222201',
   (select id from public.profiles where username = 'ayesha_khan'),
   'Punjab Board Class 11 Physics Textbook (Part 1 & 2)',
   1, 'Physics', 'Grade 11', 'good',
   'Punjab Textbook Board edition. Minor pencil underlining in two chapters, all pages intact. Bought last year, finished with it now.',
   'sell', 800, null, 'available', now() + interval '20 days'),

  ('22222222-2222-2222-2222-222222222202',
   (select id from public.profiles where username = 'ayesha_khan'),
   'Chemistry Part 1 & 2 — Federal Board Class 11',
   1, 'Chemistry', 'Grade 11', 'like_new',
   'Hardly used. Covers both Part 1 and Part 2. Ideal for anyone starting Class 11.',
   'exchange', null, 'Class 11 Mathematics textbook (any board)',
   'available', now() + interval '12 days'),

  ('22222222-2222-2222-2222-222222222203',
   (select id from public.profiles where username = 'bilal_ahmed'),
   'Class 10 Maths Key Book / Solved Guide (LGS edition)',
   3, 'Mathematics', 'Grade 10', 'good',
   'Step-by-step solutions. A few pages have margin notes. Very helpful for boards preparation.',
   'sell', 450, null, 'available', now() + interval '25 days'),

  ('22222222-2222-2222-2222-222222222204',
   (select id from public.profiles where username = 'fatima_noor'),
   'Class 9 Biology Complete Notes (handwritten, 120 pages)',
   2, 'Biology', 'Grade 9', 'used',
   'Complete handwritten notes covering all chapters with diagrams. Gave them away to a junior.',
   'give_away', null, null, 'given_away', now() - interval '5 days'),

  ('22222222-2222-2222-2222-222222222205',
   (select id from public.profiles where username = 'daniyal_shah'),
   'Casio fx-991EX ClassWiz Scientific Calculator',
   4, null, 'BS Physics Year 3', 'like_new',
   'Used for one semester of labs. Comes with original box and manual. Perfect for engineering/physics.',
   'sell', 5000, null, 'available', now() + interval '18 days'),

  ('22222222-2222-2222-2222-222222222206',
   (select id from public.profiles where username = 'zara_malik'),
   'English Literature Guide — Class 10',
   3, 'English', 'Grade 10', 'good',
   'Punjab board. Some highlighting in poetry section. Free to whoever needs it.',
   'give_away', null, null, 'available', now() + interval '28 days'),

  ('22222222-2222-2222-2222-222222222207',
   (select id from public.profiles where username = 'mr_shah'),
   'Oxford English Grammar Course (Advanced) — unused',
   1, 'English', 'Teacher resource', 'new',
   'Brand new, never opened. Great for teaching O/A level English.',
   'sell', 2200, null, 'available', now() + interval '22 days'),

  ('22222222-2222-2222-2222-222222222208',
   (select id from public.profiles where username = 'daniyal_shah'),
   'Calculus Early Transcendentals — swap for Linear Algebra book',
   1, 'Mathematics', 'BS Year 1', 'used',
   'Well used but complete. Looking to swap for a Linear Algebra text (any edition).',
   'exchange', null, 'Linear Algebra textbook',
   'available', now() + interval '30 days'),

  ('22222222-2222-2222-2222-222222222209',
   (select id from public.profiles where username = 'bilal_ahmed'),
   'Pack of 5 A4 Notebooks (unused)',
   5, null, 'Grade 11', 'new',
   'Unused notebooks from a bulk pack. Selling cheap.',
   'sell', 500, null, 'reserved', now() + interval '9 days'),

  ('22222222-2222-2222-2222-222222222210',
   (select id from public.profiles where username = 'ayesha_khan'),
   'Data Structures & Algorithms in Java (2nd ed)',
   1, 'Computer Science', 'BS CS Year 2', 'good',
   'Core course book. Slight cover wear, inside clean.',
   'sell', 1500, null, 'expired', now() - interval '2 days'),

  ('22222222-2222-2222-2222-222222222211',
   (select id from public.profiles where username = 'fatima_noor'),
   'Physics Practical Notebook (Class 9)',
   5, 'Physics', 'Grade 9', 'like_new',
   'Completed practical notebook, teacher-checked. Useful as a reference.',
   'exchange', null, 'Chemistry practical notebook',
   'available', now() + interval '15 days'),

  ('22222222-2222-2222-2222-222222222212',
   (select id from public.profiles where username = 'zara_malik'),
   'Computer Science Class 9 Guide',
   3, 'Computer Science', 'Grade 9', 'good',
   'In good condition, no missing pages.',
   'sell', 350, null, 'available', now() + interval '24 days')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- Demo listing images (placeholder URLs — replace with real photos)
-- ----------------------------------------------------------------------------
insert into public.listing_images (listing_id, url, position)
select l.id, 'https://picsum.photos/seed/' || l.id || '/800/600', 0
from public.listings l
where l.id in (
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
  '22222222-2222-2222-2222-222222222203',
  '22222222-2222-2222-2222-222222222205',
  '22222222-2222-2222-2222-222222222206',
  '22222222-2222-2222-2222-222222222207',
  '22222222-2222-2222-2222-222222222208',
  '22222222-2222-2222-2222-222222222209',
  '22222222-2222-2222-2222-222222222211',
  '22222222-2222-2222-2222-222222222212'
);

-- ----------------------------------------------------------------------------
-- Demo wanted posts
-- ----------------------------------------------------------------------------
insert into public.wanted_posts (
  id, user_id, title, category_id, subject, education_level,
  condition_pref, budget, description, status, expires_at
) values
  ('33333333-3333-3333-3333-333333333301',
   (select id from public.profiles where username = 'bilal_ahmed'),
   'Wanted: Class 11 Physics Textbook', 1, 'Physics', 'Grade 11',
   'good', 1000,
   'Looking for a used copy in reasonable condition. Any board welcome.',
   'active', now() + interval '20 days'),

  ('33333333-3333-3333-3333-333333333302',
   (select id from public.profiles where username = 'zara_malik'),
   'Wanted: Class 10 Biology textbook', 1, 'Biology', 'Grade 10',
   'used', 600,
   'Need it for board prep. Willing to buy used.',
   'active', now() + interval '26 days'),

  ('33333333-3333-3333-3333-333333333303',
   (select id from public.profiles where username = 'daniyal_shah'),
   'Wanted: Linear Algebra textbook', 1, 'Mathematics', 'BS Year 2',
   null, 1500,
   'Any standard text. Happy to exchange or buy.',
   'active', now() + interval '14 days'),

  ('33333333-3333-3333-3333-333333333304',
   (select id from public.profiles where username = 'ayesha_khan'),
   'Wanted: Scientific calculator for exams', 4, null, 'Grade 12',
   'good', 2500,
   'Casio or similar. Need it before the November exam session.',
   'active', now() + interval '10 days')
on conflict (id) do nothing;
