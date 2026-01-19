import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import { useAIToken } from "../../hooks/useAIToken";
import {
  mockGenerateCourseStructure,
  AI_TOKEN_COSTS,
} from "../../services/aiService";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import styles from "./AICourseDetail.module.css";

const AICourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { getCourseById, userProfile, setCurrentCourse } =
    useCourseGeneration();
  const { canUseTokens, useTokens, tokensRemaining } = useAIToken();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const enrolledCourse = getCourseById(courseId);
    if (!enrolledCourse) {
      navigate("/course-catalog");
      return;
    }

    setCourse(enrolledCourse);
    setCurrentCourse(enrolledCourse);

    if (!enrolledCourse.structure) {
      generateStructure(enrolledCourse);
    }
  }, [courseId]);

  const generateStructure = async (enrolledCourse) => {
    const tokenCost = AI_TOKEN_COSTS.GENERATE_COURSE_STRUCTURE;

    if (!canUseTokens(tokenCost)) {
      setError("Insufficient AI tokens to generate course structure");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await mockGenerateCourseStructure(
        enrolledCourse.title,
        userProfile,
      );

      if (result.success) {
        useTokens(result.tokensUsed);
        const updatedCourse = {
          ...enrolledCourse,
          structure: result.structure,
        };
        setCourse(updatedCourse);

        const stored = localStorage.getItem("courseGenerationData");
        const data = stored ? JSON.parse(stored) : {};
        const enrolledCourses = data.enrolledCourses || [];
        const updated = enrolledCourses.map((c) =>
          c.id === courseId ? updatedCourse : c,
        );
        localStorage.setItem(
          "courseGenerationData",
          JSON.stringify({
            ...data,
            enrolledCourses: updated,
          }),
        );
      } else {
        setError("Failed to generate course structure");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const startLesson = (moduleIndex, lessonIndex, lessonId) => {
    navigate(`/courses/${courseId}/lessons/${lessonId}`, {
      state: { moduleIndex, lessonIndex },
    });
  };

  const isLessonUnlocked = (moduleIndex, lessonIndex) => {
    if (!course?.progress) return moduleIndex === 0 && lessonIndex === 0;

    const { currentModuleIndex, currentLessonIndex } = course.progress;

    if (moduleIndex < currentModuleIndex) return true;
    if (moduleIndex === currentModuleIndex && lessonIndex <= currentLessonIndex)
      return true;

    return false;
  };

  const getCompletionPercentage = () => {
    if (!course?.structure || !course?.progress) return 0;

    const totalLessons = course.structure.totalLessons || 0;
    const completedLessons = course.progress.completedLessons?.length || 0;

    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
          <p>Generating course structure...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="secondary" onClick={() => navigate("/course-catalog")}>
          Back to Catalog
        </Button>
        <div className={styles.tokenDisplay}>
          <span className={styles.tokenLabel}>AI Tokens:</span>
          <span className={styles.tokenValue}>{tokensRemaining}</span>
        </div>
      </div>

      <Card className={styles.courseHeader}>
        <div className={styles.courseTitle}>
          <h1>{course.title}</h1>
          <span
            className={`${styles.difficulty} ${styles[course.difficulty?.toLowerCase()]}`}
          >
            {course.difficulty}
          </span>
        </div>
        <p className={styles.description}>{course.description}</p>

        {course.structure && (
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span>Course Progress</span>
              <span>{Math.round(getCompletionPercentage())}%</span>
            </div>
            <ProgressBar
              progress={getCompletionPercentage()}
              max={100}
              height="8px"
            />
          </div>
        )}
      </Card>

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="secondary" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {course.structure ? (
        <div className={styles.modules}>
          {course.structure.modules.map((module, moduleIndex) => (
            <Card key={module.id} className={styles.moduleCard}>
              <div className={styles.moduleHeader}>
                <h2>{module.title}</h2>
                <p>{module.description}</p>
              </div>

              <div className={styles.lessons}>
                {module.lessons.map((lesson, lessonIndex) => {
                  const unlocked = isLessonUnlocked(moduleIndex, lessonIndex);
                  const completed = course.progress?.completedLessons?.includes(
                    lesson.id,
                  );

                  return (
                    <div
                      key={lesson.id}
                      className={`${styles.lessonItem} ${
                        !unlocked ? styles.locked : ""
                      } ${completed ? styles.completed : ""}`}
                    >
                      <div className={styles.lessonInfo}>
                        <h3>{lesson.title}</h3>
                        <div className={styles.lessonMeta}>
                          <span>{lesson.estimatedMinutes} min</span>
                          <span>{lesson.type}</span>
                        </div>
                      </div>

                      {unlocked ? (
                        <Button
                          variant={completed ? "secondary" : "primary"}
                          onClick={() =>
                            startLesson(moduleIndex, lessonIndex, lesson.id)
                          }
                        >
                          {completed ? "Review" : "Start"}
                        </Button>
                      ) : (
                        <div className={styles.lockedBadge}>Locked</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className={styles.emptyState}>
          <p>Course structure will be generated automatically</p>
        </Card>
      )}
    </div>
  );
};

export default AICourseDetail;
