import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import { useAIToken } from "../../hooks/useAIToken";
import {
  generateCourseStructure,
  AI_TOKEN_COSTS,
} from "../../services/aiServiceReal";
import { updateCourse } from "../../services/courseDataService";
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
  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    const enrolledCourse = getCourseById(courseId);
    if (!enrolledCourse) {
      navigate("/course-catalog");
      return;
    }

    console.log("📚 Course data from DB:", {
      title: enrolledCourse.title,
      status: enrolledCourse.status,
      hasModules: !!enrolledCourse.modules,
      modulesIsArray: Array.isArray(enrolledCourse.modules),
      modulesLength: enrolledCourse.modules?.length,
      progress: enrolledCourse.progress,
      completedLessons: enrolledCourse.progress?.completedLessons,
    });

    // Structure should already exist from enrollment - just load it
    const hasValidStructure =
      enrolledCourse.modules &&
      Array.isArray(enrolledCourse.modules) &&
      enrolledCourse.modules.length > 0;

    if (hasValidStructure) {
      console.log(
        "✅ Loading structure with",
        enrolledCourse.modules.length,
        "modules",
      );
      setCourse({
        ...enrolledCourse,
        structure: { modules: enrolledCourse.modules },
      });
      setCurrentCourse(enrolledCourse);
    } else {
      // This shouldn't happen if enrollment worked correctly
      console.error("❌ No modules found after enrollment. This is a bug.");
      setError("Course structure missing. Please try enrolling again.");
      setCourse(enrolledCourse);
    }
  }, [courseId, getCourseById]);

  const generateStructure = async (enrolledCourse) => {
    const tokenCost = AI_TOKEN_COSTS.GENERATE_COURSE_STRUCTURE;

    // DISABLED: No token restrictions
    // if (!canUseTokens(tokenCost)) {
    //   setError("Insufficient AI tokens to generate course structure");
    //   return;
    // }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔨 Generating structure for: ${enrolledCourse.title}`);
      const result = await generateCourseStructure(
        enrolledCourse.title,
        enrolledCourse.description,
        enrolledCourse.modules_count || enrolledCourse.modulesCount || 6,
      );

      if (result.success) {
        // Update tokens
        useTokens(result.tokensUsed, "generate_structure", {
          courseId: enrolledCourse.id,
        });

        // Check if actual module count matches expected
        const expectedCount =
          enrolledCourse.modules_count || enrolledCourse.modulesCount;
        const actualCount = result.actualModuleCount || result.modules.length;

        if (actualCount !== expectedCount) {
          console.warn(
            `⚠️ Course specified ${expectedCount} modules, AI generated ${actualCount}. ` +
              `Updating course metadata to match reality.`,
          );
        }

        // Save structure to database (both modules and metadata)
        await updateCourse(enrolledCourse.id, {
          modules: result.modules,
          modules_count: actualCount,
        });

        const updatedCourse = {
          ...enrolledCourse,
          modules: result.modules,
          modules_count: actualCount,
          structure: { modules: result.modules },
        };
        setCourse(updatedCourse);

        console.log(
          `✅ Generated ${actualCount} modules successfully and saved to database`,
        );
      } else {
        setError(result.error || "Failed to generate course structure");
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
    const modules = course?.structure?.modules || course?.modules || [];
    if (modules.length === 0) return 0;

    // Calculate total lessons from all modules
    const totalLessons = modules.reduce(
      (sum, module) => sum + (module.lessons?.length || 0),
      0,
    );
    const completedLessons = course?.progress?.completedLessons?.length || 0;

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
            <Card key={moduleIndex} className={styles.moduleCard}>
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
                      key={lessonIndex}
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
