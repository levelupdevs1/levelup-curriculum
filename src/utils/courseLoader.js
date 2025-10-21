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

  console.log(`📚 Loaded ${courses.length} courses from local files`);
  return courses;
};

export const loadLesson = async (courseId, moduleId, lessonId) => {
  try {
    const response = await fetch(
      `/src/courses/${courseId}/${moduleId}/${lessonId}.md`
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
