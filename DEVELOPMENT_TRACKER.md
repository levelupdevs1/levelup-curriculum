# Level Up AI Revamp - Development Tracker

**Project:** AI-Powered Learn-to-Earn Platform  
**Branch:** freed-ai-revamp  
**Started:** January 19, 2026  
**Last Updated:** January 19, 2026

---

## Key Decisions Made

### AI Provider Strategy

- **Primary:** DeepSeek V3 (cheaper, generous free tier: 50M tokens/day)
- **Fallback:** Gemini 1.5 Flash (reliability, multimodal)
- **Premium:** DeepSeek R1 (Pro tier users only)
- **Reasoning:** 23-30% cost savings, 2x more free users supported

### Tech Stack Confirmed

- **Frontend:** React + Vite (existing)
- **Backend:** Supabase (new project to be created)
- **Blockchain:** Hedera Hashgraph (existing)
- **Language:** JavaScript (no TypeScript)
- **Styling:** CSS Modules (existing)

### Development Principles

- No gradients, no emojis, no unnecessary complexity
- Best practices over common practices
- Build incrementally, test continuously
- Mock data first, real APIs later
- No assumptions, verify everything

---

## Current Codebase State

### Existing Infrastructure (KEEP)

**Base UI Components:**

- Button (src/components/Button/)
- Card (src/components/Card/)
- Input (src/components/Input/)
- Modal (src/components/Modal/)
- LoadingSpinner (src/components/LoadingSpinner/)
- ProgressBar (src/components/ProgressBar/)

**Layout Components:**

- Layout (src/components/Layout/)
- Header (src/components/Header/)
- Footer (src/components/Footer/)
- Sidebar (src/components/Sidebar/)

**Route Guards:**

- ProtectedRoute (src/components/ProtectedRoute/)
- AuthRoute (src/components/AuthRoute/)
- HomeRoute (src/components/HomeRoute/)

**Services:**

- authService.js (Supabase auth)
- Pattern: Clean service layer approach

**Contexts:**

- UserContext.jsx (auth state management)
- Pattern established, will extend for AI features

**Dependencies:**

```json
{
  "react": "^19.1.1",
  "react-router-dom": "^7.9.1",
  "@supabase/supabase-js": "^2.75.1",
  "lucide-react": "^0.544.0",
  "react-markdown": "^10.1.0"
}
```

### Existing Infrastructure (TRANSFORM)

**To Be Repurposed:**

- CourseContext.jsx → Convert to AI course management
- Dashboard page → Update for AI courses
- Profile page → Add AI token display
- Rewards page → Update tokenomics
- Certificates page → Keep NFT logic, update data source

### Existing Infrastructure (REMOVE/REPLACE)

**Static Course System:**

- src/courses/\* (local course files)
- courseLoader.js (static file loading)
- CourseDetail page (rebuild for AI)
- LessonViewer page (rebuild for AI generation)
- PeerReview page (replace with AI review)

---

## Implementation Phases

### Phase 1: Foundation (No Backend) - COMPLETED

**Status:** Complete  
**Goal:** Build frontend structure with mock data

#### Tasks:

- [x] 1.1 Create New Contexts
  - [x] AITokenContext (manage AI token state)
  - [x] CourseGenerationContext (handle AI course generation state)
  - [x] Update UserContext for AI profile data

- [x] 1.2 Build Onboarding Flow
  - [x] OnboardingWizard component
  - [x] OnboardingStep component
  - [x] Question components (multi-choice, text input)
  - [x] Profile summary view
  - [x] Mock data handling (localStorage)

- [x] 1.3 Update Routing
  - [x] Add /onboarding route
  - [x] Add /ai-courses route
  - [x] Add /ai-lesson/:id route
  - [x] Redirect logic for first-time users

- [x] 1.4 AI Course Components
  - [x] AICourseCard component
  - [x] AICourseCatalog page
  - [x] AICourseDetail page
  - [x] AILessonViewer page (with generation states)
  - [x] AIAssessment component

- [x] 1.5 Token Display Components
  - [x] AITokenBalance component
  - [x] PlatformTokenBalance component
  - [x] TokenUsageIndicator component
  - [x] UpgradeTierPrompt component

- [x] 1.6 Mock Data System
  - [x] Create mock AI responses (JSON)
  - [x] Mock course generation
  - [x] Mock lesson content
  - [x] Mock assessment data
  - [x] Mock user profiles

### Phase 2: Backend Setup

