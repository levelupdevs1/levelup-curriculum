-- Level Up AI Platform - Complete Database Schema
-- Phase 2: Backend Setup
-- Date: January 19, 2026

-- =============================================================================
-- EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS & PROFILES
-- =============================================================================

-- Extend existing users table (auth.users managed by Supabase)
-- Create profiles table for app-specific data
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE NOT NULL,
  
  -- Level & Progress
  current_level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  
  -- Subscription
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'starter', 'pro'
  subscription_status TEXT DEFAULT 'active',
  subscription_expires_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI User Profile (onboarding data)
CREATE TABLE ai_user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Onboarding responses
  learning_goal TEXT NOT NULL,
  skill_level TEXT NOT NULL,
  goal TEXT NOT NULL,
  time_commitment TEXT NOT NULL,
  learning_style TEXT NOT NULL,
  custom_interests TEXT,
  
  -- Profile state
  onboarding_completed BOOLEAN DEFAULT true,
  profile_version INTEGER DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- AI TOKEN MANAGEMENT
-- =============================================================================

CREATE TABLE ai_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Token allocation
  tier TEXT NOT NULL DEFAULT 'free',
  tokens_used INTEGER DEFAULT 0,
  tokens_limit INTEGER NOT NULL,
  
  -- Reset tracking
  reset_period TEXT NOT NULL, -- 'daily', 'monthly'
  last_reset TIMESTAMP DEFAULT NOW(),
  next_reset TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Token usage log
CREATE TABLE ai_token_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Usage details
  operation TEXT NOT NULL, -- 'generate_course', 'generate_lesson', etc
  tokens_used INTEGER NOT NULL,
  operation_details JSONB,
  
  -- Cost tracking
  estimated_cost NUMERIC(10, 6),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_token_usage_user ON ai_token_usage(user_id);
CREATE INDEX idx_token_usage_created ON ai_token_usage(created_at);

-- =============================================================================
-- PLATFORM TOKENS (BLOCKCHAIN)
-- =============================================================================

-- Platform token claims (level rewards)
CREATE TABLE platform_token_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Claim details
  level INTEGER NOT NULL,
  tokens_claimed INTEGER NOT NULL,
  reason TEXT, -- 'level_up', 'course_complete', etc
  
  -- Transaction
  transaction_hash TEXT,
  claimed_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, level)
);

-- Platform token transactions
CREATE TABLE platform_token_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Transaction details
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'earned', 'spent', 'transferred'
  reason TEXT NOT NULL,
  reference_id UUID, -- links to course, bounty, etc
  
  -- Balance tracking
  balance_after INTEGER NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_platform_tokens_user ON platform_token_transactions(user_id);

-- =============================================================================
-- AI-GENERATED COURSES
-- =============================================================================

CREATE TABLE generated_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Course details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL, -- 'Beginner', 'Intermediate', 'Advanced'
  estimated_hours INTEGER,
  potential_tokens INTEGER,
  tags TEXT[],
  
  -- Structure
  modules JSONB NOT NULL, -- Array of module outlines
  modules_count INTEGER,
  
  -- Status
  status TEXT DEFAULT 'recommended', -- 'recommended', 'enrolled', 'in_progress', 'completed'
  enrolled_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Generation metadata
  ai_model TEXT, -- 'deepseek-v3', 'gemini-flash'
  generation_cost INTEGER, -- AI tokens used
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_courses_user ON generated_courses(user_id);
CREATE INDEX idx_courses_status ON generated_courses(user_id, status);

-- =============================================================================
-- AI-GENERATED MODULES
-- =============================================================================

CREATE TABLE generated_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES generated_courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Module details
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  
  -- Lessons structure
  lessons JSONB NOT NULL, -- Array of lesson outlines
  lessons_count INTEGER,
  
  -- Progress
  is_unlocked BOOLEAN DEFAULT false,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(course_id, order_index)
);

CREATE INDEX idx_modules_course ON generated_modules(course_id);

-- =============================================================================
-- AI-GENERATED LESSONS
-- =============================================================================

CREATE TABLE generated_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES generated_modules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Lesson details
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  estimated_minutes INTEGER,
  
  -- Content
  content TEXT, -- Full lesson content (markdown)
  content_type TEXT DEFAULT 'text', -- 'text', 'video_script', 'interactive'
  
  -- Progress
  is_unlocked BOOLEAN DEFAULT false,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Generation metadata
  ai_model TEXT,
  generation_cost INTEGER,
  generated_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(module_id, order_index)
);

