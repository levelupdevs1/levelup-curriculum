# Phase 3: Real AI Integration - Complete

## ✅ Implementation Status

### Completed

1. **DeepSeek V3.2 Integration** - Primary AI provider
2. **Gemini 2.0 Flash Integration** - Fallback provider
3. **Automatic Fallback System** - Seamless provider switching
4. **Environment Configuration** - API key management
5. **Real Token Tracking** - Actual API usage costs

## AI Providers

### Primary: DeepSeek V3.2

- **Model**: `deepseek-chat` (DeepSeek-V3.2 Non-thinking Mode)
- **Endpoint**: `https://api.deepseek.com/chat/completions`
- **Pricing**:
  - Input: $0.28 per 1M tokens
  - Output: $0.42 per 1M tokens
- **Context**: 128K tokens
- **Max Output**: 8K tokens
- **Get API Key**: https://platform.deepseek.com/api_keys

### Fallback: Gemini 2.0 Flash

- **Model**: `gemini-2.0-flash`
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models`
- **Pricing**:
  - Free tier available with generous limits
  - Paid: $0.10 per 1M input tokens, $0.40 per 1M output tokens
- **Context**: 1M tokens
- **Get API Key**: https://aistudio.google.com/apikey

## Environment Setup

### 1. Copy .env.example to .env.local

```bash
cp .env.example .env.local
```

### 2. Add Your API Keys

```env
# Supabase (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# DeepSeek (recommended primary)
VITE_DEEPSEEK_API_KEY=your_deepseek_key

# Gemini (optional fallback)
VITE_GEMINI_API_KEY=your_gemini_key
```

**Note**: At minimum, configure **one** AI provider (DeepSeek or Gemini). Both is recommended for reliability.

## Service Architecture

### aiServiceReal.js (Main AI Service)

Central service that handles provider selection and fallback:

```javascript
import {
  generateCourseCatalog,
  isAIConfigured,
  getActiveProvider,
} from "./services/aiServiceReal";

// Automatically uses DeepSeek if configured, falls back to Gemini
const result = await generateCourseCatalog(userProfile);
```

**Functions**:

- `generateCourseCatalog(userProfile)` - Generate 3 personalized courses
- `generateCourseStructure(title, description, modulesCount)` - Generate modules/lessons
- `generateLessonContent(courseTitle, moduleTitle, lessonTitle)` - Generate full lesson
- `generateAssessment(lessonTitle, content)` - Create assessments
- `reviewSubmission(type, question, answer)` - Review user submissions
- `isAIConfigured()` - Check if any provider is set up
- `getActiveProvider()` - Returns "DeepSeek V3.2" or "Gemini 2.0 Flash"

### deepseekService.js

Direct DeepSeek API integration:

**Key Features**:

- OpenAI-compatible API format
- Structured JSON responses
- Detailed prompt engineering for educational content
- Real external resource URLs (MDN, official docs)
- Token usage tracking

**API Call**:

```javascript
const result = await callDeepSeek(messages, {
  temperature: 0.7,
  maxTokens: 4000,
  stream: false,
});
```

**Response Format**:

```javascript
{
  success: true,
  content: "AI response",
  usage: {
    promptTokens: 150,
    completionTokens: 450,
    totalTokens: 600
  },
  model: "deepseek-chat"
}
```

### geminiService.js

Google Gemini API integration:

**Key Features**:

- Message format conversion (OpenAI → Gemini)
- System instruction support
- JSON mode response
- Free tier available

**API Call**:

```javascript
const result = await callGemini(messages, {
  temperature: 0.7,
  maxTokens: 4000,
});
```

## Token Cost Tracking

### Estimated Costs (in AI tokens, not platform tokens)

```javascript
export const AI_TOKEN_COSTS = {
  GENERATE_COURSE_CATALOG: 50, // ~$0.000014
  GENERATE_COURSE_STRUCTURE: 100, // ~$0.000028
  GENERATE_LESSON_CONTENT: 150, // ~$0.000042
  GENERATE_ASSESSMENT: 80, // ~$0.000022
  REVIEW_SUBMISSION: 60, // ~$0.000017
};
```

**Note**: These are estimated token counts for our database tracking. Actual API usage will vary and is tracked separately via the AI provider's response.

### Database Tracking

All AI operations are logged in `ai_token_usage` table:

```sql
{
  user_id: uuid,
  operation: "generate_course_catalog",
  tokens_used: 600,  -- Actual tokens from API response
  operation_details: { courses: 3, model: "deepseek-chat" },
  estimated_cost: 0.000168,  -- $0.28 input + $0.42 output per 1M
  created_at: timestamp
}
```

## Prompt Engineering

### Course Catalog Generation

- **Temperature**: 0.8 (creative variety)
- **Focus**: Personalized to user profile, progressive difficulty
- **Output**: 3 courses with realistic tech stacks

### Course Structure

- **Temperature**: 0.7 (balanced)
- **Focus**: Logical progression, actionable lesson titles
- **Output**: 4-8 modules with 4-6 lessons each

### Lesson Content

- **Temperature**: 0.6 (more focused)
- **Focus**: Educational depth, real code examples, external resources
- **Output**: Objectives, content, takeaways, verified resource links
- **Critical**: Only real, existing URLs from reputable sources

### Assessment Generation

- **Temperature**: 0.5 (consistent)
- **Focus**: Fair evaluation, appropriate difficulty
- **Output**: Quiz, coding challenge, written, or project type

### Submission Review

- **Temperature**: 0.3 (very focused)
- **Focus**: Constructive feedback, specific suggestions
- **Output**: Score, feedback, improvement suggestions

## Integration Points

### Updated Files

1. **src/pages/AICatalog/AICatalog.jsx**
   - Replaced mock with real AI service
   - Added provider status logging
   - Error handling for unconfigured providers

2. **src/services/aiTokenService.js**
   - Now tracks actual API token usage
   - Stores model information in operation_details

3. **New Files**:
   - `src/services/aiServiceReal.js` - Main AI service with fallback
   - `src/services/deepseekService.js` - DeepSeek integration
   - `src/services/geminiService.js` - Gemini integration

## Testing the Integration

### 1. Configure Environment

```bash
# Add at least one API key to .env.local
VITE_DEEPSEEK_API_KEY=sk-your-key-here
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test Flow

