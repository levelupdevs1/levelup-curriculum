import express from "express";
import {
  generateCourseStructure,
  generateLessonContent,
  generateAssessment,
  reviewSubmission,
  generateCourseCatalog,
  reviewSubmissionBatch,
} from "../controllers/aiController.js";
import { verifyAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

// All routes require authentication
router.use(verifyAuth);

router.post("/generate-course-catalog", asyncHandler(generateCourseCatalog));

// Course structure generation
router.post(
  "/generate-course-structure",
  asyncHandler(generateCourseStructure),
);

// Lesson content generation
router.post("/generate-lesson-content", asyncHandler(generateLessonContent));

// Assessment generation
router.post("/generate-assessment", asyncHandler(generateAssessment));

// Submission review
router.post("/review-submission", asyncHandler(reviewSubmission));

router.post("/review-submission-batch", asyncHandler(reviewSubmissionBatch));

export default router;
