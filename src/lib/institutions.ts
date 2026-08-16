import type { InstitutionType } from "./types"

// ============================================================================
// National institution catalog
// ----------------------------------------------------------------------------
// A curated list of well-known Pakistani schools, colleges and universities
// that are pre-registered (and considered verified) so students can find
// their institution immediately. Institutions NOT on this list can still be
// requested through the "Request institution" flow, which admins review.
//
// The demo service (demoService.ts) and the Supabase seed (seed.sql) both
// build their institution tables from this list.
// ============================================================================

export interface CatalogInstitution {
  id: string
  name: string
  type: InstitutionType
  city: string
  is_verified: boolean
}

export const INSTITUTIONS: CatalogInstitution[] = [
  // --------------------------------------------------------------------------
  // Lahore — universities
  // --------------------------------------------------------------------------
  { id: "inst_punjab", name: "University of the Punjab", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_gcu", name: "Government College University Lahore", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_uet", name: "University of Engineering & Technology Lahore", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_lums", name: "Lahore University of Management Sciences (LUMS)", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_ucp", name: "University of Central Punjab", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_umt", name: "University of Management & Technology (UMT)", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_lcwu", name: "Lahore College for Women University", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_forman", name: "Forman Christian College (A Chartered University)", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_uol", name: "The University of Lahore", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_bnu", name: "Beaconhouse National University", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_itu", name: "Information Technology University (ITU)", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_kinnaird", name: "Kinnaird College for Women University", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_nca", name: "National College of Arts (NCA)", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_superior", name: "Superior University", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_hajvery", name: "Hajvery University", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_mul", name: "Minhaj University Lahore", type: "university", city: "Lahore", is_verified: true },
  { id: "inst_ue", name: "University of Education (Lahore)", type: "university", city: "Lahore", is_verified: true },

  // --------------------------------------------------------------------------
  // Islamabad & Rawalpindi — universities
  // --------------------------------------------------------------------------
  { id: "inst_nust", name: "National University of Sciences & Technology (NUST)", type: "university", city: "Islamabad", is_verified: true },
  { id: "inst_qau", name: "Quaid-i-Azam University", type: "university", city: "Islamabad", is_verified: true },
  { id: "inst_iiui", name: "International Islamic University Islamabad", type: "university", city: "Islamabad", is_verified: true },
  { id: "inst_comsats", name: "COMSATS University Islamabad", type: "university", city: "Islamabad", is_verified: true },
  { id: "inst_air", name: "Air University", type: "university", city: "Islamabad", is_verified: true },
  { id: "inst_bahria", name: "Bahria University", type: "university", city: "Islamabad", is_verified: true },
  { id: "inst_numl", name: "National University of Modern Languages (NUML)", type: "university", city: "Islamabad", is_verified: true },
  { id: "inst_riphah", name: "Riphah International University", type: "university", city: "Islamabad", is_verified: true },
  { id: "inst_pieas", name: "Pakistan Institute of Engineering & Applied Sciences (PIEAS)", type: "university", city: "Islamabad", is_verified: true },
  { id: "inst_szabist", name: "SZABIST", type: "university", city: "Islamabad", is_verified: true },
  { id: "inst_fuuast", name: "Federal Urdu University of Arts, Science & Technology", type: "university", city: "Islamabad", is_verified: true },
  { id: "inst_foundation", name: "Foundation University Islamabad", type: "university", city: "Islamabad", is_verified: true },
  { id: "inst_aiou", name: "Allama Iqbal Open University", type: "university", city: "Islamabad", is_verified: true },
  { id: "inst_uaar", name: "Pir Mehr Ali Shah Arid Agriculture University", type: "university", city: "Rawalpindi", is_verified: true },

  // --------------------------------------------------------------------------
  // Karachi — universities
  // --------------------------------------------------------------------------
  { id: "inst_kurdu", name: "University of Karachi", type: "university", city: "Karachi", is_verified: true },
  { id: "inst_ned", name: "NED University of Engineering & Technology", type: "university", city: "Karachi", is_verified: true },
  { id: "inst_aku", name: "Aga Khan University", type: "university", city: "Karachi", is_verified: true },
  { id: "inst_iba", name: "Institute of Business Administration (IBA) Karachi", type: "university", city: "Karachi", is_verified: true },
  { id: "inst_dow", name: "Dow University of Health Sciences", type: "university", city: "Karachi", is_verified: true },
  { id: "inst_ssuet", name: "Sir Syed University of Engineering & Technology", type: "university", city: "Karachi", is_verified: true },
  { id: "inst_habib", name: "Habib University", type: "university", city: "Karachi", is_verified: true },
  { id: "inst_iqra", name: "Iqra University", type: "university", city: "Karachi", is_verified: true },
  { id: "inst_hamdard", name: "Hamdard University", type: "university", city: "Karachi", is_verified: true },
  { id: "inst_indu", name: "Indus Valley School of Art & Architecture", type: "university", city: "Karachi", is_verified: true },
  { id: "inst_maju", name: "Mohammad Ali Jinnah University", type: "university", city: "Karachi", is_verified: true },

  // --------------------------------------------------------------------------
  // Other cities — universities
  // --------------------------------------------------------------------------
  { id: "inst_uetp", name: "University of Engineering & Technology Peshawar", type: "university", city: "Peshawar", is_verified: true },
  { id: "inst_peshawar", name: "University of Peshawar", type: "university", city: "Peshawar", is_verified: true },
  { id: "inst_agripesh", name: "The University of Agriculture Peshawar", type: "university", city: "Peshawar", is_verified: true },
  { id: "inst_sargodha", name: "University of Sargodha", type: "university", city: "Sargodha", is_verified: true },
  { id: "inst_gcuf", name: "Government College University Faisalabad", type: "university", city: "Faisalabad", is_verified: true },
  { id: "inst_uaf", name: "University of Agriculture Faisalabad", type: "university", city: "Faisalabad", is_verified: true },
  { id: "inst_ntu", name: "National Textile University", type: "university", city: "Faisalabad", is_verified: true },
  { id: "inst_bzu", name: "Bahauddin Zakariya University", type: "university", city: "Multan", is_verified: true },
  { id: "inst_nishtar", name: "Nishtar Medical University", type: "university", city: "Multan", is_verified: true },
  { id: "inst_uog", name: "University of Gujrat", type: "university", city: "Gujrat", is_verified: true },
  { id: "inst_uwah", name: "University of Wah", type: "university", city: "Wah Cantt", is_verified: true },
  { id: "inst_uob", name: "University of Balochistan", type: "university", city: "Quetta", is_verified: true },
  { id: "inst_buitems", name: "Balochistan University of IT, Engineering & Management Sciences (BUITEMS)", type: "university", city: "Quetta", is_verified: true },
  { id: "inst_sindh", name: "University of Sindh", type: "university", city: "Jamshoro", is_verified: true },
  { id: "inst_mehran", name: "Mehran University of Engineering & Technology", type: "university", city: "Jamshoro", is_verified: true },
  { id: "inst_sukkur", name: "Sukkur IBA University", type: "university", city: "Sukkur", is_verified: true },
  { id: "inst_iub", name: "The Islamia University of Bahawalpur", type: "university", city: "Bahawalpur", is_verified: true },
  { id: "inst_ghazi", name: "Ghazi University", type: "university", city: "Dera Ghazi Khan", is_verified: true },
  { id: "inst_swat", name: "University of Swat", type: "university", city: "Swat", is_verified: true },

  // --------------------------------------------------------------------------
  // Colleges
  // --------------------------------------------------------------------------
  { id: "inst_kips", name: "KIPS College", type: "college", city: "Lahore", is_verified: true },
  { id: "inst_pgc", name: "Punjab Group of Colleges", type: "college", city: "Lahore", is_verified: true },
  { id: "inst_punjabcolleges", name: "Punjab Colleges", type: "college", city: "Lahore", is_verified: true },
  { id: "inst_superiorcollege", name: "Superior College", type: "college", city: "Lahore", is_verified: true },
  { id: "inst_edwardes", name: "Edwardes College", type: "college", city: "Peshawar", is_verified: true },
  { id: "inst_islamiacollege", name: "Islamia College Peshawar", type: "college", city: "Peshawar", is_verified: true },
  { id: "inst_dj", name: "D.J. Science College", type: "college", city: "Karachi", is_verified: true },
  { id: "inst_gnc", name: "Government National College", type: "college", city: "Karachi", is_verified: true },
  { id: "inst_gdc", name: "Government Degree College", type: "college", city: "Lahore", is_verified: false },
  { id: "inst_gct", name: "Government College of Technology", type: "college", city: "Lahore", is_verified: true },
  { id: "inst_cadet_petaro", name: "Cadet College Petaro", type: "college", city: "Jamshoro", is_verified: true },

  // --------------------------------------------------------------------------
  // Schools
  // --------------------------------------------------------------------------
  { id: "inst_lgs", name: "Lahore Grammar School", type: "school", city: "Lahore", is_verified: true },
  { id: "inst_beaconhouse", name: "Beaconhouse School System", type: "school", city: "Lahore", is_verified: true },
  { id: "inst_cityschool", name: "The City School", type: "school", city: "Karachi", is_verified: true },
  { id: "inst_roots", name: "Roots Millennium Schools", type: "school", city: "Islamabad", is_verified: true },
  { id: "inst_educators", name: "The Educators", type: "school", city: "Lahore", is_verified: true },
  { id: "inst_aitchison", name: "Aitchison College", type: "school", city: "Lahore", is_verified: true },
  { id: "inst_kgs", name: "Karachi Grammar School", type: "school", city: "Karachi", is_verified: true },
  { id: "inst_apsacs", name: "Army Public School & College System (APSACS)", type: "school", city: "Rawalpindi", is_verified: true },
  { id: "inst_cadet_hasan", name: "Cadet College Hasan Abdal", type: "school", city: "Hasan Abdal", is_verified: true },
  { id: "inst_sadiq", name: "Sadiq Public School", type: "school", city: "Bahawalpur", is_verified: true },
  { id: "inst_ngs", name: "National Grammar School", type: "school", city: "Karachi", is_verified: true },
  { id: "inst_stpatrick", name: "St. Patrick's High School", type: "school", city: "Karachi", is_verified: true },
  { id: "inst_dps", name: "Divisional Public School", type: "school", city: "Lahore", is_verified: true },
  { id: "inst_crescent", name: "Crescent Model Higher Secondary School", type: "school", city: "Lahore", is_verified: true },
  { id: "inst_garrison", name: "Garrison Academy", type: "school", city: "Lahore", is_verified: true },
  { id: "inst_froebel", name: "Froebel's International School", type: "school", city: "Islamabad", is_verified: true },
  { id: "inst_headstart", name: "Headstart School", type: "school", city: "Islamabad", is_verified: true },
  { id: "inst_islconvent", name: "Islamabad Convent School", type: "school", city: "Islamabad", is_verified: true },
  { id: "inst_kendall", name: "Kendall Pearson Academy", type: "school", city: "Lahore", is_verified: true },
]
