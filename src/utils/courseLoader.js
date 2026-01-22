// Course loader utility to fetch course content from the courses directory

export const loadCourse = async (courseId) => {
  try {
    // Import course metadata
    const courseModule = await import(`../courses/${courseId}/course.json`);
    const course = courseModule.default || courseModule;

    // Just return the course structure - markdown content will be loaded separately
    return course;
  } catch (error) {
    console.error(`Error loading course ${courseId}:`, error);
    throw new Error(`Course ${courseId} not found`);
  }
};

export const loadAllCourses = async () => {
  // Dynamically import all course.json files from src/courses/
  const courseModules = import.meta.glob("../courses/*/course.json", {
    eager: true,
  });

  const courses = [];

  for (const [path, module] of Object.entries(courseModules)) {
    try {
      const course = module.default || module;
      courses.push(course);
    } catch (error) {
      console.error(`Error loading course from ${path}:`, error);
    }
  }

  return courses;
};

export const loadLesson = async (courseId, moduleId, lessonId) => {
  try {
    const response = await fetch(
      `/src/courses/${courseId}/${moduleId}/${lessonId}.md`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch ${lessonId}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading lesson ${lessonId}:`, error);
    throw new Error(`Lesson ${lessonId} not found`);
  }
};

/**
 * Load foundation course lesson content from filePath
 * The filePath is relative to the foundation course directory
 */
export const loadFoundationLesson = async (filePath) => {
  try {
    // Use Vite's import.meta.glob for dynamic loading of markdown files
    const lessonModules = import.meta.glob("../courses/foundation/**/*.md", {
      query: "?raw",
      import: "default",
    });

    // Build the full import path
    const fullPath = `../courses/foundation/${filePath}`;

    if (lessonModules[fullPath]) {
      const content = await lessonModules[fullPath]();
      return content;
    }

    throw new Error(`Lesson file not found: ${filePath}`);
  } catch (error) {
    console.error(`Error loading foundation lesson ${filePath}:`, error);
    throw new Error(`Foundation lesson not found: ${filePath}`);
  }
};
