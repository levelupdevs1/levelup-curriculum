import PropTypes from "prop-types";
import { ChevronLeft } from "lucide-react";
import Button from "../Button/Button";
import Card from "../Card/Card";
import styles from "./AssessmentView.module.css";

const AssessmentView = ({
  assessment,
  submission,
  setSubmission,
  onSubmit,
  onBack,
  submitting,
}) => {
  return (
    <div className={styles.assessmentContent}>
      <Card className={styles.assessmentCard}>
        <h1>{assessment.title}</h1>
        <p className={styles.description}>{assessment.description}</p>
        <p className={styles.passingScore}>
          Passing Score: {assessment.passingScore}% ({assessment.totalPoints}{" "}
          points)
        </p>

        <div className={styles.questions}>
          {assessment.questions?.map((question, questionIndex) => {
            // Generate ID if missing
            const questionId = question.id || `q${questionIndex + 1}`;
            return (
              <div key={questionId} className={styles.question}>
                <h3>{question.question}</h3>

                {question.type === "multiple_choice" && (
                  <div className={styles.options}>
                    {question.options.map((option, index) => (
                      <label key={index} className={styles.option}>
                        <input
                          type="radio"
                          name={questionId}
                          value={index}
                          onChange={(e) =>
                            setSubmission((prev) => ({
                              ...prev,
                              [questionId]: parseInt(e.target.value),
                            }))
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === "coding" && (
                  <textarea
                    className={styles.codeInput}
                    value={submission[questionId] || question.starterCode || ""}
                    placeholder="Write your code here..."
                    rows={10}
                    onChange={(e) =>
                      setSubmission((prev) => ({
                        ...prev,
                        [questionId]: e.target.value,
                      }))
                    }
                  />
                )}

                {question.type === "code_challenge" && (
                  <div className={styles.codeChallenge}>
                    <textarea
                      className={styles.codeInput}
                      value={
                        submission[questionId] || question.starterCode || ""
                      }
                      placeholder="Write your code here..."
                      rows={8}
                      onChange={(e) =>
                        setSubmission((prev) => ({
                          ...prev,
                          [questionId]: e.target.value,
                        }))
                      }
                    />
                    {question.hints && question.hints.length > 0 && (
                      <details className={styles.hints}>
                        <summary>💡 Hints</summary>
                        <ul>
                          {question.hints.map((hint, idx) => (
                            <li key={idx}>{hint}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                )}

                {question.type === "project" && (
                  <div className={styles.projectSubmission}>
                    <div className={styles.projectRequirements}>
                      <h4>Required Features:</h4>
                      <ul>
                        {question.requirements?.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    {question.stretchGoals &&
                      question.stretchGoals.length > 0 && (
                        <div className={styles.stretchGoals}>
                          <h4>Stretch Goals (Optional):</h4>
                          <ul>
                            {question.stretchGoals.map((goal, idx) => (
                              <li key={idx}>{goal}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    <input
                      type="url"
                      className={styles.urlInput}
                      placeholder="GitHub Repository URL (required)"
                      value={submission[questionId]?.githubUrl || ""}
                      onChange={(e) =>
                        setSubmission((prev) => ({
                          ...prev,
                          [questionId]: {
                            ...prev[questionId],
                            githubUrl: e.target.value,
                          },
                        }))
                      }
                    />
                    <input
                      type="url"
                      className={styles.urlInput}
                      placeholder="Live Demo URL (optional)"
                      value={submission[questionId]?.liveUrl || ""}
                      onChange={(e) =>
                        setSubmission((prev) => ({
                          ...prev,
                          [questionId]: {
                            ...prev[questionId],
                            liveUrl: e.target.value,
                          },
                        }))
                      }
                    />
                    <textarea
                      className={styles.textInput}
                      placeholder="Project description (what you built, challenges faced, what you learned)"
                      rows={4}
                      value={submission[questionId]?.description || ""}
                      onChange={(e) =>
                        setSubmission((prev) => ({
                          ...prev,
                          [questionId]: {
                            ...prev[questionId],
                            description: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                )}

                {question.type === "short_answer" && (
                  <textarea
                    className={styles.textInput}
                    placeholder="Type your answer here..."
                    rows={6}
                    value={submission[questionId] || ""}
                    onChange={(e) =>
                      setSubmission((prev) => ({
                        ...prev,
                        [questionId]: e.target.value,
                      }))
                    }
                  />
                )}

                <div className={styles.points}>Points: {question.points}</div>
              </div>
            );
          })}
        </div>

        <div className={styles.assessmentActions}>
          <Button variant="secondary" onClick={onBack}>
            <ChevronLeft size={18} />
            <span className={styles.backText}>Back</span>
            <span className={styles.backTextFull}>to Lesson</span>
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

AssessmentView.propTypes = {
  assessment: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    passingScore: PropTypes.number.isRequired,
    totalPoints: PropTypes.number.isRequired,
    questions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        question: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        options: PropTypes.arrayOf(PropTypes.string),
        starterCode: PropTypes.string,
        hints: PropTypes.arrayOf(PropTypes.string),
        requirements: PropTypes.arrayOf(PropTypes.string),
        stretchGoals: PropTypes.arrayOf(PropTypes.string),
        points: PropTypes.number.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  submission: PropTypes.object.isRequired,
  setSubmission: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export default AssessmentView;
