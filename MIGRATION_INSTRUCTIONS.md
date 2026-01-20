# Database Migration: Add Progress Column

## Issue

The app is trying to save progress to a `progress` column that doesn't exist in the `generated_courses` table.

## Solution

Run the migration SQL in your Supabase dashboard.

## Steps

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste this SQL:

```sql
-- Add progress column to generated_courses table
ALTER TABLE generated_courses
ADD COLUMN IF NOT EXISTS progress JSONB DEFAULT '{"currentModuleIndex": 0, "currentLessonIndex": 0, "completedLessons": []}'::jsonb;

-- Add index for progress queries
CREATE INDEX IF NOT EXISTS idx_courses_progress ON generated_courses USING GIN (progress);

-- Update existing enrolled courses to have default progress
UPDATE generated_courses
SET progress = '{"currentModuleIndex": 0, "currentLessonIndex": 0, "completedLessons": []}'::jsonb
WHERE progress IS NULL AND status IN ('enrolled', 'in_progress');
```

5. Click **Run** (or press Ctrl+Enter)
6. Verify success message

### Option 2: Supabase CLI (If installed)

```bash
cd /home/freed/Practice/level-up
supabase db push
```

## What This Does

- Adds a `progress` JSONB column to track:
  - `currentModuleIndex`: Current module being studied
  - `currentLessonIndex`: Current lesson in the module
  - `completedLessons`: Array of completed lesson IDs
- Creates a GIN index for efficient progress queries
- Sets default progress for existing enrolled courses

## After Migration

The app will be able to:

- ✅ Save lesson completion progress
- ✅ Track which lessons are completed
- ✅ Show progress bars accurately
- ✅ Unlock next lessons after completion
