-- Add audio fields to tarot_readings table
-- This migration adds support for storing audio data directly in the database

ALTER TABLE tarot_readings 
ADD COLUMN IF NOT EXISTS audio_data TEXT,
ADD COLUMN IF NOT EXISTS audio_mime_type VARCHAR(50);

-- Add index for faster audio lookups
CREATE INDEX IF NOT EXISTS idx_tarot_readings_audio_data 
ON tarot_readings(id) 
WHERE audio_data IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN tarot_readings.audio_data IS 'Base64 encoded audio data for the tarot reading';
COMMENT ON COLUMN tarot_readings.audio_mime_type IS 'MIME type of the audio data (e.g., audio/mpeg)';