**Status:** Pending  
**Goal:** Set up new Supabase project and database

#### Tasks:

- [ ] 2.1 Supabase Project Setup
  - [ ] Create new Supabase project
  - [ ] Configure project settings
  - [ ] Set up environment variables
  - [ ] Test connection

- [ ] 2.2 Database Schema Design
  - [ ] users table (extend existing)
  - [ ] ai_user_profiles table
  - [ ] ai_tokens table
  - [ ] generated_courses table
  - [ ] generated_modules table
  - [ ] generated_lessons table
  - [ ] generated_assessments table
  - [ ] user_submissions table
  - [ ] ai_interaction_history table
  - [ ] bounties table
  - [ ] bounty_submissions table

- [ ] 2.3 Database Migration
  - [ ] Write SQL migration scripts
  - [ ] Review schema together
  - [ ] Execute migrations incrementally
  - [ ] Test each table

- [ ] 2.4 Row Level Security (RLS)
  - [ ] Set up RLS policies per table
  - [ ] Test access control
  - [ ] Verify security

- [ ] 2.5 Supabase Services
  - [ ] Create aiService.js
  - [ ] Create courseGenerationService.js
  - [ ] Create tokenService.js
  - [ ] Update existing services

### Phase 3: AI Integration

**Status:** Pending  
**Goal:** Connect to DeepSeek and Gemini APIs

#### Tasks:

- [ ] 3.1 Edge Functions Setup
  - [ ] Initialize Edge Functions in Supabase
  - [ ] Set up secrets (API keys)
  - [ ] Create function structure

- [ ] 3.2 DeepSeek Integration
  - [ ] Create DeepSeek client
  - [ ] Test API connection
  - [ ] Implement course generation endpoint
  - [ ] Implement lesson generation endpoint
  - [ ] Implement assessment generation endpoint
  - [ ] Implement review endpoint

- [ ] 3.3 Gemini Fallback
  - [ ] Create Gemini client
  - [ ] Test API connection
  - [ ] Implement fallback logic
  - [ ] Add retry mechanism

- [ ] 3.4 Caching System
  - [ ] Implement database caching
  - [ ] Add cache check logic
  - [ ] Test cache hit/miss

- [ ] 3.5 Cost Tracking
  - [ ] Log all AI calls
  - [ ] Track token usage
  - [ ] Monitor costs
  - [ ] Set up alerts

### Phase 4: Frontend-Backend Integration

**Status:** Pending  
**Goal:** Connect frontend to real backend

#### Tasks:

- [ ] 4.1 Replace Mock Data
  - [ ] Connect onboarding to database
  - [ ] Connect course catalog to AI
  - [ ] Connect lesson viewer to AI
  - [ ] Connect assessments to AI review

- [ ] 4.2 Real-time Features
  - [ ] AI generation progress indicators
  - [ ] Token balance updates
  - [ ] Progress tracking
  - [ ] Notifications

- [ ] 4.3 Token System
  - [ ] AI token allocation
  - [ ] Platform token earning
  - [ ] Token usage tracking
  - [ ] Subscription tier logic

- [ ] 4.4 Progression System
  - [ ] Lesson unlocking logic
  - [ ] Module unlocking logic
  - [ ] Assessment pass/fail flow
  - [ ] Level progression

### Phase 5: Advanced Features

**Status:** Pending  
**Goal:** Add bounties, gamification, payments

#### Tasks:

- [ ] 5.1 Bounty System
  - [ ] Bounty marketplace page
  - [ ] Bounty entry flow
  - [ ] Submission handling
  - [ ] AI evaluation
  - [ ] Winner selection

- [ ] 5.2 Subscription System
  - [ ] Stripe integration
  - [ ] Subscription pages
  - [ ] Tier management
  - [ ] Billing portal

- [ ] 5.3 Platform Economy
  - [ ] Token-to-subscription exchange
  - [ ] Token purchase flow
  - [ ] Platform token utility features

- [ ] 5.4 Gamification
  - [ ] Achievements system
  - [ ] Leaderboards
  - [ ] Daily streaks
  - [ ] Social features

### Phase 6: Testing & Launch

**Status:** Pending  
**Goal:** Production-ready platform

#### Tasks:

- [ ] 6.1 Testing
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] E2E tests
  - [ ] Load testing
  - [ ] Security audit

- [ ] 6.2 Polish
  - [ ] Performance optimization
  - [ ] UI/UX refinements
  - [ ] Error handling
  - [ ] Loading states

