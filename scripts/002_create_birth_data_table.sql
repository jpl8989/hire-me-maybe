-- Create birth_data table to store user birth information
CREATE TABLE IF NOT EXISTS birth_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('manager', 'candidate')),
  dob DATE NOT NULL,
  birth_time TEXT NOT NULL,
  birth_city TEXT NOT NULL,
  timezone TEXT NOT NULL,
  company_name TEXT,
  company_founding_date DATE,
  company_city TEXT,
  company_timezone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_birth_data_user_id ON birth_data(user_id);

-- Enable Row Level Security
ALTER TABLE birth_data ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own birth data
CREATE POLICY "Users can view own birth data"
  ON birth_data
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own birth data
CREATE POLICY "Users can insert own birth data"
  ON birth_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own birth data
CREATE POLICY "Users can update own birth data"
  ON birth_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
