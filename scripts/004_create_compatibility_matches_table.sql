-- Create compatibility_matches table to store compatibility analysis results
CREATE TABLE IF NOT EXISTS compatibility_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  score INT CHECK (score >= 0 AND score <= 100),
  analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_compatibility_manager_id ON compatibility_matches(manager_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_candidate_id ON compatibility_matches(candidate_id);

-- Enable Row Level Security
ALTER TABLE compatibility_matches ENABLE ROW LEVEL SECURITY;

-- Policy: Managers can view their own compatibility matches
CREATE POLICY "Managers can view own compatibility matches"
  ON compatibility_matches
  FOR SELECT
  USING (auth.uid() = manager_id);

-- Policy: Managers can insert their own compatibility matches
CREATE POLICY "Managers can insert own compatibility matches"
  ON compatibility_matches
  FOR INSERT
  WITH CHECK (auth.uid() = manager_id);

-- Policy: Managers can update their own compatibility matches
CREATE POLICY "Managers can update own compatibility matches"
  ON compatibility_matches
  FOR UPDATE
  USING (auth.uid() = manager_id)
  WITH CHECK (auth.uid() = manager_id);

-- Policy: Managers can delete their own compatibility matches
CREATE POLICY "Managers can delete own compatibility matches"
  ON compatibility_matches
  FOR DELETE
  USING (auth.uid() = manager_id);
