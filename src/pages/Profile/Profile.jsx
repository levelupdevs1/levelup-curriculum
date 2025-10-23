import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { useCourse } from "../../hooks/useCourse";
import { getUserSubmissions } from "../../services/courseService";
import {
  User,
  Mail,
  Calendar,
  Wallet,
  Copy,
  BookOpen,
  Coins,
  CheckCircle,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import styles from "./Profile.module.css";

const Profile = () => {
  const { user, profile } = useUser();
  const { courses } = useCourse();
  const navigate = useNavigate();
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  // Fetch user submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (user?.id) {
        const { success, submissions: userSubmissions } =
          await getUserSubmissions(user.id);
        if (success) {
          setSubmissions(userSubmissions);
        }
      }
    };
    fetchSubmissions();
  }, [user]);

  // Get enrolled courses
  const enrolledCourses = courses.filter((course) => course.isEnrolled);

  // Mock wallet address (will be replaced with real Hedera wallet)
  const walletAddress =
    profile?.wallet_address || "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";

  // Mock token transaction history (will be fetched from token_claims table)
  const tokenTransactions = [
    {
      id: "1",
      description: "Completed Level 1",
      tokens: 10,
      date: "2025-10-20",
      status: "claimed",
    },
    {
      id: "2",
      description: "Completed Web Development Basics",
      tokens: 50,
      date: "2025-10-18",
      status: "claimed",
    },
    {
      id: "3",
      description: "First Lesson Bonus",
      tokens: 5,
      date: "2025-10-15",
      status: "claimed",
    },
  ];

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  // Helper function to get lesson title from assignment_id
  const getLessonTitle = (courseId, assignmentId) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course || !course.modules) return null;

    for (const module of course.modules) {
      if (module.lessons) {
        const lesson = module.lessons.find((l) => l.id === assignmentId);
        if (lesson) {
          return {
            lessonTitle: lesson.title,
            moduleTitle: module.title,
          };
        }
      }
    }
    return null;
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
                {profile?.full_name || "User"}
              </h2>
              <p className={styles.profileUsername}>
                @{profile?.username || user?.email?.split("@")[0]}
              </p>
            </div>
            <div className={styles.profileActions}>
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
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
                  profile?.created_at || Date.now()
                ).toLocaleDateString()}
              </span>
            </div>
            <div className={styles.detailItem}>
              <Wallet size={16} />
              <span className={styles.walletAddress}>
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
              <button
                className={styles.copyButton}
                onClick={handleCopyWallet}
                title="Copy wallet address"
              >
                {copiedWallet ? (
                  <CheckCircle size={16} className={styles.copied} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          </div>
        </Card>

        {/* My Courses Section */}
        <Card className={styles.coursesCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.sectionTitle}>My Courses</h3>
            <span className={styles.courseCount}>
              {enrolledCourses.length}{" "}
              {enrolledCourses.length === 1 ? "Course" : "Courses"}
            </span>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className={styles.emptyState}>
              <BookOpen size={48} className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                You haven't enrolled in any courses yet
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/courses")}
              >
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className={styles.coursesList}>
              {enrolledCourses.map((course) => (
                <div key={course.id} className={styles.courseItem}>
                  <div className={styles.courseInfo}>
                    <h4 className={styles.courseTitle}>{course.title}</h4>
                    <p className={styles.courseLevel}>{course.level}</p>
                  </div>
                  <div className={styles.courseProgress}>
                    <ProgressBar progress={course.progress || 0} />
                    <span className={styles.progressText}>
                      {course.progress || 0}% Complete
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<ArrowRight size={16} />}
                    onClick={() => handleViewCourse(course.id)}
                  >
                    Continue
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Submission History */}
        <Card className={styles.submissionsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.sectionTitle}>Submission History</h3>
            <FileText size={20} className={styles.submissionsIcon} />
          </div>

          {submissions.length === 0 ? (
            <div className={styles.emptyState}>
              <FileText size={48} className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                No submissions yet. Complete assignments to see them here!
              </p>
            </div>
          ) : (
            <div className={styles.submissionsList}>
              {submissions.map((submission) => {
                const lessonInfo = getLessonTitle(
                  submission.course_id,
                  submission.assignment_id
                );
                return (
                  <div key={submission.id} className={styles.submissionItem}>
                    <div className={styles.submissionInfo}>
                      <div className={styles.submissionIcon}>
                        {submission.status === "approved" ? (
                          <CheckCircle2 size={20} className={styles.approved} />
                        ) : submission.status === "rejected" ? (
                          <XCircle size={20} className={styles.rejected} />
                        ) : (
                          <Clock size={20} className={styles.pending} />
                        )}
                      </div>
                      <div className={styles.submissionDetails}>
                        <p className={styles.submissionCourse}>
                          {submission.courses?.title || "Unknown Course"}
                        </p>
                        {lessonInfo && (
                          <button
                            className={styles.submissionLesson}
                            onClick={() =>
                              navigate(
                                `/courses/${submission.course_id}/lessons/${submission.assignment_id}`
                              )
                            }
                          >
                            {lessonInfo.moduleTitle} • {lessonInfo.lessonTitle}
                          </button>
                        )}
                        <p className={styles.submissionDate}>
                          Submitted on{" "}
                          {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className={styles.submissionMeta}>
                      <span
                        className={`${styles.submissionStatus} ${
                          styles[submission.status]
                        }`}
                      >
                        {submission.status === "pending"
                          ? "Pending Review"
                          : submission.status === "approved"
                          ? "Approved"
                          : submission.status === "rejected"
                          ? "Needs Work"
                          : submission.status}
                      </span>
                      {submission.points_earned > 0 && (
                        <span className={styles.submissionPoints}>
                          +{submission.points_earned} pts
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Token Transaction History */}
        <Card className={styles.tokensCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.sectionTitle}>Token History</h3>
            <Coins size={20} className={styles.tokensIcon} />
          </div>

          <div className={styles.tokensList}>
            {tokenTransactions.map((transaction) => (
              <div key={transaction.id} className={styles.tokenItem}>
                <div className={styles.tokenInfo}>
                  <div className={styles.tokenIcon}>
                    <Coins size={20} />
                  </div>
                  <div className={styles.tokenDetails}>
                    <p className={styles.tokenDescription}>
                      {transaction.description}
                    </p>
                    <p className={styles.tokenDate}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={styles.tokenAmount}>
                  <span className={styles.tokenValue}>
                    +{transaction.tokens}
                  </span>
                  <span className={styles.tokenStatus}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Account Settings */}
        <Card className={styles.settingsCard}>
          <h3 className={styles.sectionTitle}>Account Settings</h3>
          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingTitle}>Email Notifications</h4>
                <p className={styles.settingDescription}>
                  Receive updates about your courses and achievements
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingTitle}>Privacy Settings</h4>
                <p className={styles.settingDescription}>
                  Control who can see your progress and achievements
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4 className={styles.settingTitle}>Wallet Management</h4>
                <p className={styles.settingDescription}>
                  Connect or disconnect your Hedera wallet
                </p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
