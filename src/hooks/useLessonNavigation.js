import { useNavigate } from "react-router-dom";

export const useLessonNavigation = (
  course,
  courseId,
  moduleIndex,
  lessonIndex,
) => {
  const navigate = useNavigate();

  const modules = course?.structure?.modules || course?.modules || [];
  const currentModule = modules[moduleIndex];

  const getPreviousLesson = () => {
    const prevLessonIndex = lessonIndex - 1;
    if (prevLessonIndex >= 0) {
      return {
        lesson: currentModule?.lessons[prevLessonIndex],
        moduleIndex,
        lessonIndex: prevLessonIndex,
      };
    }

    const prevModuleIndex = moduleIndex - 1;
    if (prevModuleIndex >= 0) {
      const prevModule = modules[prevModuleIndex];
      const prevLessonIdx = prevModule.lessons.length - 1;
      return {
        lesson: prevModule.lessons[prevLessonIdx],
        moduleIndex: prevModuleIndex,
        lessonIndex: prevLessonIdx,
      };
    }

    return null;
  };

  const getNextLesson = () => {
    const nextLessonIdx = lessonIndex + 1;
    if (nextLessonIdx < currentModule?.lessons.length) {
      return {
        lesson: currentModule.lessons[nextLessonIdx],
        moduleIndex,
        lessonIndex: nextLessonIdx,
      };
    }

    const nextModuleIndex = moduleIndex + 1;
    if (nextModuleIndex < modules.length) {
      const nextModule = modules[nextModuleIndex];
      return {
        lesson: nextModule.lessons[0],
        moduleIndex: nextModuleIndex,
        lessonIndex: 0,
      };
    }

    return null;
  };

  const navigateToPreviousLesson = () => {
    const prev = getPreviousLesson();
    if (prev) {
      navigate(`/courses/${courseId}/lessons/${prev.lesson.id}`, {
        state: { moduleIndex: prev.moduleIndex, lessonIndex: prev.lessonIndex },
      });
    }
  };

  const navigateToNextLesson = () => {
    const next = getNextLesson();
    if (next) {
      navigate(`/courses/${courseId}/lessons/${next.lesson.id}`, {
        state: { moduleIndex: next.moduleIndex, lessonIndex: next.lessonIndex },
      });
    } else {
      navigate(`/courses/${courseId}`);
    }
  };

  const canGoBack = () => getPreviousLesson() !== null;
  const canGoForward = () => getNextLesson() !== null;

  return {
    navigateToPreviousLesson,
    navigateToNextLesson,
    canGoBack,
    canGoForward,
    getPreviousLesson,
    getNextLesson,
  };
};
