import { useState, useCallback } from "react";
import { CourseGenerationContext } from "./createCourseGenerationContext";

const STORAGE_KEY = "courseGenerationData";

export const CourseGenerationProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.userProfile || null;
      } catch (error) {
        console.error("Failed to parse stored course data:", error);
        return null;
      }
    }
    return null;
  });

  const [generatedCourses, setGeneratedCourses] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.generatedCourses || [];
      } catch (error) {
        console.error("Failed to parse stored course data:", error);
        return [];
      }
    }
    return [];
  });

  const [enrolledCourses, setEnrolledCourses] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.enrolledCourses || [];
      } catch (error) {
        console.error("Failed to parse stored course data:", error);
        return [];
      }
    }
    return [];
  });

  const [currentCourse, setCurrentCourse] = useState(null);
  const [generationStatus, setGenerationStatus] = useState({
    isGenerating: false,
    type: null,
    progress: 0,
    error: null,
  });

  const saveToStorage = useCallback((data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save to storage:", error);
    }
  }, []);

  const updateUserProfile = useCallback(
    (profile) => {
      setUserProfile(profile);
      const stored = localStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      saveToStorage({ ...data, userProfile: profile });
    },
    [saveToStorage],
  );

  const addGeneratedCourses = useCallback(
    (courses) => {
      setGeneratedCourses((prev) => {
        const updated = [...prev, ...courses];
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};
        saveToStorage({ ...data, generatedCourses: updated });
        return updated;
      });
    },
    [saveToStorage],
  );

  const enrollInCourse = useCallback(
    (courseId) => {
      const course = generatedCourses.find((c) => c.id === courseId);
      if (!course) {
        return { success: false, error: "Course not found" };
      }

      setEnrolledCourses((prev) => {
        if (prev.find((c) => c.id === courseId)) {
          return prev;
        }

        const enrolledCourse = {
          ...course,
          enrolledAt: new Date().toISOString(),
          progress: {
            currentModuleIndex: 0,
            currentLessonIndex: 0,
            completedLessons: [],
          },
        };

        const updated = [...prev, enrolledCourse];
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};
        saveToStorage({ ...data, enrolledCourses: updated });
        return updated;
      });

      return { success: true };
    },
    [generatedCourses, saveToStorage],
  );

  const updateCourseProgress = useCallback(
    (courseId, progress) => {
      setEnrolledCourses((prev) => {
        const updated = prev.map((course) =>
          course.id === courseId ? { ...course, progress } : course,
        );
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : {};
        saveToStorage({ ...data, enrolledCourses: updated });
        return updated;
      });
    },
    [saveToStorage],
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
