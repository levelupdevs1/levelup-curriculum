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
import {
  getFoundationCourse,
  hasCompletedFoundation,
} from "../services/foundationCourseService";

export const CourseGenerationProvider = ({ children }) => {
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [generatedCourses, setGeneratedCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [foundationCourse, setFoundationCourse] = useState(null);
  const [foundationCompleted, setFoundationCompleted] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generationStatus, setGenerationStatus] = useState({
    isGenerating: false,
    type: null,
    progress: 0,
    error: null,
  });

  // Load user profile and courses from database
  useEffect(() => {
    setLoading(true);
    const loadUserData = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }
        
        
        let fetchedUserProfile = null;
        // Load foundation course (creates if doesn't exist)
        // Use Web Lock to prevent race conditions across tabs
        await navigator.locks.request(`foundation_creation_${user.id}`, async () => {
          const foundationResult = await getFoundationCourse(user.id);
          if (foundationResult.success && foundationResult.data) {
            setFoundationCourse(foundationResult.data);
          }
        });

        // Check foundation completion status
        const completionResult = await hasCompletedFoundation(user.id);
        if (completionResult.success) {
          setFoundationCompleted(completionResult.completed);
          
          // Only load AI user profile if foundation is completed
          if (completionResult.completed) {
            const profileResult = await getUserProfile(user.id);
            if (profileResult.success && profileResult.data) {
              fetchedUserProfile = profileResult.data;
              setUserProfile(profileResult.data);
            }
          }
        }

        // Load all generated courses (both recommended and enrolled)
        const coursesResult = await getCourses(user.id);
        if (coursesResult.success) {
          const allCourses = coursesResult.data || [];
          // Filter out foundation course from regular courses (it's handled separately)
          const nonFoundationCourses = allCourses.filter(
            (c) => !c.is_foundation,
          );
          // Separate enrolled and non-enrolled courses
          const enrolled = nonFoundationCourses.filter(
            (c) => c.status === "enrolled",
          );

          setGeneratedCourses(nonFoundationCourses); // Show all non-foundation courses in catalog
          setEnrolledCourses(enrolled);
        }
        setLoading(false);
      } catch {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

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
        return { success: true, data: course };
      }

      const { success, data, error } = await enrollInCourseDB(
        courseId,
        user.id,
      );

      if (success) {
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

      return { success: false, error: error || "Failed to enroll" };
    },
    [generatedCourses, user],
  );

  const updateCourseData = useCallback(
  (courseId, updates) => {
    const isFoundation = foundationCourse && foundationCourse.id === courseId;
    if (isFoundation) {
      setFoundationCourse((prev) => (prev ? { ...prev, ...updates } : prev));
    } else {
      setEnrolledCourses((prev) =>
        prev.map((course) =>
          course.id === courseId ? { ...course, ...updates } : course
        )
      );
    }
  },
  [foundationCourse]
);

  const updateCourseProgress = useCallback(
    (courseId, progress) => {
      // Check if this is the foundation course
      const isFoundation = foundationCourse && foundationCourse.id === courseId;

      if (isFoundation) {
        // Update foundation course progress
        setFoundationCourse((prev) => (prev ? { ...prev, progress } : prev));

        // Check if foundation is now complete
        const completedLessons = progress?.completedLessons || [];
        let totalLessons = 0;
        for (const module of foundationCourse.modules || []) {
          totalLessons += module.lessons?.length || 0;
        }
        if (totalLessons > 0 && completedLessons.length >= totalLessons) {
          setFoundationCompleted(true);
        }
      } else {
        // Update progress in local state for AI courses
        setEnrolledCourses((prev) => {
          return prev.map((course) =>
            course.id === courseId ? { ...course, progress } : course,
          );
        });
      }

      // Save progress to database
      import("../services/courseDataService").then(({ updateCourse }) => {
        updateCourse(courseId, { progress });
      });
    },
    [foundationCourse],
  );

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
      // Check foundation course first
      if (foundationCourse && foundationCourse.id === courseId) {
        return foundationCourse;
      }
      return enrolledCourses.find((c) => c.id === courseId) || null;
    },
    [enrolledCourses, foundationCourse],
  );

  const hasCompletedOnboarding = useCallback(() => {
    return userProfile !== null;
  }, [userProfile]);

  const value = {
    userProfile,
    generatedCourses,
    enrolledCourses,
    foundationCourse,
    foundationCompleted,
    currentCourse,
    generationStatus,
    updateUserProfile,
    addGeneratedCourses,
    enrollInCourse,
    loading,
    updateCourseData,
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
