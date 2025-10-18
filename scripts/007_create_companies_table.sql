-- Create companies table (one company per manager)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  founding_date DATE,
  founding_time TEXT,
  founding_city TEXT,
  timezone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_companies_manager_id ON companies(manager_id);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Managers can view own company"
  ON companies
  FOR SELECT
  USING (auth.uid() = manager_id);

CREATE POLICY "Managers can insert own company"
  ON companies
  FOR INSERT
  WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Managers can update own company"
  ON companies
  FOR UPDATE
  USING (auth.uid() = manager_id)
  WITH CHECK (auth.uid() = manager_id);


