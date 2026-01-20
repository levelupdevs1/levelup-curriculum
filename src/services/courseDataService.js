import { supabase } from "./authService";

/**
 * Save user profile from onboarding
 */
export const saveUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from("ai_user_profiles")
      .insert([
        {
          user_id: userId,
          learning_goal: profileData.learning_goal,
          skill_level: profileData.skill_level,
          goal: profileData.goal,
          time_commitment: profileData.time_commitment,
          learning_style: profileData.learning_style,
          custom_interests: profileData.custom_interests || null,
          onboarding_completed: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Save user profile error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("ai_user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: true, data: null };
      }
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get user profile error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from("ai_user_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Update user profile error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Save generated courses
 */
export const saveGeneratedCourses = async (userId, courses) => {
  try {
    const coursesToInsert = courses.map((course) => ({
      user_id: userId,
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      estimated_hours: course.estimatedHours,
      potential_tokens: course.potentialTokens,
      tags: course.tags,
      modules: course.modules || [],
      modules_count: course.modulesCount || 0,
      status: "recommended",
      ai_model: "deepseek-v3",
      generation_cost: course.generationCost || 50,
    }));

    const { data, error } = await supabase
      .from("generated_courses")
      .insert(coursesToInsert)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Save generated courses error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's courses by status
 */
export const getCourses = async (userId, status = null) => {
  try {
    let query = supabase
      .from("generated_courses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Get courses error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Enroll in a course
 */
export const enrollInCourse = async (courseId, userId) => {
  try {
    const { data, error } = await supabase
      .from("generated_courses")
      .update({
        status: "enrolled",
        enrolled_at: new Date().toISOString(),
      })
      .eq("id", courseId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Enroll in course error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get course by ID
 */
export const getCourseById = async (courseId, userId) => {
  try {
    const { data, error } = await supabase
      .from("generated_courses")
      .select("*")
      .eq("id", courseId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Get course by ID error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update course metadata (e.g., when AI generates different module count)
 */
export const updateCourse = async (courseId, updates) => {
  try {
    const { data, error } = await supabase
      .from("generated_courses")
      .update(updates)
      .eq("id", courseId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Update course error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Save generated modules for a course
 */
export const saveGeneratedModules = async (courseId, userId, modules) => {
  try {
    const modulesToInsert = modules.map((module, index) => ({
      course_id: courseId,
      user_id: userId,
      title: module.title,
      description: module.description,
      order_index: index,
      lessons: module.lessons || [],
      lessons_count: module.lessons?.length || 0,
      is_unlocked: index === 0,
    }));

    const { data, error } = await supabase
      .from("generated_modules")
      .insert(modulesToInsert)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Save generated modules error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get modules for a course
 */
export const getModules = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from("generated_modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Get modules error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Save generated lesson
 */
export const saveGeneratedLesson = async (moduleId, userId, lessonData) => {
  try {
    const { data, error } = await supabase
      .from("generated_lessons")
      .insert([
        {
          module_id: moduleId,
          user_id: userId,
          title: lessonData.title,
          order_index: lessonData.orderIndex,
          estimated_minutes: lessonData.estimatedMinutes,
          content: lessonData.content,
          content_type: lessonData.contentType || "text",
          is_unlocked: lessonData.isUnlocked || false,
          ai_model: lessonData.aiModel || "deepseek-v3",
          generation_cost: lessonData.generationCost || 150,
          generated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Save generated lesson error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get lesson by ID
 */
export const getLesson = async (lessonId, userId) => {
  try {
    const { data, error } = await supabase
      .from("generated_lessons")
      .select("*")
      .eq("id", lessonId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: true, data: null };
      }
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get lesson error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Save external resources for a lesson
 */
export const saveExternalResources = async (lessonId, resources) => {
  try {
    const resourcesToInsert = resources.map((resource, index) => ({
      lesson_id: lessonId,
      title: resource.title,
      url: resource.url,
      type: resource.type,
      description: resource.description,
      source: resource.source || "ai_recommended",
      relevance_score: resource.relevanceScore || 0.8,
      order_index: index,
    }));

    const { data, error } = await supabase
      .from("external_resources")
      .insert(resourcesToInsert)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Save external resources error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get external resources for a lesson
 */
export const getExternalResources = async (lessonId) => {
  try {
    const { data, error } = await supabase
      .from("external_resources")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Get external resources error:", error);
    return { success: false, error: error.message };
  }
};
