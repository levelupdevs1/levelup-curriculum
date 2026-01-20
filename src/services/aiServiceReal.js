/**
 * AI Service - Dual Provider (Gemini + Groq Fallback)
 * Primary: Gemini 2.5 Flash (15 RPM, 1500 RPD)
 * Fallback: Groq (Unlimited beta, fact-based)
 * Strategy: Alternating requests between providers
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
 * Alternating provider strategy
 * Gemini → Groq → Gemini → Groq...
 */
let useGeminiNext = true;

const getNextProvider = () => {
  useGeminiNext = !useGeminiNext;
  return useGeminiNext ? "groq" : "gemini"; // Flip logic since we toggle before returning
};

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
 * Generate personalized course catalog (Alternating: Gemini ↔ Groq)
 */
export const generateCourseCatalog = async (userProfile) => {
  const provider = getNextProvider();

  console.log(
    `🤖 Generating course catalog with ${provider.toUpperCase()} (alternating strategy)...`,
  );

  if (provider === "gemini") {
    const result = await generateCourseCatalogGemini(userProfile);
    if (!result.success) {
      console.warn("⚠️ Gemini failed, trying Groq as backup...");
      return await generateCourseCatalogGroq(userProfile);
    }
    return result;
  } else {
    const result = await generateCourseCatalogGroq(userProfile);
    if (!result.success) {
      console.warn("⚠️ Groq failed, trying Gemini as backup...");
      return await generateCourseCatalogGemini(userProfile);
    }
    return result;
  }
};

/**
 * Generate course structure (Alternating: Gemini ↔ Groq)
 */
export const generateCourseStructure = async (
  courseTitle,
  courseDescription,
  modulesCount,
) => {
  const provider = getNextProvider();

  console.log(
    `🤖 Generating course structure with ${provider.toUpperCase()} (alternating strategy)...`,
  );

  if (provider === "gemini") {
    const result = await generateCourseStructureGemini(
      courseTitle,
      courseDescription,
      modulesCount,
    );
    if (!result.success) {
      console.warn("⚠️ Gemini failed, trying Groq as backup...");
      return await generateCourseStructureGroq(courseTitle, courseDescription);
    }
    return result;
  } else {
    const result = await generateCourseStructureGroq(
      courseTitle,
      courseDescription,
    );
    if (!result.success) {
      console.warn("⚠️ Groq failed, trying Gemini as backup...");
      return await generateCourseStructureGemini(
        courseTitle,
        courseDescription,
        modulesCount,
      );
    }
    return result;
  }
};

/**
 * Generate lesson content (Alternating: Gemini ↔ Groq)
 */
export const generateLessonContent = async (
  courseTitle,
  moduleTitle,
  lessonTitle,
) => {
  const provider = getNextProvider();

  console.log(
    `🤖 Generating lesson content with ${provider.toUpperCase()} (alternating strategy)...`,
  );

  if (provider === "gemini") {
    const result = await generateLessonContentGemini(
      courseTitle,
      moduleTitle,
      lessonTitle,
    );
    if (!result.success) {
      console.warn("⚠️ Gemini failed, trying Groq as backup...");
      return await generateLessonContentGroq(
        lessonTitle,
        moduleTitle,
        courseTitle,
        30,
      );
    }
    return result;
  } else {
    const result = await generateLessonContentGroq(
      lessonTitle,
      moduleTitle,
      courseTitle,
      30,
    );
    if (!result.success) {
      console.warn("⚠️ Groq failed, trying Gemini as backup...");
      return await generateLessonContentGemini(
        courseTitle,
        moduleTitle,
        lessonTitle,
      );
    }
    return result;
  }
};

/**
 * Generate assessment (Alternating: Gemini ↔ Groq) with type-specific logic
 */
export const generateAssessment = async (
  lessonTitle,
  lessonContent,
  assessmentType = "coding_challenge",
) => {
  const provider = getNextProvider();

  console.log(
    `🤖 Generating ${assessmentType} assessment with ${provider.toUpperCase()} (alternating strategy)...`,
  );

  if (provider === "gemini") {
    const result = await generateAssessmentGemini(
      lessonTitle,
      lessonContent,
      assessmentType,
    );
    if (!result.success) {
      console.warn("⚠️ Gemini failed, trying Groq as backup...");
      return await generateAssessmentGroq(
        lessonTitle,
        lessonContent,
        assessmentType,
      );
    }
    return result;
  } else {
    const result = await generateAssessmentGroq(
      lessonTitle,
      lessonContent,
      assessmentType,
    );
    if (!result.success) {
      console.warn("⚠️ Groq failed, trying Gemini as backup...");
      return await generateAssessmentGemini(
        lessonTitle,
        lessonContent,
        assessmentType,
      );
    }
    return result;
  }
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
 * Review entire assessment submission in a single batch call (Alternating: Gemini ↔ Groq)
 */
export const reviewSubmissionBatch = async (questions, submissionAnswers) => {
  const provider = getNextProvider();

  console.log(
    `🤖 Batch reviewing with ${provider.toUpperCase()} (alternating strategy)...`,
  );

  if (provider === "gemini") {
    const result = await reviewSubmissionBatchGemini(
      questions,
      submissionAnswers,
    );
    if (!result.success || !result.review) {
      console.warn("⚠️ Gemini failed, trying Groq as backup...");
      return await reviewSubmissionBatchGroq(questions, submissionAnswers);
    }
    return result;
  } else {
    const result = await reviewSubmissionBatchGroq(
      questions,
      submissionAnswers,
    );
    if (!result.success || !result.review) {
      console.warn("⚠️ Groq failed, trying Gemini as backup...");
      return await reviewSubmissionBatchGemini(questions, submissionAnswers);
    }
    return result;
  }
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
