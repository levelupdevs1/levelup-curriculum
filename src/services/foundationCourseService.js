/**
 * Foundation Course Service
 * Handles loading and managing the static foundation course
 */

import foundationCourseData from "../courses/foundation/course.json";
import { supabase } from "./authService";

// Import all foundation course markdown files
const lessonFiles = import.meta.glob("../courses/foundation/**/*.md", {
  query: "?raw",
  import: "default",
});

/**
 * Load markdown content for a foundation lesson
 */
export const loadFoundationLessonContent = async (filePath) => {
  const fullPath = `../courses/foundation/${filePath}`;

  if (lessonFiles[fullPath]) {
    const content = await lessonFiles[fullPath]();
    return content;
  }

  throw new Error(`Foundation lesson not found: ${filePath}`);
};

/**
 * Transform lesson type from foundation format to AI format
 */
const mapLessonType = (type) => {
  const typeMap = {
    lesson: "reading",
    assignment: "project",
  };
  return typeMap[type] || "reading";
};

/**
 * Build the foundation course structure with pre-loaded content
 * This transforms the static course.json into the AI course format
 */
export const buildFoundationCourseStructure = async () => {
  const modules = [];

  for (const moduleData of foundationCourseData.modules) {
    const lessons = [];

    for (const lessonData of moduleData.lessons) {
      // Load the markdown content
      let markdownContent = "";
      try {
        markdownContent = await loadFoundationLessonContent(
          lessonData.filePath,
        );
      } catch (err) {
        console.warn(
          `Failed to load lesson content: ${lessonData.filePath}`,
          err,
        );
        markdownContent = `# ${lessonData.title}\n\nContent loading failed.`;
      }

      // Extract title from markdown (first h1) or use lessonData.title
      const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : lessonData.title;

      // Remove the first h1 heading from markdown to avoid duplicate title
      const contentWithoutTitle = markdownContent.replace(/^#\s+.+\n+/, "");

      // Extract external resources from markdown (links with MDN, etc.)
      const resourceRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
      const externalResources = [];
      let match;
      while ((match = resourceRegex.exec(markdownContent)) !== null) {
        // Only add external links (not internal anchors)
        if (match[2].startsWith("http")) {
          externalResources.push({
            title: match[1],
            url: match[2],
            type: "documentation",
            description: "",
          });
        }
      }

      // Build the lesson object in AI course format
      const lesson = {
        id: lessonData.id,
        title: lessonData.title,
        description: lessonData.title,
        type: mapLessonType(lessonData.type),
        estimatedMinutes: 15,
        requiresAssessment: lessonData.type === "assignment",
        assessmentType: lessonData.type === "assignment" ? "project" : null,
        points: lessonData.points || 10,
        filePath: lessonData.filePath, // Keep for reference
        isChooseYourPath: lessonData.isChooseYourPath || false,

        // Pre-loaded content in AI format
        content: {
          title: title,
          objectives: [],
          content: contentWithoutTitle,
          keyTakeaways: [],
          externalResources: externalResources.slice(0, 5), // Limit to 5 resources
        },

        // No AI assessment for foundation lessons (pre-defined)
        assessment:
          lessonData.type === "assignment"
            ? {
                title: `${lessonData.title} Assessment`,
                description:
                  "Complete the assignment as described in the lesson.",
                passingScore: 70,
                totalPoints: lessonData.points || 20,
                questions: [
                  {
                    id: "q1",
                    type: "short_answer",
                    question: "Describe what you learned from this assignment.",
                    points: lessonData.points || 20,
                  },
                ],
              }
            : null,
      };

      lessons.push(lesson);
    }

    modules.push({
      id: moduleData.id,
      title: moduleData.title,
      description: `${moduleData.title} - Foundation Course`,
      lessons: lessons,
    });
  }

  return modules;
};

/**
 * Get the foundation course for a user (create if doesn't exist)
 */
export const getFoundationCourse = async (userId) => {
  try {
    // Check if user already has the foundation course
    console.log("Checking for foundation course");
    const { data: existingCourse, error: fetchError } = await supabase
      .from("generated_courses")
      .select("*")
      .eq("user_id", userId)
      .eq("is_foundation", true)
      .limit(1)
      .single();

    if (existingCourse) {
      return { success: true, data: existingCourse, isNew: false };
    }

    // If not found (PGRST116 = no rows), create it
    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    // Build the course structure with content
    const modules = await buildFoundationCourseStructure();

    // Calculate total points
    let totalPoints = 0;
    for (const module of modules) {
      for (const lesson of module.lessons) {
        totalPoints += lesson.points || 10;
      }
    }

    // Create the foundation course for this user
    console.log("Creating foundation course");
    const courseData = {
      user_id: userId,
      title: foundationCourseData.title,
      description: foundationCourseData.description,
      difficulty: foundationCourseData.level || "Beginner",
      estimated_hours: 20,
      potential_tokens: totalPoints,
      tags: foundationCourseData.tags || ["Programming Basics", "Fundamentals"],
      modules: modules,
      modules_count: modules.length,
      status: "enrolled", // Auto-enrolled
      enrolled_at: new Date().toISOString(),
      is_foundation: true,
      ai_model: "static", // Indicates not AI-generated
      generation_cost: 0,
      progress: {
        completedLessons: [],
        currentModuleIndex: 0,
        currentLessonIndex: 0,
      },
    };

    const { data: newCourse, error: insertError } = await supabase
      .from("generated_courses")
      .insert(courseData)
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return { success: true, data: newCourse, isNew: true };
  } catch (error) {
    console.error("Error getting foundation course:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user has completed the foundation course
 */
export const hasCompletedFoundation = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("generated_courses")
      .select("status, progress, modules")
      .eq("user_id", userId)
      .eq("is_foundation", true)
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: true, completed: false, hasFoundation: false };
      }
      throw error;
    }

    // Check if course is marked complete
    if (data.status === "completed") {
      return { success: true, completed: true, hasFoundation: true };
    }

    // Check if all lessons are completed
    const completedLessons = data.progress?.completedLessons || [];
    let totalLessons = 0;

    for (const module of data.modules || []) {
      totalLessons += module.lessons?.length || 0;
    }

    const allCompleted =
      totalLessons > 0 && completedLessons.length >= totalLessons;

    return {
      success: true,
      completed: allCompleted,
      hasFoundation: true,
      progress: {
        completed: completedLessons.length,
        total: totalLessons,
        percentage:
          totalLessons > 0
            ? Math.round((completedLessons.length / totalLessons) * 100)
            : 0,
      },
    };
  } catch (error) {
    console.error("Error checking foundation completion:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Mark the "Choose Your Path" lesson as triggering onboarding
 */
export const isChooseYourPathLesson = (lesson) => {
  return (
    lesson?.isChooseYourPath === true ||
    lesson?.id === "lesson-6-choose-your-path"
  );
};

/**
 * Get foundation course ID for a user
 */
export const getFoundationCourseId = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("generated_courses")
      .select("id")
      .eq("user_id", userId)
      .eq("is_foundation", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: true, courseId: null };
      }
      throw error;
    }

    return { success: true, courseId: data.id };
  } catch (error) {
    console.error("Error getting foundation course ID:", error);
    return { success: false, error: error.message };
  }
};

export default {
  loadFoundationLessonContent,
  buildFoundationCourseStructure,
  getFoundationCourse,
  hasCompletedFoundation,
  isChooseYourPathLesson,
  getFoundationCourseId,
};
