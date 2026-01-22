import React from "react";
import styles from "./ProgressBar.module.css";

const ProgressBar = ({
  progress,
  max = 100,
  label = null,
  showLabel = true,
  height = "8px",
  color = "#ffd700",
  backgroundColor = "#e5e7eb",
}) => {
  const percentage = Math.min(Math.max((progress / max) * 100, 0), 100);
  const isCompleted = percentage >= 100;
  const fillColor = isCompleted ? "#10b981" : color;

  return (
    <div className={styles.progressContainer}>
      {showLabel && label && (
        <div className={styles.progressInfo}>
          <span>{label}</span>
          <span>
            {progress} / {max}
          </span>
        </div>
      )}
      <div
        className={styles.progressBar}
        style={{
          height,
          backgroundColor,
        }}
      >
        <div
          className={styles.progressFill}
          style={{
            width: `${percentage}%`,
            backgroundColor: fillColor,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
