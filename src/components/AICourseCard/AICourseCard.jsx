import Card from "../Card/Card";
import Button from "../Button/Button";
import courseDefaultImage from "../../assets/course-default.svg";
import styles from "./AICourseCard.module.css";

const AICourseCard = ({
  course,
  isEnrolled = false,
  onAction,
  actionLabel,
  showProgress = false,
  progress = 0,
}) => {
  const handleClick = () => {
    if (onAction) {
      onAction(course.id);
    }
  };

  // Calculate progress if not provided
  const displayProgress = showProgress ? progress : 0;

  return (
    <Card className={styles.courseCard} onClick={handleClick}>
      <div className={styles.courseImage}>
        <img src={courseDefaultImage} alt={course.title} />
        <span
          className={`${styles.difficulty} ${styles[course.difficulty?.toLowerCase() || "beginner"]}`}
        >
          {course.difficulty || "Beginner"}
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

      {showProgress && (
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span>Progress</span>
            <span>{displayProgress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      )}

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
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        className={styles.actionButton}
      >
        {actionLabel || (isEnrolled ? "Continue Learning" : "Enroll Now")}
      </Button>
    </Card>
  );
};

export default AICourseCard;