CREATE INDEX idx_lessons_module ON generated_lessons(module_id);
CREATE INDEX idx_lessons_user ON generated_lessons(user_id);

-- =============================================================================
-- EXTERNAL RESOURCES
-- =============================================================================

CREATE TABLE external_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES generated_lessons(id) ON DELETE CASCADE,
  
  -- Resource details
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT, -- 'documentation', 'tutorial', 'video', 'article', 'repository'
  description TEXT,
  
  -- Metadata
  source TEXT, -- 'official', 'community', 'ai_recommended'
  relevance_score NUMERIC(3,2), -- 0-1
  order_index INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_resources_lesson ON external_resources(lesson_id);

-- =============================================================================
-- AI-GENERATED ASSESSMENTS
-- =============================================================================

CREATE TABLE generated_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES generated_lessons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Assessment type and content
  type TEXT NOT NULL, -- 'quiz', 'coding_challenge', 'written', 'project', 'deployment', 'code_review'
  content JSONB NOT NULL, -- Type-specific content (questions, requirements, etc)
  
  -- Requirements
  requirements JSONB, -- Pass criteria, rubric, test cases
  
  -- Metadata
  estimated_time INTEGER, -- minutes
  difficulty TEXT,
  is_optional BOOLEAN DEFAULT false,
  max_attempts INTEGER DEFAULT 3,
  
  -- Generation
  ai_model TEXT,
  generation_cost INTEGER,
  generated_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(lesson_id, user_id)
);

CREATE INDEX idx_assessments_lesson ON generated_assessments(lesson_id);

-- =============================================================================
-- USER SUBMISSIONS
-- =============================================================================

CREATE TABLE user_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES generated_assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Submission content (type-specific)
  submission_type TEXT NOT NULL,
  content JSONB NOT NULL, -- answers, code, description, etc
  
  -- For project/deployment types
  github_url TEXT,
  live_url TEXT,
  repository_analyzed BOOLEAN DEFAULT false,
  
  -- Review and status
  ai_review JSONB,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'passed', 'failed', 'needs_manual_review'
  score NUMERIC(5,2),
  
  -- Attempts
  attempt_number INTEGER DEFAULT 1,
  
  -- Timestamps
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  
  UNIQUE(assessment_id, user_id, attempt_number)
);

CREATE INDEX idx_submissions_assessment ON user_submissions(assessment_id);
CREATE INDEX idx_submissions_user ON user_submissions(user_id);
CREATE INDEX idx_submissions_status ON user_submissions(status);

-- =============================================================================
-- USER PROGRESS TRACKING
-- =============================================================================

CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- References
  course_id UUID REFERENCES generated_courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES generated_modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES generated_lessons(id) ON DELETE CASCADE,
  
  -- Progress details
  status TEXT NOT NULL, -- 'started', 'in_progress', 'completed'
  completion_percentage INTEGER DEFAULT 0,
  
  -- Time tracking
  time_spent INTEGER DEFAULT 0, -- seconds
  last_accessed_at TIMESTAMP DEFAULT NOW(),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_course ON user_progress(course_id);

-- =============================================================================
-- AI INTERACTION HISTORY
-- =============================================================================

CREATE TABLE ai_interaction_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Context
  context_type TEXT NOT NULL, -- 'course_generation', 'lesson_generation', 'assessment_review', 'tutor_question'
  context_id UUID, -- Reference to course, lesson, etc
  
  -- Interaction details
  prompt TEXT,
  ai_response TEXT,
  ai_model TEXT,
  tokens_used INTEGER,
  
  -- Metadata
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  response_time_ms INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_interactions_user ON ai_interaction_history(user_id);
CREATE INDEX idx_interactions_type ON ai_interaction_history(context_type);
CREATE INDEX idx_interactions_created ON ai_interaction_history(created_at);

-- =============================================================================
-- BOUNTIES
-- =============================================================================

CREATE TABLE bounties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Bounty details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL, -- 'easy', 'medium', 'hard', 'expert'
  
  -- Requirements
  min_level INTEGER NOT NULL,
  entry_fee INTEGER NOT NULL, -- platform tokens
  reward_tokens INTEGER NOT NULL,
  
  -- Submission requirements
  submission_requirements JSONB NOT NULL,
  evaluation_criteria JSONB NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'closed'
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  
  -- Winner
  winner_id UUID REFERENCES users(id),
  winning_submission_id UUID,
  
  -- Dates
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_bounties_status ON bounties(status);
CREATE INDEX idx_bounties_level ON bounties(min_level);

