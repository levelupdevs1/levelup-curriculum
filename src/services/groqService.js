/**
 * Groq Service - Fallback AI Provider (UPDATED)
 * Provider: Groq (Free tier, unlimited beta)
 * Models: Mixtral 8x7b, LLaMA 3.3 70b, LLaMA 3.1 70b
 * IMPROVEMENTS: Better prompts, skill-level adaptation, comprehensive content
 */

import { validateProjectSubmission } from "./projectValidationService";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Model rotation priority (for resilience)
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
];

/**
 * Check if Groq is configured
 */
export const isGroqConfigured = () => {
  return !!GROQ_API_KEY && GROQ_API_KEY !== "gsk_YOUR_GROQ_API_KEY_HERE";
};

/**
 * Call Groq API with model rotation
 */
const callGroq = async (messages, options = {}) => {
  if (!isGroqConfigured()) {
    return {
      success: false,
      error: "Groq API key not configured",
    };
  }

  const { temperature = 0.3, maxTokens = 1000 } = options;

  for (let i = 0; i < GROQ_MODELS.length; i++) {
    const model = GROQ_MODELS[i];

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        continue;
      }

      const data = await response.json();

      return {
        success: true,
        content: data.choices[0]?.message?.content || "",
        usage: {
          totalTokens:
            (data.usage?.prompt_tokens || 0) +
            (data.usage?.completion_tokens || 0),
        },
        model,
      };
    } catch (error) {
      continue;
    }
  }

  return {
    success: false,
    error: "All Groq models failed",
  };
};

/**
 * UPDATED: Generate course catalog with skill-level adaptation
 */
