import { getModel } from "../config/gemini.js";

export const generateCourseCatalog = async (req, res) => {
  const { goal } = req.body;

  console.log("goal", goal);

  try {
    const model = getModel();

    console.log("it reach here o");

    const prompt = "very crazy AI";

    console.log("lets log something else");

    const messages = [
      {
        role: "system",
        content:
          "You are an AI learning path designer following The Odin Project standards: practical, hands-on, project-based learning. Use the exact delimiter format specified.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const result = await model.generateContent(prompt);

    const response = result.response;
    const text = response.text();

    console.log("text", text);

    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    console.log("cleanedText", cleanedText);

    const courseCatalog = cleanedText;

    console.log("courseCatalog", courseCatalog);

    res.json({
      success: true,
      data: courseCatalog,
      metadata: {},
    });

    console.log(
      "res.json",
      res.json({
        success: true,
        data: courseCatalog,
        metadata: {},
      }),
    );
  } catch (parseError) {
    return {
      success: false,
      error: `Failed to parse AI response: ${parseError.message}`,
    };
  }
};

export const generateCourseStructure = async (req, res) => {
  const { title, description, modulesCount, userId } = req.body;

  if (!title || !description || !modulesCount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const model = getModel();

    const prompt = `You are an expert curriculum designer. Create a comprehensive course structure.

Course Title: ${title}
Description: ${description}
Number of Modules: ${modulesCount}

Generate a JSON structure with the following format:
{
  "modules": [
    {
      "id": "module-1",
      "title": "Module Title",
      "description": "Brief description",
      "lessons": [
        {
          "id": "lesson-1",
          "title": "Lesson Title",
          "type": "lesson",
          "estimatedMinutes": 30
        }
      ]
    }
  ]
}

Requirements:
- Each module should have 4-6 lessons
- Include varied lesson types: lessons, coding challenges, assessments
- Ensure logical progression from beginner to advanced
- Make it engaging and practical

Return ONLY valid JSON, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const courseStructure = JSON.parse(cleanedText);

    // Add Opik metadata (automatically tracked by trackGemini)
    res.json({
      success: true,
      data: courseStructure,
      metadata: {
        userId,
        feature: "course_generation",
        modulesCount,
      },
    });
  } catch (error) {
    console.error("Course generation error:", error);
    res.status(500).json({
      error: "Failed to generate course structure",
      details: error.message,
    });
  }
};

export const generateLessonContent = async (req, res) => {
  const { title, description, courseTitle, estimatedMinutes, userId } =
    req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const model = getModel();

    const prompt = `You are an expert educational content creator. Generate comprehensive lesson content.

Lesson Title: ${title}
Description: ${description}
Course: ${courseTitle || "General"}
Estimated Duration: ${estimatedMinutes || 30} minutes

Create detailed lesson content in Markdown format with:
1. Clear introduction explaining what students will learn
2. Main content broken into digestible sections
3. Code examples (if applicable)
4. Practical exercises
5. Key takeaways summary

Make it engaging, clear, and beginner-friendly. Use proper markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    res.json({
      success: true,
      data: {
        title,
        content,
        estimatedMinutes: estimatedMinutes || 30,
      },
      metadata: {
        userId,
        feature: "lesson_generation",
        courseTitle,
      },
    });
  } catch (error) {
    console.error("Lesson generation error:", error);
    res.status(500).json({
      error: "Failed to generate lesson content",
      details: error.message,
    });
  }
};

export const generateAssessment = async (req, res) => {
  const { lessonTitle, lessonContent, assessmentType, userId } = req.body;

  if (!lessonTitle || !lessonContent) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const model = getModel();

    const prompt = `You are an expert assessment designer. Create an assessment based on this lesson.

Lesson Title: ${lessonTitle}
Assessment Type: ${assessmentType || "mixed"}

Lesson Content:
${lessonContent.substring(0, 2000)}...

Generate a JSON assessment with the following structure:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why this is correct"
    },
    {
      "id": "q2",
      "type": "coding_challenge",
      "question": "Challenge description",
      "starterCode": "// Your code here",
      "testCases": [
        {"input": "test", "expected": "result"}
      ]
    }
  ]
}

Include 5-7 questions with varied types. Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const assessment = JSON.parse(cleanedText);

    res.json({
      success: true,
      data: assessment,
      metadata: {
        userId,
        feature: "assessment_generation",
        assessmentType,
      },
    });
  } catch (error) {
    console.error("Assessment generation error:", error);
    res.status(500).json({
      error: "Failed to generate assessment",
      details: error.message,
    });
  }
};

export const reviewSubmission = async (req, res) => {
  const { questions, answers, userId } = req.body;

  if (!questions || !answers) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const model = getModel();

    const prompt = `You are an expert code reviewer and educator. Review this student's submission.

Questions and Answers:
${JSON.stringify({ questions, answers }, null, 2)}

Provide detailed feedback in JSON format:
{
  "overallScore": 85,
  "feedback": [
    {
      "questionId": "q1",
      "isCorrect": true,
      "feedback": "Detailed feedback",
      "suggestions": ["Improvement suggestion"]
    }
  ],
  "summary": "Overall performance summary",
  "nextSteps": ["What to focus on next"]
}

Be constructive, encouraging, and specific. Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const review = JSON.parse(cleanedText);

    res.json({
      success: true,
      data: review,
      metadata: {
        userId,
        feature: "submission_review",
        questionsCount: questions.length,
      },
    });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({
      error: "Failed to review submission",
      details: error.message,
    });
  }
};

export const reviewSubmissionBatch = async (req, res) => {
  const { questions, submissionAnswers } = req.body;

  if (!questions || !submissionAnswers) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check for project-type questions and validate them
  const projectQuestions = questions.filter((q) => q.type === "project");
  const projectValidations = {};

  for (const pq of projectQuestions) {
    const submission = submissionAnswers[pq.id];
    if (submission && typeof submission === "object") {
      const validation = await validateProjectSubmission(
        submission,
        pq.question,
      );
      projectValidations[pq.id] = validation;
    }
  }

  // Build structured format with all Q&A pairs, mapping indices to actual answers
  const questionsData = questions
    .map((q, idx) => {
      let answerText = submissionAnswers[q.id];

      // For multiple choice, map index to the actual option text
      if (q.type === "multiple_choice" && answerText !== undefined) {
        const answerIndex = parseInt(answerText);
        if (!isNaN(answerIndex) && q.options && q.options[answerIndex]) {
          answerText = q.options[answerIndex];
        }
      }

      // For project submissions, use validated content with actual code
      if (
        q.type === "project" &&
        typeof answerText === "object" &&
        answerText !== null
      ) {
        const validation = projectValidations[q.id];
        if (validation && validation.formattedContent) {
          // Use the validated content with actual code
          answerText = validation.formattedContent;
        } else {
          // Fallback to basic URL display if validation not available
          const projectParts = [];
          if (answerText.repoUrl)
            projectParts.push(`GitHub Repository: ${answerText.repoUrl}`);
          if (answerText.liveUrl)
            projectParts.push(`Live Demo: ${answerText.liveUrl}`);
          answerText =
            projectParts.length > 0
              ? projectParts.join("\n") +
                "\n\nWARNING: Project content could not be validated. Review URLs manually."
              : "[NO PROJECT LINKS PROVIDED]";
        }
      }

      // Handle unanswered questions
      if (answerText === undefined || answerText === "") {
        answerText = "[NO ANSWER PROVIDED]";
      }

      return `
Question ${idx + 1} (${q.type}): ${q.question}
${q.options ? `Options: ${q.options.map((opt, i) => `${i + 1}. ${opt}`).join(" | ")}` : ""}
Student Answer: ${answerText}
---`;
    })
    .join("\n");

  // Check if there are project questions for stricter review
  const hasProjectQuestions = questions.some((q) => q.type === "project");

  // Get validation metadata for project questions
  const projectMeta = hasProjectQuestions
    ? Object.values(projectValidations)[0]?.validationSummary
    : null;

  try {
    const model = getModel();

    const prompt = `Review this student's assessment submission. For EACH question, provide feedback.

ASSESSMENT QUESTIONS AND ANSWERS:
${questionsData}

PASSING SCORE REQUIREMENT: 70% (Student must score >= 70 to pass)

${
  hasProjectQuestions
    ? `
=== STRICT ANTI-HALLUCINATION REVIEW MODE ===
${
  projectMeta
    ? `Validation ID: ${projectMeta.validationId || "N/A"}
Files Reviewed: ${projectMeta.filesAvailable || 0}
Code Coverage: ${projectMeta.coverage || 0}%
Repository Accessible: ${projectMeta.repoAccessible ? "YES" : "NO"}
Live URL Accessible: ${projectMeta.liveUrlAccessible ? "YES" : "NO"}
`
    : ""
}
MANDATORY RULES FOR PROJECT REVIEW:
1. ONLY use evidence from the ACTUAL CODE provided
2. NEVER assume features exist without code proof
3. CITE specific file paths and line numbers
4. Mark requirements as NOT MET if no code evidence found
5. If "VALIDATION FAILED" appears, score MUST be 0
6. Partial implementations = NOT MET
7. No hallucinations - evidence only
===
`
    : ""
}

For each question:
1. Is the answer correct, partially correct, or incorrect?
2. Key strengths (cite specific evidence from their answer/code)
3. What to improve
4. Next steps

IMPORTANT: 
- Use "You" and "Your" (personalized)
- Be CONCISE. Max 1-2 sentences per field.
- Calculate overallScore as percentage of correct answers
- Set "passed" to true ONLY if overallScore >= 70
- For projects: verify EACH requirement against actual code

=== RESPONSE FORMAT (USE THESE EXACT DELIMITERS) ===
<<<PASSED>>>
true | false (MUST be true if overallScore >= 70)
<<<OVERALL_SCORE>>>
0-100
<<<OVERALL_FEEDBACK>>>
Your overall score is X%. You got Y right.

For each question reviewed:
<<<QUESTION_REVIEW>>>
<<<QUESTION_ID>>>
the question id
<<<QUESTION_TEXT>>>
the question text
<<<QUESTION_TYPE>>>
the question type
<<<SCORE>>>
0-100
<<<IS_CORRECT>>>
true | false
<<<FEEDBACK>>>
You [did/didn't] understand X because Y. Your answer was clear.
<<<SUGGESTIONS>>>
- Fix this
- Try that
<<<ENCOURAGEMENT>>>
Keep going`;

    // Use stricter system prompt for project reviews
    const systemPrompt = hasProjectQuestions
      ? "You are a strict code reviewer with anti-hallucination training. For project submissions: ONLY cite evidence from the provided code. NEVER assume features exist. Quote exact file paths and line numbers. If no code evidence, mark as NOT MET. Provide brief, personalized feedback using 'You' and 'Your'. Use the exact delimiter format specified."
      : "You are a concise technical educator. Provide brief, personalized feedback using 'You' and 'Your'. Be direct and avoid long explanations. Use the exact delimiter format specified.";

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Parse JSON response
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const review = JSON.parse(cleanedText);

    res.json({
      success: true,
      data: review,
      metadata: {},
    });
  } catch (parseError) {
    return {
      success: false,
      error: `Failed to parse batch review: ${parseError.message}`,
    };
  }
};
