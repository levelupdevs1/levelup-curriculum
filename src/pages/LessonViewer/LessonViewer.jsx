import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import { isSupabaseConfigured } from "../../services/authService";
import {
  Play,
  CheckCircle,
  Lock,
  Code,
  FileText,
  Upload,
  Eye,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
} from "lucide-react";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import SubmissionForm from "../../components/SubmissionForm/SubmissionForm";
import ReviewRequestForm from "../../components/ReviewRequestForm/ReviewRequestForm";
import ModuleList from "../../components/ModuleList/ModuleList";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import LessonCard from "../../components/LessonCard/LessonCard";
import ReviewRequestsModal from "../../components/ReviewRequestsModal/ReviewRequestsModal";
import SubmissionsModal from "../../components/SubmissionsModal/SubmissionsModal";
import Modal from "../../components/Modal/Modal";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { recordLessonCompletion } from "../../services/courseService";
import { addPointsToUser } from "../../services/progressService";
import { submitAssignment as submitAssignmentToBackend } from "../../services/courseService";
import { getSubmissionsForLesson as getSubmissionsFromBackend } from "../../services/courseService";
import { fetchPeerReviews } from "../../services/courseService";
import styles from "./LessonViewer.module.css";
// import courses from "../../courses.json";

const LessonViewer = () => {
  const { courseId, lessonId } = useParams();
  const { user, profile, refreshProfile } = useUser();
  const { generatedCourses, foundationCourse } = useCourseGeneration();
  const navigate = useNavigate();

  // Check if this is the foundation course
  const isFoundationCourse = courseId === "foundation";

  // Find course and lesson from AI-generated courses OR foundation course
  const course = isFoundationCourse 
    ? foundationCourse 
    : generatedCourses?.find((c) => c.id === courseId);
  const lesson = course?.modules
    ?.flatMap((m) => m.lessons)
    .find((l) => l.id === lessonId);

  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showReviewRequestForm, setShowReviewRequestForm] = useState(false);
  const [showReviewRequests, setShowReviewRequests] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [isCompletingLesson, setIsCompletingLesson] = useState(false);
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [_isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);

  // Fetch submissions from backend
  React.useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoadingSubmissions(true);
      try {
        const { success, submissions: backendSubmissions } =
          await getSubmissionsFromBackend(courseId, lessonId);
        if (success) {
          // Transform backend data and fetch reviews for each submission
          const transformedSubmissions = await Promise.all(
            backendSubmissions.map(async (submission) => {
              const parsedContent =
                typeof submission.submission_content === "string"
                  ? JSON.parse(submission.submission_content)
                  : submission.submission_content;

              // Fetch peer reviews from backend
              const { success: reviewSuccess, reviews: fetchedReviews } =
                await fetchPeerReviews(submission.id);
              const reviews = reviewSuccess ? fetchedReviews : [];

              return {
                id: submission.id,
                userId: submission.user_id,
                userName: submission.user_name || "Anonymous",
                submittedAt: submission.created_at,
                status: submission.status || "submitted",
                url: parsedContent?.url || null,
                githubUrl: parsedContent?.githubUrl || null,
                notes: parsedContent?.notes || null,
                files: parsedContent?.files || [],
                peerReviews: reviews,
              };
            }),
          );
          setSubmissions(transformedSubmissions);
        }
      } catch {
        // Error fetching submissions
      } finally {
        setIsLoadingSubmissions(false);
      }
    };

    fetchSubmissions();
  }, [courseId, lessonId]);

  const handleMarkComplete = async () => {
    if (!lesson.isCompleted && user && profile) {
      setIsCompletingLesson(true);
      try {
        const points = 10; // 10 points per lesson
        // Find module ID by searching through course modules
        let moduleId = null;
        if (course && course.modules) {
          for (const module of course.modules) {
            if (
              module.lessons &&
              module.lessons.some((l) => l.id === lessonId)
            ) {
              moduleId = module.id;
              break;
            }
          }
        }

        if (moduleId) {
          // Record completion in database
          const completionResult = await recordLessonCompletion(
            user.id,
            courseId,
            moduleId,
            lessonId,
            points,
          );

          if (!completionResult.success) {
            addNotification(
              "Failed to complete lesson. Please try again.",
              "error",
            );
            return;
          }

          // Add points to user
          const pointsResult = await addPointsToUser(user.id, points);

          if (!pointsResult.success) {
            addNotification("Failed to add points. Please try again.", "error");
            return;
          }

          // Refresh profile to show updated points and level
          await refreshProfile();

          // Update local state ONLY after backend operations succeed
          completeLesson(courseId, lessonId);
          unlockNextLesson(courseId, lessonId);
          addNotification("Lesson completed! You earned 10 points.", "success");
        }
      } catch {
        addNotification("An error occurred. Please try again.", "error");
      } finally {
        setIsCompletingLesson(false);
      }
    }
  };

  const handleSubmitAssignment = async (submission) => {
    setIsSubmittingAssignment(true);
    try {
      if (!user) {
        return;
      }

      // Submit to backend (Supabase)
      const { success } = await submitAssignmentToBackend(
        user.id,
        courseId,
        lessonId,
        submission,
      );

      if (success) {
        setShowSubmissionForm(false);
        addNotification("Assignment submitted successfully!", "success");
        // Mark lesson as completed after submission
        handleMarkComplete();
      } else {
        addNotification(
          "Failed to submit assignment. Please try again.",
          "error",
        );
      }
    } catch {
      addNotification("An error occurred. Please try again.", "error");
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  const reviewRequests = getReviewRequestsForLesson(lessonId);

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const getAllLessons = () => {
    if (!course || !course.modules) return [];
    return course.modules.flatMap((module) => module.lessons || []);
  };

  const getCurrentLessonIndex = () => {
    const allLessons = getAllLessons();
    return allLessons.findIndex((l) => l.id === lessonId);
  };

  const getPreviousLesson = () => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  const getNextLesson = () => {
    const allLessons = getAllLessons();
    const currentIndex = getCurrentLessonIndex();
    return currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;
  };

  const handlePreviousLesson = () => {
    const previousLesson = getPreviousLesson();
    if (previousLesson && !previousLesson.isLocked) {
      navigate(`/courses/${courseId}/lessons/${previousLesson.id}`);
    }
  };

  const handleNextLesson = () => {
    const nextLesson = getNextLesson();
    if (nextLesson && !nextLesson.isLocked) {
      navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
    }
  };

  if (!course || !lesson) {
    return (
      <div className={styles.container}>
        <LoadingSpinner size="lg" message="Loading lesson..." />
      </div>
    );
  }

  // Prevent access to locked lessons (only in production or with Supabase configured)
  // In dev mode without Supabase, all lessons are unlocked for testing
  if (lesson.isLocked && (import.meta.env.PROD || isSupabaseConfigured)) {
    return (
      <div className={styles.container}>
        <div className={styles.lockedLessonContainer}>
          <Lock size={64} className={styles.lockedIcon} />
          <h1>Lesson Locked</h1>
          <p>Please complete the previous lesson to unlock this one.</p>
          <button onClick={() => navigate(-1)} className={styles.unlockButton}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <button
            onClick={() => navigate(-1)}
            className={styles.breadcrumbLink}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <span className={styles.breadcrumbSeparator}>←</span>
            Back
          </button>
        </div>
        <h1 className={styles.title}>{lesson.title}</h1>
        <p className={styles.description}>{lesson.description}</p>
      </div>

      <div className={styles.content}>
        <div className={styles.lessonContent}>
          <LessonCard
            lesson={lesson}
            courseId={courseId}
            submissions={submissions}
            reviewRequests={reviewRequests}
            isCompletingLesson={isCompletingLesson}
            isSubmittingAssignment={isSubmittingAssignment}
            onMarkComplete={handleMarkComplete}
            onShowSubmissionForm={() => setShowSubmissionForm(true)}
            onShowReviewRequestForm={() => setShowReviewRequestForm(true)}
            onShowSubmissions={() => setShowSubmissions(true)}
            onShowReviewRequests={() => setShowReviewRequests(true)}
          />
        </div>

        <div className={styles.sidebar}>
          <Card className={styles.progressCard}>
            <h3>Course Progress</h3>
            <ProgressBar
              progress={course.progress}
              max={100}
              height="8px"
              showLabel={false}
              color={course.progress === 100 ? "#10b981" : "#ffd700"}
            />
            <p>{course.progress}% Complete</p>
          </Card>

          <Card className={styles.lessonsCard}>
            <h3>Course Lessons</h3>
            <ModuleList
              modules={course.modules}
              expandedModules={expandedModules}
              onToggleModule={toggleModule}
              onLessonClick={(lessonId) => {
                const lesson = course.modules
                  .flatMap((m) => m.lessons)
                  .find((l) => l.id === lessonId);
                if (lesson && !lesson.isLocked) {
                  navigate(`/courses/${courseId}/lessons/${lessonId}`);
                }
              }}
              currentLessonId={lessonId}
              showProgress={false}
              className={styles.lessonList}
            />
          </Card>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className={styles.navigation}>
        <Button
          variant="outline"
          size="lg"
          icon={<ChevronLeft size={20} />}
          onClick={handlePreviousLesson}
          disabled={!getPreviousLesson() || getPreviousLesson()?.isLocked}
          className={styles.navButton}
        >
          Previous
        </Button>

        <div className={styles.lessonProgress}>
          <span>
            Lesson {getCurrentLessonIndex() + 1} of {getAllLessons().length}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={<ChevronRight size={20} />}
          iconPosition="right"
          onClick={handleNextLesson}
          disabled={!getNextLesson() || getNextLesson()?.isLocked}
          className={styles.navButton}
        >
          Next
        </Button>
      </div>

      {/* Submission Form Modal */}
      {showSubmissionForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <SubmissionForm
              lesson={lesson}
              onSubmit={handleSubmitAssignment}
              onCancel={() => setShowSubmissionForm(false)}
            />
          </div>
        </div>
      )}

      {/* Review Request Form Modal */}
      {showReviewRequestForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <ReviewRequestForm
              lesson={lesson}
              onSubmit={async (reviewRequest) => {
                const requestId = await submitReviewRequest(
                  courseId,
                  lessonId,
                  reviewRequest,
                );
                if (requestId) {
                  addNotification(
                    "Review request submitted! Peers will see your request.",
                    "success",
                  );
                  setShowReviewRequestForm(false);
                }
              }}
              onCancel={() => setShowReviewRequestForm(false)}
            />
          </div>
        </div>
      )}

      {/* Review Requests Modal */}
      <ReviewRequestsModal
        isOpen={showReviewRequests}
        onClose={() => setShowReviewRequests(false)}
        reviewRequests={reviewRequests}
        onSubmitReviewFeedback={submitReviewFeedback}
      />

      {/* Submissions Modal */}
      <SubmissionsModal
        isOpen={showSubmissions}
        onClose={() => setShowSubmissions(false)}
        submissions={submissions}
      />
    </div>
  );
};

export default LessonViewer;
