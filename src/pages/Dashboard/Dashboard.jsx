import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import {
  Trophy,
  BookOpen,
  Flame,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import AICourseCard from "../../components/AICourseCard/AICourseCard";
import styles from "./Dashboard.module.css";
import StatCard from "../../components/StatCard/StatCard";

const COURSES_PER_PAGE = 6;

const Dashboard = () => {
  const { user, profile, refreshProfile } = useUser();
  const { enrolledCourses: contextEnrolledCourses, generatedCourses, foundationCourse, foundationCompleted, loading: coursesLoading } =
    useCourseGeneration();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // Refresh profile on mount to get latest XP
  React.useEffect(() => {
    if (user && refreshProfile) {
      refreshProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Show all personalized courses on dashboard (not just enrolled)
  // Include foundation course if it exists and is not completed
  const allCourses = useMemo(() => {
    const aiCourses = generatedCourses || [];
    // Add foundation course at the beginning if not completed
    if (foundationCourse && !foundationCompleted) {
      return [foundationCourse, ...aiCourses];
    }
    return aiCourses;
  }, [generatedCourses, foundationCourse, foundationCompleted]);
  
  const enrolledCourses = useMemo(
    () => {
      const enrolled = contextEnrolledCourses?.length > 0
        ? contextEnrolledCourses
        : allCourses.filter((c) => c.status === "enrolled");
      // Include foundation course in enrolled if exists
      if (foundationCourse && !enrolled.find(c => c.id === foundationCourse.id)) {
        return [foundationCourse, ...enrolled];
      }
      return enrolled;
    },
    [contextEnrolledCourses, allCourses, foundationCourse],
  );

  // Pagination
  const totalPages = Math.ceil(allCourses.length / COURSES_PER_PAGE);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
    return allCourses.slice(startIndex, startIndex + COURSES_PER_PAGE);
  }, [allCourses, currentPage]);

  // Helper to calculate course progress percentage
  const getCourseProgress = (course) => {
    if (!course) return 0;

    // If progress is a number, use it directly
    if (typeof course.progress === "number") return course.progress;

    // If progress is an object with completedLessons
    if (course.progress?.completedLessons) {
      const completedCount = course.progress.completedLessons.length;
      const modules = course.modules || course.structure?.modules || [];
      const totalLessons = modules.reduce(
        (sum, m) => sum + (m.lessons?.length || 0),
        0,
      );
      return totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;
    }

    return 0;
  };

  // Helper to get completed lessons count
  const getCompletedLessons = (course) => {
    if (course.progress?.completedLessons) {
      return course.progress.completedLessons.length;
    }
    return 0;
  };

  const handleContinueLearning = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  // Calculate stats
  const totalLessonsCompleted = enrolledCourses.reduce(
    (sum, c) => sum + getCompletedLessons(c),
    0,
  );
  const completedCoursesCount = enrolledCourses.filter(
    (c) => getCourseProgress(c) === 100,
  ).length;

  // Calculate level progress - use total_experience (XP) from profile
  const currentLevel = profile?.current_level || 1;
  const totalXP = profile?.total_experience || profile?.total_points || 0;

  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - totalXP;
  const levelProgress = Math.min((xpInCurrentLevel / 100) * 100, 100);

  const stats = [
    {
      title: "Current Level",
      value: currentLevel,
      icon: Trophy,
      color: "#ffd700",
    },
    {
      title: "Total XP",
      value: totalXP.toLocaleString(),
      icon: Star,
      color: "#4a154b",
    },
    {
      title: "Lessons Completed",
      value: totalLessonsCompleted,
      icon: BookOpen,
      color: "#10b981",
    },
    {
      title: "Courses Completed",
      value: completedCoursesCount,
      icon: Flame,
      color: "#ef4444",
    },
  ];

  return (
    <div className={styles.dashboard}>
      {!profile || coursesLoading ? (
        <LoadingSpinner size="lg" message="Loading your dashboard..." />
      ) : (
        <>
          {/* Welcome Section */}
          <div className={styles.welcomeSection}>
            <div className={styles.welcomeContent}>
              <h1 className={styles.welcomeTitle}>
                Welcome back, {profile?.full_name || user?.email?.split("@")[0]}
                !
              </h1>
              <p className={styles.welcomeSubtitle}>
                Ready to continue your learning journey?
              </p>
            </div>
          </div>

          {/* Level Progress Card */}
          <Card className={styles.levelCard}>
            <div className={styles.levelHeader}>
              <div className={styles.levelInfo}>
                <Zap size={20} className={styles.levelIcon} />
                <span>Level {currentLevel} Progress</span>
              </div>
              <span className={styles.levelPoints}>
                {xpInCurrentLevel} / 100 XP
              </span>
            </div>
            <ProgressBar
              progress={levelProgress}
              max={100}
              height="10px"
              showLabel={false}
              color="#ffd700"
            />
            <p className={styles.levelHint}>
              Earn {xpNeededForNextLevel > 0 ? xpNeededForNextLevel : 0} more XP
              to reach Level {currentLevel + 1}
            </p>
          </Card>

          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Your Courses</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/course-catalog")}
              >
                Browse All
              </Button>
            </div>

            {allCourses.length > 0 ? (
              <>
                <div className={styles.courseGrid}>
                  {paginatedCourses.map((course) => {
                    const isEnrolled = enrolledCourses.some(
                      (c) => c.id === course.id,
                    );
                    const progress = isEnrolled ? getCourseProgress(course) : 0;

                    return (
                      <AICourseCard
                        key={course.id}
                        course={course}
                        isEnrolled={isEnrolled}
                        onAction={handleContinueLearning}
                        actionLabel={
                          isEnrolled ? "Continue Learning" : "Start Course"
                        }
                        showProgress={isEnrolled}
                        progress={progress}
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageButton}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={20} />
                      Previous
                    </button>

                    <div className={styles.pageNumbers}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            className={`${styles.pageNumber} ${currentPage === page ? styles.activePage : ""}`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      className={styles.pageButton}
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Card className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <BookOpen size={48} />
                </div>
                <h3>No courses yet</h3>
                <p>Generate your personalized learning path to get started!</p>
                <Button
                  variant="primary"
                  onClick={() => navigate("/course-catalog")}
                >
                  Generate Courses
                </Button>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