- [ ] 6.3 Documentation
  - [ ] User guides
  - [ ] API documentation
  - [ ] Deployment docs

- [ ] 6.4 Launch Preparation
  - [ ] Beta testing
  - [ ] Bug fixes
  - [ ] Marketing materials
  - [ ] Soft launch

---

## File Structure Plan

### New Files to Create

```
src/
├── contexts/
│   ├── AITokenContext.jsx          [NEW]
│   ├── CourseGenerationContext.jsx [NEW]
│   └── UserContext.jsx              [UPDATE]
│
├── components/
│   ├── Onboarding/                  [NEW]
│   │   ├── OnboardingWizard.jsx
│   │   ├── OnboardingStep.jsx
│   │   └── ProfileSummary.jsx
│   │
│   ├── AIToken/                     [NEW]
│   │   ├── AITokenBalance.jsx
│   │   ├── TokenUsageIndicator.jsx
│   │   └── UpgradeTierPrompt.jsx
│   │
│   └── AICourse/                    [NEW]
│       ├── AICourseCard.jsx
│       ├── AIModuleList.jsx
│       ├── AILessonContent.jsx
│       └── AIAssessment.jsx
│
├── pages/
│   ├── Onboarding/                  [NEW]
│   │   └── Onboarding.jsx
│   │
│   ├── AICourseCatalog/             [NEW]
│   │   └── AICourseCatalog.jsx
│   │
│   ├── AICourseDetail/              [NEW]
│   │   └── AICourseDetail.jsx
│   │
│   ├── AILessonViewer/              [NEW]
│   │   └── AILessonViewer.jsx
│   │
│   └── Bounties/                    [NEW]
│       └── Bounties.jsx
│
├── services/
│   ├── aiService.js                 [NEW]
│   ├── courseGenerationService.js   [NEW]
│   ├── tokenService.js              [NEW]
│   └── authService.js               [UPDATE]
│
├── utils/
│   ├── mockData.js                  [NEW]
│   └── constants.js                 [NEW]
│
└── hooks/
    ├── useAITokens.js               [NEW]
    ├── useCourseGeneration.js       [NEW]
    └── useUser.js                   [UPDATE]
```

### Files to Remove (Later)

```
src/
├── courses/                         [REMOVE AFTER PHASE 2]
│   ├── foundation/
│   ├── javascript-advanced/
│   ├── react-fundamentals/
│   └── web-development-basics/
│
└── utils/
    └── courseLoader.js              [REMOVE AFTER PHASE 2]
```

---

## Database Schema (To Be Created)

### Tables Overview

```sql
-- Core user tables
users (existing, extend)
ai_user_profiles (new)
ai_tokens (new)

-- AI-generated content
generated_courses (new)
generated_modules (new)
generated_lessons (new)
generated_assessments (new)

-- User activity
user_submissions (new)
ai_interaction_history (new)

-- Gamification
bounties (new)
bounty_submissions (new)

-- Existing tables to keep
token_claims (existing)
certificates (existing)
```

### Detailed Schema (To Be Reviewed Together)

Will be created in separate SQL migration files during Phase 2.

---

## Environment Variables Needed

### Current (.env.local)

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Additional (To Be Added)

```
# Supabase Edge Functions (server-side only)
DEEPSEEK_API_KEY=your_deepseek_key
GEMINI_API_KEY=your_gemini_key

# Optional
STRIPE_SECRET_KEY=your_stripe_key (Phase 5)
STRIPE_WEBHOOK_SECRET=your_webhook_secret (Phase 5)
```

---

## AI Token Costs Reference

### DeepSeek V3 Pricing

- Input: $0.27/1M tokens
- Output: $1.10/1M tokens
- Free tier: 50M tokens/day

### AI Token Usage Map

| Action                    | Estimated Tokens | Cost (DeepSeek) |
| ------------------------- | ---------------- | --------------- |
| Generate course catalog   | 50,000           | $0.07           |
| Generate course structure | 100,000          | $0.14           |
| Generate lesson content   | 150,000          | $0.21           |
| Generate assessment       | 80,000           | $0.11           |
| Review submission         | 60,000           | $0.08           |
| AI tutor question         | 30,000           | $0.04           |
| Generate hint             | 20,000           | $0.03           |
| Project evaluation        | 200,000          | $0.28           |

### User AI Token Allocations

