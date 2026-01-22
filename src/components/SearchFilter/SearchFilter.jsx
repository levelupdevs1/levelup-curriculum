import { Search, Filter } from "lucide-react";
import PropTypes from "prop-types";
import styles from "./SearchFilter.module.css";

const SearchFilter = ({
  searchQuery,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  searchPlaceholder = "Search...",
  filterLabel = "Filter",
}) => {
  return (
    <div className={styles.searchFilters}>
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
          aria-label="Search"
        />
      </div>
      {filterOptions && filterOptions.length > 0 && (
        <div className={styles.filterContainer}>
          <Filter className={styles.filterIcon} size={18} />
          <select
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            className={styles.filterSelect}
            aria-label={filterLabel}
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

SearchFilter.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  filterValue: PropTypes.string,
  onFilterChange: PropTypes.func,
  filterOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  searchPlaceholder: PropTypes.string,
  filterLabel: PropTypes.string,
};

export default SearchFilter;
