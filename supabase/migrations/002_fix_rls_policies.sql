-- Fix RLS policies to allow user signup and initialization
-- Date: January 19, 2026

-- =============================================================================
-- DROP EXISTING POLICIES THAT NEED MODIFICATION
-- =============================================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Users can view own AI profile" ON ai_user_profiles;
DROP POLICY IF EXISTS "Users can insert own AI profile" ON ai_user_profiles;
DROP POLICY IF EXISTS "Users can update own AI profile" ON ai_user_profiles;

DROP POLICY IF EXISTS "Users can view own AI tokens" ON ai_tokens;
DROP POLICY IF EXISTS "Users can insert own AI tokens" ON ai_tokens;
DROP POLICY IF EXISTS "Users can update own AI tokens" ON ai_tokens;

DROP POLICY IF EXISTS "Users can view own token usage" ON ai_token_usage;
DROP POLICY IF EXISTS "Users can insert own token usage" ON ai_token_usage;

DROP POLICY IF EXISTS "Users can view own courses" ON generated_courses;
DROP POLICY IF EXISTS "Users can insert own courses" ON generated_courses;
DROP POLICY IF EXISTS "Users can update own courses" ON generated_courses;

DROP POLICY IF EXISTS "Users can view own modules" ON generated_modules;
DROP POLICY IF EXISTS "Users can insert own modules" ON generated_modules;

DROP POLICY IF EXISTS "Users can view own lessons" ON generated_lessons;
DROP POLICY IF EXISTS "Users can insert own lessons" ON generated_lessons;
DROP POLICY IF EXISTS "Users can update own lessons" ON generated_lessons;

DROP POLICY IF EXISTS "Users can view lesson resources" ON external_resources;
DROP POLICY IF EXISTS "Users can insert lesson resources" ON external_resources;

DROP POLICY IF EXISTS "Users can view own assessments" ON generated_assessments;
DROP POLICY IF EXISTS "Users can insert own assessments" ON generated_assessments;

DROP POLICY IF EXISTS "Users can view own submissions" ON user_submissions;
DROP POLICY IF EXISTS "Users can insert own submissions" ON user_submissions;

DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

DROP POLICY IF EXISTS "Users can view own AI interactions" ON ai_interaction_history;
DROP POLICY IF EXISTS "Users can insert own AI interactions" ON ai_interaction_history;

DROP POLICY IF EXISTS "Users can view own token claims" ON platform_token_claims;
DROP POLICY IF EXISTS "Users can insert own token claims" ON platform_token_claims;

DROP POLICY IF EXISTS "Users can view own transactions" ON platform_token_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON platform_token_transactions;

DROP POLICY IF EXISTS "Anyone can view active bounties" ON bounties;

DROP POLICY IF EXISTS "Users can view own bounty submissions" ON bounty_submissions;
DROP POLICY IF EXISTS "Users can insert own bounty submissions" ON bounty_submissions;

DROP POLICY IF EXISTS "Users can view own certificates" ON certificates;
DROP POLICY IF EXISTS "Users can insert own certificates" ON certificates;

DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;

DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;

DROP POLICY IF EXISTS "Users can view own streaks" ON daily_streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON daily_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON daily_streaks;

-- =============================================================================
-- CREATE COMPLETE RLS POLICIES WITH INSERT PERMISSIONS
-- =============================================================================

-- Users table - full access to own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- AI user profiles - full access
CREATE POLICY "Users can view own AI profile" ON ai_user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI profile" ON ai_user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI profile" ON ai_user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- AI tokens - full access
CREATE POLICY "Users can view own AI tokens" ON ai_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI tokens" ON ai_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI tokens" ON ai_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- AI token usage - full access
CREATE POLICY "Users can view own token usage" ON ai_token_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own token usage" ON ai_token_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Generated courses - full access
CREATE POLICY "Users can view own courses" ON generated_courses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own courses" ON generated_courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own courses" ON generated_courses
  FOR UPDATE USING (auth.uid() = user_id);

-- Generated modules - full access
CREATE POLICY "Users can view own modules" ON generated_modules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own modules" ON generated_modules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Generated lessons - full access
CREATE POLICY "Users can view own lessons" ON generated_lessons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lessons" ON generated_lessons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lessons" ON generated_lessons
  FOR UPDATE USING (auth.uid() = user_id);

-- External resources - full access
CREATE POLICY "Users can view lesson resources" ON external_resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM generated_lessons
      WHERE generated_lessons.id = lesson_id
      AND generated_lessons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert lesson resources" ON external_resources
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM generated_lessons
      WHERE generated_lessons.id = lesson_id
      AND generated_lessons.user_id = auth.uid()
    )
  );

-- Generated assessments - full access
CREATE POLICY "Users can view own assessments" ON generated_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments" ON generated_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User submissions - full access
CREATE POLICY "Users can view own submissions" ON user_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" ON user_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User progress - full access
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- AI interaction history - full access
CREATE POLICY "Users can view own AI interactions" ON ai_interaction_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI interactions" ON ai_interaction_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Platform tokens - full access
CREATE POLICY "Users can view own token claims" ON platform_token_claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own token claims" ON platform_token_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON platform_token_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON platform_token_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bounties - public read, users can submit
CREATE POLICY "Anyone can view active bounties" ON bounties
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view own bounty submissions" ON bounty_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bounty submissions" ON bounty_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Certificates - users can view own
CREATE POLICY "Users can view own certificates" ON certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own certificates" ON certificates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements - public read for all achievements
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- User achievements - users can view and insert own
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily streaks - users can view and update own
CREATE POLICY "Users can view own streaks" ON daily_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON daily_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON daily_streaks
  FOR UPDATE USING (auth.uid() = user_id);
