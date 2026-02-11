import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import {
  User,
  Mail,
  Calendar,
  BookOpen,
  Target,
  Clock,
  Star,
  Trophy,
  ArrowRight,
  Zap,
  GraduationCap,
  Settings,
  LogOut,
} from "lucide-react";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import styles from "./Profile.module.css";

const Profile = () => {
  const { user, profile, logout, hasCompletedOnboarding } = useUser();
  const {
    generatedCourses,
    enrolledCourses: contextEnrolledCourses,
    userProfile,
  } = useCourseGeneration();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Get enrolled courses
  const enrolledCourses =
    contextEnrolledCourses?.length > 0
      ? contextEnrolledCourses
      : (generatedCourses || []).filter((c) => c.status === "enrolled");

  // Calculate course progress
  const getCourseProgress = (course) => {
    if (!course) return 0;
    if (typeof course.progress === "number") return course.progress;
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

  // Get completed lessons count
  const getCompletedLessons = (course) => {
    if (course.progress?.completedLessons) {
      return course.progress.completedLessons.length;
    }
    return 0;
  };

  // Get total lessons count
  const getTotalLessons = (course) => {
    const modules = course.modules || course.structure?.modules || [];
    return modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  };

  // Stats calculations
  const totalLessonsCompleted = enrolledCourses.reduce(
    (sum, c) => sum + getCompletedLessons(c),
    0,
  );
  const completedCoursesCount = enrolledCourses.filter(
    (c) => getCourseProgress(c) === 100,
  ).length;

  // XP and Level from profile
  const totalXP = profile?.total_experience || 0;

  // AI Profile info
  const learningGoal =
    userProfile?.learning_goal || profile?.learning_goal || "Not set";
  const skillLevel =
    userProfile?.skill_level || profile?.skill_level || "Not set";
  const timeCommitment =
    userProfile?.time_commitment || profile?.time_commitment || "Not set";
  const learningStyle =
    userProfile?.learning_style || profile?.learning_style || "Not set";

  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle}>
          Manage your account and track your learning journey
        </p>
      </div>

      <div className={styles.content}>
        {/* Profile Info Card */}
        <Card className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              <User size={48} />
            </div>
            <div className={styles.profileInfo}>
              <h2 className={styles.profileName}>
                {profile?.full_name || user?.email?.split("@")[0] || "User"}
              </h2>
              <p className={styles.profileEmail}>{user?.email}</p>
            </div>
            <div className={styles.profileActions}>
              {hasCompletedOnboarding && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate("/onboarding", { state: { from: "/profile" } })
                  }
                >
                  Update Preferences
                </Button>
              )}
            </div>
          </div>

          <div className={styles.profileDetails}>
            <div className={styles.detailItem}>
              <Mail size={16} />
              <span>{user?.email}</span>
            </div>
            <div className={styles.detailItem}>
              <Calendar size={16} />
              <span>
                Joined{" "}
                {new Date(
                  user?.created_at || profile?.created_at || Date.now(),
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <Star size={24} className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {totalXP.toLocaleString()}
              </span>
              <span className={styles.statLabel}>Total XP</span>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <BookOpen size={24} className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{totalLessonsCompleted}</span>
              <span className={styles.statLabel}>Lessons Completed</span>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <GraduationCap size={24} className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{completedCoursesCount}</span>
              <span className={styles.statLabel}>Courses Completed</span>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <Zap size={24} className={styles.statIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{enrolledCourses.length}</span>
              <span className={styles.statLabel}>Enrolled Courses</span>
            </div>
          </Card>
        </div>

        {/* Tabbed Section */}
        <Card className={styles.tabbedCard}>
          {/* Tab Navigation */}
          <div className={styles.tabNav}>
            <button
              className={`${styles.tab} ${activeTab === "overview" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <Target size={16} />
              <span>Learning Profile</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === "courses" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("courses")}
            >
              <BookOpen size={16} />
              <span>My Courses</span>
              <span className={styles.tabBadge}>{enrolledCourses.length}</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === "settings" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {/* Learning Profile Tab */}
            {activeTab === "overview" && (
              <div className={styles.overviewSection}>
                {hasCompletedOnboarding ? (
                  <>
                    <div className={styles.preferencesList}>
                      <div className={styles.preferenceItem}>
                        <div className={styles.preferenceIcon}>
                          <Target size={20} />
                        </div>
                        <div className={styles.preferenceInfo}>
                          <span className={styles.preferenceLabel}>
                            Learning Goal
                          </span>
                          <span className={styles.preferenceValue}>
                            {learningGoal}
                          </span>
                        </div>
                      </div>
                      <div className={styles.preferenceItem}>
                        <div className={styles.preferenceIcon}>
                          <Zap size={20} />
                        </div>
                        <div className={styles.preferenceInfo}>
                          <span className={styles.preferenceLabel}>
                            Skill Level
                          </span>
                          <span className={styles.preferenceValue}>
                            {skillLevel}
                          </span>
                        </div>
                      </div>
                      <div className={styles.preferenceItem}>
                        <div className={styles.preferenceIcon}>
                          <Clock size={20} />
                        </div>
                        <div className={styles.preferenceInfo}>
                          <span className={styles.preferenceLabel}>
                            Time Commitment
                          </span>
                          <span className={styles.preferenceValue}>
                            {timeCommitment}
                          </span>
                        </div>
                      </div>
                      <div className={styles.preferenceItem}>
                        <div className={styles.preferenceIcon}>
                          <BookOpen size={20} />
                        </div>
                        <div className={styles.preferenceInfo}>
                          <span className={styles.preferenceLabel}>
                            Learning Style
                          </span>
                          <span className={styles.preferenceValue}>
                            {learningStyle}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.updatePreferences}>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          navigate("/onboarding", {
                            state: { from: "/profile" },
                          })
                        }
                      >
                        Update Learning Preferences
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <Target size={48} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>
                      Complete onboarding to set your learning preferences
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => navigate("/onboarding")}
                    >
                      Complete Onboarding
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* My Courses Tab */}
            {activeTab === "courses" && (
              <div className={styles.coursesSection}>
                {enrolledCourses.length === 0 ? (
                  <div className={styles.emptyState}>
                    <BookOpen size={48} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>
                      You haven't enrolled in any courses yet
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate("/course-catalog")}
                    >
                      Browse Courses
                    </Button>
                  </div>
                ) : (
                  <div className={styles.coursesList}>
                    {enrolledCourses.map((course) => {
                      const progress = getCourseProgress(course);
                      const completed = getCompletedLessons(course);
                      const total = getTotalLessons(course);

                      return (
                        <div key={course.id} className={styles.courseItem}>
                          <div className={styles.courseInfo}>
                            <h4 className={styles.courseTitle}>
                              {course.title}
                            </h4>
                            <p className={styles.courseLevel}>
                              {course.difficulty || course.level || "Beginner"}
                            </p>
                          </div>
                          <div className={styles.courseProgress}>
                            <ProgressBar
                              progress={progress}
                              max={100}
                              color={progress === 100 ? "#10b981" : "#ffd700"}
                            />
                            <span className={styles.progressText}>
                              {completed}/{total} lessons ({progress}%)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCourse(course.id)}
                          >
                            <ArrowRight size={16} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className={styles.settingsSection}>
                <div className={styles.settingsList}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h4 className={styles.settingTitle}>
                        Update Learning Preferences
                      </h4>
                      <p className={styles.settingDescription}>
                        Change your learning goal, skill level, or time
                        commitment
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate("/onboarding", { state: { from: "/profile" } })
                      }
                    >
                      Update
                    </Button>
                  </div>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h4 className={styles.settingTitle}>
                        Regenerate Courses
                      </h4>
                      <p className={styles.settingDescription}>
                        Get new Generated courses based on your preferences
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/course-catalog")}
                    >
                      Go to Catalog
                    </Button>
                  </div>
                  <div className={`${styles.settingItem} ${styles.dangerZone}`}>
                    <div className={styles.settingInfo}>
                      <h4 className={styles.settingTitle}>Sign Out</h4>
                      <p className={styles.settingDescription}>
                        Sign out of your account
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut size={16} />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
