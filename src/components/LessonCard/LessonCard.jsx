import { useEffect, useState } from "react";
import {
  Play,
  CheckCircle,
  Lock,
  Upload,
  MessageSquare,
  Eye,
  Loader,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Card from "../Card/Card";
import Button from "../Button/Button";
import styles from "./LessonCard.module.css";
import { fetchLessonMarkdown } from "../../services/courseService";
import { isSupabaseConfigured } from "../../services/authService";

const LessonCard = ({
  lesson,
  courseId,
  submissions = [],
  reviewRequests = [],
  onMarkComplete,
  onShowSubmissionForm,
  onShowReviewRequestForm,
  onShowSubmissions,
  onShowReviewRequests,
  isCompletingLesson = false,
  isSubmittingAssignment = false,
}) => {
  const [markdownContent, setMarkdownContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (lesson.filePath && courseId) {
      setIsLoading(true);
      setError(null);
      fetchLessonMarkdown(courseId, lesson.filePath)
        .then(({ success, content, error: fetchError }) => {
          if (success) {
            setMarkdownContent(content);
          } else {
            setError(fetchError);
          }
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => setIsLoading(false));
    }
  }, [lesson, courseId]);

  return (
    <Card className={styles.lessonCard}>
      <div className={styles.lessonHeader}>
        <div className={styles.lessonType}>
          {lesson.type === "assignment" ? (
            <Upload size={20} />
          ) : lesson.type === "project" ? (
            <Play size={20} />
          ) : (
            <Play size={20} />
          )}
          <span>{lesson.type}</span>
        </div>
        {lesson.isCompleted && (
          <div className={styles.completed}>
            <CheckCircle size={20} />
            <span>Completed</span>
          </div>
        )}
      </div>

      <div className={styles.lessonContent}>
        {lesson.filePath ? (
          isLoading ? (
            <div className={styles.loading}>Loading lesson content...</div>
          ) : error ? (
            <div className={styles.error}>
              Failed to load lesson content: {error}
            </div>
          ) : (
            <div className={styles.markdown}>
              <ReactMarkdown>{markdownContent}</ReactMarkdown>
            </div>
          )
        ) : (
          <div>No Lesson Found</div>
        )}

        {/* Show completion banner if completed */}
        {lesson.isCompleted && (
          <div className={styles.completedContent}>
            <div className={styles.completedHeader}>
              <CheckCircle size={20} className={styles.completedIcon} />
              <span>Lesson Completed</span>
            </div>
            <p>
              Great job! You've completed this lesson. You can review the
              content above or move on to the next lesson.
            </p>
          </div>
        )}
      </div>

      <div className={styles.lessonActions}>
        {lesson.isLocked ? (
          <div className={styles.locked}>
            <Lock size={20} className={styles.lockedIcon} />
            <span>Locked - Complete previous lesson</span>
          </div>
        ) : (
          <>
            {/* Only show interactive features when Supabase is configured */}
            {isSupabaseConfigured && submissions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowSubmissions}
                icon={<Eye size={16} />}
              >
                View Submissions
              </Button>
            )}

            {/* Show Review Others if there are peer requests */}
            {reviewRequests.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={onShowReviewRequests}
              >
                Review Others
              </Button>
            )}

            {/* If lesson not completed and it's assignment type, show submission actions */}
            {!lesson.isCompleted &&
              (lesson.type === "assignment" || lesson.type === "project") && (
                <div className={styles.submissionActions}>
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={isSubmittingAssignment}
                    onClick={onShowReviewRequestForm}
                    icon={<MessageSquare size={20} />}
                  >
                    Request Review
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={isSubmittingAssignment}
                    icon={
                      isSubmittingAssignment ? (
                        <Loader size={20} className={styles.spinning} />
                      ) : (
                        <Upload size={20} />
                      )
                    }
                    onClick={onShowSubmissionForm}
                  >
                    {isSubmittingAssignment
                      ? "Submitting..."
                      : "Submit Assignment"}
                  </Button>
                </div>
              )}

            {/* If lesson not completed and no submissions/review requests yet, show Mark as Complete */}
            {!lesson.isCompleted &&
              submissions.length === 0 &&
              reviewRequests.length === 0 &&
              lesson.type !== "assignment" &&
              lesson.type !== "project" && (
                <Button
                  variant="primary"
                  size="lg"
                  disabled={isCompletingLesson}
                  icon={
                    isCompletingLesson ? (
                      <Loader size={20} className={styles.spinning} />
                    ) : (
                      <CheckCircle size={20} />
                    )
                  }
                  onClick={onMarkComplete}
                >
                  {isCompletingLesson ? "Completing..." : "Mark as Complete"}
                </Button>
              )}
          </>
        )}
      </div>
    </Card>
  );
};

export default LessonCard;
