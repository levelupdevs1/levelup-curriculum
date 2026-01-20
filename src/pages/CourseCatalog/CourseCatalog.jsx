import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  Clock,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader,
} from "lucide-react";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import SearchAndFilter from "../../components/SearchAndFilter/SearchAndFilter";
import TagList from "../../components/TagList/TagList";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./CourseCatalog.module.css";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";

const CourseCatalog = () => {
  const { generatedCourses, enrollInCourse } = useCourseGeneration();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  const courses = generatedCourses || [];

  // Helper function to get all lessons from a course
  const getAllLessons = (course) => {
    if (!course.modules || !Array.isArray(course.modules)) {
      return [];
    }
    return course.modules.flatMap((module) => module.lessons || []);
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const levels = ["all", "Beginner", "Intermediate", "Advanced"];
  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest" },
    { value: "price", label: "Price" },
  ];

  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.tags &&
          course.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ));

      const matchesLevel =
        selectedLevel === "all" || course.level === selectedLevel;

      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.enrolled_count || 0) - (a.enrolled_count || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case "price":
          return (a.price || 0) - (b.price || 0);
        default:
          return 0;
      }
    });

  const handleEnroll = async (courseId) => {
    setEnrollingCourseId(courseId);
    try {
      console.log("📝 Enrolling in course:", courseId);
      const result = await enrollInCourse(courseId);

      if (result.success) {
        console.log("✅ Enrollment successful, navigating to course...");
        // Navigate to course detail after successful enrollment
        navigate(`/courses/${courseId}`);
      } else {
        console.error("❌ Enrollment failed:", result.error);
      }
    } catch (error) {
      console.error("Failed to enroll in course:", error);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className={styles.catalog}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Course Catalog</h1>
        <p className={styles.subtitle}>
          Discover courses to level up your skills and earn rewards
        </p>
      </div>

      {/* Search and Filters */}
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        showFilters={showFilters}
        onToggleFilters={isDesktop ? null : toggleFilters}
        placeholder="Search courses, topics, or skills..."
        inlineFilters={isDesktop}
      >
        {(isDesktop || showFilters) && (
          <div className={styles.filterSection}>
            <div className={styles.filterGroup}>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className={styles.filterSelect}
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level === "all" ? "All Levels" : level}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.filterSelect}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </SearchAndFilter>

      {/* Results */}
      <div className={styles.results}>
        {!courses || courses.length === 0 ? (
          <LoadingSpinner size="lg" message="Loading courses..." />
        ) : (
          <>
            <div className={styles.resultsHeader}>
              <h2 className={styles.resultsTitle}>
                {filteredCourses.length} Course
                {filteredCourses.length !== 1 ? "s" : ""} Found
              </h2>
            </div>

            <div className={styles.courseGrid}>
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className={styles.courseCard}
                  hover
                  clickable
                  onClick={() => handleViewCourse(course.id)}
                >
                  <div className={styles.courseImage}>
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className={styles.courseImageImg}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={styles.imagePlaceholder}
                      style={{ display: course.thumbnail ? "none" : "flex" }}
                    >
                      <BookOpen size={48} />
                    </div>
                    <div className={styles.courseBadge}>
                      {(course.price || 0) === 0
                        ? "Free"
                        : `${course.price} Coins`}
                    </div>
                  </div>

                  <div className={styles.courseContent}>
                    <div className={styles.courseHeader}>
                      <h3 className={styles.courseTitle}>{course.title}</h3>
                    </div>

                    <p className={styles.courseDescription}>
                      {course.description}
                    </p>

                    <div className={styles.courseMeta}>
                      <div className={styles.metaItem}>
                        <Clock size={16} />
                        <span>Self-paced</span>
                      </div>
                      <div className={styles.metaItem}>
                        <BookOpen size={16} />
                        <span>{getAllLessons(course).length} lessons</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Users size={16} />
                        <span>{course.enrolled_count || 0} enrolled</span>
                      </div>
                    </div>

                    <div className={styles.courseTags}>
                      {(course.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className={styles.courseFooter}>
                      <div className={styles.courseLevel}>
                        <span className={styles.levelBadge}>
                          {course.level}
                        </span>
                      </div>
                      <Button
                        variant={course.isEnrolled ? "outline" : "primary"}
                        size="sm"
                        disabled={enrollingCourseId === course.id}
                        icon={
                          enrollingCourseId === course.id ? (
                            <Loader size={16} className={styles.spinning} />
                          ) : undefined
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnroll(course.id);
                        }}
                      >
                        {enrollingCourseId === course.id
                          ? "Enrolling..."
                          : course.isEnrolled
                            ? "Continue"
                            : "Enroll"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyContent}>
                  <BookOpen size={64} className={styles.emptyIcon} />
                  <h3 className={styles.emptyTitle}>No courses found</h3>
                  <p className={styles.emptyDescription}>
                    Try adjusting your search or filter criteria
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedLevel("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;
