const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export const AI_TOKEN_COSTS = {
  GENERATE_COURSE_CATALOG: 50, // Estimated tokens for course catalog generation
  GENERATE_COURSE_STRUCTURE: 100, // Estimated tokens for module/lesson structure
  GENERATE_LESSON_CONTENT: 150, // Estimated tokens for full lesson content
  GENERATE_ASSESSMENT: 80, // Estimated tokens for assessment creation
  REVIEW_SUBMISSION: 60, // Estimated tokens for submission review
};

const isGeminiConfigured = () => !!import.meta.env.VITE_GEMINI_API_KEY;

// Helper function to get auth token
const getAuthToken = () => {
  // This will be populated by Supabase auth
  const session = JSON.parse(
    localStorage.getItem("sb-emrcbgdeujmvlfvcaxbf-auth-token") || "{}",
  );
  return session?.access_token || "";
};

// Helper function to make authenticated API calls
const apiCall = async (endpoint, body) => {
  console.log("body", body);

  const token = getAuthToken();

  console.log("token", token);

  const response = await fetch(`${API_BASE_URL}/api/ai/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  console.log("result", result);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }

  console.log("result", result);

  return result;
};

export const aiService = {
  async generateCourseCatalog(userProfile) {
    try {
      const result = await apiCall("generate-course-catalog", {
        ...userProfile,
      });

      return result.data;
    } catch (error) {
      console.error("Error generating course catalog:", error);
      throw error;
    }
  },

  async generateCourseStructure(title, description, modulesCount, userId) {
    try {
      const result = await apiCall("generate-course-structure", {
        title,
        description,
        modulesCount,
        userId,
      });

      return result.data;
    } catch (error) {
      console.error("Error generating course structure:", error);
      throw error;
    }
  },

  async generateLessonContent(
    title,
    description,
    courseTitle,
    estimatedMinutes,
    userId,
  ) {
    try {
      const result = await apiCall("generate-lesson-content", {
        title,
        description,
        courseTitle,
        estimatedMinutes,
        userId,
      });

      return result.data;
    } catch (error) {
      console.error("Error generating lesson content:", error);
      throw error;
    }
  },

  async generateAssessment(lessonTitle, lessonContent, assessmentType, userId) {
    try {
      const result = await apiCall("generate-assessment", {
        lessonTitle,
        lessonContent,
        assessmentType,
        userId,
      });

      return result.data;
    } catch (error) {
      console.error("Error generating assessment:", error);
      throw error;
    }
  },

  async reviewSubmission(questions, answers, userId) {
    try {
      const result = await apiCall("review-submission", {
        questions,
        answers,
        userId,
      });

      return result.data;
    } catch (error) {
      console.error("Error reviewing submission:", error);
      throw error;
    }
  },

  async reviewSubmissionBatch(questions, submissionAnswers) {
    try {
      const result = await apiCall("review-submission-batch", {
        questions,
        submissionAnswers,
      });

      return result.data;
    } catch (error) {
      console.error("Error reviewing submission batch:", error);
      throw error;
    }
  },
};

export default aiService;

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
