import React from "react";
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import Input from "../Input/Input";
import Button from "../Button/Button";
import styles from "./SearchAndFilter.module.css";

const SearchAndFilter = ({
  searchTerm,
  onSearchChange,
  showFilters = false,
  onToggleFilters = null,
  children,
  placeholder = "Search...",
  className = "",
  inlineFilters = false,
}) => {
  return (
    <div className={`${styles.container} ${inlineFilters ? styles.inlineContainer : ''} ${className}`}>
      {inlineFilters ? (
        <>
          <div className={styles.searchSection}>
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={onSearchChange}
              icon={<Search size={20} />}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filtersInline}>
            {children}
          </div>
        </>
      ) : (
        <>
          <div className={styles.searchSection}>
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={onSearchChange}
              icon={<Search size={20} />}
              className={styles.searchInput}
            />
          {onToggleFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              // icon={
              //   showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />
              // }
              className={styles.filterButton}
            >
              <Filter size={20}/>
            </Button>
          )}

          {children}
          </div>

        </>
      )}
    </div>
    
  );
};

export default SearchAndFilter;