export const generateCourseCatalogGroq = async (userProfile) => {
  // Skill-level specific guidance
  const skillGuidance = {
    "Complete Beginner": {
      approach:
        "Start with absolute fundamentals. Assume ZERO prior knowledge. Build confidence through achievable milestones.",
      courseCount: "4-6 courses for solid foundation",
      pacing: "Slower, thorough progression with lots of practice",
    },
    "Some Experience": {
      approach:
        "Build on existing knowledge. Fill gaps and introduce industry best practices.",
      courseCount: "4-5 courses focusing on depth and real-world application",
      pacing: "Moderate progression with practical projects",
    },
    Experienced: {
      approach:
        "Advanced patterns, architecture, optimization, and system design.",
      courseCount: "3-4 focused courses on mastery and specialization",
      pacing: "Fast progression, emphasis on nuance and trade-offs",
    },
  };

  const guidance =
    skillGuidance[userProfile.skill_level] || skillGuidance["Some Experience"];

  const prompt = `You are designing a COMPLETE learning path for a real student who wants to get job-ready.

=== STUDENT PROFILE ===
Learning Goal: ${userProfile.learning_goal}
Skill Level: ${userProfile.skill_level}
Career Goal: ${userProfile.goal}
Time Commitment: ${userProfile.time_commitment} per week
Learning Style: ${userProfile.learning_style}

=== YOUR APPROACH ===
${guidance.approach}
Expected Course Count: ${guidance.courseCount}
Pacing: ${guidance.pacing}

=== QUALITY STANDARDS ===
Use only REAL, widely-adopted technologies:
✅ Programming languages: JavaScript, Python, Java, C++, C#, Go, Rust, etc.
✅ Web frameworks: React, Vue, Angular, Django, Flask, Spring Boot, Express, etc.
✅ Databases: PostgreSQL, MongoDB, MySQL, Redis, SQLite, etc.
✅ Tools & platforms: Git, Docker, AWS, Heroku, VS Code, etc.
✅ Libraries with official documentation and active maintenance
✅ Technologies currently used in production by real companies

❌ Experimental/beta libraries without stable releases
❌ Obscure frameworks with poor documentation
❌ Deprecated technologies
❌ Made-up tools or fictional frameworks

${
  userProfile.skill_level === "Complete Beginner"
    ? `
=== SPECIAL GUIDANCE FOR COMPLETE BEGINNERS ===
Your first course MUST start with:
- What is programming?
- How does code actually work?
- Setting up the development environment
- Writing and running your first program

Each course should:
- Build confidence through small, achievable wins
- Introduce ONE major concept at a time
- Include lots of hands-on practice
- Use analogies and real-world examples
- Assume they know NOTHING about coding

Example progression:
1. Programming Fundamentals with JavaScript
2. Building Interactive Web Pages with HTML/CSS/JS
3. JavaScript Projects and Problem Solving
4. Modern Web Development with React
5. Building Full Applications with Backend
6. Portfolio Project and Job Prep
`
    : userProfile.skill_level === "Experienced"
      ? `
=== SPECIAL GUIDANCE FOR EXPERIENCED DEVELOPERS ===
Skip the basics. Focus on:
- Advanced design patterns and architecture
- Performance optimization and scalability
- System design and trade-offs
- Production-ready code practices
- Industry-standard tooling and workflows

Each course should challenge them to level up to senior/lead roles.
`
      : `
=== GUIDANCE FOR DEVELOPERS WITH SOME EXPERIENCE ===
Build on what they know while filling critical gaps:
- Reinforce fundamentals that may be shaky
- Introduce professional development practices
- Cover testing, deployment, and production concerns
- Bridge tutorial knowledge to real-world application
`
}

=== COURSE STRUCTURE REQUIREMENTS ===
Each course must include:

1. **Title** (40-60 characters)
   - Action-oriented and specific
   - Mention key technology
   - ✅ "Build REST APIs with Node.js & Express"
   - ✅ "Master React Hooks and State Management"
   - ❌ "Learn Backend" (too vague)
   - ❌ "Introduction to Programming" (too generic)

2. **Description** (150-250 characters)
   - What they'll BUILD (concrete projects)
   - What they'll UNDERSTAND (key concepts)
   - Technologies they'll use
   - Should excite them about what they'll create

3. **Difficulty**
   - Beginner | Intermediate | Advanced
   - First course should match their current level or slightly below
   - Each subsequent course increases difficulty appropriately

4. **Estimated Hours** (realistic for deep learning)
   - Complete Beginner: 30-60 hours per course
   - Some Experience: 25-45 hours per course
   - Experienced: 20-40 hours per course

5. **Modules Count**: 5-8 modules
   - Each module = 1 major concept/skill cluster
   - Enough to thoroughly cover the topic

6. **Potential Tokens**: 400-700
   - Higher for foundational courses
   - Moderate for specialized courses

7. **Tags**: 4-6 relevant tags
   - Include technologies, concepts, project types
   - Help with searchability

=== LEARNING PATH LOGIC ===
Design a clear progression:

Course 1: Foundation for their learning goal
- If beginner: Start with basics of the main technology
- If experienced: Start with advanced concepts in their focus area

Course 2-N: Build complexity toward career goal
- Each course introduces new concepts while reinforcing previous learning
- Include increasingly complex projects
- Cover professional practices (testing, deployment, etc.)

Final Course: Portfolio-worthy capstone project
- Demonstrates job-ready skills
- Uses technologies from entire learning path
- Can be shown to potential employers

=== RESPONSE FORMAT (USE EXACT DELIMITERS) ===

<<<COURSE>>>
<<<TITLE>>>
[Action-oriented title, 40-60 characters]
<<<DESCRIPTION>>>
[What they'll build and learn, 150-250 characters, mention specific technologies]
<<<DIFFICULTY>>>
Beginner | Intermediate | Advanced
<<<HOURS>>>
[15-80 hours, realistic for comprehensive learning]
<<<MODULES_COUNT>>>
[5-8 modules]
<<<TOKENS>>>
[400-700]
<<<TAGS>>>
- tag1
- tag2
- tag3
- tag4

Generate ${guidance.courseCount} that will take them from their current level to job-ready.
Each course should feel substantial and valuable.`;

  const messages = [
    {
      role: "system",
      content: `You are an expert curriculum designer creating learning paths for real students seeking employment.

Your courses should be:
1. Comprehensive and substantial (not superficial)
2. Based only on real, well-documented technologies
3. Appropriate for the learner's skill level
4. Designed to make them job-ready

Use the exact delimiter format specified. Be creative with course design while staying grounded in real technologies.`,
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await callGroq(messages, {
    temperature: 0.7,
    maxTokens: 4000, // INCREASED from 2500
  });

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
    return {
      success: false,
      error: `Failed to parse AI response: ${parseError.message}`,
    };
  }
};

/**
 * UPDATED: Generate course structure with better guidance
 */
export const generateCourseStructureGroq = async (
  courseTitle,
  courseDescription,
  modulesCount,
) => {
  const prompt = `You are creating a detailed curriculum for a serious developer education platform.

Course: "${courseTitle}"
Description: ${courseDescription}
Required Modules: EXACTLY ${modulesCount} modules

=== QUALITY STANDARDS ===
Use ONLY real, documented technologies and concepts:
✅ Standard language features from official documentation
✅ Well-known frameworks and libraries (React, Django, Spring, etc.)
✅ Official APIs and standard libraries for the language being taught
✅ Industry-standard patterns and practices
✅ Tools and packages with official documentation

❌ Made-up APIs or methods that don't exist
❌ Fictional frameworks or libraries
❌ Invented terminology or non-standard patterns
❌ Deprecated or obsolete features

=== MODULE & LESSON STRUCTURE ===

**You MUST generate EXACTLY ${modulesCount} modules.**

Each module should:
- Focus on ONE major concept/skill
- Include 5-7 lessons
- Progress from theory to practice to project
- Build on previous modules

Lesson Type Distribution (The Odin Project style):
- **reading** (30-45 min): Theory, concepts, documentation study
- **practice** (45-60 min): Hands-on coding exercises
- **project** (2-4 hours): Build real applications

Typical module structure:
- Lesson 1-2: **reading** (establish foundation)
- Lesson 3-5: **practice** (apply concepts)
- Lesson 6-7: **project** (synthesize learning)

=== ASSESSMENT PHILOSOPHY ===
Only 30-40% of lessons need assessments:
- **reading** lessons: Usually NO assessment (learning happens in practice)
- **practice** lessons: coding_challenge (for key practice lessons)
- **project** lessons: ALWAYS include project assessment
- Intro/overview lessons: NO assessment

=== COMPREHENSIVE COVERAGE ===
This is NOT a surface-level overview. Each topic should be:
- Explained thoroughly enough for real-world use
- Include prerequisite concepts explicitly
- Build complexity gradually
- Connect to practical applications
- Prepare students for professional work

=== RESPONSE FORMAT (USE EXACT DELIMITERS) ===

<<<MODULE>>>
<<<MODULE_TITLE>>>
[Clear, descriptive module title]
<<<MODULE_DESCRIPTION>>>
[What students will BUILD and UNDERSTAND - under 120 characters]

<<<LESSON>>>
<<<LESSON_TITLE>>>
[Specific, actionable lesson title]
<<<LESSON_TYPE>>>
reading | practice | project
<<<LESSON_MINUTES>>>
[30-240 minutes, realistic for content depth]
<<<LESSON_DESCRIPTION>>>
[Concrete learning outcome - under 100 characters]
<<<REQUIRES_ASSESSMENT>>>
true | false
<<<ASSESSMENT_TYPE>>>
coding_challenge | project | null

[Repeat <<<LESSON>>> block 5-7 times per module]

[Repeat <<<MODULE>>> block EXACTLY ${modulesCount} times]

**CRITICAL**: Count your modules before submitting. You MUST have EXACTLY ${modulesCount} modules.`;

  const messages = [
    {
      role: "system",
      content: `You are an expert curriculum designer following The Odin Project methodology: practical, hands-on, project-based learning.

Create comprehensive course structures that:
1. Cover topics thoroughly (not superficially)
2. Use only real, documented technologies
3. Build skills progressively
4. Prepare students for real-world development

Use the exact delimiter format specified.`,
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await callGroq(messages, {
    temperature: 0.7,
    maxTokens: 10000, // INCREASED from 8000
  });

  if (!result.success) {
    return result;
  }

  try {
    const structure = parseCourseStructure(result.content);

    // VALIDATION: Ensure module count matches specification
    if (!structure.modules || structure.modules.length !== modulesCount) {
      console.warn(
        `Expected ${modulesCount} modules, got ${structure.modules?.length || 0}`,
      );
    }

    // VALIDATION: Ensure each module has lessons
    const validModules = structure.modules.filter(
      (m) => m.lessons && m.lessons.length > 0,
    );
    if (validModules.length === 0) {
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
    return {
      success: false,
      error: `Failed to parse course structure: ${parseError.message}`,
    };
  }
};

/**
 * FIXED: Generate lesson content that adapts to actual lesson needs (no forced templates)
 */
export const generateLessonContentGroq = async (
  courseTitle,
  moduleTitle,
  lessonTitle,
  lessonType = "reading",
  skillLevel = "Some Experience",
) => {
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

  // Detect primary language/technology from all available titles
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
      content: `You are an expert technical educator creating lesson content.

Key principles:
- Adapt content structure to what each lesson actually needs
- Don't force every lesson into the same template
- Use clear, professional language (NO emojis)
- Make code examples realistic and working
- Vary your approach based on lesson type and topic

Reading lessons: Focus on explanation and understanding
Practice lessons: Focus on exercises and application  
Project lessons: Focus on building something complete

Use the exact delimiter format specified, but write natural content within each section.`,
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await callGroq(messages, {
    temperature: 0.6,
    maxTokens: 8000,
  });

  if (!result.success) {
    return result;
  }

  try {
    const lessonData = parseLessonContent(result.content);

    // Validate content length based on skill level
    const minLength = skillLevel === "Complete Beginner" ? 1500 : 1000;
    if (!lessonData.content || lessonData.content.length < minLength) {
      return {
        success: false,
        error: `Content too short for ${skillLevel} level. Got ${lessonData.content?.length || 0} characters, expected at least ${minLength}.`,
      };
    }

    return {
      success: true,
      content: lessonData,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch (parseError) {
    return {
      success: false,
      error: `Failed to parse lesson content: ${parseError.message}`,
    };
  }
};

/**
 * FIXED: Generate assessment with full context of what student knows
 *
 * @param {string} lessonTitle - Title of the lesson being assessed
 * @param {object|string} lessonContent - Content of the current lesson
 * @param {string} assessmentType - Type of assessment (quiz, project, coding_challenge)
 * @param {array} previousLessons - Array of previous lesson contents for context (optional)
 */
export const generateAssessmentGroq = async (
  lessonTitle,
  lessonContent,
  assessmentType = "coding_challenge",
  previousLessons = [],
) => {
  // Extract full content text if it's an object
  let fullLessonText = "";
  if (typeof lessonContent === "object" && lessonContent.content) {
    fullLessonText = lessonContent.content;
  } else if (typeof lessonContent === "string") {
    fullLessonText = lessonContent;
  }

  // Current lesson content (main focus of assessment)
  const currentLessonSummary = fullLessonText.substring(0, 2000);

  // Previous lessons context (what they already know)
  let previousContext = "";
  if (previousLessons && previousLessons.length > 0) {
    previousContext =
      "\n\n=== PREREQUISITE KNOWLEDGE (from previous lessons) ===\n";
    previousContext += "The student has already learned:\n";
    previousLessons.forEach((prevLesson, idx) => {
      const prevContent =
        typeof prevLesson === "object" ? prevLesson.content : prevLesson;
      const summary = prevContent ? prevContent.substring(0, 300) : "N/A";
      previousContext += `\nPrevious Lesson ${idx + 1}: ${summary.split("\n")[0]}...\n`;
    });
    previousContext +=
      "\nYou CAN assume they know concepts from these previous lessons.\n";
  }

  let prompt = "";

  if (assessmentType === "quiz") {
    prompt = `Create a QUIZ assessment for this lesson.

Lesson: ${lessonTitle}

=== CURRENT LESSON CONTENT (primary focus of assessment) ===
${currentLessonSummary}
${previousContext}

CRITICAL ASSESSMENT RULES:
1. PRIMARY FOCUS: Test concepts from the current lesson content above
2. You CAN use/reference concepts from previous lessons (if provided)
3. DO NOT test concepts not yet taught (from future lessons)
4. Match the complexity level shown in the current lesson

Requirements:
- 5-7 multiple choice questions
- Focus on concepts from the CURRENT lesson
- Can build on previous lesson knowledge when relevant
- 4 options per question (one correct, three plausible distractors)
- Progress from easier to harder

=== RESPONSE FORMAT (USE EXACT DELIMITERS) ===

<<<QUESTION>>>
<<<TYPE>>>
multiple_choice
<<<TEXT>>>
[Question about current lesson concept]
<<<OPTIONS>>>
- Option 1
- Option 2
- Option 3
- Option 4
<<<CORRECT>>>
[The correct option text or index 0-3]
<<<POINTS>>>
10

Repeat for 5-7 questions.`;
  } else if (assessmentType === "project") {
    prompt = `Create PROJECT requirements for this lesson.

Lesson: ${lessonTitle}

=== CURRENT LESSON CONTENT (primary focus) ===
${currentLessonSummary}
${previousContext}

CRITICAL PROJECT RULES:
1. PRIMARY FOCUS: Apply concepts from the current lesson
2. You CAN use techniques from previous lessons (if provided)
3. DO NOT require knowledge not yet taught
4. Project should feel achievable with current knowledge

Requirements:
- Project demonstrates mastery of current lesson concepts
- Can integrate previous lesson knowledge naturally
- Clear must-have features (achievable with what they know)
- Optional stretch goals for extra practice

=== RESPONSE FORMAT (USE EXACT DELIMITERS) ===

<<<QUESTION>>>
<<<TYPE>>>
project
<<<TEXT>>>
Build a [specific project] that demonstrates [concepts from current lesson]
<<<HINTS>>>
- Must-have feature 1 (using current lesson concept)
- Must-have feature 2 (using current lesson concept)
- Must-have feature 3 (can combine with previous knowledge)
<<<TEST_CASES>>>
Stretch goal 1 (extends current concepts)
Stretch goal 2 (combines current + previous concepts)
<<<STARTER_CODE>>>
Submission format: GitHub repository URL required. Live deployment URL optional but recommended.
<<<POINTS>>>
100`;
  } else {
    // Default: coding_challenge
    prompt = `Create CODING CHALLENGE assessment for this lesson.

Lesson: ${lessonTitle}

=== CURRENT LESSON CONTENT (primary focus) ===
${currentLessonSummary}
${previousContext}

CRITICAL CHALLENGE RULES:
1. PRIMARY FOCUS: Test current lesson concepts
2. You CAN use techniques from previous lessons (if provided)
3. DO NOT require knowledge not yet taught
4. Match complexity of current lesson examples

Requirements:
- 3-5 coding challenges
- Focus on applying concepts from current lesson
- Can naturally use previous lesson knowledge
- Include clear requirements and expected behavior
- Provide starter code when helpful
- Progress from simpler to more complex

=== RESPONSE FORMAT (USE EXACT DELIMITERS) ===

<<<QUESTION>>>
<<<TYPE>>>
code_challenge
<<<TEXT>>>
[Description focusing on current lesson concepts]
<<<STARTER_CODE>>>
[Optional starter code using appropriate syntax]
<<<TEST_CASES>>>
input1 -> expected output1
input2 -> expected output2
<<<HINTS>>>
- Use [technique from current lesson]
- Consider [concept from current lesson]
<<<POINTS>>>
20

Repeat for 3-5 challenges.`;
  }

  const messages = [
    {
      role: "system",
      content: `You are an expert educator creating assessments that are PERFECTLY ALIGNED with lesson progression.

CRITICAL RULES:
1. PRIMARY FOCUS: Assess concepts from the current lesson being tested
2. FOUNDATION: Assume knowledge from previous lessons (if provided)
3. NO FUTURE KNOWLEDGE: Don't test concepts not yet taught
4. NATURAL INTEGRATION: Combine current + previous knowledge naturally

Examples:
- Current lesson: Arrays | Previous: Variables, Functions
  ✅ "Create an array and write a function to find the maximum value"
  ❌ "Create an array and sort it using a custom comparator class" (classes not taught yet)

- Current lesson: Functions | Previous: Variables
  ✅ "Write a function that takes two variables and returns their sum"
  ❌ "Write a function that uses arrays" (arrays not taught yet)

Use the exact delimiter format specified.`,
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  const result = await callGroq(messages, {
    temperature: 0.5,
    maxTokens: 3000,
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
    return {
      success: false,
      error: `Failed to parse assessment: ${parseError.message}`,
    };
  }
};

/**
 * Review entire assessment submission (unchanged)
 */
export const reviewSubmissionBatchGroq = async (
  questions,
  submissionAnswers,
) => {
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

  // Build structured format with all Q&A pairs
  const questionsData = questions
    .map((q, idx) => {
      let answerText = submissionAnswers[q.id];

      // For multiple choice, map index to actual option text
      if (q.type === "multiple_choice" && answerText !== undefined) {
        const answerIndex = parseInt(answerText);
        if (!isNaN(answerIndex) && q.options && q.options[answerIndex]) {
          answerText = q.options[answerIndex];
        }
      }

      // For project submissions, use validated content
      if (
        q.type === "project" &&
        typeof answerText === "object" &&
        answerText !== null
      ) {
        const validation = projectValidations[q.id];
        if (validation && validation.formattedContent) {
          answerText = validation.formattedContent;
        } else {
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

  const hasProjectQuestions = questions.some((q) => q.type === "project");
  const projectMeta = hasProjectQuestions
    ? Object.values(projectValidations)[0]?.validationSummary
    : null;

  const prompt = `Review this student's assessment submission. For EACH question, provide personalized feedback.

ASSESSMENT QUESTIONS AND ANSWERS:
${questionsData}

PASSING SCORE: 70% (Student must score >= 70 to pass)

${
  hasProjectQuestions
    ? `
=== PROJECT REVIEW MODE ===
${
  projectMeta
    ? `Validation: ${projectMeta.filesAvailable || 0} files reviewed, ${projectMeta.coverage || 0}% coverage`
    : ""
}

CRITICAL RULES:
1. ONLY cite evidence from the ACTUAL CODE provided
2. NEVER assume features exist without code proof
3. Quote specific file paths and line numbers
4. Mark requirements as NOT MET if no code evidence
5. If validation failed, score MUST be 0
===
`
    : ""
}

For each question, provide:
1. Is it correct, partially correct, or incorrect?
2. Brief, specific feedback (1-2 sentences max)
3. What to improve (if applicable)
4. Brief encouragement

IMPORTANT:
- Use "You" and "Your" (personalized tone)
- Be CONCISE - no long explanations
- Calculate overallScore as percentage
- Set passed=true ONLY if score >= 70%

=== RESPONSE FORMAT (USE EXACT DELIMITERS) ===

<<<PASSED>>>
true | false
<<<OVERALL_SCORE>>>
0-100
<<<OVERALL_FEEDBACK>>>
[Brief summary: Your score is X%. You got Y out of Z correct.]

For each question:

<<<QUESTION_REVIEW>>>
<<<QUESTION_ID>>>
[question id]
<<<QUESTION_TEXT>>>
[question text]
<<<QUESTION_TYPE>>>
[question type]
<<<SCORE>>>
0-100
<<<IS_CORRECT>>>
true | false
<<<FEEDBACK>>>
[Brief, personalized feedback using "You" and "Your"]
<<<SUGGESTIONS>>>
- [Specific improvement]
<<<ENCOURAGEMENT>>>
[Brief encouragement]`;

  const systemPrompt = hasProjectQuestions
    ? "You are a strict code reviewer. For projects: ONLY cite code evidence. Quote file paths and lines. If no proof, mark NOT MET. Be concise and personalized. Use exact delimiter format."
    : "You are a concise educator providing personalized feedback. Use 'You' and 'Your'. Be brief and helpful. Use exact delimiter format.";

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

  const result = await callGroq(messages, {
    temperature: 0.3,
    maxTokens: 4000, // INCREASED from 3000
  });

  if (!result.success) {
    return result;
  }

  try {
    const review = parseReview(result.content);
    if (!review.reviewedQuestions || review.reviewedQuestions.length === 0) {
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
    return {
      success: false,
      error: `Failed to parse batch review: ${parseError.message}`,
    };
  }
};

// ============================================================================
// PARSING FUNCTIONS (Unchanged from original)
// ============================================================================

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