-- =============================================================================
-- BOUNTY SUBMISSIONS
-- =============================================================================

CREATE TABLE bounty_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bounty_id UUID REFERENCES bounties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Submission
  submission_content TEXT NOT NULL,
  submission_url TEXT,
  github_url TEXT,
  live_url TEXT,
  
  -- Review
  ai_review JSONB,
  community_votes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'winner'
  score NUMERIC(5,2),
  
  -- Entry fee tracking
  entry_fee_paid INTEGER NOT NULL,
  entry_transaction_id UUID,
  
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  
  UNIQUE(bounty_id, user_id)
);

CREATE INDEX idx_bounty_submissions_bounty ON bounty_submissions(bounty_id);
CREATE INDEX idx_bounty_submissions_user ON bounty_submissions(user_id);

-- =============================================================================
-- CERTIFICATES (NFT)
-- =============================================================================

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES generated_courses(id),
  
  -- Certificate details
  course_name TEXT NOT NULL,
  skill_level TEXT NOT NULL,
  
  -- NFT details
  token_id TEXT,
  nft_metadata JSONB,
  transaction_hash TEXT,
  
  -- Status
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_certificates_user ON certificates(user_id);

-- =============================================================================
-- ACHIEVEMENTS & GAMIFICATION
-- =============================================================================

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Achievement details
  title TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'milestone', 'streak', 'mastery', 'social'
  
  -- Requirements
  requirements JSONB NOT NULL,
  reward_tokens INTEGER DEFAULT 0,
  
  -- Metadata
  icon TEXT,
  rarity TEXT, -- 'common', 'rare', 'epic', 'legendary'
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  
  -- Tracking
  progress INTEGER DEFAULT 0, -- for progressive achievements
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- =============================================================================
-- DAILY STREAKS
-- =============================================================================

CREATE TABLE daily_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Streak tracking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  
  -- Rewards
  total_streak_tokens INTEGER DEFAULT 0,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_profiles_updated_at BEFORE UPDATE ON ai_user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON generated_courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_token_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bounty_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own AI profile" ON ai_user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI profile" ON ai_user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI profile" ON ai_user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own AI tokens" ON ai_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own token usage" ON ai_token_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own courses" ON generated_courses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own modules" ON generated_modules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own lessons" ON generated_lessons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view lesson resources" ON external_resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM generated_lessons
      WHERE generated_lessons.id = lesson_id
      AND generated_lessons.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own assessments" ON generated_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own submissions" ON user_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" ON user_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own AI interactions" ON ai_interaction_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view open bounties" ON bounties
  FOR SELECT USING (status = 'open' OR status = 'completed');

CREATE POLICY "Users can view own bounty submissions" ON bounty_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bounty submissions" ON bounty_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own certificates" ON certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view achievements" ON achievements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view own user achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own streaks" ON daily_streaks
  FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Already created inline above, but documenting key ones:
-- idx_courses_user, idx_courses_status
-- idx_lessons_module, idx_lessons_user
-- idx_submissions_assessment, idx_submissions_user, idx_submissions_status
-- idx_progress_user, idx_progress_course
-- idx_interactions_user, idx_interactions_type, idx_interactions_created
-- idx_token_usage_user, idx_token_usage_created

-- =============================================================================
-- INITIAL DATA (Optional)
-- =============================================================================

-- Default achievements
INSERT INTO achievements (title, description, type, requirements, reward_tokens, rarity) VALUES
  ('First Steps', 'Complete your first lesson', 'milestone', '{"lessons_completed": 1}', 10, 'common'),
  ('Quick Learner', 'Complete 10 lessons', 'milestone', '{"lessons_completed": 10}', 50, 'common'),
  ('Dedicated Student', 'Maintain a 7-day streak', 'streak', '{"streak_days": 7}', 75, 'rare'),
  ('Course Master', 'Complete your first course', 'milestone', '{"courses_completed": 1}', 100, 'rare'),
  ('Perfect Score', 'Get 100% on 5 assessments', 'mastery', '{"perfect_scores": 5}', 150, 'epic');

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
