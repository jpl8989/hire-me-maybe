-- Create tarot_readings table
CREATE TABLE IF NOT EXISTS tarot_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES compatibility_matches(id) ON DELETE CASCADE,
  card_name TEXT NOT NULL,
  meaning TEXT NOT NULL,
  interpretation TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tarot_readings_match_id ON tarot_readings(match_id);

-- Enable RLS
ALTER TABLE tarot_readings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow managers to read their own tarot readings
CREATE POLICY "Managers can view their tarot readings"
  ON tarot_readings
  FOR SELECT
  USING (
    match_id IN (
      SELECT id FROM compatibility_matches WHERE manager_id = auth.uid()
    )
  );

-- Create policy to allow managers to insert their own tarot readings
CREATE POLICY "Managers can create tarot readings"
  ON tarot_readings
  FOR INSERT
  WITH CHECK (
    match_id IN (
      SELECT id FROM compatibility_matches WHERE manager_id = auth.uid()
    )
  );