| Tier          | AI Tokens/Period | Cost/User | Period  |
| ------------- | ---------------- | --------- | ------- |
| Free          | 100              | $0        | Daily   |
| Starter ($10) | 5,000            | $2.20     | Monthly |
| Pro ($25)     | 25,000           | $6.50     | Monthly |

---

## Git Workflow

### Branch Strategy

- **Main branch:** Production-ready code (don't touch)
- **freed-ai-revamp:** Development branch (current)
- Feature branches: TBD as needed

### Commit Guidelines

- Small, incremental commits
- Clear commit messages
- Test before committing
- Stage files explicitly

---

## Testing Strategy

### During Development

1. Manual testing after each feature
2. Test in browser (npm run dev)
3. Console log checking
4. Error handling verification

### Before Phase Completion

1. Full user flow testing
2. Edge case testing
3. Error state testing
4. Mobile responsive testing

---

## Current Session Notes

### Session 1 - January 19, 2026

**Progress:**

- Reviewed existing codebase
- Established development principles
- Created this tracker document
- User implemented core AI learning system:
  - AITokenContext with tier management
  - CourseGenerationContext with localStorage
  - Onboarding flow (complete)
  - AICatalog page (functional)
  - AILessonViewer page (functional)
  - AICourseDetail page (created)
  - aiService.js with mock AI functions
  - All hooks and context files
  - All CSS modules
  - Router configuration

**Decisions:**

- Use DeepSeek as primary AI provider
- Keep existing UI components
- Build incrementally with mock data first
- No TypeScript, stick with JavaScript

**Current State:**

- Phase 1 Foundation is ~80% complete
- All core infrastructure in place
- Mock data system functional
- Router configured correctly
- Token system working

**Identified Issues:**

1. Token costs all set to 1 (need realistic values)
2. Need to test full user flow
3. AICourseDetail needs content review
4. Need proper token cost constants

**Testing Results:**

- Full user flow tested successfully
- Onboarding → Course Catalog → Enrollment → Lesson viewing works
- Token system functioning correctly
- Mock AI generation working as expected
- No errors reported

**Next Steps Decision Point:**
Three possible directions:

1. Phase 2: Set up Supabase backend and database
2. Phase 1 Polish: Enhance UI, add features (bounties, better dashboard)
3. Jump to Phase 3: Real AI integration with DeepSeek

**Blockers:**

- Need to decide direction
- Need new Supabase project for backend work

**Notes:**

- User has git, node.js, editor set up
- User will code and test alongside
- User prefers best practices, clean code
- Avoid gradients, emojis, unnecessary complexity
- User ran git restore to clean state, then rebuilt

---

## Quick Reference

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Current Branch

```bash
git branch  # Should show freed-ai-revamp
```

---

## Important Reminders

1. **Never assume file contents** - Always read files before modifying
2. **Mock data first** - Build UI with fake data before real APIs
3. **Test incrementally** - Verify each feature works before moving on
4. **Keep it simple** - No unnecessary complexity
5. **Best practices** - Clean, maintainable code
6. **No emojis, no gradients** - Professional, clean UI
7. **Ask before deciding** - Clarify when multiple approaches exist
8. **Document as we go** - Update this tracker regularly

---

## Contact Points for Clarification

If unclear about:

- **UI/UX decisions** → Ask user for preference
- **Data structure** → Discuss schema together
- **Feature priority** → Confirm with user
- **Technical approach** → Propose options, let user decide
- **Breaking changes** → Get explicit approval

---

## Success Metrics

### Phase 1 Success

- [ ] Onboarding flow works with mock data
- [ ] AI course catalog displays (mock)
- [ ] Lesson viewer shows generation states
- [ ] User can navigate full flow
- [ ] No console errors
- [ ] Responsive on mobile

### Phase 2 Success

- [ ] New Supabase project connected
- [ ] All tables created and working
- [ ] RLS policies tested
- [ ] Services communicate with DB
- [ ] User data persists correctly

### Phase 3 Success

- [ ] AI generates real course content
- [ ] Fallback system works
- [ ] Caching reduces API calls by 90%+
- [ ] Cost tracking accurate
- [ ] Response times acceptable (<5s)

### Overall Success

- [ ] User can complete full learning journey
- [ ] AI content quality is good
- [ ] Token system works correctly
- [ ] No major bugs
- [ ] Performance is acceptable
- [ ] Ready for beta testing

---

**END OF TRACKER - Update this document as we progress**
