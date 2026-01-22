import React, { useEffect, useState } from "react";
import {
  getUserEnrollments,
  enrollInCourse as enrollInCourseService,
  getCourseProgress,
  submitPeerReview as submitPeerReviewService,
  submitReviewRequest as submitReviewRequestService,
  fetchCourses,
} from "../services/courseService";
import { useUser } from "../hooks/useUser";
import { CourseContext } from "./createCourseContext";

export const CourseProvider = ({ children }) => {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);

  const [currentCourse, _setCurrentCourse] = useState(null);
  const [currentLesson, _setCurrentLesson] = useState(null);
  const [userProgress, _setUserProgress] = useState({});
  const [userStats, setUserStats] = useState({
    exp: 1250,
    level: 3,
    coins: 500,
    totalCoursesCompleted: 1,
    totalLessonsCompleted: 8,
    streak: 7,
  });

  // Load courses: LOCAL FILES in dev mode, SUPABASE in production
  useEffect(() => {
    const loadCourses = async () => {
      try {
        let loadedCourses = [];

        // HYBRID LOADER: Development vs Production
        if (import.meta.env.DEV) {
          // DEV MODE: Load from local src/courses/ files for instant testing
          const { loadAllCourses } = await import("../utils/courseLoader");
          loadedCourses = await loadAllCourses();
        } else {
          // PRODUCTION MODE: Fetch from Supabase (synced via GitHub Actions)
          const { success, courses } = await fetchCourses();

          if (!success) {
            return;
          }

          loadedCourses = courses || [];
        }

        if (loadedCourses && loadedCourses.length > 0) {
          let finalCourses = loadedCourses;

          // If user is authenticated, fetch their enrollments and progress
          if (user) {
            const { enrollments } = await getUserEnrollments(user.id);
            const enrolledCourseIds = new Set(
              enrollments?.map((e) => e.course_id) || [],
            );

            // For each enrolled course, fetch progress and mark completed lessons
            finalCourses = await Promise.all(
              loadedCourses.map(async (course) => {
                const courseWithEnrollment = {
                  ...course,
                  isEnrolled: enrolledCourseIds.has(course.id),
                };

                // If course is enrolled, fetch progress
                if (courseWithEnrollment.isEnrolled) {
                  const { success: progSuccess, progress: progressData } =
                    await getCourseProgress(user.id, course.id);

                  // Calculate progress percentage (0 if no data)
                  let progressPercentage = 0;
                  let updatedModules = courseWithEnrollment.modules || [];

                  if (progSuccess && progressData && progressData.length > 0) {
                    // Create a set of completed lesson IDs for quick lookup
                    const completedLessonIds = new Set(
                      progressData.map((p) => p.lesson_id),
                    );

                    // Mark lessons as completed
                    if (courseWithEnrollment.modules) {
                      updatedModules = courseWithEnrollment.modules.map(
                        (module) => ({
                          ...module,
                          lessons: (module.lessons || []).map((lesson) => ({
                            ...lesson,
                            isCompleted: completedLessonIds.has(lesson.id),
                          })),
                        }),
                      );
                    }
                  }

                  // Apply lesson locking logic
                  const allLessons = getAllLessons({
                    ...courseWithEnrollment,
                    modules: updatedModules,
                  });

                  // Lock lessons: first is unlocked, rest are locked unless previous is completed
                  updatedModules = updatedModules.map((module) => ({
                    ...module,
                    lessons: (module.lessons || []).map((lesson) => {
                      const lessonPosition = allLessons.findIndex(
                        (l) => l.id === lesson.id,
                      );

                      // First lesson is always unlocked
                      if (lessonPosition === 0) {
                        return { ...lesson, isLocked: false };
                      }

                      // Other lessons: unlock only if previous is completed
                      const previousLesson = allLessons[lessonPosition - 1];
                      const isLocked =
                        previousLesson && !previousLesson.isCompleted;
                      return { ...lesson, isLocked };
                    }),
                  }));

                  // Calculate progress percentage
                  const allLessonsUpdated = getAllLessons({
                    ...courseWithEnrollment,
                    modules: updatedModules,
                  });
                  const completedCount = allLessonsUpdated.filter(
                    (l) => l.isCompleted,
                  ).length;
                  progressPercentage = Math.round(
                    (completedCount / allLessonsUpdated.length) * 100,
                  );

                  return {
                    ...courseWithEnrollment,
                    modules: updatedModules,
                    progress: progressPercentage,
                    isCompleted: progressPercentage === 100,
                  };
                } else {
                  // User is authenticated but NOT enrolled - lock all lessons
                  const lockedModules = courseWithEnrollment.modules.map(
                    (module) => ({
                      ...module,
                      lessons: (module.lessons || []).map((lesson) => ({
                        ...lesson,
                        isLocked: true,
                        isCompleted: false,
                      })),
                    }),
                  );
                  return {
                    ...courseWithEnrollment,
                    modules: lockedModules,
                    progress: 0,
                    isCompleted: false,
                  };
                }
              }),
            );
          } else {
            // User not authenticated, no enrollments - all lessons locked
            finalCourses = loadedCourses.map((c) => ({
              ...c,
              isEnrolled: false,
              modules: (c.modules || []).map((module) => ({
                ...module,
                lessons: (module.lessons || []).map((lesson) => ({
                  ...lesson,
                  isLocked: true, // All lessons locked for non-enrolled courses
                  isCompleted: false,
                })),
              })),
            }));
          }

          setCourses(finalCourses);
        }
      } catch {
        // Silently fail to load courses
      }
    };

    loadCourses();
  }, [user]);

  const [notifications, setNotifications] = useState([]);
  const [submissions, setSubmissions] = useState({});

  const [reviewRequests, setReviewRequests] = useState({});

  const [certificates, setCertificates] = useState([]);
  const [availableCertificates, setAvailableCertificates] = useState([]);

  // Helper function to get all lessons from a course
  const getAllLessons = (course) => {
    if (!course || !course.modules) return [];
    return course.modules.flatMap((module) => module.lessons || []);
  };

  // Helper function to get lesson by ID
  const getLessonById = (courseId, lessonId) => {
    const course = getCourseById(courseId);
    if (!course || !course.modules) return null;

    for (const module of course.modules) {
      if (module.lessons) {
        const lesson = module.lessons.find((l) => l.id === lessonId);
        if (lesson) return lesson;
      }
    }
    return null;
  };

  const getCourseById = (courseId) => {
    return courses.find((course) => course.id === courseId);
  };

  const enrollInCourse = async (courseId) => {
    if (!user) {
      return false;
    }
    try {
      await enrollInCourseService(user.id, courseId);
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === courseId
            ? { ...course, isEnrolled: true, progress: 0 }
            : course,
        ),
      );
      return true;
    } catch {
      return false;
    }
  };

  const updateCourseProgress = (courseId, newProgress) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === courseId ? { ...course, progress: newProgress } : course,
      ),
    );
  };

  const completeLesson = (courseId, lessonId) => {
    const lesson = getLessonById(courseId, lessonId);

    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.id === courseId) {
          const updatedModules = course.modules.map((module) => {
            if (module.lessons) {
              const updatedLessons = module.lessons.map((lesson) =>
                lesson.id === lessonId
                  ? { ...lesson, isCompleted: true }
                  : lesson,
              );
              return { ...module, lessons: updatedLessons };
            }
            return module;
          });

          // Calculate new progress
          const allLessons = getAllLessons({
            ...course,
            modules: updatedModules,
          });
          const completedLessons = allLessons.filter(
            (lesson) => lesson.isCompleted,
          );
          const newProgress = Math.round(
            (completedLessons.length / allLessons.length) * 100,
          );

          // Check if course is completed
          const isCourseCompleted = newProgress === 100;

          return {
            ...course,
            modules: updatedModules,
            progress: newProgress,
            isCompleted: isCourseCompleted,
          };
        }
        return course;
      }),
    );

    // Award EXP based on lesson type
    let expReward = 10; // Base EXP for completing a lesson

    if (lesson) {
      switch (lesson.type) {
        case "lesson":
          expReward = 15;
          break;
        case "assignment":
          expReward = 25;
          break;
        case "project":
          expReward = 50;
          break;
        default:
          expReward = 10;
      }
    }

    addExp(expReward, `completing ${lesson?.title || "lesson"}`);

    // Check if course is now completed and award bonus EXP
    const updatedCourse = getCourseById(courseId);
    if (updatedCourse && updatedCourse.isCompleted) {
      addExp(100, "completing course"); // Bonus EXP for completing entire course
      addCoins(25, "completing course"); // Bonus coins for completing entire course
    }

    // Unlock next lesson
    unlockNextLesson(courseId, lessonId);
  };

  const unlockNextLesson = (courseId, lessonId) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.id === courseId) {
          // Get all lessons to find the next one
          const allLessons = getAllLessons(course);
          const currentLessonIndex = allLessons.findIndex(
            (lesson) => lesson.id === lessonId,
          );

          if (
            currentLessonIndex !== -1 &&
            currentLessonIndex < allLessons.length - 1
          ) {
            const nextLessonId = allLessons[currentLessonIndex + 1].id;

            // Update the course modules to unlock the next lesson
            const updatedModules = course.modules.map((module) => {
              if (module.lessons) {
                const updatedLessons = module.lessons.map((lesson) => {
                  if (lesson.id === nextLessonId) {
                    return { ...lesson, isLocked: false };
                  }
                  return lesson;
                });
                return { ...module, lessons: updatedLessons };
              }
              return module;
            });

            return { ...course, modules: updatedModules };
          }
        }
        return course;
      }),
    );
  };

  const submitAssignment = (courseId, lessonId, submission) => {
    const submissionId = `${courseId}-${lessonId}-${Date.now()}`;
    setSubmissions((prev) => ({
      ...prev,
      [submissionId]: {
        id: submissionId,
        courseId,
        lessonId,
        ...submission,
        submittedAt: new Date().toISOString(),
        status: "submitted",
        botReview: null,
        peerReviews: [],
        needsPeerReview: true,
        authorId: "1", // Current user ID
      },
    }));
    return submissionId;
  };

  const getSubmissionsForLesson = (courseId, lessonId) => {
    return Object.values(submissions).filter(
      (submission) =>
        submission.courseId === courseId && submission.lessonId === lessonId,
    );
  };

  const getPeerReviewSubmissions = (courseId, lessonId) => {
    return Object.values(submissions).filter(
      (submission) =>
        submission.courseId === courseId &&
        submission.lessonId === lessonId &&
        submission.authorId !== "1" && // Not current user's submissions
        submission.needsPeerReview,
    );
  };

  const submitPeerReview = async (submissionId, review) => {
    if (!user) {
      addNotification("Must be logged in to submit reviews", "error");
      return null;
    }

    try {
      // Submit to backend
      const {
        success,
        review: savedReview,
        error,
      } = await submitPeerReviewService(
        user.id,
        submissionId,
        review.rating,
        review.feedback,
      );

      if (!success) {
        addNotification(error || "Failed to submit review", "error");
        return null;
      }

      // Update local state
      setSubmissions((prev) => ({
        ...prev,
        [submissionId]: {
          ...prev[submissionId],
          peerReviews: [
            ...(prev[submissionId]?.peerReviews || []),
            {
              id: savedReview.id,
              reviewerId: user.id,
              rating: savedReview.rating,
              feedback: savedReview.feedback,
              submittedAt: savedReview.created_at,
            },
          ],
        },
      }));

      // Award EXP for peer review
      addExp(10, "peer review");
      addCoins(5, "peer review");

      addNotification("Review submitted successfully!", "success");
      return savedReview.id;
    } catch {
      addNotification("Error submitting review", "error");
      return null;
    }
  };

  const getReviewRequestsForLesson = (lessonId) => {
    return reviewRequests[lessonId] || [];
  };

  const submitReviewRequest = async (courseId, lessonId, request) => {
    if (!user) {
      addNotification("Must be logged in to request a review", "error");
      return null;
    }

    try {
      // Submit to backend
      const {
        success,
        request: savedRequest,
        error,
      } = await submitReviewRequestService(
        user.id,
        courseId,
        lessonId,
        request,
      );

      if (!success) {
        addNotification(error || "Failed to submit review request", "error");
        return null;
      }

      // Also update local state for immediate UI feedback
      const requestId = savedRequest.id;
      const newRequest = {
        id: requestId,
        userId: user.id,
        userName: user.user_metadata?.full_name || user.email || "You",
        ...request,
        submittedAt: savedRequest.created_at,
        status: "open",
        reviews: [],
      };

      setReviewRequests((prevRequests) => ({
        ...prevRequests,
        [lessonId]: [...(prevRequests[lessonId] || []), newRequest],
      }));

      return requestId;
    } catch {
      addNotification("Error submitting review request", "error");
      return null;
    }
  };

  const submitReviewFeedback = (requestId, feedback) => {
    const reviewId = `rev-${Date.now()}`;
    const newReview = {
      id: reviewId,
      userId: "current-user",
      userName: "Current User",
      ...feedback,
      submittedAt: new Date().toISOString(),
    };

    setReviewRequests((prevRequests) => {
      const updatedRequests = { ...prevRequests };
      Object.keys(updatedRequests).forEach((lessonId) => {
        updatedRequests[lessonId] = updatedRequests[lessonId].map((request) => {
          if (request.id === requestId) {
            return {
              ...request,
              reviews: [...request.reviews, newReview],
            };
          }
          return request;
        });
      });
      return updatedRequests;
    });

    // Award EXP for helping others
    addExp(15, "helping peers");
    addCoins(8, "helping peers");

    return reviewId;
  };

  const claimCertificate = (certificateId) => {
    const certificate = availableCertificates.find(
      (cert) => cert.id === certificateId,
    );
    if (!certificate || !certificate.isClaimable || certificate.claimed) {
      return false;
    }

    const tokenId = `nft-${Date.now()}`;
    const claimedCertificate = {
      ...certificate,
      claimed: true,
      tokenId,
      claimedAt: new Date().toISOString(),
      transactionHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
    };

    // Add to user's certificates
    setCertificates((prev) => [...prev, claimedCertificate]);

    // Update available certificates
    setAvailableCertificates((prev) =>
      prev.map((cert) =>
        cert.id === certificateId ? { ...cert, claimed: true, tokenId } : cert,
      ),
    );

    // Award EXP and coins for claiming
    addExp(100, "claiming certificate");
    addCoins(50, "claiming certificate");

    return tokenId;
  };

  const getAvailableCertificates = () => {
    return availableCertificates.filter(
      (cert) => cert.isClaimable && !cert.claimed,
    );
  };

  const getUserCertificates = () => {
    return certificates;
  };

  const addNotification = (message, type = "success") => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const notification = {
      id,
      message,
      type,
      timestamp: new Date().toISOString(),
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto remove notification after 10 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 10000);
  };

  const addExp = (amount) => {
    setUserStats((prev) => {
      const newExp = prev.exp + amount;
      const oldLevel = prev.level;
      const newLevel = Math.floor(newExp / 500) + 1; // 500 EXP per level

      // Detect level-up
      if (newLevel > oldLevel) {
        // Show level-up notification
        addNotification(
          `🎉 Level Up! You've reached Level ${newLevel}!`,
          "success",
        );

        // Record the level claim for token rewards (if user is logged in)
        if (user) {
          recordLevelUpClaim(user.id, newLevel);
        }
      }

      return {
        ...prev,
        exp: newExp,
        level: newLevel,
      };
    });
  };

  const recordLevelUpClaim = async (userId, level) => {
    try {
      const { recordLevelClaim } = await import("../services/courseService");
      await recordLevelClaim(userId, level);
    } catch {
      // Silently fail - not critical if claim isn't recorded
    }
  };

  const addCoins = (amount, source = "") => {
    setUserStats((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));

    if (amount > 0) {
      addNotification(
        `+${amount} coins earned${source ? ` for ${source}` : ""}!`,
        "success",
      );
    }
  };

  const spendCoins = (amount) => {
    if (userStats.coins < amount) return false;
    setUserStats((prev) => ({
      ...prev,
      coins: prev.coins - amount,
    }));
    return true;
  };

  const value = {
    courses,
    currentCourse,
    currentLesson,
    userProgress,
    userStats,
    submissions,
    certificates,
    getCourseById,
    getAllLessons,
    getLessonById,
    enrollInCourse,
    updateCourseProgress,
    completeLesson,
    unlockNextLesson,
    submitAssignment,
    getSubmissionsForLesson,
    getPeerReviewSubmissions,
    submitPeerReview,
    getReviewRequestsForLesson,
    submitReviewRequest,
    submitReviewFeedback,
    getAvailableCertificates,
    getUserCertificates,
    claimCertificate,
    addExp,
    addCoins,
    spendCoins,
    notifications,
    addNotification,
  };

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
};
