import PropTypes from "prop-types";
import { ChevronRight } from "lucide-react";
import Button from "../Button/Button";
import Card from "../Card/Card";
import styles from "./ReviewView.module.css";

const ReviewView = ({ review, onClose, onNext, onRetry, onReviewLesson }) => {
  return (
    <div className={styles.assessmentContent}>
      <Card className={styles.assessmentCard}>
        <div className={styles.review}>
          <div
            className={`${styles.reviewHeader} ${review.passed ? styles.passed : styles.failed}`}
          >
            <div className={styles.resultIndicator}>
              <h2>{review.passed ? "Passed" : "Did Not Pass"}</h2>
              <div className={styles.score}>{review.score}%</div>
            </div>
            <div className={styles.scoreInfo}>
              Passing score: {review.passingScore}%
            </div>
          </div>

          <div className={styles.feedback}>
            {review.feedback?.overall && (
              <div className={styles.overallSection}>
                <h3>Assessment Results</h3>
                <p>{review.feedback.overall}</p>
              </div>
            )}

            {review.details?.length > 0 && (
              <div className={styles.detailsSection}>
                <h3>Question Breakdown</h3>
                {review.details.map((detail, index) => (
                  <div
                    key={index}
                    className={`${styles.questionResult} ${
                      detail.isCorrect ? styles.correct : styles.incorrect
                    }`}
                  >
                    <div className={styles.questionHeader}>
                      <span className={styles.questionNum}>Q{index + 1}</span>
                      <span className={styles.questionText}>
                        {detail.questionText}
                      </span>
                      <span className={styles.score}>{detail.score}%</span>
                    </div>
                    <p className={styles.feedback}>{detail.feedback}</p>
                    {detail.suggestions?.length > 0 && (
                      <div className={styles.suggestionsList}>
                        {detail.suggestions.map((suggestion, sIdx) => (
                          <div key={sIdx} className={styles.suggestion}>
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.reviewActions}>
            {review.passed ? (
              <>
                <Button variant="secondary" onClick={onClose}>
                  Close Feedback
                </Button>
                <Button variant="primary" onClick={onNext}>
                  <span className={styles.navText}>Next</span>
                  <span className={styles.navTextFull}> Lesson</span>
                  <ChevronRight size={18} />
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={onReviewLesson}>
                  Review Lesson
                </Button>
                <Button variant="primary" onClick={onRetry}>
                  Retry Assessment
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

ReviewView.propTypes = {
  review: PropTypes.shape({
    passed: PropTypes.bool.isRequired,
    score: PropTypes.number.isRequired,
    passingScore: PropTypes.number.isRequired,
    feedback: PropTypes.shape({
      overall: PropTypes.string,
    }),
    details: PropTypes.arrayOf(
      PropTypes.shape({
        questionText: PropTypes.string.isRequired,
        isCorrect: PropTypes.bool.isRequired,
        score: PropTypes.number.isRequired,
        feedback: PropTypes.string.isRequired,
        suggestions: PropTypes.arrayOf(PropTypes.string),
      }),
    ),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
  onReviewLesson: PropTypes.func.isRequired,
};

export default ReviewView;
