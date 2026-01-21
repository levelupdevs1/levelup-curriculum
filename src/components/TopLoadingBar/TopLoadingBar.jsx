import React, { useState, useCallback } from "react";
import styles from "./TopLoadingBar.module.css";
import { LoadingBarContext } from "./LoadingBarContext";

/**
 * TopLoadingBar - A thin progress bar at the very top of the viewport
 * Similar to YouTube, GitHub, and many modern web apps.
 */
export const LoadingBarProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const start = useCallback(() => {
    setIsLoading(true);
    setProgress(0);
    
    // Animate progress incrementally
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 90) {
        currentProgress = 90; // Cap at 90% until complete is called
        clearInterval(interval);
      }
      setProgress(currentProgress);
    }, 200);

    // Store interval ID to clear it later
    window.__loadingBarInterval = interval;
  }, []);

  const complete = useCallback(() => {
    if (window.__loadingBarInterval) {
      clearInterval(window.__loadingBarInterval);
    }
    setProgress(100);
    
    // Hide the bar after animation completes
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 300);
  }, []);

  const stop = useCallback(() => {
    if (window.__loadingBarInterval) {
      clearInterval(window.__loadingBarInterval);
    }
    setIsLoading(false);
    setProgress(0);
  }, []);

  return (
    <LoadingBarContext.Provider value={{ start, complete, stop, isLoading }}>
      {isLoading && (
        <div className={styles.loadingBarContainer}>
          <div 
            className={styles.loadingBar} 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {children}
    </LoadingBarContext.Provider>
  );
};

export default LoadingBarProvider;
