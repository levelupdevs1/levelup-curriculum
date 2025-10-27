import React, { useState, useEffect, useRef } from "react";
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
  X,
} from "lucide-react";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./CourseCatalog.module.css";
import { useCourse } from "../../hooks/useCourse";

const CourseCatalog = () => {
  const { courses, enrollInCourse, addNotification, getAllLessons } =
    useCourse();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [sortBy, setSortBy] = useState("popular");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDesktopFilterMenu, setShowDesktopFilterMenu] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const filterMenuRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowDesktopFilterMenu(false);
      }
    };

    if (showDesktopFilterMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDesktopFilterMenu]);

  const levels = ["Beginner", "Intermediate", "Advanced"];
  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest" },
    { value: "price", label: "Price" },
  ];

  const handleLevelChange = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
  };

  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.tags &&
          course.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ));

      const matchesLevel =
        selectedLevels.length === 0 || selectedLevels.includes(course.level);

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
      await enrollInCourse(courseId);
      addNotification("Enrolled successfully!", "success");
      navigate(`/courses/${courseId}`);
    } catch {
      addNotification("Failed to enroll. Please try again.", "error");
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const activeFilterCount = selectedLevels.length + (sortBy !== "popular" ? 1 : 0);

  return (
    <div className={styles.catalog}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Course Catalog</h1>
        <p className={styles.subtitle}>
          Discover courses to level up your skills and earn rewards
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className={styles.searchFilterBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search courses, topics, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterButtonWrapper} ref={filterMenuRef}>
          <button
            className={`${styles.filterButton} ${isDesktop ? styles.filterButtonDesktop : ''}`}
            onClick={() => {
              if (isDesktop) {
                setShowDesktopFilterMenu(!showDesktopFilterMenu);
              } else {
                setShowFilterModal(true);
              }
            }}
          >
            {isDesktop ? (
              <span >Filter</span>
            ) : (
              <Filter size={20} />
            )}
            {activeFilterCount > 0 && (
              <span className={styles.filterBadge}>{activeFilterCount}</span>
            )}
          </button>

          {/* Desktop Filter Dropdown Menu */}
          {isDesktop && showDesktopFilterMenu && (
            <div className={styles.desktopFilterMenu}>
              <div className={styles.menuSection}>
                <label className={styles.menuLabel}>Level</label>
                <select
                  className={styles.select}
                  value={selectedLevels.length === 1 ? selectedLevels[0] : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedLevels([e.target.value]);
                    } else {
                      setSelectedLevels([]);
                    }
                  }}
                >
                  <option value="">All Levels</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.menuSection}>
                <label className={styles.menuLabel}>Sort By</label>
                <select
                  className={styles.select}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {activeFilterCount > 0 && (
                <button
                  className={styles.clearButton}
                  onClick={() => {
                    setSelectedLevels([]);
                    setSortBy("popular");
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {!isDesktop && showFilterModal && (
        <>
          <div
            className={styles.modalOverlay}
            onClick={() => setShowFilterModal(false)}
          />
          <div className={styles.filterModal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Filter & Sort</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowFilterModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.filterSection}>
                <h4 className={styles.sectionTitle}>Filter</h4>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Level</label>
                  <div className={styles.checkboxGroup}>
                    {levels.map((level) => (
                      <label key={level} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={selectedLevels.includes(level)}
                          onChange={() => handleLevelChange(level)}
                          className={styles.checkbox}
                        />
                        <span>{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.sortSection}>
                <h4 className={styles.sectionTitle}>Sort</h4>
                <div className={styles.radioGroup}>
                  {sortOptions.map((option) => (
                    <label key={option.value} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="sortBy"
                        value={option.value}
                        checked={sortBy === option.value}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={styles.radio}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedLevels([]);
                  setSortBy("popular");
                }}
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowFilterModal(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </>
      )}

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
                      setSelectedLevels([]);
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