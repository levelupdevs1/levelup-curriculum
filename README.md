# 🚀 Level Up - AI-Powered Learning Platform

> **Code Your Future, Earn Your Rewards**

Level Up is an intelligent learning platform that leverages AI to create personalized educational experiences. Learn programming through custom-generated courses, earn rewards as you progress, and track your growth through a comprehensive XP and leveling system.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.1-61dafb.svg)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E.svg)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4.svg)

## ✨ Features

### 🤖 AI-Powered Personalization

- **Smart Onboarding**: AI analyzes your learning goals, skill level, and preferences
- **Custom Course Generation**: Personalized courses created specifically for your learning path
- **Adaptive Content**: Lessons and assessments tailored to your pace and style
- **Intelligent Feedback**: AI-powered reviews on your project submissions

### 📚 Comprehensive Learning Experience

- **Dynamic Course Catalog**: Browse AI-generated courses matched to your profile
- **Interactive Lessons**: Rich content with code examples and practical exercises
- **Automated Assessments**: Instant feedback on quizzes and coding challenges
- **Progress Tracking**: Monitor your learning journey across all courses

### 🏆 Gamification & Rewards

- **XP System**: Earn experience points for completing lessons and assessments
- **Leveling System**: Progress through 10 levels with increasing rewards
- **Platform Tokens**: Accumulate tokens for achievements and milestones
- **NFT Certificates**: Blockchain-verified certificates (coming soon)

### 🎯 User-Centric Design

- **Intuitive Dashboard**: Track progress, courses, and achievements at a glance
- **Responsive Interface**: Seamless experience across all devices
- **Profile Management**: Update learning preferences and track statistics
- **Token Management**: Monitor AI token usage and limits

## 🛠️ Tech Stack

### Frontend

- **React 19.1** - Modern UI library with latest features
- **Vite 7.1** - Lightning-fast build tool and dev server
- **React Router 7.9** - Client-side routing and navigation
- **Lucide React** - Beautiful icon library
- **React Markdown** - Render rich lesson content

### Backend

- **Node.js + Express** - RESTful API server
- **Google Gemini AI** - Cutting-edge AI for content generation
- **Opik Integration** - AI observability and monitoring
- **CORS Support** - Secure cross-origin requests

### Database & Auth

- **Supabase** - PostgreSQL database with Row Level Security
- **Supabase Auth** - Secure authentication and user management
- **JSONB Storage** - Flexible data structures for courses and progress

### Deployment

- **Vercel** - Frontend hosting with automatic deployments
- **Backend API** - Separate service for AI operations

