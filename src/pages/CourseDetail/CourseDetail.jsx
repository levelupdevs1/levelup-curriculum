import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourse } from "../../hooks/useCourse";
import {
  Clock,
  Users,
  Star,
  BookOpen,
  Play,
  ArrowLeft,
  CheckCircle,
  Lock,
  Code,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import ModuleList from "../../components/ModuleList/ModuleList";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./CourseDetail.module.css";

const CourseDetail = () => {
  const { courseId } = useParams();
  const { getCourseById, enrollInCourse, getAllLessons } = useCourse();
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState({});

  const course = getCourseById(courseId);

  if (!course) {
    return (
      <div className={styles.container}>
        <LoadingSpinner size="lg" message="Loading course..." />
      </div>
    );
  }

  const handleEnroll = () => {
    enrollInCourse(courseId);
  };

  const handleStartLesson = (lessonId) => {
    navigate(`/courses/${courseId}/lessons/${lessonId}`);
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleContinueCourse = () => {
    // Find the first incomplete, unlocked lesson
    const allLessons = getAllLessons(course);
    const nextLesson = allLessons.find(
      (lesson) => !lesson.isCompleted && !lesson.isLocked
    );

    if (nextLesson) {
      navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
    } else {
      // If all lessons are completed, go to the last lesson
      const lastLesson = allLessons[allLessons.length - 1];
      navigate(`/courses/${courseId}/lessons/${lastLesson.id}`);
    }
  };

  const courseProgress = course.progress || 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.courseInfo}>
          <h1 className={styles.title}>{course.title}</h1>
          <p className={styles.description}>{course.description}</p>

          {course.isEnrolled && (
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span>Course Progress</span>
                <span>{courseProgress}% Complete</span>
              </div>
              <ProgressBar
                progress={courseProgress}
                max={100}
                height="12px"
                showLabel={false}
                color={courseProgress === 100 ? "#10b981" : "#ffd700"}
              />
            </div>
          )}

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <Clock size={20} />
              <span>Self-paced</span>
            </div>
            <div className={styles.metaItem}>
              <BookOpen size={20} />
              <span>{getAllLessons(course).length} lessons</span>
            </div>
            <div className={styles.metaItem}>
              <Users size={20} />
              <span>{course.enrolled_count || 0} students</span>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              variant="primary"
              size="lg"
              onClick={course.isEnrolled ? handleContinueCourse : handleEnroll}
              icon={<Play size={20} />}
            >
              {course.isEnrolled ? "Continue Course" : "Enroll Now"}
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.lessons}>
          <h2 className={styles.sectionTitle}>Course Modules</h2>
          <ModuleList
            modules={course.modules}
            expandedModules={expandedModules}
            onToggleModule={toggleModule}
            onLessonClick={handleStartLesson}
            showProgress={true}
            className={styles.moduleList}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
