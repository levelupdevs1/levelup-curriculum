import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import { useAIToken } from "../../hooks/useAIToken";
import {
  mockGenerateCourseCatalog,
  AI_TOKEN_COSTS,
} from "../../services/aiService";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./AICatalog.module.css";

const AICatalog = () => {
  const navigate = useNavigate();
  const { userProfile, generatedCourses, addGeneratedCourses, enrollInCourse } =
    useCourseGeneration();
  const { canUseTokens, useTokens, tokensRemaining } = useAIToken();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userProfile) {
      navigate("/onboarding");
      return;
    }

    if (generatedCourses.length === 0) {
      generateCourses();
    }
  }, [userProfile]);

  const generateCourses = async () => {
    const tokenCost = AI_TOKEN_COSTS.GENERATE_COURSE_CATALOG;

    if (!canUseTokens(tokenCost)) {
      setError("Insufficient AI tokens to generate courses");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await mockGenerateCourseCatalog(userProfile);

      if (result.success) {
        useTokens(result.tokensUsed);
        addGeneratedCourses(result.courses);
      } else {
        setError("Failed to generate courses");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = (courseId) => {
    const result = enrollInCourse(courseId);
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
        {generatedCourses.map((course) => (
          <Card key={course.id} className={styles.courseCard}>
            <div className={styles.courseHeader}>
              <h3>{course.title}</h3>
              <span
                className={`${styles.difficulty} ${styles[course.difficulty.toLowerCase()]}`}
              >
                {course.difficulty}
              </span>
            </div>

            <p className={styles.description}>{course.description}</p>

            <div className={styles.courseStats}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Modules</span>
                <span className={styles.statValue}>{course.modulesCount}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Est. Hours</span>
                <span className={styles.statValue}>
                  {course.estimatedHours}h
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Tokens</span>
                <span className={styles.statValue}>
                  {course.potentialTokens}
                </span>
              </div>
            </div>

            <div className={styles.tags}>
              {course.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>

            <Button
              variant="primary"
              onClick={() => handleEnroll(course.id)}
              className={styles.enrollButton}
            >
              Enroll Now
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AICatalog;
