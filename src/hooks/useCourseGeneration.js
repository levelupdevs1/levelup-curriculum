import { useContext } from "react";
import { CourseGenerationContext } from "../contexts/createCourseGenerationContext";

export const useCourseGeneration = () => {
  const context = useContext(CourseGenerationContext);
  if (!context) {
    throw new Error(
      "useCourseGeneration must be used within CourseGenerationProvider",
    );
  }
  return context;
};
