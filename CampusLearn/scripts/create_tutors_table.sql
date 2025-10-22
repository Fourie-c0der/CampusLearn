-- Create the tutors table if it doesn't exist
CREATE TABLE IF NOT EXISTS tutors (
  student_id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  programe TEXT,
  phone_number TEXT,
  modules TEXT,
  profile_photo TEXT
);

-- Populate the tutors table with data from students, tutor_details, and tutor_programmes
INSERT INTO tutors (student_id, full_name, email, programe, phone_number, modules, profile_photo)
SELECT
  s.student_id,
  s.full_name,
  s.email,
  COALESCE(p.name, 'Unknown Programme') AS programe,
  'N/A' AS phone_number, -- Phone number not available, set to N/A
  COALESCE(
    STRING_AGG(DISTINCT pr.name, ', '),
    'No modules listed'
  ) AS modules,
  s.profile_photo
FROM students s
LEFT JOIN tutor_programmes tp ON s.student_id = tp.student_id
LEFT JOIN programmes pr ON tp.programme_id = pr.programme_id
LEFT JOIN tutor_details td ON s.student_id = td.student_id
WHERE s.is_tutor = true
GROUP BY s.student_id, s.full_name, s.email, p.name, s.profile_photo;

-- Note: This assumes programmes table exists and has name column.
-- If programmes table has different structure, adjust accordingly.
