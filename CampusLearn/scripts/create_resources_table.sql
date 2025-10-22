-- Create the resources table if it doesn't exist
CREATE TABLE IF NOT EXISTS resources (
  resource_id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  module_id INTEGER REFERENCES modules(module_id),
  visibility TEXT NOT NULL CHECK (visibility IN ('private', 'public')),
  student_id INTEGER REFERENCES students(student_id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_resources_visibility ON resources(visibility);
CREATE INDEX IF NOT EXISTS idx_resources_module_id ON resources(module_id);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);
