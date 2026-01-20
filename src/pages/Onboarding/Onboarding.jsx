import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import { useAIToken } from "../../hooks/useAIToken";
import { useUser } from "../../hooks/useUser";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import styles from "./Onboarding.module.css";

const ONBOARDING_STEPS = [
  {
    id: "learning_goal",
    question: "What do you want to learn?",
    options: [
      "Web Development",
      "Blockchain Development",
      "AI & Machine Learning",
      "Mobile Development",
      "Data Science",
      "Other",
    ],
    allowCustom: true,
  },
  {
    id: "skill_level",
    question: "What's your current skill level?",
    options: [
      "Complete Beginner",
      "Some Experience",
      "Intermediate",
      "Advanced",
    ],
    allowCustom: false,
  },
  {
    id: "goal",
    question: "What's your primary goal?",
    options: [
      "Get a job",
      "Build a project",
      "Learn for fun",
      "Start a business",
      "Career transition",
    ],
    allowCustom: true,
  },
  {
    id: "time_commitment",
    question: "How much time can you dedicate per week?",
    options: ["1-2 hours", "3-5 hours", "6-10 hours", "10+ hours"],
    allowCustom: false,
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { updateUserProfile } = useCourseGeneration();
  const { canUseTokens } = useAIToken();
  const { refreshProfile } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const canProceed = answers[step.id] !== undefined;

  const handleOptionSelect = (option) => {
    if (option === "Other" && step.allowCustom) {
      setShowCustomInput(true);
      setCustomInput("");
    } else {
      setAnswers((prev) => ({ ...prev, [step.id]: option }));
      setShowCustomInput(false);
      setCustomInput("");
    }
  };

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      setAnswers((prev) => ({ ...prev, [step.id]: customInput.trim() }));
      setShowCustomInput(false);
      setCustomInput("");
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setShowCustomInput(false);
      setCustomInput("");
    }
  };

  const handleComplete = async () => {
    const profile = {
      learning_goal: answers.learning_goal,
      skill_level: answers.skill_level,
      goal: answers.goal,
      time_commitment: answers.time_commitment,
      learning_style: "Project-based (The Odin Project style)", // Default to Odin Project approach
    };

    const result = await updateUserProfile(profile);

    if (result?.success) {
      // Refresh user context to update hasCompletedOnboarding
      await refreshProfile();

      // Small delay to ensure state updates propagate
      setTimeout(() => {
        // Navigate based on token availability
        if (canUseTokens(50)) {
          navigate("/course-catalog", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }, 100);
    } else {
      console.error("Failed to save profile:", result?.error);
    }
  };

  const progressPercentage =
    ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Welcome to Level Up</h1>
          <p>Let&apos;s personalize your learning experience</p>
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <Card className={styles.questionCard}>
          <div className={styles.stepIndicator}>
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
          </div>

          <h2 className={styles.question}>{step.question}</h2>

          {!showCustomInput ? (
            <div className={styles.options}>
              {step.options.map((option) => (
                <button
                  key={option}
                  className={`${styles.option} ${
                    answers[step.id] === option ? styles.selected : ""
                  }`}
                  onClick={() => handleOptionSelect(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.customInput}>
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter your answer"
                className={styles.input}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCustomSubmit();
                  }
                }}
              />
              <div className={styles.customActions}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomInput("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCustomSubmit}
                  disabled={!customInput.trim()}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}

          {answers[step.id] && !showCustomInput && (
            <div className={styles.selectedAnswer}>
              Selected: <strong>{answers[step.id]}</strong>
            </div>
          )}
        </Card>

        <div className={styles.navigation}>
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button variant="primary" onClick={handleNext} disabled={!canProceed}>
            {isLastStep ? "Complete" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
