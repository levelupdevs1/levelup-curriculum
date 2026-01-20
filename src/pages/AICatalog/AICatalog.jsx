import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import { useAIToken } from "../../hooks/useAIToken";
import {
  generateCourseCatalog,
  AI_TOKEN_COSTS,
  isAIConfigured,
  getActiveProvider,
} from "../../services/aiServiceReal";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import courseDefaultImage from "../../assets/course-default.svg";
import styles from "./AICatalog.module.css";

const AICatalog = () => {
  const navigate = useNavigate();
  const {
    userProfile,
    generatedCourses,
    enrolledCourses,
    addGeneratedCourses,
    enrollInCourse,
  } = useCourseGeneration();
  const {
    canUseTokens,
    useTokens: consumeTokens,
    tokensRemaining,
  } = useAIToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasGeneratedRef = useRef(false);

  const generateCourses = async () => {
    if (!isAIConfigured()) {
      setError(
        "Gemini API not configured. Please add VITE_GEMINI_API_KEY to .env.local (free tier available at ai.google.dev)",
      );
      return;
    }

    const tokenCost = AI_TOKEN_COSTS.GENERATE_COURSE_CATALOG;

    // DISABLED: No token restrictions
    // if (!canUseTokens(tokenCost)) {
    //   setError("Insufficient AI tokens to generate courses");
    //   return;
    // }

    setLoading(true);
    setError(null);

    try {
      console.log(`🤖 Generating courses with ${getActiveProvider()}...`);
      const result = await generateCourseCatalog(userProfile);

      if (result.success) {
        console.log(
          `✅ Generated ${result.courses.length} courses using ${result.tokensUsed} tokens`,
        );

        const tokenResult = await consumeTokens(
          result.tokensUsed,
          "generate_course_catalog",
          { courses: result.courses.length, model: result.model },
        );

        if (tokenResult.success) {
          const addResult = await addGeneratedCourses(result.courses);
          if (!addResult.success) {
            setError(addResult.error || "Failed to save courses");
          }
        } else {
          setError(tokenResult.error);
        }
      } else {
        setError(result.error || "Failed to generate courses");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userProfile) {
      navigate("/onboarding");
      return;
    }

    // Prevent duplicate calls in React StrictMode (development)
    if (generatedCourses.length === 0 && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      generateCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnroll = async (courseId) => {
    const isEnrolled = enrolledCourses.some((c) => c.id === courseId);
    if (isEnrolled) {
      navigate(`/courses/${courseId}`);
      return;
    }

    const result = await enrollInCourse(courseId);
    if (result.success) {
      navigate(`/courses/${courseId}`);
    } else {
      setError(result.error);
    }
  };

  if (!userProfile) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
          <p>Generating personalized courses for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Your Personalized Courses</h1>
          <p>AI-generated learning paths tailored to your goals</p>
        </div>
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

      {generatedCourses.length === 0 && !loading && (
        <div className={styles.empty}>
          <p>No courses generated yet</p>
          <Button variant="primary" onClick={generateCourses}>
            Generate Courses
          </Button>
        </div>
      )}

      <div className={styles.coursesGrid}>
        {generatedCourses.map((course) => {
          const isEnrolled = enrolledCourses.some((c) => c.id === course.id);

          return (
            <Card key={course.id} className={styles.courseCard}>
              <div className={styles.courseImage}>
                <img src={courseDefaultImage} alt="Course" />
                <span
                  className={`${styles.difficulty} ${styles[course.difficulty.toLowerCase()]}`}
                >
                  {course.difficulty}
                </span>
              </div>

              <div className={styles.courseContent}>
                <h3 className={styles.courseTitle}>{course.title}</h3>
                <p className={styles.description}>{course.description}</p>
              </div>

              <div className={styles.courseStats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Modules</span>
                  <span className={styles.statValue}>
                    {course.modules_count}
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Est. Hours</span>
                  <span className={styles.statValue}>
                    {course.estimated_hours}h
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Tokens</span>
                  <span className={styles.statValue}>
                    {course.potential_tokens}
                  </span>
                </div>
              </div>

              <div className={styles.tags}>
                {Array.isArray(course.tags) &&
                  course.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                {Array.isArray(course.tags) && course.tags.length > 2 && (
                  <span
                    className={styles.tagOverflow}
                    title={course.tags.slice(2).join(", ")}
                  >
                    +{course.tags.length - 2}
                  </span>
                )}
              </div>

              <Button
                variant={isEnrolled ? "secondary" : "primary"}
                onClick={() => handleEnroll(course.id)}
                className={styles.enrollButton}
              >
                {isEnrolled ? "Continue Learning" : "Enroll Now"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AICatalog;
