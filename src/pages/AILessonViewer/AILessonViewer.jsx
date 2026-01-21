import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import { useAIToken } from "../../hooks/useAIToken";
import { useUser } from "../../hooks/useUser";
import {
  generateLessonContent,
  generateAssessment,
  reviewSubmissionBatch,
  AI_TOKEN_COSTS,
} from "../../services/aiServiceReal";
import { updateCourse } from "../../services/courseDataService";
import { awardXP, TOKEN_REWARDS } from "../../services/platformTokenService";
import { logResourceValidation } from "../../utils/resourceValidation";
import { isChooseYourPathLesson } from "../../services/foundationCourseService";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import ReactMarkdown from "react-markdown";
import styles from "./AILessonViewer.module.css";

const AILessonViewer = () => {
  const { courseId, lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getCourseById, updateCourseProgress } = useCourseGeneration();
  const { useTokens, tokensRemaining } = useAIToken();
  const { user, refreshProfile } = useUser();

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [levelUpNotification, setLevelUpNotification] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [submission, setSubmission] = useState({});
  const [review, setReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isChooseYourPath, setIsChooseYourPath] = useState(false);
  const hasGeneratedRef = useRef(false);

  const { moduleIndex, lessonIndex } = location.state || {
    moduleIndex: 0,
    lessonIndex: 0,
  };

  useEffect(() => {
    // Reset state when lesson changes
    hasGeneratedRef.current = false;
    setReview(null);
    setSubmission({});
    setShowAssessment(false);
    setError(null);

    // Prevent double execution in React StrictMode
    if (hasGeneratedRef.current) {
      console.log("⏭️ useEffect skipped - already processed");
      return;
    }

    const enrolledCourse = getCourseById(courseId);
    if (!enrolledCourse) {
      navigate("/course-catalog");
      return;
    }

    setCourse(enrolledCourse);
    loadLesson(enrolledCourse);
  }, [courseId, lessonId]);

  const loadLesson = async (enrolledCourse) => {
    // Mark as processing immediately to prevent race conditions
    if (hasGeneratedRef.current) {
      console.log("⏭️ loadLesson skipped - already processing");
      return;
    }
    hasGeneratedRef.current = true;

    console.log("📖 loadLesson called", {
      courseId: enrolledCourse.id,
      lessonId,
      moduleIndex,
      lessonIndex,
    });

    // Check if structure exists
    if (!enrolledCourse.structure && !enrolledCourse.modules) {
      console.error("No structure found in enrolledCourse");
      setError(
        "Course structure not generated. Please go back to the course page.",
      );
      return;
    }

    // Use structure from modules field or structure field
    const modules = enrolledCourse.modules || enrolledCourse.structure?.modules;

    if (!modules || !Array.isArray(modules) || modules.length === 0) {
      console.error("❌ No modules found in course");
      setError(
        "Course modules not found. Please regenerate the course structure.",
      );
      return;
    }

    const module = modules[moduleIndex];

    if (!module) {
      console.error("Module not found at index:", moduleIndex);
      setError("Module not found");
      return;
    }

    const lessonData = module.lessons?.[lessonIndex];
    if (!lessonData) {
      console.error("Lesson not found at index:", lessonIndex);
      setError("Lesson not found");
      return;
    }

    // Check if this is the "Choose Your Path" lesson
    const isPathLesson = isChooseYourPathLesson(lessonData);
    setIsChooseYourPath(isPathLesson);
    if (isPathLesson) {
      console.log("🎯 This is the Choose Your Path lesson");
    }

    // Check if lesson content already exists in database
    if (lessonData.content) {
      console.log("✅ Loading existing lesson content from database");
      setLesson(lessonData.content);

      // Load assessment if it exists (some lessons don't have assessments)
      if (lessonData.assessment) {
        setAssessment(lessonData.assessment);
      }

      // Load existing review if available
      if (lessonData.review) {
        console.log("✅ Found existing review:", lessonData.review);
        setReview(lessonData.review);
      }

      setLoading(false);
      return;
    }

    console.log("🔨 No existing content found, generating new content...");

    const lessonTitle = lessonData.title;
    const lessonDescription = lessonData.description || "";
    console.log("🔨 Generating content for:", lessonTitle);

    // Token check disabled for development
    // const contentCost = AI_TOKEN_COSTS.GENERATE_LESSON_CONTENT;
    // const assessmentCost = AI_TOKEN_COSTS.GENERATE_ASSESSMENT;
    // if (!canUseTokens(contentCost + assessmentCost)) {
    //   setError("Insufficient AI tokens");
    //   return;
    // }

    setLoading(true);
    setError(null);

    try {
      // Generate lesson content with real AI
      console.log("🤖 Generating lesson content with Gemini...");
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
        console.log(
          `🤖 Generating ${assessmentType} assessment with Gemini...`,
        );
        assessmentResult = await generateAssessment(
          lessonTitle,
          contentResult.content,
          assessmentType,
        );

        if (!assessmentResult.success) {
          console.warn(
            "⚠️ Assessment generation failed, continuing without assessment",
          );
          // Don't fail the entire lesson, just skip assessment
        } else {
          tokensUsed += assessmentResult.tokensUsed;
        }
      } else {
        console.log("ℹ️ This lesson does not require an assessment");
      }

      // Update tokens used
      useTokens(tokensUsed, "generate_lesson", {
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

      console.log("✅ Lesson content generated and saved to database");
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
      console.error("❌ Error generating lesson:", err);
      setError(err.message || "An error occurred while generating the lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssessment = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Normalize questions to have IDs if missing
      const normalizedQuestions = assessment.questions.map((q, idx) => ({
        ...q,
        id: q.id || `q${idx + 1}`,
      }));

      console.log("🤖 Batch reviewing all questions with Gemini...");
      const result = await reviewSubmissionBatch(
        normalizedQuestions,
        submission,
      );

      console.log("📥 Review result received:", result);

      if (result.success) {
        useTokens(result.tokensUsed, "review_submission", { lessonId });

        // Transform Gemini response into UI-compatible format
        const review = result.review;
        const aggregatedReview = {
          passed: review.passed || false,
          score: review.overallScore || 0,
          passingScore: assessment.passingScore || 70,
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

        console.log("📊 Aggregated review:", {
          passed: aggregatedReview.passed,
          score: aggregatedReview.score,
          passingScore: aggregatedReview.passingScore,
        });

        setReview(aggregatedReview);

        // Save review to database
        try {
          console.log("💾 Saving review to database...");

          // Get fresh course data from context
          const freshCourse = getCourseById(courseId);
          const courseModules =
            freshCourse?.structure?.modules || freshCourse?.modules;

          if (!freshCourse || !courseModules) {
            console.error("❌ Course structure not found!", {
              freshCourse,
              hasStructure: !!freshCourse?.structure,
              hasModules: !!freshCourse?.modules,
            });
            throw new Error("Course structure is missing");
          }

          console.log(
            "📦 Using course modules:",
            courseModules.length,
            "modules",
          );
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

          const dbResult = await updateCourse(courseId, {
            modules: updatedModules,
          });
          console.log("✅ Review saved to database:", dbResult);
        } catch (dbErr) {
          console.error("⚠️ Failed to save review to database:", dbErr);
        }

        if (aggregatedReview.passed) {
          console.log("🎉 Assessment PASSED! Updating progress...");

          // Award XP for passing assessment
          const isPerfectScore = aggregatedReview.score === 100;
          const xpAmount = isPerfectScore
            ? TOKEN_REWARDS.PERFECT_SCORE * 10 // 250 XP for perfect
            : TOKEN_REWARDS.PASS_ASSESSMENT * 10; // 100 XP for pass

          // We'll call handleAwardXP after defining it - for now just log
          if (user?.id) {
            awardXP(
              user.id,
              xpAmount,
              isPerfectScore
                ? "Perfect score on assessment"
                : "Passed assessment",
            )
              .then((result) => {
                if (result?.success && result?.leveledUp) {
                  setLevelUpNotification({
                    newLevel: result.currentLevel,
                    tokenReward: result.tokenReward,
                  });
                  setTimeout(() => setLevelUpNotification(null), 5000);
                }
                if (refreshProfile) refreshProfile();
              })
              .catch((err) => console.error("Failed to award XP:", err));
          }

          // Get fresh course data again for progress calculation
          const freshCourse = getCourseById(courseId);
          const progressModules =
            freshCourse?.structure?.modules || freshCourse?.modules;

          if (!freshCourse || !progressModules) {
            console.error("❌ Cannot find course for progress update");
            return;
          }

          const completedLessons = [
            ...(freshCourse.progress?.completedLessons || []),
            lessonId,
          ];

          console.log("📝 Completed lessons:", completedLessons);

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

          console.log("📈 Updating progress:", progressUpdate);
          updateCourseProgress(courseId, progressUpdate);
          console.log("✅ Progress updated!");
        } else {
          console.log(
            "❌ Assessment NOT PASSED. Score:",
            aggregatedReview.score,
            "Required:",
            aggregatedReview.passingScore,
          );
        }
      } else {
        console.error("❌ Review failed:", result.error);
        setError(result.error || "Failed to review submission");
      }
    } catch (err) {
      console.error("❌ Error submitting assessment:", err);
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to award XP and handle level up notifications
  const handleAwardXP = async (xpAmount, reason) => {
    if (!user?.id) return;

    try {
      const result = await awardXP(user.id, xpAmount, reason);
      if (result.success) {
        console.log(`🎯 Awarded ${xpAmount} XP for: ${reason}`);

        // Show level up notification
        if (result.leveledUp) {
          setLevelUpNotification({
            newLevel: result.currentLevel,
            tokenReward: result.tokenReward,
          });

          // Auto-hide after 5 seconds
          setTimeout(() => setLevelUpNotification(null), 5000);
        }

        // Refresh user profile to update UI
        if (refreshProfile) {
          refreshProfile();
        }
      }
    } catch (err) {
      console.error("Failed to award XP:", err);
    }
  };

  const handleNextLesson = async () => {
    const modules = course.structure?.modules || course.modules;
    const currentModule = modules[moduleIndex];

    // Mark current lesson as complete if not already
    const completedLessons = course.progress?.completedLessons || [];
    if (!completedLessons.includes(lessonId)) {
      const updatedCompletedLessons = [...completedLessons, lessonId];

      const nextLessonIdx = lessonIndex + 1;
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

      console.log(
        "📈 Marking lesson complete and updating progress:",
        progressUpdate,
      );

      // Save to database directly and wait for it
      try {
        const result = await updateCourse(courseId, {
          progress: progressUpdate,
        });
        if (result.success) {
          console.log("✅ Progress saved to database");
          // Also update local context
          updateCourseProgress(courseId, progressUpdate);

          // Award XP for completing the lesson
          await handleAwardXP(
            TOKEN_REWARDS.COMPLETE_LESSON * 10,
            `Completed lesson: ${lesson?.title || "Lesson"}`,
          );
        } else {
          console.error("❌ Failed to save progress:", result.error);
        }
      } catch (err) {
        console.error("❌ Error saving progress:", err);
      }
    }

    // Navigate to next lesson
    const nextLessonIndex = lessonIndex + 1;
    if (nextLessonIndex < currentModule.lessons.length) {
      const nextLesson = currentModule.lessons[nextLessonIndex];
      navigate(`/courses/${courseId}/lessons/${nextLesson.id}`, {
        state: { moduleIndex, lessonIndex: nextLessonIndex },
      });
    } else {
      const nextModuleIndex = moduleIndex + 1;
      if (nextModuleIndex < modules.length) {
        const nextModule = modules[nextModuleIndex];
        const nextLesson = nextModule.lessons[0];
        navigate(`/courses/${courseId}/lessons/${nextLesson.id}`, {
          state: { moduleIndex: nextModuleIndex, lessonIndex: 0 },
        });
      } else {
        navigate(`/courses/${courseId}`);
      }
    }
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
            Back to Course
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
      {/* Level Up Notification */}
      {levelUpNotification && (
        <div className={styles.levelUpNotification}>
          <div className={styles.levelUpContent}>
            <span className={styles.levelUpIcon}>🎉</span>
            <div className={styles.levelUpText}>
              <h3>Level Up!</h3>
              <p>You reached Level {levelUpNotification.newLevel}!</p>
              {levelUpNotification.tokenReward > 0 && (
                <p className={styles.tokenReward}>
                  +{levelUpNotification.tokenReward} tokens earned!
                </p>
              )}
            </div>
            <button
              className={styles.levelUpClose}
              onClick={() => setLevelUpNotification(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <Button
          variant="secondary"
          onClick={() => navigate(`/courses/${courseId}`)}
        >
          Back to Course
        </Button>
        <div className={styles.tokenDisplay}>
          <span className={styles.tokenLabel}>AI Tokens:</span>
          <span className={styles.tokenValue}>{tokensRemaining}</span>
        </div>
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
          <Card className={styles.lessonCard}>
            <h1>{lesson.title}</h1>

            {/* Render objectives if available */}
            {lesson.objectives?.length > 0 && (
              <div className={styles.objectives}>
                <h3>Learning Objectives</h3>
                <ul>
                  {lesson.objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Render markdown content */}
            {lesson.content && (
              <div className={styles.markdownContent}>
                <ReactMarkdown>{lesson.content}</ReactMarkdown>
              </div>
            )}

            {/* Render key takeaways */}
            {lesson.keyTakeaways?.length > 0 && (
              <div className={styles.takeaways}>
                <h3>Key Takeaways</h3>
                <ul>
                  {lesson.keyTakeaways.map((takeaway, index) => (
                    <li key={index}>{takeaway}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Render external resources */}
            {lesson.externalResources?.length > 0 && (
              <div className={styles.resources}>
                <h3>Additional Resources</h3>
                <ul>
                  {lesson.externalResources.map((resource, index) => (
                    <li key={index}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {resource.title}
                      </a>
                      {resource.description && (
                        <p className={styles.resourceDescription}>
                          {resource.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <div className={styles.lessonActions}>
            {isChooseYourPath ? (
              // Choose Your Path lesson - mark complete then proceed to onboarding
              <Button
                variant="primary"
                onClick={async () => {
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
                    } catch (err) {
                      console.error("Error saving progress:", err);
                    }
                  }

                  // Navigate to onboarding
                  navigate("/onboarding", { state: { fromFoundation: true } });
                }}
                className={styles.choosePathButton}
              >
                🚀 Choose Your Learning Path
              </Button>
            ) : !assessment ? (
              // No assessment required - show next lesson button
              <Button variant="primary" onClick={handleNextLesson}>
                Next Lesson →
              </Button>
            ) : review?.passed ? (
              // Assessment already passed - show navigation and review buttons
              <div className={styles.completedActions}>
                <Button
                  variant="secondary"
                  onClick={() => setShowAssessment(true)}
                >
                  View Feedback
                </Button>
                <Button variant="primary" onClick={handleNextLesson}>
                  Next Lesson →
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
        <div className={styles.assessmentContent}>
          <Card className={styles.assessmentCard}>
            <h1>{assessment.title}</h1>
            <p className={styles.description}>{assessment.description}</p>
            <p className={styles.passingScore}>
              Passing Score: {assessment.passingScore}% (
              {assessment.totalPoints} points)
            </p>

            {!review ? (
              <>
                <div className={styles.questions}>
                  {assessment.questions?.map((question, questionIndex) => {
                    // Generate ID if missing
                    const questionId = question.id || `q${questionIndex + 1}`;
                    return (
                      <div key={questionId} className={styles.question}>
                        <h3>{question.question}</h3>

                        {question.type === "multiple_choice" && (
                          <div className={styles.options}>
                            {question.options.map((option, index) => (
                              <label key={index} className={styles.option}>
                                <input
                                  type="radio"
                                  name={questionId}
                                  value={index}
                                  onChange={(e) =>
                                    setSubmission((prev) => ({
                                      ...prev,
                                      [questionId]: parseInt(e.target.value),
                                    }))
                                  }
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === "coding" && (
                          <textarea
                            className={styles.codeInput}
                            placeholder={question.starterCode}
                            rows={10}
                            onChange={(e) =>
                              setSubmission((prev) => ({
                                ...prev,
                                [questionId]: e.target.value,
                              }))
                            }
                          />
                        )}

                        {question.type === "code_challenge" && (
                          <div className={styles.codeChallenge}>
                            <textarea
                              className={styles.codeInput}
                              placeholder={
                                question.starterCode ||
                                "Write your code here..."
                              }
                              rows={8}
                              onChange={(e) =>
                                setSubmission((prev) => ({
                                  ...prev,
                                  [questionId]: e.target.value,
                                }))
                              }
                            />
                            {question.hints && question.hints.length > 0 && (
                              <details className={styles.hints}>
                                <summary>💡 Hints</summary>
                                <ul>
                                  {question.hints.map((hint, idx) => (
                                    <li key={idx}>{hint}</li>
                                  ))}
                                </ul>
                              </details>
                            )}
                          </div>
                        )}

                        {question.type === "project" && (
                          <div className={styles.projectSubmission}>
                            <div className={styles.projectRequirements}>
                              <h4>Required Features:</h4>
                              <ul>
                                {question.requirements?.map((req, idx) => (
                                  <li key={idx}>{req}</li>
                                ))}
                              </ul>
                            </div>
                            {question.stretchGoals &&
                              question.stretchGoals.length > 0 && (
                                <div className={styles.stretchGoals}>
                                  <h4>Stretch Goals (Optional):</h4>
                                  <ul>
                                    {question.stretchGoals.map((goal, idx) => (
                                      <li key={idx}>{goal}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            <input
                              type="url"
                              className={styles.urlInput}
                              placeholder="GitHub Repository URL (required)"
                              onChange={(e) =>
                                setSubmission((prev) => ({
                                  ...prev,
                                  [questionId]: {
                                    ...prev[questionId],
                                    githubUrl: e.target.value,
                                  },
                                }))
                              }
                            />
                            <input
                              type="url"
                              className={styles.urlInput}
                              placeholder="Live Demo URL (optional)"
                              onChange={(e) =>
                                setSubmission((prev) => ({
                                  ...prev,
                                  [questionId]: {
                                    ...prev[questionId],
                                    liveUrl: e.target.value,
                                  },
                                }))
                              }
                            />
                            <textarea
                              className={styles.textInput}
                              placeholder="Project description (what you built, challenges faced, what you learned)"
                              rows={4}
                              onChange={(e) =>
                                setSubmission((prev) => ({
                                  ...prev,
                                  [questionId]: {
                                    ...prev[questionId],
                                    description: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                        )}

                        {question.type === "short_answer" && (
                          <textarea
                            className={styles.textInput}
                            placeholder="Type your answer here..."
                            rows={6}
                            onChange={(e) =>
                              setSubmission((prev) => ({
                                ...prev,
                                [questionId]: e.target.value,
                              }))
                            }
                          />
                        )}

                        <div className={styles.points}>
                          Points: {question.points}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.assessmentActions}>
                  <Button
                    variant="secondary"
                    onClick={() => setShowAssessment(false)}
                  >
                    Back to Lesson
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmitAssessment}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Assessment"}
                  </Button>
                </div>
              </>
            ) : (
              <div className={styles.review}>
                <div
                  className={`${styles.reviewHeader} ${review.passed ? styles.passed : styles.failed}`}
                >
                  <div className={styles.resultIndicator}>
                    <h2>{review.passed ? "Passed" : "Did Not Pass"}</h2>
                    <div className={styles.score}>{review.score}%</div>
                  </div>
                  <div className={styles.scoreInfo}>
                    Passing score: {review.passingScore}%
                  </div>
                </div>

                <div className={styles.feedback}>
                  {review.feedback?.overall && (
                    <div className={styles.overallSection}>
                      <h3>Assessment Results</h3>
                      <p>{review.feedback.overall}</p>
                    </div>
                  )}

                  {review.details?.length > 0 && (
                    <div className={styles.detailsSection}>
                      <h3>Question Breakdown</h3>
                      {review.details.map((detail, index) => (
                        <div
                          key={index}
                          className={`${styles.questionResult} ${
                            detail.isCorrect ? styles.correct : styles.incorrect
                          }`}
                        >
                          <div className={styles.questionHeader}>
                            <span className={styles.questionNum}>
                              Q{index + 1}
                            </span>
                            <span className={styles.questionText}>
                              {detail.questionText}
                            </span>
                            <span className={styles.score}>
                              {detail.score}%
                            </span>
                          </div>
                          <p className={styles.feedback}>{detail.feedback}</p>
                          {detail.suggestions?.length > 0 && (
                            <div className={styles.suggestionsList}>
                              {detail.suggestions.map((suggestion, sIdx) => (
                                <div key={sIdx} className={styles.suggestion}>
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.reviewActions}>
                  {review.passed ? (
                    <Button variant="primary" onClick={handleNextLesson}>
                      Next Lesson
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setReview(null);
                          setSubmission({});
                          setShowAssessment(false);
                        }}
                      >
                        Review Lesson
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setReview(null);
                          setSubmission({});
                        }}
                      >
                        Retry Assessment
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
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