## 📋 Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Supabase Account** (free tier available)
- **Google Gemini API Key** (free tier available at [ai.google.dev](https://ai.google.dev))
- **Opik Account** (optional, for AI observability)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/LevelUp.git
cd LevelUp
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Configure `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_BACKEND_URL=http://localhost:3001
```

### 3. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPIK_PROJECT_NAME=levelup
OPIK_WORKSPACE=default
```

### 4. Database Setup

Run the SQL migration in your Supabase project:

```bash
# Open Supabase SQL Editor and run
cat NEW_SUPABASE_SETUP.sql
```

This creates 7 essential tables:

- `users` - User accounts and basic info
- `ai_user_profiles` - Onboarding data and XP tracking
- `generated_courses` - AI-generated courses with structure
- `ai_tokens` - AI usage tracking and limits
- `ai_token_usage` - Detailed AI operation logs
- `platform_token_transactions` - Reward transactions
- `platform_token_claims` - Level reward claims

### 5. Run the Application

**Terminal 1 - Frontend:**

```bash
npm run dev
```

**Terminal 2 - Backend:**

```bash
cd backend
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) 🎉

## 📖 Usage

### Getting Started

1. **Sign Up**: Create an account with email/password
2. **Onboarding**: Answer 4 questions about your learning goals
3. **AI Generation**: Platform generates 3 personalized courses
4. **Enroll**: Choose a course and start learning
5. **Learn & Earn**: Complete lessons, take assessments, earn XP

### User Flow

```
Landing Page → Register → Onboarding → AI Course Generation
→ Course Catalog → Enroll → Course Detail → Lesson Viewer
→ Assessment → Review → Level Up → Rewards
```

### Course Structure

Each AI-generated course includes:

- **Modules**: 3-5 thematic learning modules
- **Lessons**: 3-5 lessons per module with rich content
- **Assessments**: Quizzes and coding challenges
- **Projects**: Hands-on practical assignments
- **Resources**: Additional learning materials

### Token System

**AI Tokens** (for course generation):

- Free Tier: 500 tokens/day
- Course Catalog: 50 tokens
- Course Structure: 100 tokens
- Lesson Content: 150 tokens
- Assessment: 80 tokens

**Platform Tokens** (rewards):

- Complete Lesson: 5 tokens
- Pass Assessment: 10 tokens
- Perfect Score: 25 tokens
- Complete Course: 100 tokens

## 🏗️ Project Structure

```
LevelUp/
├── src/
│   ├── api/              # API integration helpers
│   ├── assets/           # Static assets
│   ├── components/       # Reusable UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── LessonContent/
│   │   ├── AssessmentView/
│   │   ├── ProgressBar/
│   │   └── ...
│   ├── contexts/         # React Context providers
│   │   ├── UserContext.jsx
│   │   ├── CourseGenerationContext.jsx
│   │   └── AITokenContext.jsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useUser.js
│   │   ├── useCourseGeneration.js
│   │   ├── useAIToken.js
│   │   └── useXPAward.js
│   ├── pages/            # Page components
│   │   ├── Landing/
│   │   ├── Dashboard/
│   │   ├── AICatalog/
│   │   ├── AILessonViewer/
│   │   └── ...
│   ├── services/         # API and business logic
│   │   ├── authService.js
│   │   ├── aiServiceReal.js
│   │   ├── courseDataService.js
│   │   ├── platformTokenService.js
│   │   └── aiTokenService.js
│   └── utils/            # Utility functions
├── backend/              # Express API server
│   ├── controllers/
│   │   └── aiController.js
│   ├── routes/
│   │   └── ai.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── config/
│   │   └── gemini.js
│   └── server.js
├── supabase/             # Database migrations
│   └── migrations/
└── package.json
```

## 🔑 Key Components

### Contexts

- **UserContext**: Manages authentication, user profile, and onboarding state
- **CourseGenerationContext**: Handles AI course generation, enrollment, and progress
- **AITokenContext**: Tracks AI token usage and tier limits

### Services

- **authService**: Supabase authentication wrapper
- **aiServiceReal**: Gemini AI integration for content generation
- **courseDataService**: Course CRUD operations
- **platformTokenService**: XP, leveling, and reward calculations
- **aiTokenService**: AI token management and tracking

### Protected Routes

- **ProtectedRoute**: Requires authentication + onboarding completion
- **OnboardingRoute**: Requires authentication, redirects if onboarded
- **AuthRoute**: Only for logged-out users (login/register)

## 🎨 Features in Detail

### AI Course Generation

The platform uses Google Gemini to generate:

1. **Course Catalog** (50 tokens): 3 personalized course recommendations
2. **Course Structure** (100 tokens): Modules and lesson outlines
3. **Lesson Content** (150 tokens): Full lesson with examples and exercises
4. **Assessments** (80 tokens): Questions tailored to lesson content
5. **Feedback** (60 tokens): AI reviews of student submissions

### Progress Tracking

Courses store progress as JSONB:

```json
{
  "currentModuleIndex": 0,
  "currentLessonIndex": 2,
  "completedLessons": ["lesson-1", "lesson-2"]
}
```

### XP & Leveling

- **10 Levels Total**: Progress from 1 to 10
- **XP Thresholds**: 500 → 1500 → 3000 → 5000 → ...
- **Level Rewards**: 10 → 50 → 70 → 100 → 150 tokens
- **Tier Multipliers**: Free (1x), Starter (1.2x), Pro (1.5x)

## 🚦 API Endpoints

### AI Endpoints (`/api/ai`)

| Method | Endpoint                     | Description                       |
| ------ | ---------------------------- | --------------------------------- |
| POST   | `/generate-course-catalog`   | Generate 3 course recommendations |
| POST   | `/generate-course-structure` | Generate module/lesson structure  |
| POST   | `/generate-lesson-content`   | Generate full lesson content      |
| POST   | `/generate-assessment`       | Generate quiz questions           |
| POST   | `/review-submission`         | AI review of user submission      |

All endpoints require Bearer token authentication.

## 🧪 Development

### Code Style

- **ESLint**: Configured with React rules
- **Prettier**: (Recommended) Add `.prettierrc` for formatting
- **Module CSS**: Component-scoped styling

### Environment Variables

**Frontend (`.env.local`):**

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`
- `VITE_BACKEND_URL`

**Backend (`.env`):**

- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPIK_PROJECT_NAME`
- `OPIK_WORKSPACE`
- `PORT` (optional, defaults to 3001)

### Scripts

**Frontend:**

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

**Backend:**

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
```

## 🐛 Troubleshooting

### Common Issues

**1. Supabase Connection Error**

- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Row Level Security policies are enabled

**2. AI Generation Fails**

- Confirm `VITE_GEMINI_API_KEY` is valid
- Check free tier limits at [ai.google.dev](https://ai.google.dev)
- Verify backend is running on port 3001

**3. Token Tracking Issues**

- Ensure `ai_tokens` table initialized for user
- Check `ai_token_usage` table for operation logs

**4. Progress Not Saving**

- Verify RLS policies allow user to update courses
- Check browser console for Supabase errors

## 🔒 Security

- **Row Level Security**: All tables protected with RLS policies
- **Authentication**: Supabase JWT-based auth
- **Environment Variables**: Sensitive keys never committed
- **CORS**: Configured for specific origins
- **API Middleware**: Auth verification on all endpoints

## 🚀 Deployment

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend

Deploy to your preferred Node.js hosting:

- Railway
- Render
- Heroku
- DigitalOcean App Platform

Update `VITE_BACKEND_URL` in frontend env after deployment.

## 🗺️ Roadmap

### ✅ Completed Features

- User authentication and onboarding
- AI course generation with Gemini
- Progress tracking and enrollment
- XP and leveling system
- Token management
- Assessment system with AI review

### 🚧 Coming Soon

- NFT certificate minting
- Discussion forums
- Peer review system
- Course sharing and community
- Mobile app
- Advanced analytics dashboard
- Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👏 Acknowledgments

- **Google Gemini** - AI-powered content generation
- **Supabase** - Backend infrastructure and authentication
- **Opik** - AI observability and monitoring
- **Lucide** - Beautiful icon library
- **React Community** - Amazing ecosystem and tools

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for learners worldwide**

_Learn. Build. Earn. Repeat._ 🚀
