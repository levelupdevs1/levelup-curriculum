import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import { useAIToken } from "../../hooks/useAIToken";
import {
  mockGenerateLessonContent,
  mockGenerateAssessment,
  mockReviewSubmission,
  AI_TOKEN_COSTS,
} from "../../services/aiService";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./AILessonViewer.module.css";

const AILessonViewer = () => {
  const { courseId, lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getCourseById, updateCourseProgress } = useCourseGeneration();
  const { canUseTokens, useTokens, tokensRemaining } = useAIToken();

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [submission, setSubmission] = useState({});
  const [review, setReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { moduleIndex, lessonIndex } = location.state || {
    moduleIndex: 0,
    lessonIndex: 0,
  };

  useEffect(() => {
    const enrolledCourse = getCourseById(courseId);
    if (!enrolledCourse) {
      navigate("/course-catalog");
      return;
    }

    setCourse(enrolledCourse);
    loadLesson(enrolledCourse);
  }, [courseId, lessonId]);

  const loadLesson = async (enrolledCourse) => {
    console.log("loadLesson called", {
      enrolledCourse,
      lessonId,
      moduleIndex,
      lessonIndex,
    });

    // Check if structure exists
    if (!enrolledCourse.structure) {
      console.error("No structure found in enrolledCourse");
      setError("Course structure not generated. Please go back to the course page.");
      return;
    }

    console.log("Course structure:", enrolledCourse.structure);

    const stored = localStorage.getItem("lessonContent");
    const cachedLessons = stored ? JSON.parse(stored) : {};

    if (cachedLessons[lessonId]) {
      console.log("Loading cached lesson");
      setLesson(cachedLessons[lessonId].content);
      setAssessment(cachedLessons[lessonId].assessment);
      return;
    }

    const module = enrolledCourse.structure.modules?.[moduleIndex];
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

    const lessonTitle = lessonData.title;
    console.log("Lesson title:", lessonTitle);

    if (!lessonTitle) {
      setError("Lesson not found");
      return;
    }

    const contentCost = AI_TOKEN_COSTS.GENERATE_LESSON_CONTENT;
    const assessmentCost = AI_TOKEN_COSTS.GENERATE_ASSESSMENT;

    if (!canUseTokens(contentCost + assessmentCost)) {
      setError("Insufficient AI tokens");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Generating lesson content...");
      const storedProfile = localStorage.getItem("courseGenerationData");
      const profileData = storedProfile ? JSON.parse(storedProfile) : {};
      const userProfileData = profileData.userProfile || {
        learningGoal: "Web Development",
        skillLevel: "Intermediate",
      };

      const contentResult = await mockGenerateLessonContent(
        lessonTitle,
        { courseTitle: enrolledCourse.title },
        userProfileData,
      );

      console.log("Content result:", contentResult);

      if (!contentResult.success) {
        setError("Failed to generate lesson content");
        return;
      }

      const assessmentResult = await mockGenerateAssessment(
        lessonTitle,
        contentResult.content,
      );
      console.log("Assessment result:", assessmentResult);

      if (!assessmentResult.success) {
        setError("Failed to generate assessment");
        return;
      }

      useTokens(contentResult.tokensUsed + assessmentResult.tokensUsed);

      cachedLessons[lessonId] = {
        content: contentResult.content,
        assessment: assessmentResult.assessment,
      };
      localStorage.setItem("lessonContent", JSON.stringify(cachedLessons));

      setLesson(contentResult.content);
      setAssessment(assessmentResult.assessment);
      console.log("Lesson loaded successfully");
    } catch (err) {
      console.error("Error loading lesson:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssessment = async () => {
    if (!canUseTokens(AI_TOKEN_COSTS.REVIEW_SUBMISSION)) {
      setError("Insufficient AI tokens");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await mockReviewSubmission(
        { id: `sub_${Date.now()}`, answers: submission },
        assessment,
      );

      if (result.success) {
        useTokens(result.tokensUsed);
        setReview(result.review);

        if (result.review.passed) {
          const completedLessons = [
            ...(course.progress.completedLessons || []),
            lessonId,
          ];
          const totalLessons = course.structure.modules.reduce(
            (sum, m) => sum + m.lessons.length,
            0,
          );
          const nextLessonIndex = lessonIndex + 1;
          const nextModuleIndex =
            nextLessonIndex >=
            course.structure.modules[moduleIndex].lessons.length
              ? moduleIndex + 1
              : moduleIndex;
          const nextLessonIndexInModule =
            nextLessonIndex >=
            course.structure.modules[moduleIndex].lessons.length
              ? 0
              : nextLessonIndex;

          updateCourseProgress(courseId, {
            ...course.progress,
            completedLessons,
            currentModuleIndex:
              nextModuleIndex < course.structure.modules.length
                ? nextModuleIndex
                : moduleIndex,
            currentLessonIndex: nextLessonIndexInModule,
          });
        }
      } else {
        setError("Failed to review submission");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextLesson = () => {
    const nextLessonIndex = lessonIndex + 1;
    const currentModule = course.structure.modules[moduleIndex];

    if (nextLessonIndex < currentModule.lessons.length) {
      const nextLesson = currentModule.lessons[nextLessonIndex];
      navigate(`/courses/${courseId}/lessons/${nextLesson.id}`, {
        state: { moduleIndex, lessonIndex: nextLessonIndex },
      });
    } else {
      const nextModuleIndex = moduleIndex + 1;
      if (nextModuleIndex < course.structure.modules.length) {
        const nextModule = course.structure.modules[nextModuleIndex];
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
            <p className={styles.introduction}>{lesson.introduction}</p>

            {lesson.sections.map((section) => (
              <div key={section.id} className={styles.section}>
                <h2>{section.heading}</h2>
                {section.type === "code" ? (
                  <pre className={styles.codeBlock}>
                    <code>{section.content}</code>
                  </pre>
                ) : (
                  <p>{section.content}</p>
                )}
              </div>
            ))}

            {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
              <div className={styles.takeaways}>
                <h3>Key Takeaways</h3>
                <ul>
                  {lesson.keyTakeaways.map((takeaway, index) => (
                    <li key={index}>{takeaway}</li>
                  ))}
                </ul>
              </div>
            )}

            {lesson.resources && lesson.resources.length > 0 && (
              <div className={styles.resources}>
                <h3>Additional Resources</h3>
                <ul>
                  {lesson.resources.map((resource, index) => (
                    <li key={index}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {resource.title}
                      </a>
                      <span className={styles.resourceType}>
                        {resource.type}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <div className={styles.lessonActions}>
            <Button variant="primary" onClick={() => setShowAssessment(true)}>
              Continue to Assessment
            </Button>
          </div>
        </div>
      ) : (
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
                  {assessment.questions.map((question) => (
                    <div key={question.id} className={styles.question}>
                      <h3>{question.question}</h3>

                      {question.type === "multiple_choice" && (
                        <div className={styles.options}>
                          {question.options.map((option, index) => (
                            <label key={index} className={styles.option}>
                              <input
                                type="radio"
                                name={question.id}
                                value={index}
                                onChange={(e) =>
                                  setSubmission((prev) => ({
                                    ...prev,
                                    [question.id]: parseInt(e.target.value),
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
                              [question.id]: e.target.value,
                            }))
                          }
                        />
                      )}

                      {question.type === "short_answer" && (
                        <textarea
                          className={styles.textInput}
                          placeholder="Type your answer here..."
                          rows={6}
                          onChange={(e) =>
                            setSubmission((prev) => ({
                              ...prev,
                              [question.id]: e.target.value,
                            }))
                          }
                        />
                      )}

                      <div className={styles.points}>
                        Points: {question.points}
                      </div>
                    </div>
                  ))}
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
                  <h2>
                    {review.passed ? "Congratulations!" : "Keep Learning"}
                  </h2>
                  <div className={styles.score}>Score: {review.score}%</div>
                </div>

                <div className={styles.feedback}>
                  <h3>Overall Feedback</h3>
                  <p>{review.feedback.overall}</p>

                  <div className={styles.feedbackSection}>
                    <h4>Strengths</h4>
                    <ul>
                      {review.feedback.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.feedbackSection}>
                    <h4>Areas for Improvement</h4>
                    <ul>
                      {review.feedback.improvements.map(
                        (improvement, index) => (
                          <li key={index}>{improvement}</li>
                        ),
                      )}
                    </ul>
                  </div>
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
      )}
    </div>
  );
};

export default AILessonViewer;
