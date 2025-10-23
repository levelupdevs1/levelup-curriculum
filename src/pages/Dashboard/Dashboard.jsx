import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { useCourse } from "../../hooks/useCourse";
import { Trophy, Coins, Flame, Star } from "lucide-react";
import ContinueLearningSection from "../../components/Dashboard/ContinueLearningSection";
import RecommendedCoursesSection from "../../components/Dashboard/RecommendedCoursesSection";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./Dashboard.module.css";
import StatCard from "../../components/StatCard/StatCard";

const Dashboard = () => {
  const { user, profile } = useUser();
  const { courses, _enrollInCourse } = useCourse();
  const navigate = useNavigate();

  const enrolledCourses = courses.filter((course) => course.isEnrolled);
  // const recentCourses = courses.slice(0, 3);

  // const handleEnrollCourse = (courseId) => {
  //   enrollInCourse(courseId);
  //   navigate(`/courses/${courseId}`);
  // };

  const handleContinueLearning = (courseId) => {
    // For enrolled courses, go to course details page
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
      value: courses.filter((c) => c.isCompleted).length,
      icon: Flame,
      color: "#ef4444",
    },
  ];

  return (
    <div className={styles.dashboard}>
      {!profile || !courses || courses.length === 0 ? (
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
            <ContinueLearningSection
              enrolledCourses={enrolledCourses}
              onContinueCourse={handleContinueLearning}
            />

            {/* <div className="recommend">
              <RecommendedCoursesSection
                recommendedCourses={recentCourses}
                onContinueCourse={handleContinueCourse}
                onEnrollCourse={handleEnrollCourse}
              />
            </div> */}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
