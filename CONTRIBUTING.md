# Contributing to Level Up

Thank you for your interest in contributing! We welcome contributions from everyone.

## How to Contribute

### 1. Adding or Updating Courses

Courses are stored in `src/courses/` as Markdown files with JSON metadata.

#### Course Structure

```
src/courses/
└── your-course-name/
    ├── course.json          # Course metadata
    ├── module-1-basics/
    │   ├── lesson-1-intro.md
    │   └── assignment-1.md
    └── module-2-advanced/
```

#### Create course.json

```json
{
  "id": "your-course-name",
  "title": "Your Course Title",
  "description": "What students will learn",
  "level": "Beginner",
  "tags": ["JavaScript", "Web Development"],
  "thumbnail": "https://images.unsplash.com/photo-...",
  "modules": [
    {
      "id": "module-1-basics",
      "title": "Module 1: Basics",
      "lessons": [
        {
          "id": "lesson-1-intro",
          "title": "Introduction",
          "type": "lesson",
          "filePath": "module-1-basics/lesson-1-intro.md",
          "points": 10
        }
      ]
    }
  ]
}
```

#### Testing Your Course Locally

```bash
npm run dev
```

Your course will load automatically from local files - no database setup needed!

#### Submitting Your Course

1. Fork the repository
2. Create a branch: `git checkout -b add-course/your-course-name`
3. Add your course files
4. Commit: `git commit -m "Add: Your Course Name"`
5. Push: `git push origin add-course/your-course-name`
6. Open a Pull Request

### 2. Reporting Bugs

Open an issue with:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

### 3. Suggesting Features

Open an issue with:

- Feature description
- Use case
- Mockups or examples (if applicable)

### 4. Code Contributions

1. Fork and clone the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a Pull Request

## Development Setup

### For Course Contributors

Just clone and run:

```bash
npm install
npm run dev
```

### For Core Developers

Add Supabase credentials to `.env.local`:

```bash
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

## Code Style

- Use ESLint (run `npm run lint`)
- Follow existing code patterns
- Write clear commit messages
- Add comments for complex logic

## Commit Message Format

```
Type: Brief description

Examples:
- Add: New Python course
- Fix: Login button alignment
- Update: React course module 3
- Docs: Update contributing guide
```

## Need Help?

- Check existing issues
- Join our discussions
- Ask in Pull Request comments

Thank you for contributing! 🚀
