/**
 * DeepSeek API Integration
 * Documentation: https://api-docs.deepseek.com/
 * Model: deepseek-chat (DeepSeek-V3.2 Non-thinking Mode)
 * Pricing: $0.28/1M input tokens, $0.42/1M output tokens
 */

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

/**
 * Call DeepSeek API
 */
export const callDeepSeek = async (messages, options = {}) => {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DeepSeek API key not configured");
  }

  const { temperature = 0.7, maxTokens = 4000, stream = false } = options;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      model: data.model,
    };
  } catch (error) {
    console.error("DeepSeek API error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate course catalog based on user profile
 */
export const generateCourseCatalog = async (userProfile) => {
  const prompt = `You are an expert educational content designer specializing in The Odin Project teaching methodology.

Generate 3 personalized PROJECT-BASED coding courses for:

Learning Goal: ${userProfile.learning_goal}
Skill Level: ${userProfile.skill_level}
Career Goal: ${userProfile.goal}
Time Commitment: ${userProfile.time_commitment}

IMPORTANT: Follow The Odin Project philosophy:
- Focus on BUILDING REAL PROJECTS, not passive learning
- Text-based curriculum with curated free resources
- Learning by doing, hands-on coding
- No video-based learning (reading + coding only)
- Each course should culminate in portfolio-worthy projects

For each course, provide:
1. A compelling title (specific and actionable)
2. A detailed description (2-3 sentences, mention real technologies and tangible projects students will build)
3. Difficulty level (Beginner, Intermediate, or Advanced)
4. Estimated hours to complete (realistic based on content depth)
5. Number of modules (4-8 modules)
6. Potential platform tokens learner can earn (300-800 range)
7. 3-5 relevant tags

Format response as valid JSON array with this exact structure:
[
  {
    "title": "Course Title",
    "description": "Detailed description",
    "difficulty": "Beginner|Intermediate|Advanced",
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
        "You are an AI learning path designer. Respond only with valid JSON, no markdown formatting.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await callDeepSeek(messages, { temperature: 0.8 });

  if (!result.success) {
    return result;
  }

  try {
    const courses = JSON.parse(result.content);
    return {
      success: true,
      courses,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch {
    return {
      success: false,
      error: "Failed to parse AI response",
    };
  }
};

/**
 * Generate course structure (modules and lessons)
 */
export const generateCourseStructure = async (
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

Format as valid JSON with EXACTLY ${modulesCount} modules:
{
  "modules": [
    {
      "title": "Module Title (specific and actionable)",
      "description": "What students will BUILD in this module",
      "lessons": [
        {
          "title": "Lesson Title",
          "estimatedMinutes": 30,
          "description": "What students will learn and build"
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

  const result = await callDeepSeek(messages, {
    temperature: 0.7,
    maxTokens: 3000,
  });

  if (!result.success) {
    return result;
  }

  try {
    const structure = JSON.parse(result.content);

    // VALIDATION: Ensure module count matches specification
    if (!structure.modules || structure.modules.length !== modulesCount) {
      console.warn(
        `AI generated ${structure.modules?.length || 0} modules, expected ${modulesCount}. ` +
          `This is a quality issue - the course metadata may need updating.`,
      );

      // If AI generated different count, still return but log the discrepancy
      // The calling code should update the course metadata to match reality
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

    return {
      success: true,
      modules: structure.modules,
      actualModuleCount: structure.modules.length,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch {
    return {
      success: false,
      error: "Failed to parse course structure",
    };
  }
};

/**
 * Generate lesson content
 */
export const generateLessonContent = async (
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

  const result = await callDeepSeek(messages, {
    temperature: 0.6,
    maxTokens: 4000,
  });

  if (!result.success) {
    return result;
  }

  try {
    const lessonData = JSON.parse(result.content);
    return {
      success: true,
      content: lessonData,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch {
    return {
      success: false,
      error: "Failed to parse lesson content",
    };
  }
};

/**
 * Generate assessment for a lesson
 */
export const generateAssessment = async (lessonTitle, lessonContent) => {
  const prompt = `Create an assessment for the lesson: "${lessonTitle}"

Lesson content summary: ${lessonContent.substring(0, 500)}...

Generate ONE assessment of appropriate type:
- quiz: Multiple choice questions (use for concepts, theory)
- coding_challenge: Code implementation task (use for programming skills)
- written: Short answer questions (use for explanations)
- project: Build something (use for practical application)

Format as valid JSON:
{
  "type": "quiz|coding_challenge|written|project",
  "title": "Assessment title",
  "description": "What the learner needs to do",
  "passingScore": 70,
  "questions": [
    {
      "question": "Question text",
      "type": "multiple_choice|code|text",
      "options": ["option1", "option2"],
      "correctAnswer": "answer or code solution",
      "points": 10,
      "explanation": "Why this is the correct answer"
    }
  ]
}

For coding challenges, include a starter template and test cases. For projects, specify deliverables.`;

  const messages = [
    {
      role: "system",
      content:
        "You are an assessment designer. Create fair, educational assessments. Respond with valid JSON.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await callDeepSeek(messages, {
    temperature: 0.5,
    maxTokens: 2000,
  });

  if (!result.success) {
    return result;
  }

  try {
    const assessment = JSON.parse(result.content);
    return {
      success: true,
      assessment,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch {
    return {
      success: false,
      error: "Failed to parse assessment",
    };
  }
};

/**
 * Review user submission
 */
export const reviewSubmission = async (
  assessmentType,
  question,
  userAnswer,
) => {
  const prompt = `Review this ${assessmentType} submission:

Question: ${question}
User Answer: ${userAnswer}

Provide:
1. Is it correct? (true/false)
2. Score (0-100)
3. Detailed feedback (constructive, specific)
4. Suggestions for improvement (if applicable)

Format as valid JSON:
{
  "isCorrect": true,
  "score": 85,
  "feedback": "Detailed feedback",
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

  const messages = [
    {
      role: "system",
      content:
        "You are a patient, constructive code reviewer. Be encouraging but honest.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await callDeepSeek(messages, {
    temperature: 0.3,
    maxTokens: 1000,
  });

  if (!result.success) {
    return result;
  }

  try {
    const review = JSON.parse(result.content);
    return {
      success: true,
      review,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch {
    return {
      success: false,
      error: "Failed to parse review",
    };
  }
};
