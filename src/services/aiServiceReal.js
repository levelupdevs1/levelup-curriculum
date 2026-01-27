/**
 * AI Service - Dual Provider (Groq + Gemini Fallback)
 * Primary: Groq (Unlimited beta, fast)
 * Fallback: Gemini 2.5 Flash (15 RPM, 1500 RPD)
 * Strategy: Always try Groq first, fallback to Gemini on failure
 */

import {
  generateCourseCatalogGemini,
  generateCourseStructureGemini,
  generateLessonContentGemini,
  generateAssessmentGemini,
  reviewSubmissionGemini,
  reviewSubmissionBatchGemini,
} from "./geminiService";

import {
  generateCourseCatalogGroq,
  generateCourseStructureGroq,
  generateLessonContentGroq,
  generateAssessmentGroq,
  reviewSubmissionBatchGroq,
} from "./groqService";

/**
 * Token cost calculation (in actual tokens, not platform tokens)
 * Gemini is free tier - no costs
 */
export const AI_TOKEN_COSTS = {
  GENERATE_COURSE_CATALOG: 50, // Estimated tokens for course catalog generation
  GENERATE_COURSE_STRUCTURE: 100, // Estimated tokens for module/lesson structure
  GENERATE_LESSON_CONTENT: 150, // Estimated tokens for full lesson content
  GENERATE_ASSESSMENT: 80, // Estimated tokens for assessment creation
  REVIEW_SUBMISSION: 60, // Estimated tokens for submission review
};

const isGeminiConfigured = () => !!import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Generate personalized course catalog (Groq primary, Gemini fallback)
 */
export const generateCourseCatalog = async (userProfile) => {
  const result = await generateCourseCatalogGroq(userProfile);
  if (!result.success) {
    console.warn("⚠️ Groq failed, trying Gemini as fallback...");
    return await generateCourseCatalogGemini(userProfile);
  }
  return result;
};

/**
 * Generate course structure (Groq primary, Gemini fallback)
 */
export const generateCourseStructure = async (
  courseTitle,
  courseDescription,
  modulesCount,
) => {
  const result = await generateCourseStructureGroq(
    courseTitle,
    courseDescription,
    modulesCount,
  );
  if (!result.success) {
    console.warn("⚠️ Groq failed, trying Gemini as fallback...");
    return await generateCourseStructureGemini(
      courseTitle,
      courseDescription,
      modulesCount,
    );
  }
  return result;
};

/**
 * Generate lesson content (Groq primary, Gemini fallback)
 */
export const generateLessonContent = async (
  courseTitle,
  moduleTitle,
  lessonTitle,
  lessonType = "reading",
  skillLevel = "Some Experience",
) => {
  const result = await generateLessonContentGroq(
    courseTitle, // correct order
    moduleTitle,
    lessonTitle,
    lessonType,
    skillLevel,
  );
  if (!result.success) {
    console.warn("⚠️ Groq failed, trying Gemini as fallback...");
    return await generateLessonContentGemini(
      courseTitle,
      moduleTitle,
      lessonTitle,
    );
  }
  return result;
};

/**
 * Generate assessment (Groq primary, Gemini fallback) with type-specific logic
 */
export const generateAssessment = async (
  lessonTitle,
  lessonContent,
  assessmentType = "coding_challenge",
) => {
  const result = await generateAssessmentGroq(
    lessonTitle,
    lessonContent,
    assessmentType,
  );
  if (!result.success) {
    console.warn("⚠️ Groq failed, trying Gemini as fallback...");
    return await generateAssessmentGemini(
      lessonTitle,
      lessonContent,
      assessmentType,
    );
  }
  return result;
};

/**
 * Review user submission
 */
export const reviewSubmission = async (
  assessmentType,
  question,
  userAnswer,
) => {
  if (!isGeminiConfigured()) {
    return {
      success: false,
      error: "Gemini API key not configured",
    };
  }

  return await reviewSubmissionGemini(assessmentType, question, userAnswer);
};

/**
 * Review entire assessment submission in a single batch call (Groq primary, Gemini fallback)
 */
export const reviewSubmissionBatch = async (questions, submissionAnswers) => {
  const result = await reviewSubmissionBatchGroq(questions, submissionAnswers);
  if (!result.success || !result.review) {
    console.warn("⚠️ Groq failed, trying Gemini as fallback...");
    return await reviewSubmissionBatchGemini(questions, submissionAnswers);
  }
  return result;
};

/**
 * Check if AI provider is configured
 */
export const isAIConfigured = () => {
  return isGeminiConfigured();
};

/**
 * Get active AI provider name
 */
export const getActiveProvider = () => {
  if (isGeminiConfigured()) return "Groq (Primary) + Gemini Fallback";
  return "None";
};
