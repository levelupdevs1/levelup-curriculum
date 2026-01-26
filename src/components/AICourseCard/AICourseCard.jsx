import Card from "../Card/Card";
import Button from "../Button/Button";
import { CheckCircle2 } from "lucide-react";
import courseDefaultImage from "../../assets/course-default.svg";
import styles from "./AICourseCard.module.css";
import { useState } from "react";

const AICourseCard = ({
  course,
  isEnrolled = false,
  onAction,
  actionLabel,
  showProgress = false,
  progress = 0,
}) => {
  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    if (onAction) {
      setLoading(true);
      onAction(course.id);
    }
    setLoading(false);
  };

  // Calculate progress if not provided
  const displayProgress = showProgress ? progress : 0;
  const isCompleted = showProgress && displayProgress >= 100;
  const cappedProgress = Math.min(displayProgress, 100); // Cap at 100 for circle calculation

  return (
    <Card className={styles.courseCard} onClick={handleClick}>
      <div className={styles.courseImage}>
        <img src={courseDefaultImage} alt={course.title} />
        <span
          className={`${styles.difficulty} ${styles[course.difficulty?.toLowerCase() || "beginner"]}`}
        >
          {course.difficulty || "Beginner"}
        </span>
        {showProgress && (
          <div
            className={`${styles.circularProgress} ${isCompleted ? styles.completed : ""}`}
          >
            {isCompleted ? (
              <>
                <div className={styles.completedCircle}>
                  <CheckCircle2 size={24} strokeWidth={2.5} />
                </div>
              </>
            ) : (
              <>
                <svg className={styles.progressRing} width="60" height="60">
                  <circle
                    className={styles.progressRingCircle}
                    stroke="#e5e7eb"
                    strokeWidth="4"
                    fill="transparent"
                    r="26"
                    cx="30"
                    cy="30"
                  />
                  <circle
                    className={styles.progressRingProgress}
                    stroke="#ffd700"
                    strokeWidth="4"
                    fill="transparent"
                    r="26"
                    cx="30"
                    cy="30"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 26}`,
                      strokeDashoffset: `${2 * Math.PI * 26 * (1 - cappedProgress / 100)}`,
                    }}
                  />
                </svg>
                <span className={styles.progressText}>{displayProgress}%</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className={styles.courseContent}>
        <h3 className={styles.courseTitle}>{course.title}</h3>
        <p className={styles.description}>{course.description}</p>
      </div>

      <div className={styles.courseStats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Modules</span>
          <span className={styles.statValue}>
            {course.modules_count || course.modules?.length || 0}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Est. Hours</span>
          <span className={styles.statValue}>
            {course.estimated_hours || 0}h
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Tokens</span>
          <span className={styles.statValue}>
            {course.potential_tokens || 0}
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
        variant={isCompleted ? "success" : isEnrolled ? "secondary" : "primary"}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        className={styles.actionButton}
        disabled={loading}
      >
        {actionLabel ||
          (isCompleted
            ? "Review Course"
            : isEnrolled
              ? "Continue Learning"
              : loading ? "Loading..." : "Enroll Now")}
      </Button>
    </Card>
  );
};

export default AICourseCard;
