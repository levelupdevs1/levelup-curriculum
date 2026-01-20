import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import {
  ArrowLeft,
  Star,
  FileText,
  ExternalLink,
  Github,
  MessageSquare,
} from "lucide-react";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./PeerReview.module.css";

const PeerReview = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { generatedCourses } = useCourseGeneration();

  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [submittedReviews, setSubmittedReviews] = useState(new Set());

  // Find course and lesson from AI-generated courses
  const course = generatedCourses?.find((c) => c.id === courseId);
  const lesson = course?.modules
    ?.flatMap((m) => m.lessons)
    .find((l) => l.id === lessonId);
  const submissions = []; // TODO: Implement peer review submissions for AI courses

  if (!course || !lesson) {
    return (
      <div className={styles.container}>
        <LoadingSpinner size="lg" message="Loading peer review..." />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <MessageSquare size={64} className={styles.emptyIcon} />
          <h1>No Submissions to Review</h1>
          <p>There are currently no peer submissions available for review.</p>
          <Button
            variant="primary"
            onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}`)}
            icon={<ArrowLeft size={20} />}
          >
            Back to Lesson
          </Button>
        </div>
      </div>
    );
  }

  const currentSubmission = submissions[currentSubmissionIndex];
  const isAlreadyReviewed = submittedReviews.has(currentSubmission.id);

  const handleSubmitReview = () => {
    if (feedback.trim()) {
      // TODO: Implement submitPeerReview for AI courses
      // submitPeerReview(currentSubmission.id, { rating, feedback });
      setSubmittedReviews((prev) => new Set([...prev, currentSubmission.id]));
      setFeedback("");
      setRating(5);

      // Move to next submission or finish
      if (currentSubmissionIndex < submissions.length - 1) {
        setCurrentSubmissionIndex((prev) => prev + 1);
      } else {
        // All submissions reviewed
        navigate(`/courses/${courseId}/lessons/${lessonId}`);
      }
    }
  };

  const handleNext = () => {
    if (currentSubmissionIndex < submissions.length - 1) {
      setCurrentSubmissionIndex((prev) => prev + 1);
      setFeedback("");
      setRating(5);
    }
  };

  const handlePrevious = () => {
    if (currentSubmissionIndex > 0) {
      setCurrentSubmissionIndex((prev) => prev - 1);
      setFeedback("");
      setRating(5);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          variant="ghost"
          onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}`)}
          icon={<ArrowLeft size={20} />}
        >
          Back to Lesson
        </Button>
        <div className={styles.headerInfo}>
          <h1>Peer Review: {lesson.title}</h1>
          <p>
            Review submission {currentSubmissionIndex + 1} of{" "}
            {submissions.length}
          </p>
        </div>
      </div>

      <div className={styles.reviewContent}>
        <Card className={styles.submissionCard}>
          <div className={styles.submissionHeader}>
            <h3>Submission Details</h3>
            <span className={styles.submissionDate}>
              Submitted:{" "}
              {new Date(currentSubmission.submittedAt).toLocaleDateString()}
            </span>
          </div>

          {currentSubmission.files && currentSubmission.files.length > 0 && (
            <div className={styles.submissionSection}>
              <h4>
                <FileText size={16} />
                Files Submitted
              </h4>
              <div className={styles.fileList}>
                {currentSubmission.files.map((file, index) => (
                  <div key={index} className={styles.fileItem}>
                    <FileText size={16} />
                    <span>{file.name}</span>
                    <span className={styles.fileSize}>
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentSubmission.url && (
            <div className={styles.submissionSection}>
              <h4>
                <ExternalLink size={16} />
                Live URL
              </h4>
              <a
                href={currentSubmission.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {currentSubmission.url}
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {currentSubmission.githubUrl && (
            <div className={styles.submissionSection}>
              <h4>
                <Github size={16} />
                GitHub Repository
              </h4>
              <a
                href={currentSubmission.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {currentSubmission.githubUrl}
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {currentSubmission.notes && (
            <div className={styles.submissionSection}>
              <h4>
                <MessageSquare size={16} />
                Author Notes
              </h4>
              <p className={styles.notes}>{currentSubmission.notes}</p>
            </div>
          )}
        </Card>

        <Card className={styles.reviewCard}>
          <h3>Your Review</h3>

          <div className={styles.ratingSection}>
            <label>Rating (1-5 stars):</label>
            <div className={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`${styles.star} ${
                    star <= rating ? styles.active : ""
                  }`}
                  onClick={() => setRating(star)}
                >
                  <Star size={24} fill="currentColor" />
                </button>
              ))}
              <span className={styles.ratingText}>
                {rating === 1
                  ? "Poor"
                  : rating === 2
                    ? "Fair"
                    : rating === 3
                      ? "Good"
                      : rating === 4
                        ? "Very Good"
                        : "Excellent"}
              </span>
            </div>
          </div>

          <div className={styles.feedbackSection}>
            <label htmlFor="feedback">Feedback:</label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback on the submission..."
              className={styles.feedbackTextarea}
              rows={6}
            />
          </div>

          {isAlreadyReviewed && (
            <div className={styles.alreadyReviewed}>
              ✅ You have already reviewed this submission.
            </div>
          )}

          <div className={styles.reviewActions}>
            <div className={styles.navigationButtons}>
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSubmissionIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentSubmissionIndex === submissions.length - 1}
              >
                Next
              </Button>
            </div>

            <Button
              variant="primary"
              onClick={handleSubmitReview}
              disabled={!feedback.trim() || isAlreadyReviewed}
            >
              {isAlreadyReviewed ? "Already Reviewed" : "Submit Review"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PeerReview;
