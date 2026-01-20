import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import { useUser } from "../../hooks/useUser";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import Modal from "../../components/Modal/Modal";
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
  const location = useLocation();
  const { updateUserProfile, userProfile, generatedCourses } =
    useCourseGeneration();
  const { refreshProfile, profile } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Determine if this is an update (user already has a profile)
  const existingProfile = userProfile || profile;
  const isUpdateMode =
    existingProfile?.learning_goal || existingProfile?.onboarding_completed;
  const hasExistingCourses = generatedCourses?.length > 0;

  // Pre-fill answers from existing profile
  useEffect(() => {
    if (existingProfile && isUpdateMode) {
      const prefilled = {};

      if (existingProfile.learning_goal) {
        prefilled.learning_goal = existingProfile.learning_goal;
      }
      if (existingProfile.skill_level) {
        prefilled.skill_level = existingProfile.skill_level;
      }
      if (existingProfile.goal) {
        prefilled.goal = existingProfile.goal;
      }
      if (existingProfile.time_commitment) {
        prefilled.time_commitment = existingProfile.time_commitment;
      }

      setAnswers(prefilled);
    }
  }, [existingProfile, isUpdateMode]);

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
    setSaving(true);

    const newProfile = {
      learning_goal: answers.learning_goal,
      skill_level: answers.skill_level,
      goal: answers.goal,
      time_commitment: answers.time_commitment,
      learning_style: "Project-based (The Odin Project style)",
    };

    const result = await updateUserProfile(newProfile);

    if (result?.success) {
      await refreshProfile();
      setSaving(false);

      // If updating and has existing courses, ask if they want new courses
      if (isUpdateMode && hasExistingCourses) {
        setShowGenerateModal(true);
      } else {
        // First time user - go to catalog to generate courses
        setTimeout(() => {
          navigate("/course-catalog", { replace: true });
        }, 100);
      }
    } else {
      console.error("Failed to save profile:", result?.error);
      setSaving(false);
    }
  };

  const handleGenerateNewCourses = () => {
    setShowGenerateModal(false);
    // Navigate to catalog which will show option to generate new courses
    navigate("/course-catalog?generate=true", { replace: true });
  };

  const handleKeepExisting = () => {
    setShowGenerateModal(false);
    // Go back to where they came from (profile or dashboard)
    const from = location.state?.from || "/profile";
    navigate(from, { replace: true });
  };

  const handleCancel = () => {
    const from = location.state?.from || "/dashboard";
    navigate(from);
  };

  const progressPercentage =
    ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>
            {isUpdateMode ? "Update Your Preferences" : "Welcome to Level Up"}
          </h1>
          <p>
            {isUpdateMode
              ? "Update your learning preferences. Your existing courses will be kept."
              : "Let's personalize your learning experience"}
          </p>
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
          {isUpdateMode && currentStep === 0 ? (
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed || saving}
          >
            {saving
              ? "Saving..."
              : isLastStep
                ? isUpdateMode
                  ? "Save Changes"
                  : "Complete"
                : "Next"}
          </Button>
        </div>
      </div>

      {/* Modal for asking about new courses after update */}
      <Modal
        isOpen={showGenerateModal}
        onClose={handleKeepExisting}
        title="Preferences Updated!"
      >
        <div className={styles.modalContent}>
          <p>Your learning preferences have been updated successfully.</p>
          <p>
            Would you like to generate new courses based on your updated
            preferences? Your existing courses will be kept.
          </p>
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={handleKeepExisting}>
              Keep Existing Courses
            </Button>
            <Button variant="primary" onClick={handleGenerateNewCourses}>
              Generate New Courses
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Onboarding;
