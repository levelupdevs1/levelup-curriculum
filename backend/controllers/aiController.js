import { validateProjectSubmission } from "../../src/services/projectValidationService.js";
import { generateContent } from "../config/gemini.js";

const parseCourseCatalog = (rawContent) => {
  const courses = [];
  const courseBlocks = rawContent
    .split("<<<COURSE>>>")
    .filter((block) => block.trim());

  for (const block of courseBlocks) {
    const course = {};

    const titleMatch = block.match(/<<<TITLE>>>([\s\S]*?)(?=<<<|$)/);
    const descMatch = block.match(/<<<DESCRIPTION>>>([\s\S]*?)(?=<<<|$)/);
    const difficultyMatch = block.match(/<<<DIFFICULTY>>>([\s\S]*?)(?=<<<|$)/);
    const hoursMatch = block.match(/<<<HOURS>>>([\s\S]*?)(?=<<<|$)/);
    const modulesMatch = block.match(/<<<MODULES_COUNT>>>([\s\S]*?)(?=<<<|$)/);
    const tokensMatch = block.match(/<<<TOKENS>>>([\s\S]*?)(?=<<<|$)/);
    const tagsMatch = block.match(/<<<TAGS>>>([\s\S]*?)(?=<<<|$)/);

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

const parseCourseStructure = (rawContent) => {
  const modules = [];
  const moduleBlocks = rawContent
    .split("<<<MODULE>>>")
    .filter((block) => block.trim());

  for (let moduleIndex = 0; moduleIndex < moduleBlocks.length; moduleIndex++) {
    const block = moduleBlocks[moduleIndex];
    const module = { lessons: [] };

    const titleMatch = block.match(/<<<MODULE_TITLE>>>([\s\S]*?)(?=<<<|$)/);
    const descMatch = block.match(
      /<<<MODULE_DESCRIPTION>>>([\s\S]*?)(?=<<<|$)/,
    );

    if (titleMatch) module.title = titleMatch[1].trim();
    if (descMatch) module.description = descMatch[1].trim();
    module.id = `module-${moduleIndex + 1}`;

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
        /<<<LESSON_TITLE>>>([\s\S]*?)(?=<<<|$)/,
      );
      const lTypeMatch = lessonBlock.match(
        /<<<LESSON_TYPE>>>([\s\S]*?)(?=<<<|$)/,
      );
      const lMinutesMatch = lessonBlock.match(
        /<<<LESSON_MINUTES>>>([\s\S]*?)(?=<<<|$)/,
      );
      const lDescMatch = lessonBlock.match(
        /<<<LESSON_DESCRIPTION>>>([\s\S]*?)(?=<<<|$)/,
      );
      const lAssessMatch = lessonBlock.match(
        /<<<REQUIRES_ASSESSMENT>>>([\s\S]*?)(?=<<<|$)/,
      );
      const lAssessTypeMatch = lessonBlock.match(
        /<<<ASSESSMENT_TYPE>>>([\s\S]*?)(?=<<<|$)/,
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

const parseAssessment = (rawContent) => {
  const questions = [];
  const questionBlocks = rawContent
    .split("<<<QUESTION>>>")
    .filter((block) => block.trim());

  for (let i = 0; i < questionBlocks.length; i++) {
    const block = questionBlocks[i];
    const question = { id: `q${i + 1}` };

    const typeMatch = block.match(/<<<TYPE>>>([\s\S]*?)(?=<<<|$)/);
    const textMatch = block.match(/<<<TEXT>>>([\s\S]*?)(?=<<<|$)/);
    const optionsMatch = block.match(/<<<OPTIONS>>>([\s\S]*?)(?=<<<|$)/);
    const correctMatch = block.match(/<<<CORRECT>>>([\s\S]*?)(?=<<<|$)/);
    const starterMatch = block.match(/<<<STARTER_CODE>>>([\s\S]*?)(?=<<<|$)/);
    const testCasesMatch = block.match(/<<<TEST_CASES>>>([\s\S]*?)(?=<<<|$)/);
    const hintsMatch = block.match(/<<<HINTS>>>([\s\S]*?)(?=<<<|$)/);
    const pointsMatch = block.match(/<<<POINTS>>>([\s\S]*?)(?=<<<|$)/);

    if (typeMatch) question.type = typeMatch[1].trim();
    if (textMatch) question.question = textMatch[1].trim();
    if (pointsMatch) question.points = parseInt(pointsMatch[1].trim()) || 20;

    if (optionsMatch) {
      question.options = optionsMatch[1]
        .split("\n")
        .map((o) => o.replace(/^[-*•\d.)]\s*/, "").trim())
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
        .map((h) => h.replace(/^[-*•\d.)]\s*/, "").trim())
        .filter((h) => h);
    }

    if (question.type && question.question) questions.push(question);
  }

  return { questions };
};

const parseReview = (rawContent) => {
  const review = { reviewedQuestions: [] };

  const passedMatch = rawContent.match(/<<<PASSED>>>([\s\S]*?)(?=<<<|$)/);
  const scoreMatch = rawContent.match(/<<<OVERALL_SCORE>>>([\s\S]*?)(?=<<<|$)/);
  const overallFeedbackMatch = rawContent.match(
    /<<<OVERALL_FEEDBACK>>>([\s\S]*?)(?=<<<|$)/,
  );

  if (passedMatch) {
    const val = passedMatch[1].trim().toLowerCase();
    review.passed = val === "true" || val === "yes";
  }
  if (scoreMatch) review.overallScore = parseInt(scoreMatch[1].trim()) || 0;
  if (overallFeedbackMatch)
    review.overallFeedback = overallFeedbackMatch[1].trim();

  const questionBlocks = rawContent
    .split("<<<QUESTION_REVIEW>>>")
    .filter((block) => block.includes("<<<QUESTION_ID>>>"));

  for (const block of questionBlocks) {
    const qReview = {};

    const idMatch = block.match(/<<<QUESTION_ID>>>([\s\S]*?)(?=<<<|$)/);
    const textMatch = block.match(/<<<QUESTION_TEXT>>>([\s\S]*?)(?=<<<|$)/);
    const typeMatch = block.match(/<<<QUESTION_TYPE>>>([\s\S]*?)(?=<<<|$)/);
    const qScoreMatch = block.match(/<<<SCORE>>>([\s\S]*?)(?=<<<|$)/);
    const correctMatch = block.match(/<<<IS_CORRECT>>>([\s\S]*?)(?=<<<|$)/);
    const feedbackMatch = block.match(/<<<FEEDBACK>>>([\s\S]*?)(?=<<<|$)/);
    const suggestionsMatch = block.match(
      /<<<SUGGESTIONS>>>([\s\S]*?)(?=<<<|$)/,
    );
    const encouragementMatch = block.match(
      /<<<ENCOURAGEMENT>>>([\s\S]*?)(?=<<<|$)/,
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
        .map((s) => s.replace(/^[-*•\d.)]\s*/, "").trim())
        .filter((s) => s);
    }
    if (encouragementMatch)
      qReview.encouragement = encouragementMatch[1].trim();

    if (qReview.questionId) review.reviewedQuestions.push(qReview);
  }

  return review;
};

const parseLessonContent = (rawContent) => {
  const sections = {};
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

  const objectives = [];
  if (sections.OBJECTIVES) {
    const lines = sections.OBJECTIVES.split("\n");
    for (const line of lines) {
      const cleaned = line.replace(/^[-*•]\s*/, "").trim();
      if (cleaned) objectives.push(cleaned);
    }
  }

  const content = sections.CONTENT || "";

  const keyTakeaways = [];
  if (sections.KEY_TAKEAWAYS) {
    const lines = sections.KEY_TAKEAWAYS.split("\n");
    for (const line of lines) {
      const cleaned = line.replace(/^[-*•]\s*/, "").trim();
      if (cleaned) keyTakeaways.push(cleaned);
    }
  }

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

export const generateCourseCatalog = async (req, res) => {
  const { userProfile } = req.body;


  try {

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

    // Convert messages to Gemini format
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // System instruction goes separately
    const systemInstruction = messages.find(
      (m) => m.role === "system",
    )?.content;

    // Try each model in rotation until one succeeds

    const result = await generateContent({
      contents: contents,
      systemInstruction: systemInstruction
        ? {
            parts: [{ text: systemInstruction }],
          }
        : undefined,
    });

    const courses = result.candidates[0].content.parts[0].text;

    const courseCatalog = parseCourseCatalog(courses);

    res.json({
      success: true,
      data: courseCatalog,
      metadata: {},
    });
  } catch (parseError) {
    return {
      success: false,
      error: `Failed to parse AI response: ${parseError.message}`,
    };
  }
};

export const generateCourseStructure = async (req, res) => {
  const { title, description, modulesCount } = req.body;

  if (!title || !description || !modulesCount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const prompt = `You are creating curriculum for a SERIOUS developer learning platform following The Odin Project methodology.

Course: "${title}"
Description: ${description}

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

    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const systemInstruction = messages.find(
      (m) => m.role === "system",
    )?.content;

    const result = await generateContent({
      contents: contents,
      systemInstruction: systemInstruction
        ? {
            parts: [{ text: systemInstruction }],
          }
        : undefined,
    });
    const structure = result.candidates[0].content.parts[0].text;

    const courseStructure = parseCourseStructure(structure);

    // Add Opik metadata (automatically tracked by trackGemini)
    res.json({
      success: true,
      data: courseStructure,
      metadata: {},
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
  const { courseTitle, moduleTitle, lessonTitle, lessonType, skillLevel } =
    req.body;

  if (!courseTitle || !moduleTitle || !lessonTitle) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Skill-level specific teaching approaches
    const teachingApproach = {
      "Complete Beginner": {
        wordCount: "2000-3000 words",
        examples: "4-6 clear code examples",
        depth:
          "Explain concepts from first principles. Define technical terms. Use simple language.",
      },
      "Some Experience": {
        wordCount: "1500-2500 words",
        examples: "3-5 practical examples",
        depth:
          "Build on existing knowledge. Focus on real-world application and best practices.",
      },
      Experienced: {
        wordCount: "1200-2000 words",
        examples: "2-4 production examples",
        depth:
          "Advanced patterns, architecture, optimization. Assume strong fundamentals.",
      },
    };

    const approach =
      teachingApproach[skillLevel] || teachingApproach["Some Experience"];

    const detectLanguage = (courseTitle, moduleTitle, lessonTitle) => {
      const combined =
        `${courseTitle} ${moduleTitle} ${lessonTitle}`.toLowerCase();

      // Check for specific languages (order matters - check specific before general)
      if (combined.match(/\btypescript\b|\b\.ts\b/)) return "TypeScript";
      if (combined.match(/\bjava\b/) && !combined.match(/javascript/))
        return "Java";
      if (
        combined.match(/\b(javascript|js|react|vue|angular|node\.js|express)\b/)
      )
        return "JavaScript";
      if (combined.match(/\b(python|django|flask|pandas|numpy)\b/))
        return "Python";
      if (combined.match(/\b(c\+\+|cpp)\b/)) return "C++";
      if (combined.match(/\b(c#|csharp|\.net|dotnet)\b/)) return "C#";
      if (combined.match(/\b(ruby|rails)\b/)) return "Ruby";
      if (combined.match(/\b(go|golang)\b/)) return "Go";
      if (combined.match(/\b(rust)\b/)) return "Rust";
      if (combined.match(/\b(php|laravel|symfony)\b/)) return "PHP";
      if (combined.match(/\b(swift|ios)\b/)) return "Swift";
      if (combined.match(/\b(kotlin|android)\b/)) return "Kotlin";
      if (combined.match(/\b(sql|mysql|postgresql|database)\b/)) return "SQL";

      return null; // Will use generic examples
    };

    const language = detectLanguage(courseTitle, moduleTitle, lessonTitle);

    const prompt = `Create comprehensive lesson content for: "${lessonTitle}"

Context:
- Course: ${courseTitle}
- Module: ${moduleTitle}
- Lesson Type: ${lessonType}
- Student Level: ${skillLevel}
${language ? `- Primary Language/Technology: ${language}` : ""}

=== TEACHING GUIDELINES ===
${approach.depth}

Expected content: ${approach.wordCount}
Code examples: ${approach.examples}
${language ? `\nIMPORTANT: Use ${language} syntax and conventions in ALL code examples. Reference ${language}-specific documentation.` : "\nIMPORTANT: Use appropriate syntax for the technology being taught. Reference official documentation."}

=== CONTENT REQUIREMENTS ===

**Adapt your lesson structure to what THIS SPECIFIC LESSON needs:**

${
  lessonType === "reading"
    ? `
This is a READING lesson - focus on explanation and understanding:
- Explain concepts clearly with appropriate depth for ${skillLevel}
- Use code examples to illustrate concepts (when relevant)
- Include diagrams or visualizations if helpful (using markdown)
- NO hands-on exercises (this is reading/learning, not practice)
`
    : lessonType === "practice"
      ? `
This is a PRACTICE lesson - focus on doing:
- Brief concept review
- Multiple practical coding exercises
- Clear instructions for each exercise
- Expected outcomes
`
      : `
This is a PROJECT lesson - focus on building:
- Project requirements and goals
- Technical specifications
- Step-by-step guidance
- Testing/validation criteria
`
}

**Content Structure Guidelines (adapt as needed):**

${
  skillLevel === "Complete Beginner"
    ? `
For Complete Beginners:
- Explain WHAT the topic is before diving into HOW
- Use analogies or real-world comparisons when helpful (but don't force them)
- Define technical terms when first used
- Show simple examples before complex ones
- Point out common mistakes when relevant

Structure your lesson naturally:
- Some lessons need analogies (abstract concepts like variables, OOP, memory management)
- Some lessons DON'T need analogies (concrete tools like IDE setup, package installation)
- Adapt based on whether the lesson is conceptual, practical, or instructional
`
    : skillLevel === "Experienced"
      ? `
For Experienced Developers:
- Skip basics, dive into technical depth
- Focus on design decisions and trade-offs
- Cover performance and scalability implications
- Discuss when to use different approaches
- Include production considerations
`
      : `
For Intermediate Learners:
- Balance theory with practical application
- Show professional patterns and practices
- Cover common pitfalls and how to avoid them
- Connect concepts to real-world usage
`
}

**Quality Standards:**
- Use ONLY real, documented technologies, libraries, and APIs
- All code examples must use correct, working syntax for the language being taught
- Reference official documentation (language docs, framework docs, etc.)
- NO emojis or special characters (no ❌ ✅ 🚀 - use plain text)
- Write in clear, professional markdown
- Adapt examples to the course's technology stack (JavaScript, Python, Java, etc.)

**DO NOT:**
- Force every lesson into the same template
- Include "Hands-On Practice" sections in reading lessons
- Use repetitive phrases like "Let's build something you can actually use!"
- Add exercises when the lesson is purely conceptual or instructional
- Use placeholder text like "[Topic]" or "[Explain here]"
- Start every lesson with "What is [Topic]? (Starting from Scratch)"

**DO:**
- Structure the lesson based on what it's actually teaching
- Make code examples realistic and relevant
- Explain WHY things work, not just HOW
- Keep tone professional and clear
- Adapt depth to skill level
- Vary your opening based on lesson type (setup lessons, concept lessons, etc.)

=== RESPONSE FORMAT ===

<<<OBJECTIVES>>>
- [3-5 clear learning objectives specific to THIS lesson]
- [What students will understand or be able to do]
- [Written naturally, not as a template]

<<<CONTENT>>>
[Write your lesson content here using natural markdown structure]

[Organize with appropriate headers based on the lesson topic]

[Include code examples where they help explain concepts]

[NO forced templates - adapt to lesson needs]

<<<KEY_TAKEAWAYS>>>
- [Main points from this lesson]
- [Skills or knowledge gained]
- [2-4 concise takeaways]

<<<RESOURCES>>>
- [Source Name]: [Topic] | [Real URL] | [Brief description]
- [Only include verified sources: MDN, official docs, JavaScript.info, Web.dev]
- [2-4 relevant resources]

Write comprehensive content (${approach.wordCount}) that teaches this lesson effectively.`;

    const messages = [
      {
        role: "system",
        content:
          "You are an expert educational content creator for The Odin Project. Create comprehensive, text-based lesson content with working code examples. Use the exact delimiter format specified.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const systemInstruction = messages.find(
      (m) => m.role === "system",
    )?.content;

    const result = await generateContent({
      contents: contents,
      systemInstruction: systemInstruction
        ? {
            parts: [{ text: systemInstruction }],
          }
        : undefined,
    });
    const content = result.candidates[0].content.parts[0].text;
    const lessonContent = parseLessonContent(content);

    res.json({
      success: true,
      data: lessonContent,
      metadata: {},
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
  const {
    lessonTitle,
    lessonContent,
    assessmentType = "coding_challenge",
  } = req.body;

  if (!lessonTitle || !lessonContent) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
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

    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const systemInstruction = messages.find(
      (m) => m.role === "system",
    )?.content;

    const result = await generateContent({
      contents: contents,
      systemInstruction: systemInstruction
        ? {
            parts: [{ text: systemInstruction }],
          }
        : undefined,
    });
    const text = result.candidates[0].content.parts[0].text;

    const assessment = parseAssessment(text);

    res.json({
      success: true,
      data: assessment,
      metadata: {},
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

    const messages = [
      {
        role: "system",
        content:
          "You are an expert code reviewer and educator. Provide constructive, encouraging feedback in valid JSON format.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const systemInstruction = messages.find(
      (m) => m.role === "system",
    )?.content;

    const result = await generateContent({
      contents: contents,
      systemInstruction: systemInstruction
        ? {
            parts: [{ text: systemInstruction }],
          }
        : undefined,
    });
    const text = result.candidates[0].content.parts[0].text;
    const review = parseReview(text);

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

    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const systemInstruction = messages.find(
      (m) => m.role === "system",
    )?.content;

    const result = await generateContent({
      contents,
      systemInstruction: systemInstruction
        ? {
            parts: [{ text: systemInstruction }],
          }
        : undefined,
    });
    const text = result.candidates[0].content.parts[0].text;

    const review = parseReview(text);

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
