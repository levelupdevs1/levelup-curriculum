import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import { useAIToken } from "../../hooks/useAIToken";
import { useUser } from "../../hooks/useUser";
import { useLoadingBar } from "../../components/TopLoadingBar";
import { useLessonNavigation } from "../../hooks/useLessonNavigation";
import { useXPAward } from "../../hooks/useXPAward";
import {
  generateLessonContent,
  generateAssessment,
  reviewSubmissionBatch,
  AI_TOKEN_COSTS,
} from "../../services/aiServiceReal";
import { updateCourse } from "../../services/courseDataService";
import { TOKEN_REWARDS } from "../../services/platformTokenService";
import { logResourceValidation } from "../../utils/resourceValidation";
import { isChooseYourPathLesson } from "../../services/foundationCourseService";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import LevelUpNotification from "../../components/LevelUpNotification/LevelUpNotification";
import LessonContent from "../../components/LessonContent/LessonContent";
import AssessmentView from "../../components/AssessmentView/AssessmentView";
import ReviewView from "../../components/ReviewView/ReviewView";
import styles from "./AILessonViewer.module.css";

const AILessonViewer = () => {
  const { courseId, lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getCourseById, updateCourseProgress, updateCourseData } = useCourseGeneration();
  const { consumeTokens } = useAIToken();
  const { user, refreshProfile } = useUser();
  const loadingBar = useLoadingBar();

  const { moduleIndex, lessonIndex } = location.state || {
    moduleIndex: 0,
    lessonIndex: 0,
  };

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [submission, setSubmission] = useState({});
  const [review, setReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isNext, setIsNext] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const [isChooseYourPath, setIsChooseYourPath] = useState(false);
  const hasGeneratedRef = useRef(false);

  const { handleAwardXP, levelUpNotification, setLevelUpNotification } =
    useXPAward(user, refreshProfile);
  const { navigateToPreviousLesson, navigateToNextLesson, canGoBack } =
    useLessonNavigation(course, courseId, moduleIndex, lessonIndex);

  useEffect(() => {
    // Reset state when lesson changes
    hasGeneratedRef.current = false;
    setReview(null);
    setSubmission({});
    setShowAssessment(false);
    setAssessment(null);
    setError(null);

    // Prevent double execution in React StrictMode
    if (hasGeneratedRef.current) {
      return;
    }

    const enrolledCourse = getCourseById(courseId);
    if (!enrolledCourse) {
      navigate("/course-catalog");
      return;
    }

    setCourse(enrolledCourse);
    loadLesson(enrolledCourse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId]);

  const loadLesson = async (enrolledCourse) => {
    // Mark as processing immediately to prevent race conditions
    if (hasGeneratedRef.current) {
      return;
    }
    hasGeneratedRef.current = true;

    // Check if structure exists
    if (!enrolledCourse.structure && !enrolledCourse.modules) {
      setError(
        "Course structure not generated. Please go back to the course page.",
      );
      return;
    }

    // Use structure from modules field or structure field
    const modules = enrolledCourse.modules || enrolledCourse.structure?.modules;

    if (!modules || !Array.isArray(modules) || modules.length === 0) {
      setError(
        "Course modules not found. Please regenerate the course structure.",
      );
      return;
    }

    const module = modules[moduleIndex];

    if (!module) {
      setError("Module not found");
      return;
    }

    const lessonData = module.lessons?.[lessonIndex];
    if (!lessonData) {
      setError("Lesson not found");
      return;
    }

    // Check if this is the "Choose Your Path" lesson
    const isPathLesson = isChooseYourPathLesson(lessonData);
    setIsChooseYourPath(isPathLesson);

    // Check if lesson content already exists in database
    if (lessonData.content) {
      setLesson(lessonData.content);

      // Load assessment if it exists (some lessons don't have assessments)
      if (lessonData.assessment) {
        setAssessment(lessonData.assessment);
      }

      // Load existing review if available
      if (lessonData.review) {
        setReview(lessonData.review);
      }

      setLoading(false);
      return;
    }

    const lessonTitle = lessonData.title;
    const lessonDescription = lessonData.description || "";

    // Token check disabled for development
    // const contentCost = AI_TOKEN_COSTS.GENERATE_LESSON_CONTENT;
    // const assessmentCost = AI_TOKEN_COSTS.GENERATE_ASSESSMENT;
    // if (!canUseTokens(contentCost + assessmentCost)) {
    //   setError("Insufficient AI tokens");
    //   return;
    // }

    setLoading(true);
    setError(null);
    loadingBar.start();

    try {
      // Generate lesson content with real AI
      const contentResult = await generateLessonContent(
        lessonTitle,
        lessonDescription,
        enrolledCourse.title,
        lessonData.estimatedMinutes || 30,
      );

      if (!contentResult.success) {
        setError(contentResult.error || "Failed to generate lesson content");
        return;
      }

      let assessmentResult = null;
      let tokensUsed = contentResult.tokensUsed;

      // Conditionally generate assessment based on lesson metadata
      const requiresAssessment = lessonData.requiresAssessment ?? true; // Default to true for backward compatibility
      const assessmentType = lessonData.assessmentType || "coding_challenge";

      if (requiresAssessment) {
        assessmentResult = await generateAssessment(
          lessonTitle,
          contentResult.content,
          assessmentType,
        );

        if (!assessmentResult.success) {
          // Don't fail the entire lesson, just skip assessment
        } else {
          tokensUsed += assessmentResult.tokensUsed;
        }
      }

      // Update tokens used
      consumeTokens(tokensUsed, "generate_lesson", {
        courseId: enrolledCourse.id,
        lessonId,
      });

      // Save to database - update the specific lesson in the modules array
      const updatedModules = [...modules];
      updatedModules[moduleIndex].lessons[lessonIndex] = {
        ...lessonData,
        content: contentResult.content,
        assessment: assessmentResult?.assessment || null,
      };

      await updateCourse(enrolledCourse.id, {
        modules: updatedModules,
      });

      setLesson(contentResult.content);
      setAssessment(assessmentResult?.assessment || null);

      // Validate external resources
      if (contentResult.content?.externalResources) {
        logResourceValidation(
          lessonTitle,
          contentResult.content.externalResources,
        );
      }
    } catch (err) {
      setError(err.message || "An error occurred while generating the lesson");
    } finally {
      setLoading(false);
      loadingBar.complete();
    }
  };

  const handleSubmitAssessment = async () => {
    setSubmitting(true);
    setError(null);
    loadingBar.start();

    try {
      // Normalize questions to have IDs if missing
      const normalizedQuestions = assessment.questions.map((q, idx) => ({
        ...q,
        id: q.id || `q${idx + 1}`,
      }));

      const result = await reviewSubmissionBatch(
        normalizedQuestions,
        submission,
      );

      if (result.success) {
        consumeTokens(result.tokensUsed, "review_submission", { lessonId });

        // Transform Gemini response into UI-compatible format
        const review = result.review;
        const overallScore = review.overallScore || 0;
        const passingScore = assessment.passingScore || 70;
        const aggregatedReview = {
          passed: overallScore >= passingScore, // Calculate passed based on score
          score: overallScore,
          passingScore: passingScore,
          totalQuestions: assessment.questions?.length || 0,
          questionsReviewed: review.reviewedQuestions?.length || 0,
          details: review.reviewedQuestions || [],
          feedback: {
            overall: review.overallFeedback || "",
            strengths:
              review.reviewedQuestions
                ?.filter((q) => q.isCorrect)
                .map(
                  (q) =>
                    `${q.questionType === "short_answer" ? "Essay" : "Code"}: ${q.feedback}`,
                ) || [],
            improvements:
              review.reviewedQuestions
                ?.filter((q) => !q.isCorrect)
                .map((q) => `${q.questionText}: ${q.feedback}`) || [],
          },
        };

        setReview(aggregatedReview);

        // Save review to database
        try {
          // Get fresh course data from context
          const freshCourse = getCourseById(courseId);
          const courseModules =
            freshCourse?.structure?.modules || freshCourse?.modules;

          if (!freshCourse || !courseModules) {
            throw new Error("Course structure is missing");
          }
          const updatedModules = courseModules.map((mod, mIdx) => {
            if (mIdx === moduleIndex) {
              return {
                ...mod,
                lessons: mod.lessons.map((les, lIdx) => {
                  if (lIdx === lessonIndex) {
                    return {
                      ...les,
                      review: {
                        ...aggregatedReview,
                        submittedAt: new Date().toISOString(),
                      },
                    };
                  }
                  return les;
                }),
              };
            }
            return mod;
          });

          await updateCourse(courseId, {
            modules: updatedModules,
          });

          updateCourseData(courseId, { modules: updatedModules });
        } catch {
          // Failed to save review
        }

        if (aggregatedReview.passed) {
          // Award XP for passing assessment
          const isPerfectScore = aggregatedReview.score === 100;
          const xpAmount = isPerfectScore
            ? TOKEN_REWARDS.PERFECT_SCORE * 10
            : TOKEN_REWARDS.PASS_ASSESSMENT * 10;

          if (user?.id) {
            handleAwardXP(
              xpAmount,
              isPerfectScore
                ? "Perfect score on assessment"
                : "Passed assessment",
            );
          }

          // Get fresh course data again for progress calculation
          const freshCourse = getCourseById(courseId);
          const progressModules =
            freshCourse?.structure?.modules || freshCourse?.modules;

          if (!freshCourse || !progressModules) {
            return;
          }

          const completedLessons = [
            ...(freshCourse.progress?.completedLessons || []),
            lessonId,
          ];

          const nextLessonIndex = lessonIndex + 1;
          const nextModuleIndex =
            nextLessonIndex >= progressModules[moduleIndex].lessons.length
              ? moduleIndex + 1
              : moduleIndex;
          const nextLessonIndexInModule =
            nextLessonIndex >= progressModules[moduleIndex].lessons.length
              ? 0
              : nextLessonIndex;

          const progressUpdate = {
            ...freshCourse.progress,
            completedLessons,
            currentModuleIndex:
              nextModuleIndex < progressModules.length
                ? nextModuleIndex
                : moduleIndex,
            currentLessonIndex: nextLessonIndexInModule,
          };

          updateCourseProgress(courseId, progressUpdate);
        } else {
          // Assessment not passed
        }
      } else {
        setError(result.error || "Failed to review submission");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
      loadingBar.complete();
    }
  };

  const handleNextLesson = async () => {
    const modules = course.structure?.modules || course.modules;
    const completedLessons = course.progress?.completedLessons || [];
    if (!completedLessons.includes(lessonId)) {
      const updatedCompletedLessons = [...completedLessons, lessonId];

      const nextLessonIdx = lessonIndex + 1;
      const currentModule = modules[moduleIndex];
      const nextModIdx =
        nextLessonIdx >= currentModule.lessons.length
          ? moduleIndex + 1
          : moduleIndex;
      const nextLessonIdxInModule =
        nextLessonIdx >= currentModule.lessons.length ? 0 : nextLessonIdx;

      const progressUpdate = {
        ...course.progress,
        completedLessons: updatedCompletedLessons,
        currentModuleIndex:
          nextModIdx < modules.length ? nextModIdx : moduleIndex,
        currentLessonIndex: nextLessonIdxInModule,
      };

      // Save to database directly and wait for it
      setIsNext(true);
      loadingBar.start();
      try {
        const result = await updateCourse(courseId, {
          progress: progressUpdate,
        });
        if (result.success) {
          // Also update local context
          updateCourseProgress(courseId, progressUpdate);

          // Award XP for completing the lesson
          await handleAwardXP(
            TOKEN_REWARDS.COMPLETE_LESSON * 10,
            `Completed lesson: ${lesson?.title || "Lesson"}`,
          );
        }
      } catch {
        // Error saving progress
      } finally {
        setIsNext(false);
        loadingBar.complete();
      }
    }

    navigateToNextLesson();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
          <p>Generating personalized lesson content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <Button
            variant="secondary"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            <ChevronLeft size={18} />
            <span className={styles.backText}>Back</span>
            <span className={styles.backTextFull}>to Course</span>
          </Button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <LevelUpNotification
        notification={levelUpNotification}
        onClose={() => setLevelUpNotification(null)}
      />

      <div className={styles.header}>
        <Button
          variant="secondary"
          onClick={() => navigate(`/courses/${courseId}`)}
        >
          <ChevronLeft size={18} />
          <span className={styles.backText}>Back</span>
          <span className={styles.backTextFull}>to Course</span>
        </Button>
      </div>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="secondary" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {!showAssessment ? (
        <div className={styles.lessonContent}>
          <LessonContent lesson={lesson} />

          <div className={styles.lessonActions}>
            {isChooseYourPath ? (
              // Choose Your Path lesson - mark complete then proceed to onboarding
              <Button
                variant="primary"
                onClick={async () => {
                  setIsChoosing(true);
                  // Mark lesson as complete first
                  const completedLessons =
                    course.progress?.completedLessons || [];

                  if (!completedLessons.includes(lessonId)) {
                    const updatedCompletedLessons = [
                      ...completedLessons,
                      lessonId,
                    ];
                    const progressUpdate = {
                      ...course.progress,
                      completedLessons: updatedCompletedLessons,
                      currentModuleIndex: moduleIndex,
                      currentLessonIndex: lessonIndex,
                    };

                    try {
                      const result = await updateCourse(courseId, {
                        progress: progressUpdate,
                      });
                      if (result.success) {
                        updateCourseProgress(courseId, progressUpdate);
                        await handleAwardXP(
                          TOKEN_REWARDS.COMPLETE_LESSON * 10,
                          `Completed lesson: ${lesson?.title || "Lesson"}`,
                        );
                      }
                    } catch {
                      // Error saving progress
                    } finally {
                      setIsChoosing(false);
                    }
                    // Navigate to onboarding
                    navigate("/onboarding", { state: { fromFoundation: true } });
                  } else{
                    navigate('/dashboard')
                  }

                }}
                disabled={isChoosing}
                className={styles.choosePathButton}
              >
                Choose Your Learning Path
              </Button>
            ) : !assessment ? (
              // No assessment required - show navigation buttons
              <div className={styles.completedActions}>
                {canGoBack() && (
                  <Button
                    variant="secondary"
                    onClick={navigateToPreviousLesson}
                  >
                    <ChevronLeft size={18} />
                    <span className={styles.navText}>Prev</span>
                    <span className={styles.navTextFull}>Lesson</span>
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={handleNextLesson}
                  disabled={isNext}
                >
                  <span className={styles.navText}>Next</span>
                  <span className={styles.navTextFull}> Lesson</span>
                  <ChevronRight size={18} />
                </Button>
              </div>
            ) : review?.passed ? (
              // Assessment already passed - show navigation and review buttons
              <div className={styles.completedActions}>
                {canGoBack() && (
                  <Button
                    variant="secondary"
                    onClick={navigateToPreviousLesson}
                  >
                    <ChevronLeft size={18} />
                    <span className={styles.navText}>Prev</span>
                    <span className={styles.navTextFull}>Lesson</span>
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setShowAssessment(true)}
                >
                  <Eye size={18} />
                  <span className={styles.buttonText}>View Feedback</span>
                </Button>
                <Button variant="primary" onClick={handleNextLesson}>
                  <span className={styles.navText}>Next</span>
                  <span className={styles.navTextFull}> Lesson</span>
                  <ChevronRight size={18} />
                </Button>
              </div>
            ) : (
              // Assessment not taken or not passed - show assessment CTA
              <Button variant="primary" onClick={() => setShowAssessment(true)}>
                Continue to Assessment
              </Button>
            )}
          </div>
        </div>
      ) : showAssessment && assessment ? (
        !review ? (
          <AssessmentView
            assessment={assessment}
            submission={submission}
            setSubmission={setSubmission}
            onSubmit={handleSubmitAssessment}
            onBack={() => setShowAssessment(false)}
            submitting={submitting}
          />
        ) : (
          <ReviewView
            review={review}
            onClose={() => setShowAssessment(false)}
            onNext={handleNextLesson}
            onRetry={() => {
              setReview(null);
              setSubmission({});
            }}
            onReviewLesson={() => {
              setReview(null);
              setSubmission({});
              setShowAssessment(false);
            }}
          />
        )
      ) : showAssessment && !assessment ? (
        <div className={styles.container}>
          <div className={styles.loadingContainer}>
            <LoadingSpinner />
            <p>Loading assessment...</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AILessonViewer;
