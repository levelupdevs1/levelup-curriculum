/**
 * Google Gemini API Integration (Primary Provider)
 * Documentation: https://ai.google.dev/gemini-api/docs
 *
 * FREE TIER MODELS (with automatic rotation on failure):
 * 1. gemini-2.5-flash-lite - 10 RPM, best for high throughput
 * 2. gemini-2.5-flash - 5 RPM, hybrid reasoning model
 * 3. gemini-2.0-flash - Better rate limits
 * 4. gemini-2.0-flash-lite - Fallback option
 */

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// Model rotation: try in order until one succeeds
const FREE_MODELS = [
  "gemini-2.5-flash-lite", // Primary: 10 RPM, cost-effective
  "gemini-2.5-flash", // Backup: 5 RPM, hybrid reasoning
  "gemini-2.0-flash", // Backup: good rate limits
  "gemini-2.0-flash-lite", // Last resort: smallest model
];

/**
 * Call Gemini API with automatic model rotation on failure
 */
export const callGemini = async (messages, options = {}) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const { temperature = 0.7, maxTokens = 4000 } = options;

  // Convert messages to Gemini format
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  // System instruction goes separately
  const systemInstruction = messages.find((m) => m.role === "system")?.content;

  // Try each model in rotation until one succeeds
  let lastError = null;

  for (let i = 0; i < FREE_MODELS.length; i++) {
    const model = FREE_MODELS[i];

    try {
      console.log(`🤖 Trying model: ${model} (${i + 1}/${FREE_MODELS.length})`);

      const url = `${GEMINI_API_URL}/${model}:generateContent`;

      const body = {
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          responseMimeType: "application/json",
        },
      };

      if (systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMsg = error.error?.message || `HTTP ${response.status}`;

        // Check if it's a rate limit error
        if (
          response.status === 429 ||
          errorMsg.includes("quota") ||
          errorMsg.includes("rate limit")
        ) {
          console.warn(`⚠️ Rate limit hit for ${model}, trying next model...`);
          lastError = new Error(`Rate limit: ${errorMsg}`);
          continue; // Try next model
        }

        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response from Gemini");
      }

      const content = data.candidates[0].content.parts[0].text;

      console.log(`✅ Success with model: ${model}`);

      return {
        success: true,
        content,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0,
        },
        model: model,
      };
    } catch (error) {
      console.error(`❌ ${model} failed:`, error.message);
      lastError = error;

      // If it's the last model, throw the error
      if (i === FREE_MODELS.length - 1) {
        break;
      }

      // Otherwise, continue to next model
      continue;
    }
  }

  // All models failed
  console.error("❌ All models failed");
  return {
    success: false,
    error: lastError?.message || "All models failed",
  };
};

/**
 * Generate course catalog with Gemini
 */
