import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock } from "lucide-react";
import Card from "../Card/Card";
import Button from "../Button/Button";
import ProgressBar from "../ProgressBar/ProgressBar";
import styles from "./ContinueLearningSection.module.css";

const ContinueLearningSection = ({ enrolledCourses, onContinueCourse }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Continue Learning</h2>
        <Link to="/courses" className={styles.sectionLink}>
          View All
        </Link>
      </div>

      {enrolledCourses.length > 0 ? (
        <div className={styles.courseList}>
          {enrolledCourses.map((course) => (
            <Card
              key={course.id}
              className={styles.courseCard}
              clickable
              onClick={() => onContinueCourse(course.id)}
            >
              <div className={styles.courseContent}>
                <div className={styles.courseInfo}>
                  <h3 className={styles.courseTitle}>{course.title}</h3>
                  <p className={styles.courseDescription}>
                    {course.description}
                  </p>
                  <div className={styles.courseMeta}>
                    <span className={styles.courseLevel}>{course.level}</span>
                    <span className={styles.courseDuration}>
                      <Clock size={16} />
                      Self-paced
                    </span>
                  </div>
                </div>
                <div className={styles.courseProgress}>
                  <ProgressBar
                    progress={course.progress}
                    max={100}
                    height="8px"
                    showLabel={false}
                    color={course.progress === 100 ? "#10b981" : "#ffd700"}
                  />
                  <span className={styles.progressText}>
                    {course.progress}% Complete
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <BookOpen size={48} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No courses enrolled yet</h3>
            <p className={styles.emptyDescription}>
              Start your learning journey by enrolling in a course
            </p>
            <Button as={Link} to="/courses">
              Browse Courses
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ContinueLearningSection;
