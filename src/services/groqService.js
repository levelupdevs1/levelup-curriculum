/**
 * Groq Service - Fallback AI Provider
 * Provider: Groq (Free tier, unlimited beta)
 * Models: Mixtral 8x7b, LLaMA 3.3 70b, LLaMA 3.1 70b
 * Anti-hallucination: Strict prompt engineering, fact-based only
 */

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
    console.log(
      `🤖 Trying Groq model: ${model} (${i + 1}/${GROQ_MODELS.length})`,
    );

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
        console.warn(
          `⚠️ Groq model ${model} failed:`,
          errorData.error?.message || response.statusText,
        );
        continue;
      }

      const data = await response.json();
      console.log(`✅ Success with Groq model: ${model}`);

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
      console.error(`❌ Groq model ${model} error:`, error.message);
      continue;
    }
  }

  return {
    success: false,
    error: "All Groq models failed",
  };
};

/**
 * Generate course catalog (educational purposes only, fact-based)
 */
export const generateCourseCatalogGroq = async (userGoal, skillLevel) => {
  const systemPrompt = `You are an educational curriculum designer. Generate ONLY factual course recommendations.
DO NOT:
- Make up course names
- Assume learner abilities
- Include fictional projects
- Guess at timelines

Base recommendations on widely recognized, established learning paths.`;

  const prompt = `Based on:
- Goal: ${userGoal}
- Skill Level: ${skillLevel}

Generate 3-5 real, established courses. Use only known frameworks and real learning methodologies.
Return valid JSON with title, description, difficulty, estimatedHours, modulesCount only.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const result = await callGroq(messages, { maxTokens: 1500 });

  if (!result.success) {
    return result;
  }

  try {
    let cleanContent = result.content.trim();

    if (cleanContent.includes("```")) {
      cleanContent = cleanContent
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?```\s*$/, "")
        .trim();
    }

    cleanContent = cleanContent.replace(/^["'`]+|["'`]+$/g, "");
    cleanContent = cleanContent.replace(/([^\\])\n/g, "$1\\n");

    if (cleanContent.startsWith("\n")) {
      cleanContent = cleanContent.replace(/^\n/, "\\n");
    }

    const catalog = JSON.parse(cleanContent);
    return {
      success: true,
      catalog: Array.isArray(catalog) ? catalog : catalog.courses || [],
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch (error) {
    console.error("❌ Failed to parse Groq catalog:", error);
    console.error(
      "📄 Raw content (first 500 chars):",
      result.content.substring(0, 500),
    );
    return {
      success: false,
      error: `Failed to parse response: ${error.message}`,
    };
  }
};

/**
 * Generate course structure (modules and lessons)
 */
export const generateCourseStructureGroq = async (
  courseTitle,
  courseDifficulty,
) => {
  const systemPrompt = `You are a curriculum architect. Create ONLY realistic, evidence-based course structures.
DO NOT:
- Invent unproven teaching methods
- Add filler content
- Make assumptions about prerequisites
- Hallucinate project requirements

Use established educational design principles.`;

  const prompt = `Course: ${courseTitle}
Difficulty: ${courseDifficulty}

Create a realistic 3-4 module structure with 3-4 lessons per module.
Each lesson must teach a real, verifiable concept.
Return valid JSON: { modules: [{ title, description, lessons: [{id, title, description, estimatedMinutes, type}] }] }`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const result = await callGroq(messages, { maxTokens: 2000 });

  if (!result.success) {
    return result;
  }

  try {
    let cleanContent = result.content.trim();

    if (cleanContent.includes("```")) {
      cleanContent = cleanContent
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?```\s*$/, "")
        .trim();
    }

    cleanContent = cleanContent.replace(/^["'`]+|["'`]+$/g, "");
    cleanContent = cleanContent.replace(/([^\\])\n/g, "$1\\n");

    if (cleanContent.startsWith("\n")) {
      cleanContent = cleanContent.replace(/^\n/, "\\n");
    }

    const structure = JSON.parse(cleanContent);
    return {
      success: true,
      structure: structure.modules ? { modules: structure.modules } : structure,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch (error) {
    console.error("❌ Failed to parse Groq structure:", error);
    return {
      success: false,
      error: `Failed to parse response: ${error.message}`,
    };
  }
};

/**
 * Generate lesson content (factual, verified information only)
 */
export const generateLessonContentGroq = async (
  lessonTitle,
  lessonDescription,
  courseTitle,
  estimatedMinutes,
) => {
  const systemPrompt = `You are an educational content writer. Write ONLY accurate, fact-checked content.
DO NOT:
- Invent examples
- Add unverified information
- Make programming syntax errors
- Assume concepts without explanation

Use only established, documented standards and best practices.`;

  const prompt = `Lesson: ${lessonTitle}
Course: ${courseTitle}
Time: ${estimatedMinutes}min

Write factual content with objectives, key concepts, and examples.
Objectives: 2-3 measurable learning outcomes
Content: 300-400 words, verified facts only
Key Takeaways: 3-4 core concepts
External Resources: Real, verified links

Return JSON: { content, objectives: [], keyTakeaways: [], externalResources: [] }`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const result = await callGroq(messages, { maxTokens: 2000 });

  if (!result.success) {
    return result;
  }

  try {
    let cleanContent = result.content.trim();

    // Remove markdown code blocks
    if (cleanContent.includes("```")) {
      cleanContent = cleanContent
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?```\s*$/, "")
        .trim();
    }

    // Remove any leading/trailing quotes or brackets that aren't JSON
    cleanContent = cleanContent.replace(/^["'`]+|["'`]+$/g, "");

    // Escape unescaped newlines in strings
    cleanContent = cleanContent.replace(/([^\\])\n/g, "$1\\n");

    // Handle leading newline
    if (cleanContent.startsWith("\n")) {
      cleanContent = cleanContent.replace(/^\n/, "\\n");
    }

    console.log(
      "🧹 Cleaned Groq lesson content (first 200 chars):",
      cleanContent.substring(0, 200),
    );

    const content = JSON.parse(cleanContent);
    return {
      success: true,
      content,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch (error) {
    console.error("❌ Failed to parse Groq lesson content:", error);
    console.error(
      "📄 Raw content (first 500 chars):",
      result.content.substring(0, 500),
    );
    return {
      success: false,
      error: `Failed to parse response: ${error.message}`,
    };
  }
};

/**
 * Generate assessment questions (factually correct only)
 */
export const generateAssessmentGroq = async (lessonTitle, lessonContent) => {
  const systemPrompt = `You are an assessment designer. Create ONLY questions with verifiable, correct answers.
DO NOT:
- Include ambiguous questions
- Use trick questions
- Assume incorrect facts
- Create questions with multiple valid answers

Base questions on the provided lesson content only.`;

  const prompt = `Lesson: ${lessonTitle}
Content: ${lessonContent.substring(0, 500)}...

Create 4-5 assessment questions (mix types).
Each question must have ONE correct answer based on lesson content.
Return JSON: { title, description, questions: [{id, question, type, options/starterCode, correctAnswer, points}], passingScore: 70, totalPoints }`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const result = await callGroq(messages, { maxTokens: 2000 });

  if (!result.success) {
    return result;
  }

  try {
    let cleanContent = result.content.trim();

    if (cleanContent.includes("```")) {
      cleanContent = cleanContent
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?```\s*$/, "")
        .trim();
    }

    cleanContent = cleanContent.replace(/^["'`]+|["'`]+$/g, "");
    cleanContent = cleanContent.replace(/([^\\])\n/g, "$1\\n");

    if (cleanContent.startsWith("\n")) {
      cleanContent = cleanContent.replace(/^\n/, "\\n");
    }

    const assessment = JSON.parse(cleanContent);
    return {
      success: true,
      assessment,
      tokensUsed: result.usage.totalTokens,
      model: result.model,
    };
  } catch (error) {
    console.error("❌ Failed to parse Groq assessment:", error);
    return {
      success: false,
      error: `Failed to parse response: ${error.message}`,
    };
  }
};

/**
 * Review assessment submission (factual evaluation only, no assumptions)
 */
export const reviewSubmissionBatchGroq = async (
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

      // For all other types (textarea, code), use as-is
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

  console.log("📤 Sending to Groq:", questionsData.substring(0, 300));

  const systemPrompt = `You are a rigorous assessment evaluator. Evaluate ONLY based on provided content.
DO NOT:
- Assume unstated knowledge
- Give partial credit for wrong answers
- Make lenient interpretations
- Guess at intent

Be objective and factual. If answer is wrong, it's wrong.`;

  const prompt = `Review these assessment answers factually.

${questionsData}

For each question:
- Is answer correct based on lesson content?
- Identify what was right/wrong only
- No encouragement or assumptions

Return JSON (keep all text on single lines):
{
  "passed": true/false,
  "overallScore": 0-100,
  "reviewedQuestions": [
    {
      "questionId": "id",
      "questionText": "text",
      "questionType": "type",
      "score": 0-100,
      "isCorrect": true/false,
      "feedback": "Your answer was correct/incorrect because [fact].",
      "suggestions": ["what to do"],
      "encouragement": "brief note"
    }
  ],
  "overallFeedback": "Your score: X%. Correct answers: Y."
}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  const result = await callGroq(messages, { maxTokens: 3000 });

  if (!result.success) {
    return result;
  }

  try {
    let cleanContent = result.content.trim();

    if (cleanContent.includes("```")) {
      cleanContent = cleanContent
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?```\s*$/, "")
        .trim();
    }

    cleanContent = cleanContent.replace(/^["'`]+|["'`]+$/g, "");
    cleanContent = cleanContent.replace(/([^\\])\n/g, "$1\\n");

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
  } catch (error) {
    console.error("❌ Failed to parse Groq review:", error);
    return {
      success: false,
      error: `Failed to parse response: ${error.message}`,
    };
  }
};
