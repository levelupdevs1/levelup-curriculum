import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import { ChevronLeft, CheckCircle2, Circle, Lock } from "lucide-react";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import styles from "./AICourseDetail.module.css";

const AICourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { getCourseById, setCurrentCourse } = useCourseGeneration();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const enrolledCourse = getCourseById(courseId);
    if (!enrolledCourse) {
      navigate("/course-catalog");
      return;
    }

    // Structure should already exist from enrollment - just load it
    const hasValidStructure =
      enrolledCourse.modules &&
      Array.isArray(
        enrolledCourse.modules?.modules || enrolledCourse.modules,
      ) &&
      (enrolledCourse.modules?.modules || enrolledCourse.modules).length > 0;

    if (hasValidStructure) {
      setCourse({
        ...enrolledCourse,
        structure: {
          modules: enrolledCourse.modules?.modules || enrolledCourse.modules,
        },
      });
      setCurrentCourse(enrolledCourse);
    } else {
      // This shouldn't happen if enrollment worked correctly
      setError("Course structure missing. Please try enrolling again.");
      setCourse(enrolledCourse);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, getCourseById]);

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
    const modules =
      course?.modules?.modules ||
      course?.modules ||
      course?.structure?.modules ||
      [];
    if (modules.length === 0) return 0;

    // Calculate total lessons from all modules
    const totalLessons = modules.reduce(
      (sum, module) => sum + (module.lessons?.length || 0),
      0,
    );
    const completedLessons = course?.progress?.completedLessons?.length || 0;

    const result =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    return result > 100 ? 100 : result;
  };

  if (!course) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="secondary" onClick={() => navigate("/course-catalog")}>
          <ChevronLeft size={18} />
          <span className={styles.backText}>Back</span>
          <span className={styles.backTextFull}>to Catalog</span>
        </Button>
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
                      }`}
                      onClick={
                        unlocked
                          ? () =>
                              startLesson(moduleIndex, lessonIndex, lesson.id)
                          : undefined
                      }
                      style={{ cursor: unlocked ? "pointer" : "not-allowed" }}
                    >
                      <div className={styles.lessonInfo}>
                        <h3>{lesson.title}</h3>
                        <div className={styles.lessonMeta}>
                          <span>{lesson.estimatedMinutes} min</span>
                          <span>{lesson.type}</span>
                        </div>
                      </div>

                      <div className={styles.lessonStatus}>
                        {!unlocked ? (
                          <Lock size={24} className={styles.lockedIcon} />
                        ) : completed ? (
                          <CheckCircle2
                            size={24}
                            className={styles.completedIcon}
                          />
                        ) : (
                          <Circle size={24} className={styles.activeIcon} />
                        )}
                      </div>
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
