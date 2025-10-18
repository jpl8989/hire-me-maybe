-- Create company_compatibility_matches table to store manager-company compatibility analysis
CREATE TABLE IF NOT EXISTS company_compatibility_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  score INT CHECK (score >= 0 AND score <= 100),
  analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_company_match_manager_id ON company_compatibility_matches(manager_id);
CREATE INDEX IF NOT EXISTS idx_company_match_company_id ON company_compatibility_matches(company_id);

-- Enable Row Level Security
ALTER TABLE company_compatibility_matches ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Managers can view own company matches"
  ON company_compatibility_matches
  FOR SELECT
  USING (auth.uid() = manager_id);

CREATE POLICY "Managers can insert own company matches"
  ON company_compatibility_matches
  FOR INSERT
  WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Managers can update own company matches"
  ON company_compatibility_matches
  FOR UPDATE
  USING (auth.uid() = manager_id)
  WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Managers can delete own company matches"
  ON company_compatibility_matches
  FOR DELETE
  USING (auth.uid() = manager_id);


