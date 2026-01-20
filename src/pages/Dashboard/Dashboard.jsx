import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import { Trophy, Coins, Flame, Star } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./Dashboard.module.css";
import StatCard from "../../components/StatCard/StatCard";

const Dashboard = () => {
  const { user, profile } = useUser();
  const { generatedCourses } = useCourseGeneration();
  const navigate = useNavigate();

  const enrolledCourses = generatedCourses || [];
  // const recentCourses = courses.slice(0, 3);

  // const handleEnrollCourse = (courseId) => {
  //   enrollInCourse(courseId);
  //   navigate(`/courses/${courseId}`);
  // };

  const handleContinueLearning = (courseId) => {
    // Navigate to AI course details page
    navigate(`/courses/${courseId}`);
  };

  // const handleContinueCourse = (courseId) => {
  //   const course = courses.find((c) => c.id === courseId);
  //   if (course && course.modules) {
  //     // Find the first incomplete, unlocked lesson across all modules
  //     let nextLesson = null;
  //     for (const module of course.modules) {
  //       if (module.lessons) {
  //         nextLesson = module.lessons.find(
  //           (lesson) => !lesson.isCompleted && !lesson.isLocked
  //         );
  //         if (nextLesson) break;
  //       }
  //     }

  //     if (nextLesson) {
  //       navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
  //     } else {
  //       // If all lessons are completed, go to course detail
  //       navigate(`/courses/${courseId}`);
  //     }
  //   }
  // };

  const stats = [
    {
      title: "Current Level",
      value: profile?.current_level || 0,
      icon: Trophy,
      color: "#ffd700",
    },
    {
      title: "Total Points",
      value: profile?.total_points || 0,
      icon: Star,
      color: "#4a154b",
    },
    {
      title: "Enrolled Courses",
      value: enrolledCourses.length,
      icon: Coins,
      color: "#ffd700",
    },
    {
      title: "Completed Courses",
      value: enrolledCourses.filter((c) => c.progress === 100).length,
      icon: Flame,
      color: "#ef4444",
    },
  ];

  return (
    <div className={styles.dashboard}>
      {!profile ? (
        <LoadingSpinner size="lg" message="Loading your dashboard..." />
      ) : (
        <>
          {/* Welcome Section */}
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              Welcome back, {profile?.full_name || user?.email}!{" "}
            </h1>
            <p className={styles.welcomeSubtitle}>
              Ready to continue your learning journey?
            </p>
          </div>

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

          {/* Main Content Grid */}
          <div className={styles.contentGrid}>
            {enrolledCourses.length > 0 ? (
              <div className={styles.coursesSection}>
                <h2>Your Courses</h2>
                <div className={styles.coursesList}>
                  {enrolledCourses.map((course) => (
                    <div
                      key={course.id}
                      className={styles.courseCard}
                      onClick={() => handleContinueLearning(course.id)}
                    >
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>
                      <div className={styles.courseMetadata}>
                        <span>{course.difficulty || "Beginner"}</span>
                        <span>{course.estimated_hours || 0}h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>
                  No enrolled courses yet. Generate your personalized
                  curriculum!
                </p>
                <button
                  className={styles.generateBtn}
                  onClick={() => navigate("/course-catalog")}
                >
                  Generate Courses
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
