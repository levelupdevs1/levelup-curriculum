/**
 * AI Service - Dual Provider (Gemini + Groq Fallback)
 * Primary: Gemini 2.5 Flash (15 RPM, 1500 RPD)
 * Fallback: Groq (Unlimited beta, fact-based)
 * Strategy: Try Gemini first, fallback to Groq if rate limited
 */

import {
  generateCourseCatalogGemini,
  generateCourseStructureGemini,
  generateLessonContentGemini,
  generateAssessmentGemini,
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
 * Generate personalized course catalog (Gemini → Groq fallback)
 */
export const generateCourseCatalog = async (userProfile) => {
  if (!isGeminiConfigured()) {
    return {
      success: false,
      error:
        "Gemini API key not configured. Please add VITE_GEMINI_API_KEY to .env.local",
    };
  }

  console.log("🤖 Generating course catalog with Gemini...");
  const result = await generateCourseCatalogGemini(userProfile);

  if (!result.success) {
    console.warn("⚠️ Gemini failed, trying Groq fallback...");
    return await generateCourseCatalogGroq(userProfile);
  }

  return result;
};

/**
 * Generate course structure (Gemini → Groq fallback)
 */
export const generateCourseStructure = async (
  courseTitle,
  courseDescription,
  modulesCount,
) => {
  if (!isGeminiConfigured()) {
    return {
      success: false,
      error: "Gemini API key not configured",
    };
  }

  console.log("🤖 Generating course structure with Gemini...");
  const result = await generateCourseStructureGemini(
    courseTitle,
    courseDescription,
    modulesCount,
  );

  if (!result.success) {
    console.warn("⚠️ Gemini failed, trying Groq fallback...");
    return await generateCourseStructureGroq(courseTitle, courseDescription);
  }

  return result;
};

/**
 * Generate lesson content (Gemini → Groq fallback)
 */
export const generateLessonContent = async (
  courseTitle,
  moduleTitle,
  lessonTitle,
) => {
  if (!isGeminiConfigured()) {
    return {
      success: false,
      error: "Gemini API key not configured",
    };
  }

  console.log("🤖 Generating lesson content with Gemini...");
  const result = await generateLessonContentGemini(
    courseTitle,
    moduleTitle,
    lessonTitle,
  );

  if (!result.success) {
    console.warn("⚠️ Gemini failed, trying Groq fallback...");
    return await generateLessonContentGroq(
      lessonTitle,
      moduleTitle,
      courseTitle,
      30,
    );
  }

  return result;
};

/**
 * Generate assessment (Gemini → Groq fallback)
 */
export const generateAssessment = async (lessonTitle, lessonContent) => {
  if (!isGeminiConfigured()) {
    return {
      success: false,
      error: "Gemini API key not configured",
    };
  }

  console.log("🤖 Generating assessment with Gemini...");
  const result = await generateAssessmentGemini(lessonTitle, lessonContent);

  if (!result.success) {
    console.warn("⚠️ Gemini failed, trying Groq fallback...");
    return await generateAssessmentGroq(lessonTitle, lessonContent);
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

  console.log("🤖 Reviewing submission with Gemini...");
  return await reviewSubmissionGemini(assessmentType, question, userAnswer);
};

/**
 * Review entire assessment submission in a single batch call (Gemini → Groq fallback)
 */
export const reviewSubmissionBatch = async (questions, submissionAnswers) => {
  if (!isGeminiConfigured()) {
    return {
      success: false,
      error: "Gemini API key not configured",
    };
  }

  console.log("🤖 Batch reviewing all questions with Gemini...");
  const result = await reviewSubmissionBatchGemini(
    questions,
    submissionAnswers,
  );

  // Only return if BOTH success AND has valid review data
  if (!result.success || !result.review) {
    console.warn(
      "⚠️ Gemini failed or returned invalid data, trying Groq fallback (fact-based evaluation)...",
    );
    return await reviewSubmissionBatchGroq(questions, submissionAnswers);
  }

  console.log("✅ Gemini review successful, returning...");
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
  if (isGeminiConfigured()) return "Gemini 1.5 Flash (Free) + Groq Fallback";
  return "None";
};
