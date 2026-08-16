-- ============================================================================
-- CampusReuse — DEMO / development seed data
-- ----------------------------------------------------------------------------
-- This file ONLY adds clearly-labelled demo data so the app can be previewed
-- after connecting a Supabase project. It is NOT part of the real product.
-- Delete it (or don't run it) for production.
--
-- Demo login: demo@campusreuse.app / DemoPass123! (also the admin account)
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
on conflict do nothing;

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
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Demo user (auth user so login works; profile is created by the
-- handle_new_user trigger). Also the admin account so every page is testable.
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
     'institution_id', '11111111-1111-1111-1111-111111111101'))
) as u(email, password, meta)
on conflict do nothing;

-- Promote demo user to admin
select public.make_admin('demo@campusreuse.app');

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

  ('22222222-2222-2222-2222-222222222210',
   (select id from public.profiles where username = 'ayesha_khan'),
   'Data Structures & Algorithms in Java (2nd ed)',
   1, 'Computer Science', 'BS CS Year 2', 'good',
   'Core course book. Slight cover wear, inside clean.',
   'sell', 1500, null, 'expired', now() - interval '2 days')
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Demo listing images (placeholder URLs — replace with real photos)
-- ----------------------------------------------------------------------------
insert into public.listing_images (listing_id, url, position)
select l.id, 'https://picsum.photos/seed/' || l.id || '/800/600', 0
from public.listings l
where l.id in (
  '22222222-2222-2222-2222-222222222201',
  '22222222-2222-2222-2222-222222222202',
  '22222222-2222-2222-2222-222222222210'
)
  and not exists (select 1 from public.listing_images img where img.listing_id = l.id);

-- ----------------------------------------------------------------------------
-- (Demo wanted posts removed — the single demo account has no wishlist items.
-- Create them from the app to test that flow.)
-- ----------------------------------------------------------------------------
