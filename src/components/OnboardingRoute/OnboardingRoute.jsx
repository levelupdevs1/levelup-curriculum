import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { isSupabaseConfigured } from "../../services/authService";

const OnboardingRoute = ({ children }) => {
  const { isAuthenticated, hasCompletedOnboarding, isInitializing } = useUser();
  const location = useLocation();

  // Wait for initialization
  if (isInitializing) {
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

  // Check if user has already completed onboarding
  if (hasCompletedOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default OnboardingRoute;
