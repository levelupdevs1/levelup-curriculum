# Level Up Backend

Backend service for the Level Up learning platform with Opik AI observability.

## Features

- 🤖 AI-powered course and lesson generation
- 📊 Full observability with Opik integration
- 🔐 Supabase authentication
- 🚀 RESTful API endpoints
- ⚡ Express.js server

## Setup

1. **Install dependencies:**

```bash
cd backend
npm install
```

2. **Configure environment variables:**

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

- `GEMINI_API_KEY`: Your Google Gemini API key
- `OPIK_API_KEY`: Your Opik API key
- `OPIK_WORKSPACE`: Your Opik workspace name
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

3. **Start the server:**

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

All endpoints require authentication via Supabase token in the `Authorization` header.

### POST `/api/ai/generate-course-structure`

Generate a complete course structure with modules and lessons.

**Request:**

```json
{
  "title": "React Fundamentals",
  "description": "Learn React from scratch",
  "modulesCount": 6,
  "userId": "user-123"
}
```

### POST `/api/ai/generate-lesson-content`

Generate detailed lesson content in Markdown format.

**Request:**

```json
{
  "title": "Introduction to Hooks",
  "description": "Learn useState and useEffect",
  "courseTitle": "React Fundamentals",
  "estimatedMinutes": 30,
  "userId": "user-123"
}
```

### POST `/api/ai/generate-assessment`

Generate assessments based on lesson content.

**Request:**

```json
{
  "lessonTitle": "Introduction to Hooks",
  "lessonContent": "...",
  "assessmentType": "coding_challenge",
  "userId": "user-123"
}
```

### POST `/api/ai/review-submission`

Review student submissions and provide feedback.

**Request:**

```json
{
  "questions": [...],
  "answers": {...},
  "userId": "user-123"
}
```

## Opik Integration

All AI operations are automatically tracked in Opik with:

- Request/response logging
- Token usage metrics
- User attribution
- Feature tagging

View traces in your Opik dashboard at `https://www.comet.com/opik`

## Frontend Integration

Update your frontend `.env`:

```env
VITE_BACKEND_URL=http://localhost:3001
```

The frontend `aiServiceReal.js` will automatically use the backend API.

## Deployment

### Option 1: Railway

1. Connect your GitHub repo
2. Add environment variables
3. Deploy automatically

### Option 2: Render

1. Create new Web Service
2. Connect repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`

### Option 3: VPS (DigitalOcean, AWS, etc.)

```bash
# Install Node.js
# Clone repository
# Install dependencies
# Set up PM2 for process management
pm2 start backend/server.js --name levelup-backend
```

## Development

The server runs on port 3001 by default. Make sure your frontend is configured to point to the correct backend URL.

Health check: `http://localhost:3001/health`
