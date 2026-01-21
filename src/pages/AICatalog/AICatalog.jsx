import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import { useAIToken } from "../../hooks/useAIToken";
import { useLoadingBar } from "../../components/TopLoadingBar";
import {
  generateCourseCatalog,
  AI_TOKEN_COSTS,
  isAIConfigured,
  getActiveProvider,
} from "../../services/aiServiceReal";
import Button from "../../components/Button/Button";
import AICourseCard from "../../components/AICourseCard/AICourseCard";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import styles from "./AICatalog.module.css";

const COURSES_PER_PAGE = 6;
const DIFFICULTY_OPTIONS = ["All", "Beginner", "Intermediate", "Advanced"];

const AICatalog = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    userProfile,
    generatedCourses,
    enrolledCourses,
    addGeneratedCourses,
    enrollInCourse,
    foundationCompleted,
    foundationCourse,
  } = useCourseGeneration();
  const { useTokens: consumeTokens, tokensRemaining } = useAIToken();
  const loadingBar = useLoadingBar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const hasGeneratedRef = useRef(false);

  // Check if we should generate new courses (from preference update)
  const shouldGenerate = searchParams.get("generate") === "true";

  // Filter courses based on active tab, search, and difficulty
  const filteredCourses = useMemo(() => {
    // Include foundation course with AI courses
    let allCourses = [...(generatedCourses || [])];
    if (
      foundationCourse &&
      !allCourses.find((c) => c.id === foundationCourse.id)
    ) {
      allCourses = [foundationCourse, ...allCourses];
    }

    let courses =
      activeTab === "enrolled"
        ? allCourses.filter(
            (c) =>
              c.status === "enrolled" ||
              c.is_foundation ||
              enrolledCourses.some((e) => e.id === c.id),
          )
        : allCourses;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      courses = courses.filter(
        (course) =>
          course.title?.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query),
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== "All") {
      courses = courses.filter(
        (course) =>
          course.difficulty?.toLowerCase() === difficultyFilter.toLowerCase(),
      );
    }

    return courses;
  }, [
    generatedCourses,
    enrolledCourses,
    foundationCourse,
    activeTab,
    searchQuery,
    difficultyFilter,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
    return filteredCourses.slice(startIndex, startIndex + COURSES_PER_PAGE);
  }, [filteredCourses, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, difficultyFilter, activeTab]);

  const generateCourses = async () => {
    // Check if foundation course is completed first
    if (!foundationCompleted) {
      setError(
        "Please complete the Foundation Software Development Course first before generating personalized courses.",
      );
      return;
    }

    if (!isAIConfigured()) {
      setError(
        "Gemini API not configured. Please add VITE_GEMINI_API_KEY to .env.local (free tier available at ai.google.dev)",
      );
      return;
    }

    // DISABLED: No token restrictions
    // const tokenCost = AI_TOKEN_COSTS.GENERATE_COURSE_CATALOG;
    // if (!canUseTokens(tokenCost)) {
    //   setError("Insufficient AI tokens to generate courses");
    //   return;
    // }

    setLoading(true);
    setError(null);
    loadingBar.start();

    try {
      console.log(`🤖 Generating courses with ${getActiveProvider()}...`);
      const result = await generateCourseCatalog(userProfile);

      if (result.success) {
        console.log(
          `✅ Generated ${result.courses.length} courses using ${result.tokensUsed} tokens`,
        );

        const tokenResult = await consumeTokens(
          result.tokensUsed,
          "generate_course_catalog",
          { courses: result.courses.length, model: result.model },
        );

        if (tokenResult.success) {
          const addResult = await addGeneratedCourses(result.courses);
          if (!addResult.success) {
            setError(addResult.error || "Failed to save courses");
          }
        } else {
          setError(tokenResult.error);
        }
      } else {
        setError(result.error || "Failed to generate courses");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
      loadingBar.complete();
    }
  };

  useEffect(() => {
    // Don't auto-generate if foundation not completed
    if (!foundationCompleted) {
      return;
    }

    // Don't auto-generate if no user profile yet (hasn't done onboarding)
    if (!userProfile) {
      return;
    }

    // Generate courses if:
    // 1. No courses exist yet, OR
    // 2. Coming from preference update with ?generate=true
    const shouldAutoGenerate = generatedCourses.length === 0 || shouldGenerate;

    if (shouldAutoGenerate && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;

      // Clear the generate param from URL
      if (shouldGenerate) {
        setSearchParams({});
      }

      generateCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldGenerate]);

  const handleEnroll = async (courseId) => {
    // Check if it's the foundation course (always enrolled)
    const isFoundation = foundationCourse && courseId === foundationCourse.id;
    if (isFoundation) {
      navigate(`/courses/${courseId}`);
      return;
    }

    const isEnrolled = enrolledCourses.some((c) => c.id === courseId);
    if (isEnrolled) {
      navigate(`/courses/${courseId}`);
      return;
    }

    const result = await enrollInCourse(courseId);
    if (result.success) {
      navigate(`/courses/${courseId}`);
    } else {
      setError(result.error);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
          <p>Generating personalized courses for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Your Personalized Courses</h1>
          <p>Generated learning paths tailored to your goals</p>
        </div>
        <div className={styles.tokenDisplay}>
          <span className={styles.tokenLabel}>AI Tokens:</span>
          <span className={styles.tokenValue}>{tokensRemaining}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "all" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Courses (
          {(generatedCourses?.length || 0) + (foundationCourse ? 1 : 0)})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "enrolled" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("enrolled")}
        >
          Enrolled (
          {(enrolledCourses?.length || 0) + (foundationCourse ? 1 : 0)})
        </button>
      </div>

      {/* Search and Filters */}
      <div className={styles.searchFilters}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterContainer}>
          <Filter className={styles.filterIcon} size={18} />
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className={styles.filterSelect}
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "All" ? "All Levels" : option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      {filteredCourses.length > 0 && (
        <p className={styles.resultsCount}>
          Showing {paginatedCourses.length} of {filteredCourses.length} courses
        </p>
      )}

      {error && (
        <div className={styles.error}>
          <p>{error}</p>
          <Button variant="secondary" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {filteredCourses.length === 0 && !loading && (
        <div className={styles.empty}>
          {!foundationCompleted ? (
            <>
              <p>
                No courses generated yet. Complete the Foundation course to
                unlock personalized courses.
              </p>
            </>
          ) : (
            <>
              <p>No courses generated yet</p>
              <Button variant="primary" onClick={generateCourses}>
                Generate Courses
              </Button>
            </>
          )}
        </div>
      )}

      {paginatedCourses.length === 0 && activeTab === "enrolled" && (
        <div className={styles.empty}>
          <p>You haven't enrolled in any courses yet</p>
          <Button variant="secondary" onClick={() => setActiveTab("all")}>
            Browse All Courses
          </Button>
        </div>
      )}

      {paginatedCourses.length === 0 &&
        activeTab === "all" &&
        filteredCourses.length === 0 &&
        generatedCourses.length > 0 && (
          <div className={styles.empty}>
            <p>No courses match your search criteria</p>
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery("");
                setDifficultyFilter("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

      <div className={styles.coursesGrid}>
        {paginatedCourses.map((course) => {
          // Foundation course is always enrolled
          const isFoundation =
            course.is_foundation ||
            (foundationCourse && course.id === foundationCourse.id);
          const isEnrolled =
            isFoundation || enrolledCourses.some((c) => c.id === course.id);

          return (
            <AICourseCard
              key={course.id}
              course={course}
              isEnrolled={isEnrolled}
              onAction={handleEnroll}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageNumber} ${currentPage === page ? styles.activePage : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className={styles.pageButton}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AICatalog;
