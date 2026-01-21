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
  // "gemini-2.5-flash", // Backup: 5 RPM, hybrid reasoning
  // "gemini-2.0-flash", // Backup: good rate limits
  // "gemini-2.0-flash-lite", // Last resort: smallest model
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
 * AI determines optimal course count based on learning goal complexity
 */
export const generateCourseCatalogGemini = async (userProfile) => {
  const prompt = `You are an expert educational content designer creating a PERSONALIZED learning path.

=== ANTI-HALLUCINATION PROTOCOL (MANDATORY) ===
YOU MUST NEVER:
- Invent frameworks, libraries, or tools that don't exist
- Create fictional concepts or terminology
- Reference non-existent documentation or resources
- Make up technologies or version numbers
- Suggest courses for technologies the user didn't express interest in

YOU MUST ONLY:
- Use well-established, documented technologies (React, Node.js, Python, etc.)
- Reference real, verifiable frameworks and tools
- Create courses that directly address the user's stated learning goal
- Base content on real-world industry requirements

=== LEARNER PROFILE ===
Learning Goal: ${userProfile.learning_goal}
Skill Level: ${userProfile.skill_level}
Career Goal: ${userProfile.goal}
Time Commitment: ${userProfile.time_commitment}
Learning Style: ${userProfile.learning_style}

=== TASK ===
Generate a comprehensive learning path with the courses needed to achieve the learner's goal.
Minimum 3 courses, but generate as many as needed to properly cover the learning goal.
For complex goals like "full-stack development", generate 5-8 courses.
For focused goals, 3-4 courses may suffice.

COURSE REQUIREMENTS:
1. Title: 40-60 characters, specific and actionable (e.g., "Build REST APIs with Node.js & Express")
2. Description: 150-250 characters, 2-3 sentences, mention REAL technologies only
3. Difficulty: EXACTLY one of "Beginner", "Intermediate", or "Advanced"
4. Estimated hours: Number between 10-100 (realistic for the content)
5. Modules count: Number between 4-8 (based on topic complexity)
6. Potential tokens: Number between 300-800
7. Tags: 3-5 relevant tags (10-20 characters each)

LEARNING PATH LOGIC:
- Course 1: Foundation skills for the stated learning goal
- Course 2-N: Progressive complexity building toward career goal
- Each course should logically follow the previous
- Final course should be project-focused for portfolio building

=== RESPONSE FORMAT (USE THESE EXACT DELIMITERS) ===
For each course, use these delimiters:

<<<COURSE>>>
<<<TITLE>>>
Course title here (40-60 characters)
<<<DESCRIPTION>>>
Course description here (150-250 characters)
<<<DIFFICULTY>>>
Beginner | Intermediate | Advanced
<<<HOURS>>>
Number between 10-100
<<<MODULES_COUNT>>>
Number between 4-8
<<<TOKENS>>>
Number between 300-800
<<<TAGS>>>
- tag1
- tag2
- tag3

Generate at least 3 courses. Include more if the learning goal requires comprehensive coverage.`;

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

  const result = await callGemini(messages, { temperature: 0.8 });

  if (!result.success) {
    return result;
  }

  try {
    const courses = parseCourseCatalog(result.content);
    if (courses.length === 0) {
      throw new Error("No courses parsed from response");
    }
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

=== ANTI-HALLUCINATION PROTOCOL (MANDATORY) ===
YOU MUST NEVER:
- Invent frameworks, libraries, or tools that don't exist
- Create fictional concepts or terminology
- Reference non-existent documentation or resources
- Make up version numbers or release dates
- Fabricate best practices that aren't widely recognized

YOU MUST ONLY:
- Use well-established, documented technologies
- Reference real, verifiable concepts from official documentation
- Follow industry-standard practices with proven track records
- Base content on MDN, official docs, and recognized educational sources

=== STRICT STRUCTURE REQUIREMENTS ===
1. Generate EXACTLY ${modulesCount} modules - NO MORE, NO LESS
2. Each module: 5-7 lessons (realistic, comprehensive progression)
3. Lesson types MUST follow The Odin Project pattern:
   - "reading": Theory, concepts, documentation study (30-45min)
   - "practice": Hands-on coding exercises (45-60min)
   - "project": Build real applications (2-4 hours)
4. Module structure MUST be:
   - Lesson 1-2: "reading" (foundation)
   - Lesson 3-5: "practice" (application)
   - Lesson 6-7: "project" (synthesis)

=== COMPREHENSIVE LEARNING PATH ===
- Each topic must be covered deeply enough for real-world application
- Include prerequisite concepts explicitly
- Build complexity gradually with clear progression
- Focus on UNDERSTANDING over memorization
- Connect concepts to practical use cases

=== ASSESSMENT PHILOSOPHY (STRICT) ===
ONLY 30-40% of lessons should have assessments:
- "reading" lessons: NO assessment (comprehension comes from practice)
- "practice" lessons: coding_challenge (every 2nd practice lesson)
- "project" lessons: ALWAYS project assessment
- Module intro/overview: NEVER assessed

=== RESPONSE FORMAT (USE THESE EXACT DELIMITERS) ===
For each module and lesson, use these delimiters:

<<<MODULE>>>
<<<MODULE_TITLE>>>
Module title here
<<<MODULE_DESCRIPTION>>>
What students will BUILD and UNDERSTAND (under 120 chars)
<<<LESSON>>>
<<<LESSON_TITLE>>>
Lesson title here
<<<LESSON_TYPE>>>
reading | practice | project
<<<LESSON_MINUTES>>>
30-240
<<<LESSON_DESCRIPTION>>>
Concrete learning outcome (under 100 chars)
<<<REQUIRES_ASSESSMENT>>>
true | false
<<<ASSESSMENT_TYPE>>>
coding_challenge | project | null

Repeat <<<LESSON>>> block for each lesson in the module.
Repeat <<<MODULE>>> block for each module.

FINAL CHECK: Count your modules. Must be EXACTLY ${modulesCount}.`;

  const messages = [
    {
      role: "system",
      content:
        "You are an expert curriculum designer for a serious developer education platform. Follow The Odin Project standards: practical, hands-on, NO fluff. Use the exact delimiter format specified.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await callGemini(messages, {
    temperature: 0.7,
    maxTokens: 8000,
  });

  if (!result.success) {
    return result;
  }

  try {
    console.log("🔍 Parsing course structure with delimiters...");
    const structure = parseCourseStructure(result.content);

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
    if (validModules.length === 0) {
      console.error("No valid modules parsed - parsing failed");
      return {
        success: false,
        error: "Invalid course structure: no modules with lessons found",
      };
    }

    // Add defaults for missing fields
    const modulesWithDefaults = structure.modules.map(
      (module, moduleIndex) => ({
        ...module,
        id: module.id || `module-${moduleIndex + 1}`,
        lessons: module.lessons.map((lesson, lessonIndex) => ({
          ...lesson,
          id:
            lesson.id || `module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`,
          type: lesson.type || "reading",
          requiresAssessment: lesson.requiresAssessment ?? lessonIndex > 0,
          assessmentType:
            lesson.assessmentType ||
            (lessonIndex === module.lessons.length - 1
              ? "project"
              : "coding_challenge"),
        })),
      }),
    );

    return {
      success: true,
      modules: modulesWithDefaults,
      actualModuleCount: modulesWithDefaults.length,
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
 * Parse delimiter-based lesson content into structured object
 */
const parseLessonContent = (rawContent) => {
  const sections = {};

  // Split by section delimiters
  const sectionRegex = /<<<(OBJECTIVES|CONTENT|KEY_TAKEAWAYS|RESOURCES)>>>/g;
  const parts = rawContent.split(sectionRegex);

  let currentSection = null;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (
      ["OBJECTIVES", "CONTENT", "KEY_TAKEAWAYS", "RESOURCES"].includes(part)
    ) {
      currentSection = part;
    } else if (currentSection && part) {
      sections[currentSection] = part;
    }
  }

  // Parse objectives (bullet points)
  const objectives = [];
  if (sections.OBJECTIVES) {
    const lines = sections.OBJECTIVES.split("\n");
    for (const line of lines) {
      const cleaned = line.replace(/^[-*•]\s*/, "").trim();
      if (cleaned) objectives.push(cleaned);
    }
  }

  // Content is already markdown
  const content = sections.CONTENT || "";

  // Parse key takeaways (bullet points)
  const keyTakeaways = [];
  if (sections.KEY_TAKEAWAYS) {
    const lines = sections.KEY_TAKEAWAYS.split("\n");
    for (const line of lines) {
      const cleaned = line.replace(/^[-*•]\s*/, "").trim();
      if (cleaned) keyTakeaways.push(cleaned);
    }
  }

  // Parse external resources (simple format: Title | URL | Description)
  const externalResources = [];
  if (sections.RESOURCES) {
    const lines = sections.RESOURCES.split("\n");
    for (const line of lines) {
      const cleaned = line.replace(/^[-*•]\s*/, "").trim();
      if (cleaned) {
        const parts = cleaned.split("|").map((p) => p.trim());
        if (parts.length >= 2) {
          externalResources.push({
            title: parts[0],
            url: parts[1],
            type: "documentation",
            description: parts[2] || "",
          });
        }
      }
    }
  }

  return { objectives, content, keyTakeaways, externalResources };
};

/**
 * Parse delimiter-based course catalog into array of courses
 */
const parseCourseCatalog = (rawContent) => {
  const courses = [];
  const courseBlocks = rawContent
    .split("<<<COURSE>>>")
    .filter((block) => block.trim());

  for (const block of courseBlocks) {
    const course = {};

    // Extract each field using regex
    const titleMatch = block.match(/<<<TITLE>>>([\\s\\S]*?)(?=<<<|$)/);
    const descMatch = block.match(/<<<DESCRIPTION>>>([\\s\\S]*?)(?=<<<|$)/);
    const difficultyMatch = block.match(
      /<<<DIFFICULTY>>>([\\s\\S]*?)(?=<<<|$)/,
    );
    const hoursMatch = block.match(/<<<HOURS>>>([\\s\\S]*?)(?=<<<|$)/);
    const modulesMatch = block.match(
      /<<<MODULES_COUNT>>>([\\s\\S]*?)(?=<<<|$)/,
    );
    const tokensMatch = block.match(/<<<TOKENS>>>([\\s\\S]*?)(?=<<<|$)/);
    const tagsMatch = block.match(/<<<TAGS>>>([\\s\\S]*?)(?=<<<|$)/);

    if (titleMatch) course.title = titleMatch[1].trim();
    if (descMatch) course.description = descMatch[1].trim();
    if (difficultyMatch) course.difficulty = difficultyMatch[1].trim();
    if (hoursMatch)
      course.estimatedHours = parseInt(hoursMatch[1].trim()) || 30;
    if (modulesMatch)
      course.modulesCount = parseInt(modulesMatch[1].trim()) || 5;
    if (tokensMatch)
      course.potentialTokens = parseInt(tokensMatch[1].trim()) || 450;
    if (tagsMatch) {
      course.tags = tagsMatch[1]
        .split("\n")
        .map((t) => t.replace(/^[-*•]\s*/, "").trim())
        .filter((t) => t);
    }

    if (course.title) courses.push(course);
  }

  return courses;
};

/**
 * Parse delimiter-based course structure into modules array
 */
const parseCourseStructure = (rawContent) => {
  const modules = [];
  const moduleBlocks = rawContent
    .split("<<<MODULE>>>")
    .filter((block) => block.trim());

  for (let moduleIndex = 0; moduleIndex < moduleBlocks.length; moduleIndex++) {
    const block = moduleBlocks[moduleIndex];
    const module = { lessons: [] };

    const titleMatch = block.match(/<<<MODULE_TITLE>>>([\\s\\S]*?)(?=<<<|$)/);
    const descMatch = block.match(
      /<<<MODULE_DESCRIPTION>>>([\\s\\S]*?)(?=<<<|$)/,
    );

    if (titleMatch) module.title = titleMatch[1].trim();
    if (descMatch) module.description = descMatch[1].trim();
    module.id = `module-${moduleIndex + 1}`;

    // Extract lessons
    const lessonBlocks = block
      .split("<<<LESSON>>>")
      .filter((l) => l.includes("<<<LESSON_TITLE>>>"));

    for (
      let lessonIndex = 0;
      lessonIndex < lessonBlocks.length;
      lessonIndex++
    ) {
      const lessonBlock = lessonBlocks[lessonIndex];
      const lesson = {};

      const lTitleMatch = lessonBlock.match(
        /<<<LESSON_TITLE>>>([\\s\\S]*?)(?=<<<|$)/,
      );
      const lTypeMatch = lessonBlock.match(
        /<<<LESSON_TYPE>>>([\\s\\S]*?)(?=<<<|$)/,
      );
      const lMinutesMatch = lessonBlock.match(
        /<<<LESSON_MINUTES>>>([\\s\\S]*?)(?=<<<|$)/,
      );
      const lDescMatch = lessonBlock.match(
        /<<<LESSON_DESCRIPTION>>>([\\s\\S]*?)(?=<<<|$)/,
      );
      const lAssessMatch = lessonBlock.match(
        /<<<REQUIRES_ASSESSMENT>>>([\\s\\S]*?)(?=<<<|$)/,
      );
      const lAssessTypeMatch = lessonBlock.match(
        /<<<ASSESSMENT_TYPE>>>([\\s\\S]*?)(?=<<<|$)/,
      );

      if (lTitleMatch) lesson.title = lTitleMatch[1].trim();
      if (lTypeMatch) lesson.type = lTypeMatch[1].trim().toLowerCase();
      if (lMinutesMatch)
        lesson.estimatedMinutes = parseInt(lMinutesMatch[1].trim()) || 30;
      if (lDescMatch) lesson.description = lDescMatch[1].trim();
      lesson.id = `module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`;

      const assessValue = lAssessMatch
        ? lAssessMatch[1].trim().toLowerCase()
        : "false";
      lesson.requiresAssessment =
        assessValue === "true" || assessValue === "yes";
      lesson.assessmentType = lAssessTypeMatch
        ? lAssessTypeMatch[1].trim()
        : null;
      if (
        lesson.assessmentType === "null" ||
        lesson.assessmentType === "none"
      ) {
        lesson.assessmentType = null;
      }

      if (lesson.title) module.lessons.push(lesson);
    }

    if (module.title && module.lessons.length > 0) modules.push(module);
  }

  return { modules };
};

/**
 * Parse delimiter-based assessment into questions array
 */
const parseAssessment = (rawContent) => {
  const questions = [];
  const questionBlocks = rawContent
    .split("<<<QUESTION>>>")
    .filter((block) => block.trim());

  for (let i = 0; i < questionBlocks.length; i++) {
    const block = questionBlocks[i];
    const question = { id: `q${i + 1}` };

    const typeMatch = block.match(/<<<TYPE>>>([\\s\\S]*?)(?=<<<|$)/);
    const textMatch = block.match(/<<<TEXT>>>([\\s\\S]*?)(?=<<<|$)/);
    const optionsMatch = block.match(/<<<OPTIONS>>>([\\s\\S]*?)(?=<<<|$)/);
    const correctMatch = block.match(/<<<CORRECT>>>([\\s\\S]*?)(?=<<<|$)/);
    const starterMatch = block.match(/<<<STARTER_CODE>>>([\\s\\S]*?)(?=<<<|$)/);
    const testCasesMatch = block.match(/<<<TEST_CASES>>>([\\s\\S]*?)(?=<<<|$)/);
    const hintsMatch = block.match(/<<<HINTS>>>([\\s\\S]*?)(?=<<<|$)/);
    const pointsMatch = block.match(/<<<POINTS>>>([\\s\\S]*?)(?=<<<|$)/);

    if (typeMatch) question.type = typeMatch[1].trim();
    if (textMatch) question.question = textMatch[1].trim();
    if (pointsMatch) question.points = parseInt(pointsMatch[1].trim()) || 20;

    if (optionsMatch) {
      question.options = optionsMatch[1]
        .split("\n")
        .map((o) => o.replace(/^[-*•\\d.)]\\s*/, "").trim())
        .filter((o) => o);
    }

    if (correctMatch) {
      const val = correctMatch[1].trim();
      question.correctAnswer = isNaN(parseInt(val)) ? val : parseInt(val);
    }

    if (starterMatch) question.starterCode = starterMatch[1].trim();

    if (testCasesMatch) {
      question.testCases = testCasesMatch[1]
        .split("\n")
        .map((t) => t.trim())
        .filter((t) => t);
    }

    if (hintsMatch) {
      question.hints = hintsMatch[1]
        .split("\n")
        .map((h) => h.replace(/^[-*•\\d.)]\\s*/, "").trim())
        .filter((h) => h);
    }

    if (question.type && question.question) questions.push(question);
  }

  return { questions };
};

/**
 * Parse delimiter-based review into structured feedback
 */
const parseReview = (rawContent) => {
  const review = { reviewedQuestions: [] };

  const passedMatch = rawContent.match(/<<<PASSED>>>([\\s\\S]*?)(?=<<<|$)/);
  const scoreMatch = rawContent.match(
    /<<<OVERALL_SCORE>>>([\\s\\S]*?)(?=<<<|$)/,
  );
  const overallFeedbackMatch = rawContent.match(
    /<<<OVERALL_FEEDBACK>>>([\\s\\S]*?)(?=<<<|$)/,
  );

  if (passedMatch) {
    const val = passedMatch[1].trim().toLowerCase();
    review.passed = val === "true" || val === "yes";
  }
  if (scoreMatch) review.overallScore = parseInt(scoreMatch[1].trim()) || 0;
  if (overallFeedbackMatch)
    review.overallFeedback = overallFeedbackMatch[1].trim();

  // Extract individual question reviews
  const questionBlocks = rawContent
    .split("<<<QUESTION_REVIEW>>>")
    .filter((block) => block.includes("<<<QUESTION_ID>>>"));

  for (const block of questionBlocks) {
    const qReview = {};

    const idMatch = block.match(/<<<QUESTION_ID>>>([\\s\\S]*?)(?=<<<|$)/);
    const textMatch = block.match(/<<<QUESTION_TEXT>>>([\\s\\S]*?)(?=<<<|$)/);
    const typeMatch = block.match(/<<<QUESTION_TYPE>>>([\\s\\S]*?)(?=<<<|$)/);
    const qScoreMatch = block.match(/<<<SCORE>>>([\\s\\S]*?)(?=<<<|$)/);
    const correctMatch = block.match(/<<<IS_CORRECT>>>([\\s\\S]*?)(?=<<<|$)/);
    const feedbackMatch = block.match(/<<<FEEDBACK>>>([\\s\\S]*?)(?=<<<|$)/);
    const suggestionsMatch = block.match(
      /<<<SUGGESTIONS>>>([\\s\\S]*?)(?=<<<|$)/,
    );
    const encouragementMatch = block.match(
      /<<<ENCOURAGEMENT>>>([\\s\\S]*?)(?=<<<|$)/,
    );

    if (idMatch) qReview.questionId = idMatch[1].trim();
    if (textMatch) qReview.questionText = textMatch[1].trim();
    if (typeMatch) qReview.questionType = typeMatch[1].trim();
    if (qScoreMatch) qReview.score = parseInt(qScoreMatch[1].trim()) || 0;
    if (correctMatch) {
      const val = correctMatch[1].trim().toLowerCase();
      qReview.isCorrect = val === "true" || val === "yes";
    }
    if (feedbackMatch) qReview.feedback = feedbackMatch[1].trim();
    if (suggestionsMatch) {
      qReview.suggestions = suggestionsMatch[1]
        .split("\n")
        .map((s) => s.replace(/^[-*•\\d.)]\\s*/, "").trim())
        .filter((s) => s);
    }
    if (encouragementMatch)
      qReview.encouragement = encouragementMatch[1].trim();

    if (qReview.questionId) review.reviewedQuestions.push(qReview);
  }

  return review;
};

/**
 * Generate lesson content with Gemini
 */
export const generateLessonContentGemini = async (
  courseTitle,
  moduleTitle,
  lessonTitle,
) => {
  const prompt = `Create comprehensive, REALISTIC lesson content following The Odin Project methodology.

Course: ${courseTitle}
Module: ${moduleTitle}
Lesson: ${lessonTitle}

=== ANTI-HALLUCINATION PROTOCOL (MANDATORY) ===
YOU MUST NEVER:
- Invent APIs, methods, or functions that don't exist
- Create fictional code examples that won't work
- Reference non-existent npm packages or libraries
- Make up syntax or language features
- Cite fake documentation or resources

YOU MUST ONLY:
- Use actual, documented JavaScript/Web APIs
- Provide working code examples from real-world use
- Reference official documentation (MDN, Node.js docs, React docs)
- Use standard, widely-adopted patterns and practices

=== THE ODIN PROJECT TEACHING STYLE ===
- TEXT-BASED learning (NO VIDEOS - link to written docs only)
- Deep understanding over surface-level knowledge
- Comprehensive explanations with "why" not just "how"
- Real-world context for every concept
- Progressive complexity with clear prerequisites

=== RESPONSE FORMAT (USE THESE EXACT DELIMITERS) ===

<<<OBJECTIVES>>>
- Understand [specific concept] and when to use it in real projects
- Build [concrete thing] using [specific techniques]
- Debug and solve [common real-world problems]

<<<CONTENT>>>
## Introduction

[Why this topic matters in professional development - 2-3 paragraphs]

## Prerequisites

[What you need to know first]

## Core Concepts

[Detailed, comprehensive explanations]

### Concept 1: [Name]

[Deep dive with examples]

\`\`\`javascript
// Working, tested code that actually runs
\`\`\`

## Practical Examples

[Real-world use cases with code]

## Common Pitfalls

[What to watch out for]

## Best Practices

[Industry-standard approaches]

## Assignment

### Task
[Build something useful]

### Requirements
- Requirement 1
- Requirement 2

### Getting Started
[Hints and guidance]

<<<KEY_TAKEAWAYS>>>
- Specific, actionable understanding gained
- Concrete skill acquired with real application
- Common problem you can now solve

<<<RESOURCES>>>
- MDN: Document Object Model | https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model | Core reference for DOM manipulation
- JavaScript.info: DOM Navigation | https://javascript.info/dom-navigation | Detailed guide on traversing DOM

=== EXTERNAL RESOURCES (STRICT VERIFICATION) ===
ONLY include resources from these VERIFIED sources:
- MDN Web Docs (developer.mozilla.org)
- Official framework docs (reactjs.org, nodejs.org, etc.)
- JavaScript.info
- Web.dev (by Google)
- CSS-Tricks (css-tricks.com)

NEVER include:
- YouTube videos or any video content
- Medium articles
- Personal blogs
- Paid resources
- Made-up URLs

CRITICAL VALIDATION:
- Every code example MUST use real, documented syntax
- Every URL MUST be from verified sources above
- Content MUST be comprehensive enough for real-world use
- Minimum 1000 words of substantial educational content`;

  const messages = [
    {
      role: "system",
      content:
        "You are an expert technical educator. Use the exact delimiter format specified. Write natural markdown content between delimiters.",
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
    const lessonData = parseLessonContent(result.content);

    // Validate we got content
    if (!lessonData.content || lessonData.content.length < 100) {
      console.error("❌ Lesson content too short or missing");
      return {
        success: false,
        error: "Generated lesson content was too short or empty",
      };
    }

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
export const generateAssessmentGemini = async (
  lessonTitle,
  lessonContent,
  assessmentType = "coding_challenge",
) => {
  let prompt = "";

  if (assessmentType === "quiz") {
    prompt = `Create a QUIZ assessment for this lesson:

Lesson: ${lessonTitle}
Content Summary: ${typeof lessonContent === "string" ? lessonContent.substring(0, 500) : JSON.stringify(lessonContent).substring(0, 500)}

Create 5-7 multiple choice questions:
- Test conceptual understanding
- 4 options per question
- Include explanations
- Progressive difficulty

=== RESPONSE FORMAT (USE THESE EXACT DELIMITERS) ===
For each question, use these delimiters:

<<<QUESTION>>>
<<<TYPE>>>
multiple_choice
<<<TEXT>>>
The question text here
<<<OPTIONS>>>
- Option 1
- Option 2
- Option 3
- Option 4
<<<CORRECT>>>
The correct option text or index (0-3)
<<<POINTS>>>
10`;
  } else if (assessmentType === "project") {
    prompt = `Create PROJECT requirements for this lesson:

Lesson: ${lessonTitle}
Content Summary: ${typeof lessonContent === "string" ? lessonContent.substring(0, 500) : JSON.stringify(lessonContent).substring(0, 500)}

Create project specifications:
- Clear must-have features
- Optional stretch goals
- Tech stack suggestions
- Evaluation criteria

=== RESPONSE FORMAT (USE THESE EXACT DELIMITERS) ===

<<<QUESTION>>>
<<<TYPE>>>
project
<<<TEXT>>>
Build a project that demonstrates the concepts from this lesson
<<<HINTS>>>
- requirement 1
- requirement 2
- requirement 3
<<<TEST_CASES>>>
stretch goal 1
stretch goal 2
<<<STARTER_CODE>>>
Submission format: GitHub repository URL required. Live deployment optional.
<<<POINTS>>>
100`;
  } else {
    // Default: coding_challenge
    prompt = `Create CODING CHALLENGE assessment for this lesson:

Lesson: ${lessonTitle}
Content Summary: ${typeof lessonContent === "string" ? lessonContent.substring(0, 500) : JSON.stringify(lessonContent).substring(0, 500)}

Create 3-5 coding challenges:
- Test practical application
- Include starter code or template
- Provide clear requirements
- Each worth points

=== RESPONSE FORMAT (USE THESE EXACT DELIMITERS) ===
For each question, use these delimiters:

<<<QUESTION>>>
<<<TYPE>>>
code_challenge
<<<TEXT>>>
Write a function that...
<<<STARTER_CODE>>>
function solution() {
  // Your code here
}
<<<TEST_CASES>>>
input1 -> expected output1
input2 -> expected output2
<<<HINTS>>>
- Consider edge cases
- Think about efficiency
<<<POINTS>>>
20`;
  }

  const messages = [
    {
      role: "system",
      content:
        "You are an expert technical educator. Create practical, real-world assessments. Use the exact delimiter format specified.",
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
    const assessment = parseAssessment(result.content);
    if (!assessment.questions || assessment.questions.length === 0) {
      throw new Error("No questions parsed from response");
    }
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
 * Review user submission with Gemini (deprecated - use batch review instead)
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

=== RESPONSE FORMAT (USE THESE EXACT DELIMITERS) ===
<<<PASSED>>>
true | false
<<<OVERALL_SCORE>>>
0-100
<<<OVERALL_FEEDBACK>>>
Your detailed feedback here
<<<QUESTION_REVIEW>>>
<<<QUESTION_ID>>>
q1
<<<QUESTION_TEXT>>>
The question text
<<<QUESTION_TYPE>>>
${assessmentType}
<<<SCORE>>>
0-100
<<<IS_CORRECT>>>
true | false
<<<FEEDBACK>>>
Your personalized feedback using You/Your
<<<SUGGESTIONS>>>
- suggestion 1
- suggestion 2
<<<ENCOURAGEMENT>>>
Positive message`;

  const messages = [
    {
      role: "system",
      content:
        "You are a supportive technical educator providing constructive code reviews. Use the exact delimiter format specified.",
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
    const review = parseReview(result.content);
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
  console.log(
    "📋 Questions:",
    questions.map((q) => ({ id: q.id, type: q.type })),
  );
  console.log("📝 Submission answers:", submissionAnswers);

  // Build structured format with all Q&A pairs, mapping indices to actual answers
  const questionsData = questions
    .map((q, idx) => {
      let answerText = submissionAnswers[q.id];

      console.log(
        `Q${idx + 1} (${q.id}): Got answer:`,
        answerText,
        "Type:",
        q.type,
      );

      // For multiple choice, map index to the actual option text
      if (q.type === "multiple_choice" && answerText !== undefined) {
        const answerIndex = parseInt(answerText);
        if (!isNaN(answerIndex) && q.options && q.options[answerIndex]) {
          const originalAnswer = answerText;
          answerText = q.options[answerIndex];
          console.log(`  Mapped index ${originalAnswer} -> "${answerText}"`);
        }
      }

      // For project submissions, format the object with repo and live URLs
      if (q.type === "project" && typeof answerText === "object" && answerText !== null) {
        const projectParts = [];
        if (answerText.repoUrl) projectParts.push(`GitHub Repository: ${answerText.repoUrl}`);
        if (answerText.liveUrl) projectParts.push(`Live Demo: ${answerText.liveUrl}`);
        answerText = projectParts.length > 0 ? projectParts.join("\n") : "[NO PROJECT LINKS PROVIDED]";
        console.log(`  Formatted project submission: ${answerText}`);
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

PASSING SCORE REQUIREMENT: 70% (Student must score >= 70 to pass)

For each question:
1. Is the answer correct, partially correct, or incorrect?
2. Key strengths
3. What to improve
4. Next steps

IMPORTANT: 
- Use "You" and "Your" (personalized)
- Be CONCISE. Max 1-2 sentences per field.
- Calculate overallScore as percentage of correct answers
- Set "passed" to true ONLY if overallScore >= 70

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

  const messages = [
    {
      role: "system",
      content:
        "You are a concise technical educator. Provide brief, personalized feedback using 'You' and 'Your'. Be direct and avoid long explanations. Use the exact delimiter format specified.",
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
    const review = parseReview(result.content);
    if (!review.reviewedQuestions || review.reviewedQuestions.length === 0) {
      // If no individual reviews parsed, try to at least get the overall score
      if (review.overallScore === undefined) {
        throw new Error("No review data parsed from response");
      }
    }
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
