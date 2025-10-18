-- Create company_tarot_readings table for manager-company tarot results
CREATE TABLE IF NOT EXISTS company_tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES company_compatibility_matches(id) ON DELETE CASCADE,
  card_name TEXT NOT NULL,
  meaning TEXT NOT NULL,
  interpretation TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  audio_data TEXT,
  audio_mime_type VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_company_tarot_readings_match_id ON company_tarot_readings(match_id);

-- Enable RLS
ALTER TABLE company_tarot_readings ENABLE ROW LEVEL SECURITY;

-- Managers can view their own company tarot readings
CREATE POLICY "Managers can view their company tarot readings"
  ON company_tarot_readings
  FOR SELECT
  USING (
    match_id IN (
      SELECT id FROM company_compatibility_matches WHERE manager_id = auth.uid()
    )
  );

-- Managers can create their own company tarot readings
CREATE POLICY "Managers can create company tarot readings"
  ON company_tarot_readings
  FOR INSERT
  WITH CHECK (
    match_id IN (
      SELECT id FROM company_compatibility_matches WHERE manager_id = auth.uid()
    )
  );

-- Managers can update their own company tarot readings (for audio updates)
CREATE POLICY "Managers can update company tarot readings"
  ON company_tarot_readings
  FOR UPDATE
  USING (
    match_id IN (
      SELECT id FROM company_compatibility_matches WHERE manager_id = auth.uid()
    )
  )
  WITH CHECK (
    match_id IN (
      SELECT id FROM company_compatibility_matches WHERE manager_id = auth.uid()
    )
  );