export const generateCourseCatalogGemini = async (userProfile) => {
  const prompt = `You are an expert educational content designer. Generate 3 personalized coding courses for a learner with the following profile:

Learning Goal: ${userProfile.learning_goal}
Skill Level: ${userProfile.skill_level}
Career Goal: ${userProfile.goal}
Time Commitment: ${userProfile.time_commitment}
Learning Style: ${userProfile.learning_style}

For each course, provide:
1. A compelling title (40-60 characters, specific and actionable)
2. A detailed description (150-250 characters, 2-3 sentences, mention real technologies and frameworks)
3. Difficulty level (MUST be exactly: "Beginner", "Intermediate", or "Advanced")
4. Estimated hours to complete (MUST be a number between 10-100)
5. Number of modules (MUST be a number between 4-8)
6. Potential platform tokens learner can earn (MUST be a number between 300-800)
7. 3-5 relevant tags (each tag 10-20 characters)

CRITICAL: All numeric fields MUST be actual numbers, not strings or letters.

Format response as valid JSON array with this exact structure:
[
  {
    "title": "Course Title",
    "description": "Detailed description between 150-250 characters",
    "difficulty": "Beginner",
    "estimatedHours": 30,
    "modulesCount": 6,
    "potentialTokens": 450,
    "tags": ["tag1", "tag2", "tag3"]
  }
]

Ensure courses are progressive in difficulty and aligned with the user's goals.`;

  const messages = [
    {
      role: "system",
      content:
        "You are an AI learning path designer following The Odin Project standards: practical, hands-on, project-based learning. Be PRECISE with numbers. Respond only with valid JSON.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await callGemini(messages, { temperature: 0.8 });

  if (!result.success) {
    return result;
  }

  try {
    // Clean the response - remove markdown code blocks if present
    let cleanContent = result.content.trim();
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const courses = JSON.parse(cleanContent);
    return {
      success: true,
      courses,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch (parseError) {
    console.error("❌ Failed to parse course catalog:", parseError);
    console.error("Raw response:", result.content?.substring(0, 500));
    return {
      success: false,
      error: `Failed to parse AI response: ${parseError.message}`,
    };
  }
};

/**
 * Generate course structure (modules and lessons) with Gemini
 */
export const generateCourseStructureGemini = async (
  courseTitle,
  courseDescription,
  modulesCount,
) => {
  const prompt = `You are creating curriculum for a SERIOUS developer learning platform following The Odin Project methodology.

Course: "${courseTitle}"
Description: ${courseDescription}

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${modulesCount} modules - NO MORE, NO LESS
2. Each module must have 4-6 lessons (focused, practical lessons)
3. Each lesson should take 15-60 minutes of ACTUAL coding/reading time
4. Focus on BUILDING and DOING, not passive learning
5. Lessons should be progressive: basics → intermediate → advanced projects

QUALITY STANDARDS (The Odin Project philosophy):
- NO fluff or filler content
- Every lesson must teach something concrete and practical
- Focus on real-world developer skills
- Emphasize hands-on coding and project building
- Each module should culminate in a mini-project

IMPORTANT: Keep descriptions CONCISE (under 100 characters each).

Format as valid JSON with EXACTLY ${modulesCount} modules:
{
  "modules": [
    {
      "title": "Module Title (specific and actionable)",
      "description": "Brief: what students will BUILD (under 100 chars)",
      "lessons": [
        {
          "title": "Lesson Title",
          "estimatedMinutes": 30,
          "description": "Brief: what students will learn (under 80 chars)"
        }
      ]
    }
  ]
}

REMEMBER: EXACTLY ${modulesCount} modules. Count them before responding.`;

  const messages = [
    {
      role: "system",
      content:
        "You are an expert curriculum designer for a serious developer education platform. Follow The Odin Project standards: practical, hands-on, NO fluff. Respond only with valid JSON. Be PRECISE with numbers.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await callGemini(messages, {
    temperature: 0.7,
    maxTokens: 8000, // Increased for complete course structures
  });

  if (!result.success) {
    return result;
  }

  try {
    // Clean the response - sometimes Gemini wraps JSON in markdown code blocks
    let cleanContent = result.content.trim();

    // Remove markdown code blocks if present
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    console.log("🔍 Parsing course structure JSON...");
    const structure = JSON.parse(cleanContent);

    // VALIDATION: Ensure module count matches specification
    if (!structure.modules || structure.modules.length !== modulesCount) {
      console.warn(
        `AI generated ${structure.modules?.length || 0} modules, expected ${modulesCount}. ` +
          `This is a quality issue - the course metadata may need updating.`,
      );
    }

    // VALIDATION: Ensure each module has lessons
    const validModules = structure.modules.filter(
      (m) => m.lessons && m.lessons.length > 0,
    );
    if (validModules.length !== structure.modules.length) {
      console.error("Some modules have no lessons - AI hallucination detected");
      return {
        success: false,
        error: "Invalid course structure: some modules have no lessons",
      };
    }

    // Add unique IDs to modules and lessons for better tracking
    const modulesWithIds = structure.modules.map((module, moduleIndex) => ({
      ...module,
      id: `module-${moduleIndex + 1}`,
      lessons: module.lessons.map((lesson, lessonIndex) => ({
        ...lesson,
        id: `module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`,
        type: lesson.type || "reading", // Default type
      })),
    }));

    return {
      success: true,
      modules: modulesWithIds,
      actualModuleCount: modulesWithIds.length,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch (parseError) {
    console.error("❌ Failed to parse course structure:", parseError);
    console.error("Raw response:", result.content?.substring(0, 500));
    return {
      success: false,
      error: `Failed to parse course structure: ${parseError.message}`,
    };
  }
};

/**
 * Generate lesson content with Gemini
 */
export const generateLessonContentGemini = async (
  courseTitle,
  moduleTitle,
  lessonTitle,
) => {
  const prompt = `Create comprehensive PROJECT-BASED lesson content following The Odin Project methodology:

Course: ${courseTitle}
Module: ${moduleTitle}
Lesson: ${lessonTitle}

IMPORTANT TEACHING PHILOSOPHY:
- This is TEXT-BASED learning (NO VIDEO RESOURCES)
- Focus on HANDS-ON CODING and BUILDING
- Include practical coding exercises and mini-projects
- Curate ONLY FREE, QUALITY external resources (MDN, official docs, freeCodeCamp, articles)
- Emphasize learning by doing, not passive consumption

Include:
1. Learning objectives (3-4 bullet points, focused on what students will BUILD)
2. Detailed explanation with practical code examples
3. Code snippets with proper syntax highlighting
4. Hands-on practice assignment or mini-project
5. Key takeaways (3-4 points)

Format as valid JSON:
{
  "objectives": ["objective 1", "objective 2"],
  "content": "Detailed markdown-formatted content with code examples",
  "keyTakeaways": ["takeaway 1", "takeaway 2"],
  "externalResources": [
    {
      "title": "Resource title",
      "url": "https://actual-url.com",
      "type": "documentation|article|tutorial",
      "description": "Why this resource is valuable"
    }
  ]
}

CRITICAL: Only include REAL, EXISTING resources with valid URLs. Acceptable sources: MDN, official documentation, freeCodeCamp, CSS Tricks, JavaScript.info, etc. NEVER include video resources.`;

  const messages = [
    {
      role: "system",
      content:
        "You are an expert technical educator. Provide accurate, real-world resources only. Respond with valid JSON.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await callGemini(messages, {
    temperature: 0.6,
    maxTokens: 4000,
  });

  if (!result.success) {
    return result;
  }

  try {
    let cleanContent = result.content.trim();
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const lessonData = JSON.parse(cleanContent);
    return {
      success: true,
      content: lessonData,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch (parseError) {
    console.error("❌ Failed to parse lesson content:", parseError);
    console.error("Raw response:", result.content?.substring(0, 500));
    return {
      success: false,
      error: `Failed to parse lesson content: ${parseError.message}`,
    };
  }
};

/**
 * Generate assessment with Gemini
 */
export const generateAssessmentGemini = async (lessonTitle, lessonContent) => {
  const prompt = `Create a practical assessment for this lesson following The Odin Project methodology:

Lesson: ${lessonTitle}
Content Summary: ${typeof lessonContent === "string" ? lessonContent.substring(0, 500) : JSON.stringify(lessonContent).substring(0, 500)}

ASSESSMENT PHILOSOPHY:
- Focus on PRACTICAL application, not memorization
- Test real-world coding skills
- Include hands-on exercises or small projects
- Mix of question types for comprehensive evaluation

Create 5-7 assessment items with:
- Mix of multiple choice, code challenges, and short answer questions
- Each question tests practical understanding
- Include explanations for correct answers
- Progressive difficulty

Format as valid JSON:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice|code_challenge|short_answer",
      "question": "Question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "correct option or answer",
      "explanation": "Why this is correct and how it applies"
    }
  ]
}`;

  const messages = [
    {
      role: "system",
      content:
        "You are an expert technical educator. Create practical, real-world assessments. Respond with valid JSON.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await callGemini(messages, {
    temperature: 0.5,
    maxTokens: 2000,
  });

  if (!result.success) {
    return result;
  }

  try {
    let cleanContent = result.content.trim();
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const assessment = JSON.parse(cleanContent);
    return {
      success: true,
      assessment,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch (parseError) {
    console.error("❌ Failed to parse assessment:", parseError);
    console.error("Raw response:", result.content?.substring(0, 500));
    return {
      success: false,
      error: `Failed to parse assessment: ${parseError.message}`,
    };
  }
};

/**
 * Review user submission with Gemini
 */
export const reviewSubmissionGemini = async (
  assessmentType,
  question,
  userAnswer,
) => {
  const prompt = `Review this student's submission with constructive, educational feedback:

Question Type: ${assessmentType}
Question: ${question}
Student's Answer: ${userAnswer}

Provide:
1. Assessment (correct/partially correct/incorrect)
2. Detailed feedback explaining what's right/wrong
3. Specific suggestions for improvement
4. Encouragement and next steps

Be supportive but honest. Focus on learning, not just grades.

Format as valid JSON:
{
  "isCorrect": true/false,
  "score": 0-100,
  "feedback": "Detailed constructive feedback",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "encouragement": "Positive message"
}`;

  const messages = [
    {
      role: "system",
      content:
        "You are a supportive technical educator providing constructive code reviews. Respond with valid JSON.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await callGemini(messages, {
    temperature: 0.3,
    maxTokens: 1000,
  });

  if (!result.success) {
    return result;
  }

  try {
    let cleanContent = result.content.trim();
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    const review = JSON.parse(cleanContent);
    return {
      success: true,
      review,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch (parseError) {
    console.error("❌ Failed to parse review:", parseError);
    console.error("Raw response:", result.content?.substring(0, 500));
    return {
      success: false,
      error: `Failed to parse review: ${parseError.message}`,
    };
  }
};

/**
 * Review entire assessment submission in a single batch call
 */
export const reviewSubmissionBatchGemini = async (
  questions,
  submissionAnswers,
) => {
  // Debug: Log what we're receiving
  console.log("📋 Questions:", questions.map(q => ({ id: q.id, type: q.type })));
  console.log("📝 Submission answers:", submissionAnswers);

  // Build structured format with all Q&A pairs, mapping indices to actual answers
  const questionsData = questions
    .map((q, idx) => {
      let answerText = submissionAnswers[q.id];
      
      console.log(`Q${idx + 1} (${q.id}): Got answer:`, answerText, "Type:", q.type);

      // For multiple choice, map index to the actual option text
      if (q.type === "multiple_choice" && answerText !== undefined) {
        const answerIndex = parseInt(answerText);
        if (!isNaN(answerIndex) && q.options && q.options[answerIndex]) {
          const originalAnswer = answerText;
          answerText = q.options[answerIndex];
          console.log(`  Mapped index ${originalAnswer} -> "${answerText}"`);
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
  
  console.log("📤 Sending to Gemini:", questionsData.substring(0, 300));

  const prompt = `Review this student's assessment submission. For EACH question, provide feedback.

ASSESSMENT QUESTIONS AND ANSWERS:
${questionsData}

For each question:
1. Is the answer correct, partially correct, or incorrect?
2. Key strengths
3. What to improve
4. Next steps


IMPORTANT: 
- Use "You" and "Your" (personalized)
- Be CONCISE. Max 1-2 sentences per field.
- Return ONLY valid JSON. Keep all text on single lines. Do NOT add line breaks inside strings.

Format:
{
  "passed": true/false,
  "overallScore": 0-100,
  "reviewedQuestions": [
    {
      "questionId": "id",
      "questionText": "question text",
      "questionType": "type",
      "score": 0-100,
      "isCorrect": true/false,
      "feedback": "You [did/didn't] understand X because Y. Your answer was clear.",
      "suggestions": ["Fix this", "Try that"],
      "encouragement": "Keep going"
    }
  ],
  "overallFeedback": "Your overall score is X%. You got Y right."
}`;

  const messages = [
    {
      role: "system",
      content:
        "You are a concise technical educator. Provide brief, personalized feedback using 'You' and 'Your'. Be direct and avoid long explanations. Respond with valid JSON only.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await callGemini(messages, {
    temperature: 0.3,
    maxTokens: 3000,
  });

  if (!result.success) {
    return result;
  }

  try {
    let cleanContent = result.content.trim();

    // Remove markdown code blocks if present
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }

    // Fix unescaped newlines inside JSON strings
    // This regex finds newlines that are not preceded by a backslash and replaces them with \n
    cleanContent = cleanContent.replace(/([^\\])\n/g, "$1\\n");

    // Handle newline at the start
    if (cleanContent.startsWith("\n")) {
      cleanContent = cleanContent.replace(/^\n/, "\\n");
    }

    const review = JSON.parse(cleanContent);
    return {
      success: true,
      review,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch (parseError) {
    console.error("❌ Failed to parse batch review:", parseError);
    console.error(
      "Raw response (first 800 chars):",
      result.content?.substring(0, 800),
    );
    return {
      success: false,
      error: `Failed to parse batch review: ${parseError.message}`,
    };
  }
};
