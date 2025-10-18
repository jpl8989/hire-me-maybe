-- Create candidates table to store candidate birth information
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dob DATE NOT NULL,
  birth_time TEXT NOT NULL,
  birth_city TEXT NOT NULL,
  timezone TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster manager lookups
CREATE INDEX IF NOT EXISTS idx_candidates_manager_id ON candidates(manager_id);

-- Enable Row Level Security
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Policy: Managers can view their own candidates
CREATE POLICY "Managers can view own candidates"
  ON candidates
  FOR SELECT
  USING (auth.uid() = manager_id);

-- Policy: Managers can insert their own candidates
CREATE POLICY "Managers can insert own candidates"
  ON candidates
  FOR INSERT
  WITH CHECK (auth.uid() = manager_id);

-- Policy: Managers can update their own candidates
CREATE POLICY "Managers can update own candidates"
  ON candidates
  FOR UPDATE
  USING (auth.uid() = manager_id)
  WITH CHECK (auth.uid() = manager_id);

-- Policy: Managers can delete their own candidates
CREATE POLICY "Managers can delete own candidates"
  ON candidates
  FOR DELETE
  USING (auth.uid() = manager_id);
