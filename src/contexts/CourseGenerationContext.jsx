import { useState, useCallback, useEffect } from "react";
import { CourseGenerationContext } from "./createCourseGenerationContext";
import { useUser } from "../hooks/useUser";
import {
  getUserProfile,
  saveUserProfile,
  getCourses,
  saveGeneratedCourses,
  enrollInCourse as enrollInCourseDB,
} from "../services/courseDataService";

export const CourseGenerationProvider = ({ children }) => {
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [generatedCourses, setGeneratedCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generationStatus, setGenerationStatus] = useState({
    isGenerating: false,
    type: null,
    progress: 0,
    error: null,
  });

  // Load user profile and courses from database
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Load user profile
      const profileResult = await getUserProfile(user.id);
      if (profileResult.success && profileResult.data) {
        setUserProfile(profileResult.data);
      }

      // Load all generated courses (both recommended and enrolled)
      const coursesResult = await getCourses(user.id);
      if (coursesResult.success) {
        const allCourses = coursesResult.data || [];
        // Separate enrolled and non-enrolled courses
        const enrolled = allCourses.filter((c) => c.status === "enrolled");
        const recommended = allCourses.filter(
          (c) => c.status === "recommended",
        );

        setGeneratedCourses(allCourses); // Show all courses in catalog
        setEnrolledCourses(enrolled);
      }

      setLoading(false);
    };

    loadUserData();
  }, [user]);

  const updateUserProfile = useCallback(
    async (profile) => {
      if (!user?.id) {
        return { success: false, error: "User not authenticated" };
      }

      const { success, data, error } = await saveUserProfile(user.id, profile);

      if (success) {
        setUserProfile(data);
        return { success: true, data };
      }

      return { success: false, error: error || "Failed to save profile" };
    },
    [user],
  );

  const addGeneratedCourses = useCallback(
    async (courses) => {
      if (!user?.id) {
        return { success: false, error: "User not authenticated" };
      }

      const { success, data, error } = await saveGeneratedCourses(
        user.id,
        courses,
      );

      if (success) {
        setGeneratedCourses((prev) => [...prev, ...data]);
        return { success: true, data };
      }

      return { success: false, error: error || "Failed to save courses" };
    },
    [user],
  );

  const enrollInCourse = useCallback(
    async (courseId) => {
      if (!user?.id) {
        return { success: false, error: "User not authenticated" };
      }

      const course = generatedCourses.find((c) => c.id === courseId);
      if (!course) {
        return { success: false, error: "Course not found" };
      }

      // Check if already enrolled
      if (course.status === "enrolled") {
        console.log("ℹ️ Already enrolled in this course");
        return { success: true, data: course };
      }

      console.log("🔄 Calling enrollInCourseDB...");
      const { success, data, error } = await enrollInCourseDB(
        courseId,
        user.id,
      );

      if (success) {
        console.log("✅ Enrollment successful, updating context...");
        console.log("📦 Enrolled course data:", data);

        // Update enrolledCourses
        setEnrolledCourses((prev) => {
          // Check if already in list
          if (prev.some((c) => c.id === courseId)) {
            return prev.map((c) => (c.id === courseId ? data : c));
          }
          return [...prev, data];
        });

        // Update the course in generatedCourses to reflect enrollment status
        setGeneratedCourses((prev) =>
          prev.map((c) => (c.id === courseId ? data : c)),
        );

        return { success: true, data };
      }

      console.error("❌ Enrollment failed:", error);
      return { success: false, error: error || "Failed to enroll" };
    },
    [generatedCourses, user],
  );

  const updateCourseProgress = useCallback((courseId, progress) => {
    // Update progress in local state
    setEnrolledCourses((prev) => {
      return prev.map((course) =>
        course.id === courseId ? { ...course, progress } : course,
      );
    });

    // Save progress to database
    import("../services/courseDataService").then(({ updateCourse }) => {
      updateCourse(courseId, { progress }).then((result) => {
        if (result.success) {
          console.log("✅ Progress saved to database:", progress);
        } else {
          console.error(
            "❌ Failed to save progress to database:",
            result.error,
          );
        }
      });
    });
  }, []);

  const setGenerating = useCallback(
    (isGenerating, type = null, progress = 0) => {
      setGenerationStatus({
        isGenerating,
        type,
        progress,
        error: null,
      });
    },
    [],
  );

  const setGenerationError = useCallback((error) => {
    setGenerationStatus((prev) => ({
      ...prev,
      isGenerating: false,
      error,
    }));
  }, []);

  const clearGenerationError = useCallback(() => {
    setGenerationStatus((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const getCourseById = useCallback(
    (courseId) => {
      return enrolledCourses.find((c) => c.id === courseId) || null;
    },
    [enrolledCourses],
  );

  const hasCompletedOnboarding = useCallback(() => {
    return userProfile !== null;
  }, [userProfile]);

  const value = {
    userProfile,
    generatedCourses,
    enrolledCourses,
    currentCourse,
    generationStatus,
    updateUserProfile,
    addGeneratedCourses,
    enrollInCourse,
    loading,
    updateCourseProgress,
    setCurrentCourse,
    setGenerating,
    setGenerationError,
    clearGenerationError,
    getCourseById,
    hasCompletedOnboarding,
  };

  return (
    <CourseGenerationContext.Provider value={value}>
      {children}
    </CourseGenerationContext.Provider>
  );
};
