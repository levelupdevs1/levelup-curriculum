-- Add progress column to generated_courses table
-- Progress stores completion state: { currentModuleIndex, currentLessonIndex, completedLessons: [] }

ALTER TABLE generated_courses
ADD COLUMN IF NOT EXISTS progress JSONB DEFAULT '{"currentModuleIndex": 0, "currentLessonIndex": 0, "completedLessons": []}'::jsonb;

-- Add index for progress queries
CREATE INDEX IF NOT EXISTS idx_courses_progress ON generated_courses USING GIN (progress);

-- Update existing enrolled courses to have default progress
UPDATE generated_courses
SET progress = '{"currentModuleIndex": 0, "currentLessonIndex": 0, "completedLessons": []}'::jsonb
WHERE progress IS NULL AND status IN ('enrolled', 'in_progress');
