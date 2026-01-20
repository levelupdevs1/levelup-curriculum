-- Level Up - Cleanup Unused Tables Migration
-- Date: January 20, 2026
-- Purpose: Remove tables that are not being used (data stored as JSONB in generated_courses instead)

-- =============================================================================
-- TABLES TO DROP (Not used - data stored inline in generated_courses.modules JSONB)
-- =============================================================================

-- These tables were designed for a normalized structure, but we're using JSONB
-- Lessons, modules, assessments are stored directly in the generated_courses.modules column

DROP TABLE IF EXISTS external_resources CASCADE;
DROP TABLE IF EXISTS generated_assessments CASCADE;
DROP TABLE IF EXISTS user_submissions CASCADE;
DROP TABLE IF EXISTS generated_lessons CASCADE;
DROP TABLE IF EXISTS generated_modules CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS ai_interaction_history CASCADE;

-- =============================================================================
-- TABLES TO DROP (Features not implemented)
-- =============================================================================

-- Bounty system - not implemented
DROP TABLE IF EXISTS bounty_submissions CASCADE;
DROP TABLE IF EXISTS bounties CASCADE;

-- Blockchain/NFT features - not implemented  
DROP TABLE IF EXISTS platform_token_claims CASCADE;
DROP TABLE IF EXISTS platform_token_transactions CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;

-- Gamification - keeping achievements but can drop if not using
-- DROP TABLE IF EXISTS user_achievements CASCADE;
-- DROP TABLE IF EXISTS achievements CASCADE;
-- DROP TABLE IF EXISTS daily_streaks CASCADE;

-- =============================================================================
-- TABLES TO KEEP
-- =============================================================================
-- users - Core user accounts
-- ai_user_profiles - Onboarding preferences
-- ai_tokens - Token allocation per user
-- ai_token_usage - Usage logging (optional, can keep for analytics)
-- generated_courses - Main course storage with JSONB modules/lessons
-- review_requests - Peer review feature
-- achievements - Gamification (seeds exist)
-- user_achievements - User progress on achievements
-- daily_streaks - Streak tracking

-- =============================================================================
-- OPTIONAL: Clean up unused indexes
-- =============================================================================

-- These indexes were for the dropped tables
-- They should be automatically dropped with CASCADE

-- =============================================================================
-- VERIFY REMAINING TABLES
-- =============================================================================
-- Run this query in Supabase SQL Editor to verify:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
