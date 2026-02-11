-- Add is_foundation flag to generated_courses table
-- This distinguishes static courses (like Foundation) from AI-generated courses

ALTER TABLE generated_courses
ADD COLUMN IF NOT EXISTS is_foundation BOOLEAN DEFAULT FALSE;

-- Create index for faster foundation course lookups
CREATE INDEX IF NOT EXISTS idx_courses_foundation ON generated_courses(is_foundation) WHERE is_foundation = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN generated_courses.is_foundation IS 'True for static/pre-built courses like Foundation, false for AI-generated courses';
