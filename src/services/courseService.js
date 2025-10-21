import { supabase, isSupabaseConfigured } from "./authService";

/**
 * Fetch all courses from Supabase
 * @returns {Promise<{success: boolean, courses?: array, error?: string}>}
 */
export const fetchCourses = async () => {
  if (!isSupabaseConfigured) {
    return { success: true, courses: [] };
  }

  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, courses: data || [] };
  } catch (err) {
    console.error("Fetch courses error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Fetch a single course by ID
 * @param {string} courseId - Course ID
 * @returns {Promise<{success: boolean, course?: object, error?: string}>}
 */
export const fetchCourseById = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, course: data };
  } catch (err) {
    console.error("Fetch course error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Enroll user in a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<{success: boolean, enrollment?: object, error?: string}>}
 */
export const enrollInCourse = async (userId, courseId) => {
  try {
    // Check if already enrolled
    const { data: existing } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (existing) {
      return {
        success: true,
        enrollment: existing,
        message: "Already enrolled",
      };
    }

    // Create enrollment
    const { data, error } = await supabase
      .from("enrollments")
      .insert([
        {
          user_id: userId,
          course_id: courseId,
          status: "in-progress",
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, enrollment: data };
  } catch (err) {
    console.error("Enroll in course error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Check if user is enrolled in a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<{success: boolean, enrolled: boolean, error?: string}>}
 */
export const isEnrolled = async (userId, courseId) => {
  if (!isSupabaseConfigured) {
    return { success: true, enrolled: false };
  }

  try {
    const { data, error } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows returned
      return { success: false, error: error.message };
    }

    return { success: true, enrolled: !!data };
  } catch (err) {
    console.error("Check enrollment error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Get user's enrollments
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, enrollments?: array, error?: string}>}
 */
export const getUserEnrollments = async (userId) => {
  if (!isSupabaseConfigured) {
    return { success: true, enrollments: [] };
  }

  try {
    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, enrollments: data || [] };
  } catch (err) {
    console.error("Get user enrollments error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Record lesson completion
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} moduleId - Module ID
 * @param {string} lessonId - Lesson ID
 * @param {number} points - Points earned (10 for lesson, 15 for assignment)
 * @returns {Promise<{success: boolean, progress?: object, error?: string}>}
 */
export const recordLessonCompletion = async (
  userId,
  courseId,
  moduleId,
  lessonId,
  points
) => {
  try {
    const { data, error } = await supabase
      .from("progress")
      .upsert([
        {
          user_id: userId,
          course_id: courseId,
          module_id: moduleId,
          lesson_id: lessonId,
          completed_at: new Date().toISOString(),
          points_earned: points,
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, progress: data };
  } catch (err) {
    console.error("Record lesson completion error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Get user's course progress
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<{success: boolean, progress?: array, error?: string}>}
 */
export const getCourseProgress = async (userId, courseId) => {
  if (!isSupabaseConfigured) {
    return { success: true, progress: [] };
  }

  try {
    const { data, error } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, progress: data || [] };
  } catch (err) {
    console.error("Get course progress error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Fetch markdown lesson content from GitHub
 * @param {string} courseId - Course ID
 * @param {string} filePath - Relative file path
 * @returns {Promise<{success: boolean, content?: string, error?: string}>}
 */
export const fetchLessonMarkdown = async (courseId, filePath) => {
  try {
    // In dev mode, load from local files
    if (import.meta.env.DEV) {
      let lessonPath = filePath;

      // Remove any prefixes to get clean path
      if (lessonPath.startsWith("/src/courses/")) {
        lessonPath = lessonPath.replace("/src/courses/", "");
      } else if (lessonPath.startsWith("src/courses/")) {
        lessonPath = lessonPath.replace("src/courses/", "");
      }

      // Remove courseId prefix if present (e.g., "web-dev/module-1/lesson.md" -> "module-1/lesson.md")
      if (lessonPath.startsWith(`${courseId}/`)) {
        lessonPath = lessonPath.replace(`${courseId}/`, "");
      }

      // Construct local file path
      const localPath = `/src/courses/${courseId}/${lessonPath}`;
      console.log(`📖 Loading lesson from local file: ${localPath}`);

      const response = await fetch(localPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch local lesson: ${response.statusText}`);
      }

      const content = await response.text();
      return { success: true, content };
    }

    // Production mode: fetch from GitHub raw URL
    let lessonPath = filePath;

    // Remove "/src/courses/" prefix if present
    if (lessonPath.startsWith("/src/courses/")) {
      lessonPath = lessonPath.replace("/src/courses/", "");
    } else if (lessonPath.startsWith("src/courses/")) {
      lessonPath = lessonPath.replace("src/courses/", "");
    }

    // Now lessonPath should be something like "webdev/html/intro-to-html.md"
    const rawUrl = `https://raw.githubusercontent.com/levelupdevs1/levelup-curriculum/main/src/courses/${courseId}/${lessonPath}`;

    const response = await fetch(rawUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch lesson: ${response.statusText}`);
    }

    const content = await response.text();
    return { success: true, content };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Submit an assignment
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} assignmentId - Assignment ID
 * @param {string} submissionContent - Submission content/notes
 * @returns {Promise<{success: boolean, submission?: object, error?: string}>}
 */
export const submitAssignment = async (
  userId,
  courseId,
  assignmentId,
  submissionContent
) => {
  try {
    const { data, error } = await supabase
      .from("submissions")
      .insert([
        {
          user_id: userId,
          course_id: courseId,
          assignment_id: assignmentId,
          submission_content: submissionContent,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, submission: data };
  } catch (err) {
    console.error("Submit assignment error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Get all submissions for a specific lesson
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<{success: boolean, submissions?: array, error?: string}>}
 */
export const getSubmissionsForLesson = async (courseId, lessonId) => {
  if (!isSupabaseConfigured) {
    return { success: true, submissions: [] };
  }

  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*, users(id, email, full_name)")
      .eq("course_id", courseId)
      .eq("assignment_id", lessonId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Transform data to flatten user info
    const submissionsWithUser =
      data?.map((submission) => ({
        ...submission,
        user_name:
          submission.users?.full_name || submission.users?.email || "Anonymous",
        user_email: submission.users?.email,
      })) || [];

    return { success: true, submissions: submissionsWithUser };
  } catch (err) {
    console.error("Get submissions error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Complete a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<{success: boolean, completion?: object, error?: string}>}
 */
export const completeCourse = async (userId, courseId) => {
  try {
    const { data, error } = await supabase
      .from("completions")
      .upsert([
        {
          user_id: userId,
          course_id: courseId,
          completed_at: new Date().toISOString(),
          certificate_eligible: true,
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, completion: data };
  } catch (err) {
    console.error("Complete course error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Get user's completed courses
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, completions?: array, error?: string}>}
 */
export const getUserCompletions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("completions")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, completions: data || [] };
  } catch (err) {
    console.error("Get user completions error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Submit a peer review for a submission
 * @param {string} reviewerId - User ID of reviewer
 * @param {string} submissionId - Submission ID being reviewed
 * @param {number} rating - Rating (1-5)
 * @param {string} feedback - Feedback text
 * @returns {Promise<{success: boolean, review?: object, error?: string}>}
 */
export const submitPeerReview = async (
  reviewerId,
  submissionId,
  rating,
  feedback
) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          reviewer_id: reviewerId,
          submission_id: submissionId,
          rating,
          feedback,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, review: data };
  } catch (err) {
    console.error("Submit peer review error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Get all reviews for a submission
 * @param {string} submissionId - Submission ID
 * @returns {Promise<{success: boolean, reviews?: array, error?: string}>}
 */
export const fetchPeerReviews = async (submissionId) => {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, users(id, email, full_name)")
      .eq("submission_id", submissionId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Transform data to flatten user info
    const reviewsWithUser =
      data?.map((review) => ({
        ...review,
        reviewer_name:
          review.users?.full_name || review.users?.email || "Anonymous",
        reviewer_email: review.users?.email,
      })) || [];

    return { success: true, reviews: reviewsWithUser };
  } catch (err) {
    console.error("Fetch peer reviews error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Record a level claim (for token rewards)
 * @param {string} userId - User ID
 * @param {number} level - Level achieved
 * @returns {Promise<{success: boolean, claim?: object, error?: string}>}
 */
export const recordLevelClaim = async (userId, level) => {
  try {
    const { data, error } = await supabase
      .from("token_claims")
      .upsert([
        {
          user_id: userId,
          level,
          claimed_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, claim: data };
  } catch (err) {
    console.error("Record level claim error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Submit a review request for help/feedback on a lesson
 * @param {string} userId - User ID requesting review
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {object} request - Request data (url, githubUrl, question, etc)
 * @returns {Promise<{success: boolean, request?: object, error?: string}>}
 */
export const submitReviewRequest = async (
  userId,
  courseId,
  lessonId,
  request
) => {
  try {
    const { data, error } = await supabase
      .from("review_requests")
      .insert([
        {
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          url: request.url || null,
          github_url: request.githubUrl || null,
          question: request.question || null,
          status: "open",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, request: data };
  } catch (err) {
    console.error("Submit review request error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Get review requests for a specific lesson
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<{success: boolean, requests?: array, error?: string}>}
 */
export const fetchReviewRequests = async (lessonId) => {
  try {
    const { data, error } = await supabase
      .from("review_requests")
      .select("*, users(id, email, full_name)")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Transform data to include user info
    const requestsWithUser =
      data?.map((req) => ({
        ...req,
        user_name: req.users?.full_name || req.users?.email || "Anonymous",
        user_email: req.users?.email,
      })) || [];

    return { success: true, requests: requestsWithUser };
  } catch (err) {
    console.error("Fetch review requests error:", err);
    return { success: false, error: err.message };
  }
};
