import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { hasCompletedFoundation } from "../../services/foundationCourseService";
import { isSupabaseConfigured } from "../../services/authService";

const OnboardingRoute = ({ children }) => {
  const { isAuthenticated, user, isInitializing } = useUser();
  const location = useLocation();
  const [foundationStatus, setFoundationStatus] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkFoundation = async () => {
      if (!user?.id) {
        setChecking(false);
        return;
      }

      const result = await hasCompletedFoundation(user.id);
      setFoundationStatus(result);
      setChecking(false);
    };

    checkFoundation();
  }, [user?.id]);

  // Wait for initialization
  if (isInitializing || checking) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  // In dev mode without Supabase, allow access
  if (import.meta.env.DEV && !isSupabaseConfigured) {
    return children;
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check foundation completion
  if (!foundationStatus?.completed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default OnboardingRoute;