1. Sign up → Onboarding questionnaire
2. Navigate to Course Catalog
3. Check browser console for AI provider logs:
   ```
   🤖 Using DeepSeek for course catalog generation
   🎓 Generating courses with DeepSeek V3.2...
   ✅ Generated 3 courses using 587 tokens
   ```
4. Verify courses appear with AI-generated content
5. Check Supabase `ai_token_usage` table for logged operations

### 4. Test Fallback (Optional)

1. Remove DeepSeek API key
2. Add Gemini API key
3. Restart server
4. Console should show: `🔄 Using Gemini fallback for course catalog generation`

## Error Handling

### No API Key Configured

```javascript
{
  success: false,
  error: "No AI provider configured. Please add VITE_DEEPSEEK_API_KEY or VITE_GEMINI_API_KEY to .env.local"
}
```

### API Error

```javascript
{
  success: false,
  error: "HTTP 401" // or specific API error message
}
```

### JSON Parse Error

```javascript
{
  success: false,
  error: "Failed to parse AI response"
}
```

## Logging

### Console Output

- `🤖 Using DeepSeek` - Primary provider active
- `🔄 Using Gemini fallback` - Fallback activated
- `✅ Generated X courses using Y tokens` - Success with metrics
- `⚠️ DeepSeek failed, trying Gemini` - Automatic fallback

### Database Logs

All AI operations stored in `ai_token_usage`:

- Operation type
- Tokens consumed
- Model used
- Operation metadata
- Estimated cost

## Security Considerations

1. **API Keys in .env.local**: Never commit to git (already in .gitignore)
2. **Client-side API calls**: API keys exposed to client (acceptable for MVP)
3. **Future**: Move to backend API proxy for production
4. **RLS Policies**: Ensure users only see their own AI usage logs

## Cost Management

### DeepSeek Free Tier

- **50M tokens per day FREE**
- Perfect for development and testing
- Resets daily at UTC midnight

### Gemini Free Tier

- **Generous rate limits**
- 500 requests per day (RPD) for Flash models
- Free for non-commercial use in Google AI Studio

### Production Recommendations

1. Start with DeepSeek free tier (50M/day)
2. Monitor usage in `ai_token_usage` table
3. Set up alerts for high usage
4. Implement rate limiting per user
5. Consider paid tier when scaling

## Next Steps (Phase 4)

1. **Lesson Content Generation**
   - Update AILessonViewer to use real AI
   - Implement lazy lesson generation
   - Save external resources to database

2. **Assessment System**
   - Integrate real AI assessment generation
   - Implement submission review
   - Handle different assessment types

3. **Progress Tracking**
   - Track lesson completion
   - Module unlocking logic
   - Course progress calculation

4. **Backend API Proxy** (Security)
   - Move API calls to server-side
   - Hide API keys from client
   - Implement rate limiting

## Verification Checklist

- [x] DeepSeek service created
- [x] Gemini service created
- [x] Fallback system implemented
- [x] Environment variables configured
- [x] AICatalog updated to use real AI
- [x] Token tracking integrated
- [x] Error handling added
- [x] Console logging added
- [x] No linting errors
- [ ] Test with real DeepSeek API key
- [ ] Test with real Gemini API key
- [ ] Test fallback mechanism
- [ ] Verify database logging
- [ ] Check course quality

---

**Status**: Phase 3 Complete - Ready for API Testing  
**Date**: January 19, 2026  
**Next**: Test with real API keys, then Phase 4 - Full Lesson Generation
