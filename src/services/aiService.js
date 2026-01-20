const AI_TOKEN_COSTS = {
  GENERATE_COURSE_CATALOG: 1,
  GENERATE_COURSE_STRUCTURE: 1,
  GENERATE_LESSON_CONTENT: 1,
  GENERATE_ASSESSMENT: 1,
  REVIEW_SUBMISSION: 1,
  AI_TUTOR_QUESTION: 1,
  GENERATE_HINT: 1,
  PROJECT_EVALUATION: 1,
};

const simulateDelay = (ms = 1500) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const generateCourseId = () => {
  return `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateLessonId = () => {
  return `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const mockGenerateCourseCatalog = async (userProfile) => {
  await simulateDelay(2000);

  const { learningGoal, skillLevel, goal } = userProfile;

  const courses = [
    {
      id: generateCourseId(),
      title: `${learningGoal} Fundamentals`,
      description: `Master the core concepts of ${learningGoal.toLowerCase()} with hands-on projects tailored to ${skillLevel.toLowerCase()} learners.`,
      difficulty: skillLevel === "Complete Beginner" ? "Beginner" : skillLevel,
      estimatedHours: skillLevel === "Complete Beginner" ? 40 : 30,
      modulesCount: 6,
      potentialTokens: 450,
      tags: [learningGoal, skillLevel, "Fundamentals"],
    },
    {
      id: generateCourseId(),
      title: `${learningGoal} for ${goal}`,
      description: `Practical ${learningGoal.toLowerCase()} skills focused on ${goal.toLowerCase()}. Build real-world projects and portfolio pieces.`,
      difficulty: skillLevel === "Advanced" ? "Advanced" : "Intermediate",
      estimatedHours: 50,
      modulesCount: 8,
      potentialTokens: 600,
      tags: [learningGoal, goal, "Project-Based"],
    },
    {
      id: generateCourseId(),
      title: `Advanced ${learningGoal} Techniques`,
      description: `Deep dive into advanced patterns, best practices, and optimization techniques in ${learningGoal.toLowerCase()}.`,
      difficulty: "Advanced",
      estimatedHours: 60,
      modulesCount: 10,
      potentialTokens: 750,
      tags: [learningGoal, "Advanced", "Best Practices"],
    },
  ];

  return {
    success: true,
    courses,
    tokensUsed: AI_TOKEN_COSTS.GENERATE_COURSE_CATALOG,
  };
};

export const mockGenerateCourseStructure = async (courseTitle, userProfile) => {
  await simulateDelay(1500);

  const { skillLevel } = userProfile;
  const moduleCount = skillLevel === "Complete Beginner" ? 6 : 8;

  const modules = [];
  for (let i = 1; i <= moduleCount; i++) {
    modules.push({
      id: `module_${i}`,
      title: `Module ${i}: Core Concept ${i}`,
      description: `Learn essential skills and techniques in this module.`,
      orderIndex: i - 1,
      lessons: [
        {
          id: generateLessonId(),
          title: `Introduction to Module ${i}`,
          orderIndex: 0,
          estimatedMinutes: 20,
          type: "lesson",
        },
        {
          id: generateLessonId(),
          title: `Deep Dive: Key Concepts`,
          orderIndex: 1,
          estimatedMinutes: 30,
          type: "lesson",
        },
        {
          id: generateLessonId(),
          title: `Hands-On Practice`,
          orderIndex: 2,
          estimatedMinutes: 45,
          type: "lesson",
        },
        {
          id: generateLessonId(),
          title: `Module ${i} Assessment`,
          orderIndex: 3,
          estimatedMinutes: 30,
          type: "assessment",
        },
      ],
    });
  }

  return {
    success: true,
    structure: {
      modules,
      totalLessons: moduleCount * 4,
      estimatedHours: moduleCount * 2,
    },
    tokensUsed: AI_TOKEN_COSTS.GENERATE_COURSE_STRUCTURE,
  };
};

export const mockGenerateLessonContent = async (
  lessonTitle,
  courseContext,
  userProfile,
) => {
  await simulateDelay(2000);

  const { skillLevel, learningGoal } = userProfile;

  const content = {
    title: lessonTitle,
    introduction: `Welcome to ${lessonTitle}. In this lesson, you'll learn fundamental concepts that will help you progress in ${learningGoal.toLowerCase()}.`,
    sections: [
      {
        id: "theory",
        heading: "Core Concepts",
        content: `This section covers the theoretical foundation you need. We'll break down complex topics into digestible pieces suitable for ${skillLevel.toLowerCase()} learners.`,
        type: "text",
      },
      {
        id: "example",
        heading: "Practical Example",
        content: `Let's see this in action with a real-world example:\n\nconst example = "This is sample code";\nconsole.log(example);`,
        type: "code",
        language: "javascript",
      },
      {
        id: "exercise",
        heading: "Try It Yourself",
        content: `Now it's your turn. Apply what you've learned by completing this exercise.`,
        type: "text",
      },
    ],
    keyTakeaways: [
      "Understanding the core concept",
      "Practical application",
      "Best practices to follow",
    ],
    resources: [
      {
        title: "Official Documentation",
        url: "#",
        type: "documentation",
      },
      {
        title: "Further Reading",
        url: "#",
        type: "article",
      },
    ],
    estimatedMinutes: 25,
  };

  return {
    success: true,
    content,
    tokensUsed: AI_TOKEN_COSTS.GENERATE_LESSON_CONTENT,
  };
};

export const mockGenerateAssessment = async (lessonTitle) => {
  await simulateDelay(1000);

  const assessment = {
    id: `assessment_${Date.now()}`,
    type: "mixed",
    title: `${lessonTitle} Assessment`,
    description:
      "Test your understanding of the concepts covered in this lesson.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What is the main concept covered in this lesson?",
        options: [
          "Option A: Correct answer",
          "Option B: Incorrect",
          "Option C: Incorrect",
          "Option D: Incorrect",
        ],
        correctAnswer: 0,
        points: 10,
      },
      {
        id: "q2",
        type: "coding",
        question: "Write code to demonstrate the concept learned.",
        starterCode: "// Write your code here\n",
        testCases: [
          { input: "test1", expected: "result1" },
          { input: "test2", expected: "result2" },
        ],
        points: 20,
      },
      {
        id: "q3",
        type: "short_answer",
        question:
          "Explain in your own words how this concept applies to real-world scenarios.",
        minWords: 50,
        points: 15,
      },
    ],
    passingScore: 70,
    totalPoints: 45,
  };

  return {
    success: true,
    assessment,
    tokensUsed: AI_TOKEN_COSTS.GENERATE_ASSESSMENT,
  };
};

export const mockReviewSubmission = async (submission, assessment) => {
  await simulateDelay(1500);

  const score = Math.floor(Math.random() * 30) + 70;
  const passed = score >= assessment.passingScore;

  const review = {
    submissionId: submission.id,
    score,
    passed,
    feedback: {
      overall: passed
        ? "Great work! You demonstrated a solid understanding of the concepts."
        : "You're on the right track, but there are some areas that need improvement.",
      strengths: [
        "Clear understanding of basic concepts",
        "Good code structure",
      ],
      improvements: [
        "Consider edge cases in your solution",
        "Add more detailed explanations",
      ],
    },
    questionReviews: assessment.questions.map((q) => ({
      questionId: q.id,
      score: Math.floor(Math.random() * q.points * 0.3) + q.points * 0.7,
      maxScore: q.points,
      feedback: "Good answer. Consider adding more detail.",
    })),
    reviewedAt: new Date().toISOString(),
  };

  return {
    success: true,
    review,
    tokensUsed: AI_TOKEN_COSTS.REVIEW_SUBMISSION,
  };
};

export { AI_TOKEN_COSTS };
