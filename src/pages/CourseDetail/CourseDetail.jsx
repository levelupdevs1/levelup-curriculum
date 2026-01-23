import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
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

// Helper to get all lessons from modules
const getAllLessons = (course) => {
  if (!course?.modules) return [];
  return course.modules.flatMap((module) => module.lessons || []);
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const { generatedCourses, enrolledCourses, enrollInCourse } =
    useCourseGeneration();
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState({});
  const [enrolling, setEnrolling] = useState(false);

  // Try to find from enrolled courses first (has latest progress), then generated
  const rawCourse =
    enrolledCourses?.find((c) => c.id === courseId) ||
    generatedCourses?.find((c) => c.id === courseId);

  // Process the course to add isCompleted and isLocked based on progress
  const course = useMemo(() => {
    if (!rawCourse) return null;

    const completedLessons = rawCourse.progress?.completedLessons || [];
    const modules = rawCourse.modules || rawCourse.structure?.modules || [];

    if (!modules.length) return rawCourse;

    // Flatten all lessons to determine locking logic
    const allLessons = modules.flatMap((m) => m.lessons || []);

    // Process modules to add isCompleted and isLocked to each lesson
    const processedModules = modules.map((module) => ({
      ...module,
      lessons: (module.lessons || []).map((lesson) => {
        const lessonIndex = allLessons.findIndex((l) => l.id === lesson.id);
        const isCompleted = completedLessons.includes(lesson.id);

        // First lesson is always unlocked, others require previous lesson completed
        let isLocked = false;
        if (lessonIndex > 0) {
          const previousLesson = allLessons[lessonIndex - 1];
          isLocked = !completedLessons.includes(previousLesson.id);
        }

        return { ...lesson, isCompleted, isLocked };
      }),
    }));

    // Calculate overall progress percentage
    const totalLessons = allLessons.length;
    const completedCount = completedLessons.length;
    const progressPercentage =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      ...rawCourse,
      modules: processedModules,
      progress: progressPercentage,
    };
  }, [rawCourse]);

  if (!course) {
    return (
      <div className={styles.container}>
        <LoadingSpinner size="lg" message="Loading course..." />
      </div>
    );
  }

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const result = await enrollInCourse(courseId);

      if (result.success && result.data?.modules?.[0]?.lessons?.[0]) {
        navigate(
          `/courses/${courseId}/lessons/${result.data.modules[0].lessons[0].id}`,
        );
      }
    } catch {
      // Error handled silently
    } finally {
      setEnrolling(false);
    }
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
      (lesson) => !lesson.isCompleted && !lesson.isLocked,
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
              disabled={enrolling}
            >
              {enrolling
                ? "Enrolling..."
                : course.isEnrolled
                  ? "Continue Course"
                  : "Enroll Now"}
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
